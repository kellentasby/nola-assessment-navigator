# NOLA Assessment Navigator: deploy guide

Student prototype for a Tulane real estate course. A chatbot that explains Orleans Parish property assessments, exemptions, tax bills and appeals, with a cited source on every fact.

## What's in this folder

| File | What it does |
|---|---|
| `index.html` | The web page people see (chat, key dates, contacts, source ledger) |
| `kb.mjs` | The knowledge base (15 sources) and the chatbot rules. Used by both the page and the server |
| `api/ask.mjs` | A small server function. It adds the rules and sources, calls Claude with your secret API key, and returns the answer |
| `package.json` | Tells Vercel this is a modern JavaScript project. No installs needed |
| `CLAUDE.md` | Instruction file for your coding agent |

Why a server function: the API key must stay secret. If it were in `index.html`, anyone could copy it and spend your money. On Vercel it lives in an environment variable that only `api/ask.mjs` can read.

## Deploy in 4 steps

1. **GitHub:** create a repo at https://github.com/new and upload every file in this folder, keeping `api/` as a folder.
2. **API key:** create one at https://platform.claude.com/settings/keys after adding credits, and set a monthly spend limit.
3. **Vercel:** import the repo at https://vercel.com/new, preset "Other", and add the environment variable `ANTHROPIC_API_KEY`. Click Deploy.
4. **Check it:** open `https://<your-project>.vercel.app/api/ask`. You should see `{"ok":true,...}`. Then ask a question on the home page.

## Settings you can change (Vercel → Project → Settings → Environment Variables)

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | (required) | Your Claude API key |
| `CLAUDE_MODEL` | `claude-sonnet-5-5` | Swap to `claude-haiku-5-5` to cut cost, at some loss in quality |
| `ANTHROPIC_VERSION` | `2023-06-01` | API version header |

Redeploy after changing a variable.

## Updating

Edit a file on GitHub (pencil icon) and commit. Vercel redeploys automatically in about a minute. Facts go in `kb.mjs`; keep `CLAUDE.md` Section 2 in sync.
