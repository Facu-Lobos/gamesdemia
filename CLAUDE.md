# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm run dev             # start the Vite dev server (localhost:5173)
npm run build            # tsc -b type-check, then vite build -> dist/
npm run preview           # serve the production build locally
npm run lint                # oxlint
npm run calcular-precio-final # regenerate src/data/games.json from data-source/lista_proveedor.txt (provider prices), applying a 40% margin
npm run enrich-videos         # fill in games.json[].videoId via YouTube Data API
npm run enrich-videos-ytdlp     # fill games.json[].videoId via yt-dlp (no API quota; needs video/cookies.txt, see below)
npm run enrich-covers           # fill in games.json[].coverImageUrl via RAWG API
npm run enrich-covers-tgdb      # fill in games.json[].coverImageUrl via TheGamesDB API (fallback used while RAWG was down)
```

There is no test suite in this project.

`enrich-videos`, `enrich-covers`, and `enrich-covers-tgdb` require `YOUTUBE_API_KEY`, `RAWG_API_KEY`, and `THEGAMESDB_API_KEY` respectively in a local `.env` (gitignored, not read by Vite — these are plain Node scripts loading `dotenv` themselves). All three are idempotent: they only fetch for games missing the field, so re-running after adding new games to the catalog is cheap and safe.

## Architecture

This is a static, single-page catalog site for "Gamesdemia" (Argentine PS4/PS5 digital game reseller). No backend, no routing, no auth — everything renders from one JSON file bundled at build time. "Buying" happens by handing off to WhatsApp (`wa.me` deep links), not a cart/checkout.

### Data pipeline (provider price list -> JSON -> UI)

The catalog's source of truth is `src/data/games.json`, generated from `data-source/lista_proveedor.txt` and committed to the repo (the running app imports it directly, it does not compute prices at runtime).

1. **`scripts/calcular-precio-final.mjs`** — reads `data-source/lista_proveedor.txt` (one `Título - $ precioProveedor` per line — copy/pasted from the provider's reseller price sheet, a Google Sheet, with no markup applied yet), then per line:
   - Splits off the trailing `$price` (Argentine thousands-separator format).
   - Strips `™`/`®` artifacts via `cleanTitle()`.
   - Detects platform (`PS4` / `PS5` / `PS4/PS5`) by scanning for those tokens *inside the title string itself*, then strips those tokens back out to produce the display title.
   - Computes `priceArs = round(precioProveedor * 1.4 / 500) * 500` — a flat 40% margin, always rounded to the nearest $500 so displayed prices look clean (e.g. $20.000, never $20.085).
   - Extracts the "Ofertas válidas hasta: DD/MM/YYYY" line into `meta.offerExpiration`.
   - Merges into the existing `games.json` by `id`, so `videoId`/`coverImageUrl` already fetched for a title are preserved across regenerations; games no longer in the source list are dropped, new ones appear without enrichment (run `enrich-videos`/`enrich-covers` after).
   - Appends the hand-loaded games from `data-source/juegos_manuales.json` (see below).
   - Logs any unparsable line as `SKIPPED` rather than dropping it silently.
   - The header line may be `ofertas válidas hasta DD/MM/YYYY` or `OFERTAS DESTACADAS HASTA EL DÍA DD/MM/YYYY` (both parsed); the 💎 emoji and exact duplicate lines are ignored.

#### Manual games (`data-source/juegos_manuales.json`)

Games not in the provider sheet (e.g. FC 27, GTA 6 — primary accounts only, **no secondary accounts**). Each entry has `id`, `title`, `platform`, `precioProveedor` (the same 40% margin + $500 rounding is applied) and optional `description` (shown on the card and modal, currently "Consultar stock"). They survive regeneration; remove a line from the file to drop a game. `Game.description?` is the optional field in `types.ts`.

2. **`scripts/enrich-videos.mjs`** — searches YouTube Data API v3 per game (`search.list`, `q="<title> gameplay trailer PS5"`) and caches the resulting `videoId` onto each game object. YouTube's free tier is 10,000 units/day at 100 units/search, i.e. **~95 games per run** — the script stops gracefully at that budget and is meant to be re-run on subsequent days until every game has a `videoId`. This `videoId` powers the gameplay modal (`GameplayModal.tsx`), embedded as a plain YouTube iframe.
   **`scripts/enrich-videos-ytdlp.mjs`** is the quota-free alternative: runs `python -m yt_dlp --flat-playlist --print id "ytsearch1:<title> gameplay trailer PS5"` per game missing a `videoId` and saves every 10 games. Override the command with the `YTDLP_CMD` env var.
3. **`scripts/enrich-covers.mjs`** — searches the RAWG API (`api.rawg.io/api/games?search=...`) per game and caches `background_image` as `coverImageUrl`. This is the actual product photo shown on cards; YouTube thumbnails were deliberately rejected for this purpose (they carry trailer-promo text baked into the image) in favor of RAWG's official box/key art. `searchableTitle()` strips edition/language suffixes (Deluxe, Ultimate, ESPAÑOL LATINO, etc.) before querying, since RAWG indexes the base game.
4. **`scripts/enrich-covers-tgdb.mjs`** — same job as `enrich-covers.mjs` (fills `coverImageUrl`) but sources images from TheGamesDB (`api.thegamesdb.net/v1`) instead, for when RAWG is unavailable. Two calls per game: `Games/ByGameName` to find the game id, then `Games/Images?filter[type]=boxart` to get the box art filename, joined with `base_url.large`. TheGamesDB mixes every platform/region/remake under one title in search results, so the script filters for platform id `4919` (PS4) or `4980` (PS5) specifically — falls back to the first result if no PS4/PS5 entry exists (common for very recent releases not yet indexed for console). Free tier is a **monthly** allowance (~1000 calls), not daily like YouTube's — mind that when re-running. Coverage is smaller than RAWG's (some bundles/lesser-known titles return no match).

### Runtime data flow

`App.tsx` imports `games.json` once at module scope and derives `featuredGames = getFeaturedGames(games)` (`src/data/featured.ts`). `PINNED_IDS` in `featured.ts` puts specific games first by id (currently GTA 6 Standard/Ultimate, then FC 27 PS5/PS4). The rest of the featured games are **not** a hand-picked list of game objects — `featured.ts` holds a list of franchise *keywords* (e.g. `"god of war"`, `"tekken"`) matched against whatever is actually in the current catalog via `normalize()` (`src/lib/search.ts`). A keyword with no match in stock is silently skipped. When the catalog is regenerated, re-check this list against what's actually for sale — franchises can disappear from stock, or a full curation pass may surface newly reasonable keywords.

`GameThumbnail.tsx` is the single place that decides what image a card shows: `coverImageUrl` if present, else an initials placeholder — no other fallback tier.

### Component layout

- `components/layout/` — `Header`, `Footer` (site chrome, logo, WhatsApp CTA).
- `components/hero/` — landing hero with offer-expiration badge.
- `components/featured/` — the curated franchise carousel (`FeaturedSection` + `FeaturedCard`).
- `components/catalog/` — `CatalogSection` owns the search/platform-filter/sort state (see `lib/search.ts`'s `filterAndSortGames`) and renders `GameGrid` -> `GameCard`; `GameplayModal` is opened by clicking any card (in both featured and catalog sections) and shows the embedded YouTube video for that game's `videoId`.
- `components/common/` — shared primitives: `PlatformBadge`, `PriceTag` (ARS `Intl.NumberFormat` formatting), `WhatsAppButton`, `GameThumbnail`.

`lib/whatsapp.ts` builds the `wa.me` deep links with a prefilled per-game message; `config/site.ts` holds the business's WhatsApp number. Note the Argentine mobile number quirk documented inline there: a `9` must be inserted after the `54` country code for `wa.me` links to resolve correctly.

### Styling

Tailwind v4, CSS-first config — there is no `tailwind.config.js`; brand color tokens (cosmic black / flame red / neon blue) and font families are declared via `@theme` directly in `src/index.css`, alongside hand-written utility classes (`.fire-frame`, `.glow-red`, `.text-glow-red`, `.cosmic-dust`) used for the brand's aggressive/neon visual identity.

## Marketing videos (`video/`)

A separate Remotion 4 project (own `package.json`; `cd video && npm i`). Not part of the site build and **not committed** (`video/` is untracked; `.gitignore` excludes `video/node_modules`, `video/public/clips`, `video/out`, `video/cookies.txt`).

- Compositions in `src/Root.tsx`: `Oferta` (30s Instagram promo, 1080x1920, gameplay clips from `public/clips/*.mp4`), `Flyer` (still 1080x1350 -> `out/flyer-gamesdemia.png`), `Explicativo` (~1 min explainer with voice-over and subtitles).
- Render with system Chrome: `npx remotion render src/index.ts <Id> out/<file>.mp4 --codec=h264 "--browser-executable=C:/Program Files/Google/Chrome/Application/chrome.exe"`. `remotion still` does not overwrite; delete the file first. Remotion's bundled ffmpeg is minimal: use `npx remotion ffmpeg`.
- Voice: the owner's own recordings in `public/voz/` (originals, untouched). `narration/limpiar_y_transcribir.py` denoises (high-pass + noisereduce) and transcribes with faster-whisper; `narration/ordenar_audios.py` matches them to the script (`narration/guion.json`, order recorded in the script), trims silences and writes `narration/duraciones.json` (copy to `src/duraciones.json`). Cleaned audio is in `public/voz_limpia/s1..s8.wav`. `narration/generar.py` is the old edge-tts (`es-AR-TomasNeural`) synthetic voice, which the owner rejected. Run Python with `-I -X utf8` on Windows.
- Site screenshots for the phone mockups: `narration/capturas.mjs` (puppeteer-core, 430x860 @2.5x) -> `public/shots/`.
- yt-dlp needs YouTube cookies exported to `video/cookies.txt` (sensitive, gitignored), `--js-runtimes node`, and `yt-dlp[default]`.
