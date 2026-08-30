---
applyTo: "client/src/**/*.{ts,tsx,css}"
---

# Frontend instructions for Hassad

Keep Arabic RTL by default and validate English LTR layouts. Prefer existing shadcn/ui components and project contexts. Use tRPC hooks from `@/lib/trpc` for server state; include loading, empty, and error states for every query.

Protect mobile usability: use `min-w-0` for grid children, avoid fixed widths that overflow, account for the mobile bottom navigation, and make tap targets clear. Respect `prefers-reduced-motion`. Do not nest links or place button-like controls inside an anchor. Do not hard-code customer feedback, ratings, or unverified claims.
