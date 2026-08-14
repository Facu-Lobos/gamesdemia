import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE_PATH = path.join(__dirname, '..', 'data-source', 'lista_proveedor.txt')
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'games.json')

const MARGEN = 1.4 // 40% de ganancia sobre el precio de proveedor
const REDONDEO = 500 // el precio final siempre cae en un múltiplo de $500

function calcularPrecioFinal(precioProveedor) {
  return Math.round((precioProveedor * MARGEN) / REDONDEO) * REDONDEO
}

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
    .replace(/[™®]️?/g, '')
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
  const raw = await readFile(SOURCE_PATH, 'utf-8')
  const existing = JSON.parse(await readFile(OUTPUT_PATH, 'utf-8'))
  const existingById = new Map(existing.games.map((g) => [g.id, g]))

  const expiryMatch = raw.match(/v[aá]lidas?\s+hasta:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i)
  const offerExpiration = expiryMatch ? expiryMatch[1] : existing.meta.offerExpiration

  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => !/^Ofertas\s+v[aá]lidas/i.test(l))

  const games = []
  const skipped = []
  const seenIds = new Map()

  for (const line of lines) {
    const priceMatch = line.match(/\$\s*([\d.,]+)\s*$/)
    if (!priceMatch) {
      skipped.push(line)
      continue
    }
    const precioProveedor = Number(priceMatch[1].replace(/,/g, ''))
    if (!Number.isFinite(precioProveedor) || precioProveedor <= 0) {
      skipped.push(line)
      continue
    }

    const rawTitle = line.slice(0, priceMatch.index).replace(/-\s*$/, '').trim()
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

    const priceArs = calcularPrecioFinal(precioProveedor)
    const previous = existingById.get(id)

    games.push({
      id,
      title: displayTitle,
      platform,
      priceArs,
      ...(previous?.videoId ? { videoId: previous.videoId } : {}),
      ...(previous?.coverImageUrl ? { coverImageUrl: previous.coverImageUrl } : {}),
    })
  }

  games.sort((a, b) => a.title.localeCompare(b.title, 'es'))

  const output = {
    meta: {
      offerExpiration,
      totalCount: games.length,
      generatedAt: new Date().toISOString(),
      sourceFile: 'lista_proveedor.txt',
    },
    games,
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8')

  console.log(`Calculados ${games.length} precios finales (margen ${Math.round((MARGEN - 1) * 100)}%, redondeo a $${REDONDEO}).`)
  console.log(`Skipped ${skipped.length} lines:`)
  for (const line of skipped) console.log(`  SKIPPED: ${line}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
