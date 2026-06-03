# OTOTR API Workspace

This folder is reserved for a future dedicated backend API server.

Current decision on 2026-06-03:

- Do not start a separate Node/NestJS/Fastify production API yet.
- Use Supabase/Postgres, RLS, reviewed RPCs and Supabase Edge Functions as the first backend layer.
- Keep server-only public form and integration endpoints under `supabase/functions`.
- Revisit this folder when mobile branch, technician and bayi portal contracts require a long-running custom API server.

Hard rules:

- Do not place service-role keys, API tokens or real `.env` values in this folder.
- Do not duplicate Supabase RPC behavior here unless there is a documented reason.
- Document endpoint contracts in `docs/api.md` before implementation.
