import { readFile, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GAMES_PATH = path.join(__dirname, '..', 'src', 'data', 'games.json')
const YTDLP = process.env.YTDLP_CMD ?? 'python'
const YTDLP_ARGS = process.env.YTDLP_CMD ? [] : ['-m', 'yt_dlp']

async function searchVideoId(title) {
  const { stdout } = await run(
    YTDLP,
    [...YTDLP_ARGS, '--flat-playlist', '--print', 'id', `ytsearch1:${title} gameplay trailer PS5`],
    { timeout: 60000 },
  )
  const id = stdout.trim().split('\n')[0]
  return /^[\w-]{11}$/.test(id) ? id : null
}

async function main() {
  const catalog = JSON.parse(await readFile(GAMES_PATH, 'utf-8'))
  const pending = catalog.games.filter((g) => !g.videoId)
  console.log(`Juegos sin video: ${pending.length} / ${catalog.games.length}`)

  let found = 0
  let i = 0
  for (const game of pending) {
    i += 1
    try {
      const videoId = await searchVideoId(game.title)
      if (videoId) {
        game.videoId = videoId
        found += 1
        console.log(`[${i}/${pending.length}] OK  ${game.title} -> ${videoId}`)
      } else {
        console.log(`[${i}/${pending.length}] SIN RESULTADOS  ${game.title}`)
      }
    } catch (err) {
      console.error(`[${i}/${pending.length}] ERROR  ${game.title}: ${err.message.split('\n')[0]}`)
    }
    if (i % 10 === 0) await writeFile(GAMES_PATH, JSON.stringify(catalog, null, 2), 'utf-8')
  }

  await writeFile(GAMES_PATH, JSON.stringify(catalog, null, 2), 'utf-8')
  console.log(`\nListo. Encontrados: ${found} | Quedan sin video: ${catalog.games.filter((g) => !g.videoId).length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
