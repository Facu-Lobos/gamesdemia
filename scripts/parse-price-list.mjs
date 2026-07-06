import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFParse } from 'pdf-parse'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PDF_PATH = path.join(__dirname, '..', 'data-source', 'lista_juegos.pdf')
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'games.json')

const NOISE_LINES = new Set(['LISTA DE JUEGOS GAMESDEMIA', 'Juego Precio', 'Juego', 'Precio'])

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cleanTitle(rawTitle) {
  return rawTitle
    .replace(/[™®]n?/g, '')
    .replace(/■/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectPlatform(title) {
  const hasPs5 = /\bPS5\b/i.test(title)
  const hasPs4 = /\bPS4\b/i.test(title)
  if (hasPs4 && hasPs5) return 'PS4/PS5'
  if (hasPs5) return 'PS5'
  if (hasPs4) return 'PS4'
  return 'PS4/PS5'
}

function stripPlatformTokens(title) {
  return title
    .replace(/\bCross\s*Gen(\s*Edition)?\b/gi, '')
    .replace(/\bPS4\s*\/?\s*PS5\b/gi, '')
    .replace(/\bPS5\b/gi, '')
    .replace(/\bPS4\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function main() {
  const buffer = await readFile(PDF_PATH)
  const parser = new PDFParse({ data: buffer })
  const { text } = await parser.getText()
  await parser.destroy()

  const expiryMatch = text.match(/v[aá]lidas?\s+hasta:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i)
  const offerExpiration = expiryMatch ? expiryMatch[1] : null

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => !NOISE_LINES.has(l))
    .filter((l) => !/^Ofertas\s+v[aá]lidas/i.test(l))
    .filter((l) => !/^--\s*\d+\s+of\s+\d+\s*--$/i.test(l))

  const games = []
  const skipped = []
  const seenIds = new Map()

  for (const line of lines) {
    const priceMatch = line.match(/\$\s*([\d.]+)\s*$/)
    if (!priceMatch) {
      skipped.push(line)
      continue
    }
    const priceArs = Number(priceMatch[1].replace(/\./g, ''))
    if (!Number.isFinite(priceArs) || priceArs <= 0) {
      skipped.push(line)
      continue
    }

    const rawTitle = line.slice(0, priceMatch.index).trim()
    if (!rawTitle) {
      skipped.push(line)
      continue
    }

    const title = cleanTitle(rawTitle)
    const platform = detectPlatform(title)
    const displayTitle = stripPlatformTokens(title) || title

    let id = slugify(displayTitle)
    const count = seenIds.get(id) ?? 0
    seenIds.set(id, count + 1)
    if (count > 0) id = `${id}-${count}`

    games.push({ id, title: displayTitle, platform, priceArs })
  }

  games.sort((a, b) => a.title.localeCompare(b.title, 'es'))

  const output = {
    meta: {
      offerExpiration,
      totalCount: games.length,
      generatedAt: new Date().toISOString(),
      sourceFile: 'lista_juegos.pdf',
    },
    games,
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8')

  console.log(`Parsed ${games.length} games.`)
  console.log(`Offer expiration: ${offerExpiration ?? 'NOT FOUND'}`)
  console.log(`Skipped ${skipped.length} lines:`)
  for (const line of skipped) console.log(`  SKIPPED: ${line}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
