# Deploying Context Vault to Vercel

This guide explains how to deploy your MCP Server to Vercel using a Neon database.

## Prerequisites

1.  **Vercel Account**: [vercel.com](https://vercel.com)
2.  **Neon Account**: [neon.tech](https://neon.tech)
3.  **Vercel CLI**: `npm i -g vercel` (optional, can also use web UI)

## Step 1: Prepare Database (Neon)

1.  Create a new project in **Neon**.
2.  Go to the **Dashboard** and copy the **Connection String** (Pooled).
    *   It should look like: `postgres://<user>:<password>@<host>/neondb?sslmode=require`

## Step 2: Push Code to GitHub

Ensure your latest changes (including `vercel.json` and `api/index.ts`) are pushed:

```bash
git add .
git commit -m "chore: prepare for vercel deployment"
git push
```

## Step 3: Deploy to Vercel

### Option A: Via Web UI (Recommended)
1.  Go to **Vercel Dashboard** -> **Add New...** -> **Project**.
2.  Import your GitHub repository: `context-vault-research-os`.
3.  **Environment Variables**:
    *   Add `DATABASE_URL` = (Paste your Neon Connection String)
    *   *Note*: Ensure you use the **Pooled** connection string (usually port 5432 or 6543, checks Neon docs).
4.  **Build Settings**:
    *   Framework Preset: **Other**.
    *   Build Command: `prisma generate` (or leave default if `postinstall` is set).
5.  Click **Deploy**.

### Option B: Via CLI
1.  Run `vercel` in the project root.
2.  Follow the prompts.
3.  When asked for settings, stick to defaults.
4.  Run `vercel env add DATABASE_URL` and paste your Neon string.
5.  Run `vercel --prod`.

## Step 4: Verify Deployment

Once deployed, your MCP Server URL will be:
`https://<your-project>.vercel.app/sse`

You can test it by running the raw verification script locally, pointing to the live URL:
1.  Edit `verify-mcp-raw.ts`, change `hostname` to your Vercel URL and port to 443 (https).
2.  Run `npx tsx verify-mcp-raw.ts`.
