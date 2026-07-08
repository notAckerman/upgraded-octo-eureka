# DECISIONS.md — Architecture and design decisions

> Every non-trivial decision gets logged here. Future contributors: read this before changing anything.

---

## D001 · Stack: Next.js 15+ instead of Express + Vite

- **Decision**: Use Next.js App Router with RSC instead of separate Express backend + Vite React frontend.
- **Why**: Single fullstack repo with SSR/SSG for the landing, API routes for the proxy and webhooks, and React Server Components for data-heavy pages. Reduces client JS, simplifies deployment (one process), and gives us streaming SSR for the chat playground.
- **Trade-off**: Slightly more complex routing mental model vs Express. Accepted because the product has many pages with shared layouts (dashboard, admin) where App Router excels.

## D002 · Database: PostgreSQL (not SQLite)

- **Decision**: PostgreSQL from day one, even in dev.
- **Why**: The spec requires Redis for rate limits and the production target is Postgres. Running Postgres locally via docker-compose keeps dev close to prod. SQLite would require migration later and lacks features we need (JSON queries, concurrent writers).
- **Trade-off**: Heavier local setup (docker required). Mitigated by docker-compose with health checks.

## D003 · Money: Decimal(14,6) everywhere

- **Decision**: Every monetary field uses Prisma `Decimal` backed by `NUMERIC(14,6)` in Postgres. No `Float` for money anywhere in the codebase.
- **Why**: Floating-point rounding errors in a billing system are catastrophic. Decimal gives exact arithmetic.
- **Trade-off**: Slightly more verbose code (can't use `===` directly, need `.equals()` or string comparison). Accepted as non-negotiable for financial correctness.

## D004 · Auth: Auth.js v5 with credentials provider

- **Decision**: Use Auth.js (NextAuth) v5 with a credentials provider (email + bcrypt). JWT sessions, not database sessions.
- **Why**: Credentials provider because users sign up with email/password. JWT avoids a DB round-trip on every request. Auth.js integrates cleanly with Next.js middleware for route protection.
- **Trade-off**: Auth.js v5 is newer and has some rough edges. Using `jose` for manual JWT handling where Auth.js doesn't cover (API key auth).

## D005 · Payment: Cryptomus for crypto

- **Decision**: Cryptomus over NOWPayments for crypto payments.
- **Why**: Cryptomus has a cleaner API, supports RUB-equivalent invoicing natively, and has better documentation for webhook verification (HMAC SHA-256). Lower fees for RU market.
- **Trade-off**: Smaller brand recognition than NOWPayments. Acceptable because the payment UX is white-labeled.

## D006 · Payment: YooKassa for SBP

- **Decision**: YooKassa over Tinkoff for SBP payments.
- **Why**: YooKassa has native SBP support via `payment_method_data.type = "sbp"`, comprehensive webhook verification, and handles the bank routing. Tinkoff requires more manual integration.
- **Trade-off**: YooKassa takes a slightly higher commission. Accepted for developer experience.

## D007 · Design: Glacial cyan accent

- **Decision**: Accent hue `oklch(0.82 0.13 210)` (glacial cyan) for both themes.
- **Why**: Avoids the banned purple-blue "AI gradient" and the acid-green-on-black stock look. Reads as cold, technical, and premium against the near-black base.
- **Trade-off**: Less "warm" than some alternatives. Deliberate choice for a data/developer product.

## D008 · Fonts: Unbounded + Onest + JetBrains Mono

- **Decision**: Unbounded 500/600 for display, Onest for body/UI, JetBrains Mono for code/numbers.
- **Why**: All three have full Cyrillic support. Unbounded is geometric and distinctive without being quirky. Onest is clean and modern. JetBrains Mono has excellent tabular numerals for data-dense tables.
- **Trade-off**: Three font families is more than ideal. Reduced by limiting Unbounded to h1/h2 only.

## D009 · Brand name: Узел (Uzel)

- **Decision**: The `{{BRAND_NAME}}` placeholder was empty. Per the master prompt, proposed three Cyrillic-friendly names (Узел, Тракт, Реле) and took the first: **Узел** (Latin wordmark "Uzel"), approved at Step 1.
- **Why**: "Узел" means network node / hub — one point where every model, key, and balance converge. It ties directly to the R1 Neural Lattice hero (a lattice of nodes) and reads technical and precise.
- **Trade-off**: `{{DOMAIN}}` and `{{TG_CHANNEL}}` were also unfilled; using `uzel.dev` and `t.me/uzel_api` as stand-ins (all references flow through `src/lib/site.ts`, easy to change).

## D010 · Landing theme + 3D budget

- **Decision**: The marketing landing is designed dark-first but stays theme-reactive (all sections use CSS-variable tokens that swap together, so the navbar toggle re-derives both themes). The R1 Neural Lattice is the single hero-grade 3D scene. The R6 ambient backdrop and the R3 token-stream are implemented in CSS, not additional WebGL canvases.
- **Why**: Honors the tasteskill doctrine "exactly one hero-grade scene; other 3D is ambient or micro" and keeps the landing 3D JS budget lean (three/r3f/drei only loads for the hero, `ssr:false` + poster). CSS covers the ambient roles at a fraction of the cost.
- **Trade-off**: The token-stream and ambient backdrop are not true 3D. Accepted; they read the same at these sizes and cost far less.

## D011 · Icons: keep lucide-react

- **Decision**: Use lucide-react (already a project dependency and the shadcn `iconLibrary`) rather than switching to Phosphor.
- **Why**: The tasteskill discourages lucide as a default but allows it when the project already depends on it. One icon family per project; switching would churn the shadcn setup for no user-visible gain.

## D012 · No fake social proof

- **Decision**: No customer "trusted by" logo wall, no testimonials, no invented traction numbers. The provider marquee shows model providers we route to (a capability list). The stat band shows honest product facts (catalog size, max context, payment methods, per-key rate limit).
- **Why**: The master prompt bans fake numbers, fake testimonials, and fake social proof outright. For a pre-launch product the honest move is to state real capabilities, not fabricate adoption.

## D013 · Dual proxy format: OpenAI + Anthropic native

- **Decision**: The proxy (P4) will expose both `/api/v1/chat/completions` (OpenAI-compatible, per the master prompt) and `/api/v1/messages` (Anthropic-native: `x-api-key` + `anthropic-version` headers, required `max_tokens`, Anthropic request/response shape). Landing and docs show both the OpenAI SDK and the official `@anthropic-ai/sdk` pointed at our base URL.
- **Why**: The user asked for Anthropic SDK examples. The Anthropic SDK targets `/v1/messages` with a different shape than OpenAI, so truthful examples require a native endpoint. It also matches the product lineage (a Claude/Anthropic reselling proxy) and is a real differentiator.
- **Trade-off**: Two request/response adapters to maintain instead of one. Contained behind a shared billing/routing core so only the translation layer differs. Verified model IDs against the claude-api skill: `claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5` are current.

## D014 · Hero 3D re-tune (parallax roll removed)

- **Decision**: Rewrote the R1 scene: parallax is now pitch + yaw only (no Z-axis roll), jitter cut from 0.06 to 0.02, spin and parallax split into nested groups, per-node depth falloff + fog, softer node shader, Bloom plus a cinematic Vignette.
- **Why**: The original looked "crooked" mainly because pointer parallax rotated the group on Z (roll), tilting the whole lattice; heavy jitter made it lumpy. These changes give a calm, premium constellation that reads as a network.