# HDWallpapers.site — 4.1.1

Next.js 15 wallpaper platform rebuilt from the v3 PHP/MySQL codebase.

## Stack

- **Next.js 15** (App Router, Route Handlers)
- **Neon Postgres** + Drizzle ORM
- **Cloudflare R2** for image storage
- **Better Auth** (email + Google + GitHub)
- **next-intl** (8 locales)
- **Sharp** for image processing
- **Vercel** deployment

## Quick Start

```bash
pnpm install
cp .env.example .env.local
# Fill in DATABASE_URL, R2 credentials, BETTER_AUTH_SECRET

pnpm db:push      # Push schema to Neon (creates `hdws_public` schema + tables)
pnpm seed         # Seed categories, resolutions, licenses, admin user

pnpm dev
```

## Admin

Default admin email: `brargurshobit2009@gmail.com`  
Set password via `ADMIN_PASSWORD` in `.env.local` before running seed.

Admin panel: `/admin`

## Reference Files

- `docs/v3/walls.sql` — v3 MySQL schema (seed source)
- `docs/design/hdwallpapers.site.dc.html` — UI design reference

## Deployment

1. Deploy to Vercel
2. Set all env vars from `.env.example`
3. **Production auth URLs** (both must match your canonical host):
   ```
   BETTER_AUTH_URL=https://www.hdwallpapers.site
   NEXT_PUBLIC_SITE_URL=https://www.hdwallpapers.site
   ```
   Redeploy after setting `NEXT_PUBLIC_SITE_URL` (baked in at build time).
4. Point `www.hdwallpapers.site` and `hdwallpapers.site` → Vercel (redirect apex → www if possible)
5. Point `static.hdwallpapers.site` → Cloudflare R2 public bucket
6. Run `pnpm db:push && pnpm seed` against production Neon DB
7. Submit sitemap to Google Search Console
