import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const GAMES_PATH = path.join(__dirname, '..', 'src', 'data', 'games.json')
const API_KEY = process.env.RAWG_API_KEY

// Quita subtítulos de edición/idioma que confunden la búsqueda en RAWG (que indexa el juego base).
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

async function searchCoverImage(title) {
  const url = new URL('https://api.rawg.io/api/games')
  url.searchParams.set('key', API_KEY)
  url.searchParams.set('search', searchableTitle(title))
  url.searchParams.set('page_size', '1')

  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`RAWG API ${res.status}: ${body}`)
  }
  const data = await res.json()
  return data.results?.[0]?.background_image ?? null
}

async function main() {
  if (!API_KEY) {
    console.error('Falta RAWG_API_KEY en .env — no se puede enriquecer con carátulas.')
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
