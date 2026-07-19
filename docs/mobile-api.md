# Mobile API Reference

This document describes how a native mobile app (or any HTTP client) consumes the
HDWallpapers API. The app needs **no third-party SDK** — plain HTTP requests only.

## Base URL

```
https://www.hdwallpapers.site
```

All API paths below are relative to this base and are **not** locale-prefixed
(e.g. call `/api/wallpapers`, never `/en/api/wallpapers`).

## Conventions

- Requests/responses are JSON. Send `Content-Type: application/json` on writes.
- Errors always look like `{ "error": "message" }`.
- Treat any non-2xx status as failure. Status codes are mostly meaningful
  (`400` bad input, `401` unauthenticated, `403` forbidden, `404` not found,
  `500` server error), but always read `error` for the message.
- CORS is enabled for `/api/*`. Native HTTP clients ignore CORS; WebView / web
  wrappers must have their origin in `API_CORS_ORIGINS` (see Configuration).

## Authentication (Bearer token)

Auth uses better-auth with the **bearer plugin**. Flow:

1. **Register** or **Login**. The response includes a `set-auth-token` header.
2. Store that token securely on the device.
3. Send it on every authenticated request:

```
Authorization: Bearer <token>
```

The same endpoints power the web app via cookies; the mobile app just uses the
header instead. No cookie jar required.

### Register

```
POST /api/auth/register
{ "username": "jane", "email": "jane@example.com", "password": "secret123", "firstName": "Jane", "lastName": "Doe" }
```

On success returns the session/user JSON and a `set-auth-token` response header.

### Login

```
POST /api/auth/login
{ "email": "jane@example.com", "password": "secret123" }
```

Read the token from the `set-auth-token` response header. `401` = invalid
credentials; `403` = email not verified (when confirmation is required).

### Current session / user

```
GET /api/auth/get-session          Authorization: Bearer <token>
```

Returns the better-auth session (or `null`). Use `GET /api/account/settings`
for the app-level profile.

### Logout

```
POST /api/auth/sign-out            Authorization: Bearer <token>
```

### Password reset

```
POST /api/auth/request-password-reset   { "email": "jane@example.com", "redirectTo": "/reset-password" }
POST /api/auth/reset-password           { "newPassword": "...", "token": "<from email>" }
```

### OAuth (Google / GitHub)

OAuth is browser/redirect based. For native, open the provider URL in the system
browser / in-app browser and handle the redirect via a deep link. Email +
password (above) is the primary phase-1 path.

## Content (read, public)

- `GET /api/wallpapers?page=1&sort=latest` — list wallpapers.
- `GET /api/wallpapers/{id}` — single wallpaper.
- `GET /api/search?q=term` — search wallpapers, tags, creators.
- `GET /api/resolutions?uuid={wallpaperUuid}` — resolution types/sizes.
- `GET /api/collections?filter=All&sort=popular&q=&featured=` — list collections.
- `GET /api/pages` — CMS pages; page bodies are HTML.

## User interactions (require Bearer token)

- `POST /api/likes` — `{ "wallpaperId": 123 }` toggle like.
- `POST /api/shortlist` — `{ "wallpaperId": 123 }` toggle shortlist. `GET` for status.
- `POST /api/comments` — `{ "wallpaperId": 123, "message": "<p>Nice!</p>" }`. Message may contain rich HTML; it is sanitized on render.
- `GET|POST|DELETE /api/users/{handle}/follow` — follow status / toggle / unfollow.
- `POST /api/views` — `{ "wallpaperId": 123 }` record a view (auth optional).

## Account settings (require Bearer token)

- `GET /api/account/settings` — profile, privacy, notifications.
- `PATCH /api/account/settings` — `{ "section": "profile"|"privacy"|"notifications"|"password"|"email", ... }`.

## Collections (require Bearer token)

- `POST /api/collections` — create `{ "name", "description", "category", "featured" }`.
- `PATCH|DELETE /api/collections/{id}` — update / delete (owner only).
- `POST|DELETE /api/collections/{id}/wallpapers` — `{ "wallpaperId": 123 }` add / remove.
- `POST /api/collections/{id}/save` — toggle save.

## Upload flow (require Bearer token)

1. `POST /api/upload` — `{ "fileName", "contentType", "size", "challengeId?" }` →
   returns a draft `wallpaperId` and a presigned R2 `uploadUrl`.
2. `PUT <uploadUrl>` — upload the raw image bytes directly to R2.
   (Or `POST /api/upload-file` multipart to have the server relay the file.)
3. `POST /api/process` — `{ "wallpaperId", "challengeId?" }` → generates
   variants, sets moderation status, attaches challenge entry. Only the uploader
   (or an admin) may call this.

## Download flow (public, token-gated)

1. `GET /api/sign-download?slug={slug}&resolution={id}` → `{ url }` (signed, time-limited).
2. `GET /api/download/{slug}?t=<token>` → **307 redirect** to a presigned R2 URL.
   Your HTTP client must follow redirects.

## Contact

```
POST /api/contact
{ "name", "email", "subject", "website?", "message", "turnstileToken?" }
```

`message` is sanitized and emailed. Turnstile is required only for
**anonymous** requests in production; **authenticated** requests (Bearer token)
skip the captcha.

## Configuration (server env)

- `MOBILE_APP_ORIGINS` — comma-separated extra trusted origins (e.g. a custom
  scheme `myapp://` or a dev host) added to better-auth `trustedOrigins`.
- `API_CORS_ORIGINS` — comma-separated origins allowed to call `/api/*` with
  credentials from a browser/WebView. If unset, `/api` responds with permissive
  `Access-Control-Allow-Origin: *` (no credentials).
- `CRON_SECRET` — required for `/api/cron/*` (endpoints fail closed without it).

## Not yet supported

Native OAuth deep-linking, push notifications, and server-side rate limiting are
out of scope for this phase.
