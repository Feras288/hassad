---
applyTo: "server/**/*.ts,drizzle/**/*.ts"
---

# Backend and data instructions for Hassad

Use typed Drizzle helpers in `server/db.ts` and typed tRPC procedures in `server/routers.ts`. Authorization must be checked server-side; never trust a role or user identifier supplied by the client.

When changing persistent data, update `drizzle/schema.ts`, generate a migration, inspect it for data loss, and apply it separately. Prefer additive nullable migrations for live data. Store timestamps in UTC. Do not put binary file data in the database; store an approved storage URL and metadata instead. Add or update Vitest coverage in `server/*.test.ts` for changed contracts, permissions, and error paths.
