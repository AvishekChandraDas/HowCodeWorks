# Setup

Prerequisites: Node.js 20 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Local development defaults to `https://ce.judge0.com`. For a private deployment, set `JUDGE0_API_URL` to a Judge0 CE-compatible deployment. Set `JUDGE0_API_KEY` only when that deployment requires it. Do not prefix either value with `NEXT_PUBLIC_`.

Use `npm run lint` for ESLint and `npm run build` for a production validation. Without a provider, the editor, stdin panel, and local UI state remain available; code execution reports that the provider is not configured.
