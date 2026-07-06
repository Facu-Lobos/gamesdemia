import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const GAMES_PATH = path.join(__dirname, '..', 'src', 'data', 'games.json')
const API_KEY = process.env.YOUTUBE_API_KEY
const SEARCH_COST_UNITS = 100
const DAILY_FREE_QUOTA = 10000
const MAX_SEARCHES_PER_RUN = Number(process.env.MAX_SEARCHES_PER_RUN ?? Math.floor((DAILY_FREE_QUOTA * 0.95) / SEARCH_COST_UNITS))

async function searchVideoId(title) {
  const query = `${title} gameplay trailer PS5`
  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'video')
  url.searchParams.set('maxResults', '1')
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`YouTube API ${res.status}: ${body}`)
  }
  const data = await res.json()
  return data.items?.[0]?.id?.videoId ?? null
}

async function main() {
  if (!API_KEY) {
    console.error('Falta YOUTUBE_API_KEY en .env — no se puede enriquecer con videos.')
    process.exit(1)
  }

  const catalog = JSON.parse(await readFile(GAMES_PATH, 'utf-8'))
  const pending = catalog.games.filter((g) => !g.videoId)

  console.log(`Juegos sin video: ${pending.length} / ${catalog.games.length}`)
  console.log(`Límite de búsquedas en esta corrida: ${MAX_SEARCHES_PER_RUN} (cuota gratuita diaria)`)

  let searched = 0
  let found = 0
  let notFound = 0

  for (const game of pending) {
    if (searched >= MAX_SEARCHES_PER_RUN) {
      console.log('Límite de cuota alcanzado para esta corrida. Volvé a correr el script mañana para seguir.')
      break
    }

    searched += 1
    try {
      const videoId = await searchVideoId(game.title)
      if (videoId) {
        game.videoId = videoId
        found += 1
        console.log(`[${searched}] OK  ${game.title} -> ${videoId}`)
      } else {
        notFound += 1
        console.log(`[${searched}] SIN RESULTADOS  ${game.title}`)
      }
    } catch (err) {
      console.error(`[${searched}] ERROR  ${game.title}: ${err.message}`)
      if (/quotaExceeded/i.test(err.message)) {
        console.log('Cuota de YouTube agotada. Cortando acá — lo ya encontrado quedó guardado.')
        break
      }
    }

    // Guarda progreso cada 10 juegos para no perder trabajo si algo falla a mitad de camino.
    if (searched % 10 === 0) {
      await writeFile(GAMES_PATH, JSON.stringify(catalog, null, 2), 'utf-8')
    }
  }

  await writeFile(GAMES_PATH, JSON.stringify(catalog, null, 2), 'utf-8')

  const stillPending = catalog.games.filter((g) => !g.videoId).length
  console.log(`\nListo. Encontrados: ${found} | Sin resultados: ${notFound} | Buscados: ${searched}`)
  console.log(`Juegos que aún quedan sin video: ${stillPending}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
