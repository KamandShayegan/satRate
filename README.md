# satRate

Kamand’s personal knowledge transfer satisfaction survey — anonymous feedback from onboarded employees.

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

Output is in `dist/`.

## Deploy to Cloudflare Pages (with KV storage)

Survey responses are sent to `POST /api/submit` and stored in **Cloudflare KV**. Set this up once, then deploy.

### 1. Create a KV namespace

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **KV**.
2. **Create namespace** (e.g. name: `satrate-submissions`).
3. Copy the **Namespace ID** (you’ll use it in step 3).

### 2. Deploy the project to Pages

1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git** (or **Direct Upload**).
2. If using Git:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root: project root (so `functions/` is at the repo root).
3. Deploy. Your site will be at `https://<project>.pages.dev`.

### 3. Bind KV to the Pages project

1. Open your **Pages project** → **Settings** → **Functions**.
2. Under **KV namespace bindings** → **Add binding**.
3. **Variable name:** `SATRATE_KV` (must match the name used in `functions/api/submit.js`).
4. **KV namespace:** select the namespace you created (e.g. `satrate-submissions`).
5. Save. Redeploy if needed so the binding is applied.

### 4. (Optional) Use wrangler.toml for KV

Instead of the dashboard, you can put the binding in `wrangler.toml` at the project root:

```toml
[[kv_namespaces]]
binding = "SATRATE_KV"
id = "YOUR_KV_NAMESPACE_ID"
```

Then deploy with **Wrangler** (e.g. `npx wrangler pages deploy dist --project-name=satrate`).

### Viewing stored responses

- **Dashboard:** Workers & Pages → KV → your namespace → **View** to list keys.
- Keys are like `submission:1738...:abc123`. Each value is the JSON survey payload.

## Tech

- Vue 3 + Vite
- Cloudflare Pages (static site + `functions/api/submit.js`)
- Cloudflare KV for storing responses
