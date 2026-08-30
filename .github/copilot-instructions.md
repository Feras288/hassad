# Hassad repository instructions

Hassad is a Saudi agricultural platform built with React 19, TypeScript, Tailwind 4, Wouter, tRPC 11, Express, Drizzle ORM, and MySQL/TiDB. Arabic RTL is the default UI; English LTR is supported via `LanguageContext` and `client/src/i18n/english.json`.

## Architecture

- UI routes: `client/src/pages/`; shared UI: `client/src/components/`; client state: `client/src/contexts/`.
- tRPC contracts: `server/routers.ts`; query helpers: `server/db.ts`.
- Schema and migrations: `drizzle/schema.ts` and `drizzle/`.
- Vitest specs: `server/*.test.ts`.

For persistent features follow: `schema -> migration -> db helper -> tRPC procedure -> UI -> Vitest`. Use existing `trpc.*.useQuery` and `trpc.*.useMutation` patterns; do not introduce direct REST/fetch clients for app data.

Do not generate fake reviews, ratings, testimonials, certificates, merchant data, or performance claims. Never commit secrets, edit framework internals under `server/_core` unless necessary, run destructive SQL, or use `git reset --hard`.

Keep Arabic RTL and English LTR correct. Build mobile-first pages that do not overflow or collide with the fixed mobile navigation. Preserve loading, empty, and error states. Wouter's `Link` renders an anchor: never nest `<a>` inside it.

Run `pnpm check && pnpm test` after changes. Run `pnpm build` after adding packages, changing Vite/build configuration, or integrating browser-only dependencies. Read `AGENTS.md` and `docs/` for fuller guidance.
