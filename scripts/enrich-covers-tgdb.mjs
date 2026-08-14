import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const GAMES_PATH = path.join(__dirname, '..', 'src', 'data', 'games.json')
const API_KEY = process.env.THEGAMESDB_API_KEY
const BASE_URL = 'https://api.thegamesdb.net/v1'

// IDs de plataforma en TheGamesDB (confirmados vía /Platforms).
const PS4_ID = 4919
const PS5_ID = 4980
const PLAYSTATION_PLATFORM_IDS = new Set([PS4_ID, PS5_ID])

// Quita subtítulos de edición/idioma que confunden la búsqueda (TheGamesDB indexa el juego base).
function searchableTitle(title) {
  return title
    .replace(
      /:?\s*(Digital )?(Deluxe|Ultimate|Complete|Definitive|Gold|Legendary|Standard|Master Assassin|Premium|Special|Remastered|Director'?s? Cut|Anniversary|GOTY|Game of the Year)( Edition)?/gi,
      '',
    )
    .replace(/ESPAÑOL( LATINO)?|INGLÉS|SUBTITULADO/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TheGamesDB API ${res.status}: ${body}`)
  }
  return res.json()
}

async function searchCoverImage(title) {
  const searchUrl = new URL(`${BASE_URL}/Games/ByGameName`)
  searchUrl.searchParams.set('apikey', API_KEY)
  searchUrl.searchParams.set('name', searchableTitle(title))

  const searchData = await fetchJson(searchUrl)
  const games = searchData.data?.games ?? []
  // TheGamesDB devuelve el mismo título en todas las plataformas y épocas (ej. remakes) mezclados;
  // preferimos la entrada específica de PS4/PS5 para no traer la carátula de otra versión/plataforma
  // (ej. "Alone in the Dark" 2008 vs el remake 2024). Si el juego no está indexado para PS4/PS5
  // (común en lanzamientos muy nuevos), usamos el primer resultado igual antes que no traer nada.
  const match = games.find((g) => PLAYSTATION_PLATFORM_IDS.has(g.platform)) ?? games[0]
  const gameId = match?.id
  if (!gameId) return null

  const imagesUrl = new URL(`${BASE_URL}/Games/Images`)
  imagesUrl.searchParams.set('apikey', API_KEY)
  imagesUrl.searchParams.set('games_id', String(gameId))
  imagesUrl.searchParams.set('filter[type]', 'boxart')

  const imagesData = await fetchJson(imagesUrl)
  const image = imagesData.data?.images?.[gameId]?.[0]
  const baseImageUrl = imagesData.data?.base_url?.large ?? imagesData.data?.base_url?.original
  if (!image || !baseImageUrl) return null

  return `${baseImageUrl}${image.filename}`
}

async function main() {
  if (!API_KEY) {
    console.error('Falta THEGAMESDB_API_KEY en .env — no se puede enriquecer con carátulas.')
    process.exit(1)
  }

  const catalog = JSON.parse(await readFile(GAMES_PATH, 'utf-8'))
  const pending = catalog.games.filter((g) => !g.coverImageUrl)

  console.log(`Juegos sin carátula: ${pending.length} / ${catalog.games.length}`)

  let found = 0
  let notFound = 0
  let errors = 0

  for (const [i, game] of pending.entries()) {
    try {
      const coverImageUrl = await searchCoverImage(game.title)
      if (coverImageUrl) {
        game.coverImageUrl = coverImageUrl
        found += 1
        console.log(`[${i + 1}/${pending.length}] OK  ${game.title}`)
      } else {
        notFound += 1
        console.log(`[${i + 1}/${pending.length}] SIN RESULTADOS  ${game.title}`)
      }
    } catch (err) {
      errors += 1
      console.error(`[${i + 1}/${pending.length}] ERROR  ${game.title}: ${err.message}`)
    }

    if ((i + 1) % 20 === 0) {
      await writeFile(GAMES_PATH, JSON.stringify(catalog, null, 2), 'utf-8')
    }
  }

  await writeFile(GAMES_PATH, JSON.stringify(catalog, null, 2), 'utf-8')

  const stillPending = catalog.games.filter((g) => !g.coverImageUrl).length
  console.log(`\nListo. Encontradas: ${found} | Sin resultados: ${notFound} | Errores: ${errors}`)
  console.log(`Juegos que aún quedan sin carátula: ${stillPending}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
