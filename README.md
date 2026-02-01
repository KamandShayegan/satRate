# satRate

Kamand’s personal knowledge transfer satisfaction survey — anonymous feedback

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
```

Output is in `dist/`. You can deploy `dist/` to **Cloudflare Pages** and later store responses in Cloudflare (e.g. Pages env vars or Workers KV) by adding a small serverless function or form handler.

## Tech

- Vue 3 + Vite
- HTML, CSS, no backend (submit currently logs to console; wire to Cloudflare when ready)
# satRate
