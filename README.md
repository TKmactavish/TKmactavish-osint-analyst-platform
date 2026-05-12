# Athena Intel

Open-source intelligence (OSINT) platform that gathers live public-source
information, analyzes it with Claude AI, and produces structured analyst briefs.

**Live site:** https://tkmactavish.github.io/TKmactavish-osint-analyst-platform/

---

## Architecture

```
Browser (GitHub Pages)
  └─► POST {query, lang}
        └─► Cloudflare Worker (holds API key securely)
              ├─► Google News RSS  (live news articles)
              ├─► Wikipedia API    (background context)
              ├─► Wikidata API     (structured entities)
              └─► Claude API       (analysis + structured JSON brief)
```

The API key is **never** exposed in the frontend. It lives only as a
Cloudflare Worker secret.

---

## Setup & Deployment

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is fine)
- [Anthropic API key](https://console.anthropic.com/)

### 1 — Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2 — Deploy the Worker

From the repository root:

```bash
wrangler deploy
```

This uploads `worker.js` to Cloudflare. Your Worker URL will be printed:

```
https://athena-intel.<your-subdomain>.workers.dev
```

### 3 — Set the Anthropic API key as a secret

```bash
wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted — it is stored encrypted, never in code
```

### 4 — Configure the frontend

Open the live site, click **⚙ Configure** in the top-right corner, and paste
your Worker URL. The URL is saved in your browser's `localStorage` — it never
leaves your machine.

### 5 — (Optional) Upgrade the Claude model

In `worker.js`, change `CLAUDE_MODEL` to `claude-opus-4-7` for the highest
analytical quality. Sonnet (`claude-sonnet-4-6`, the default) is faster and
cheaper; Opus is more thorough.

---

## What each tab shows

| Tab | Content |
|-----|---------|
| **Overview** | Executive summary, risk level, stat row, top sources |
| **Timeline** | Chronological events with dates, sources, confidence badges |
| **Sources** | All gathered sources with type, credibility score, and confidence |
| **Red Flags** | Intelligence indicators with severity, description, and evidence |
| **Risk Assessment** | HIGH / MEDIUM / LOW verdict with rationale and contributing factors |
| **Analytical Perspective** | Claude's interpretation — patterns, contradictions, geopolitical context, analyst-level flags |
| **Recommendations** | Tailored action items for three user types: Law Enforcement, Private Sector, Traveler |

---

## Geographic security context

The system prompt includes a built-in knowledge base of active conflict zones
and long-running security situations (Thai Deep South insurgency, Myanmar civil
war, Sahel, DRC, Sudan, Haiti, and more). Claude always applies this context
for location queries — even when recent news articles don't explicitly mention
the conflict.

---

## Target users

1. **Intelligence analysts** in law enforcement and government agencies
2. **Corporate security professionals** in private-sector organizations
3. **Travelers** assessing destination risk

---

## Disclaimer

Athena Intel is a research and analytical support tool. It uses **only lawful
public sources** (news RSS feeds, Wikipedia, Wikidata) and does **not**:

- Access private or restricted data
- Scrape social media behind logins
- Bypass access controls
- Collect or store personal information

**Do not** use this platform for stalking, harassment, doxxing, unlawful
surveillance, or targeting of private individuals. All output requires human
verification before operational use. Machine-assisted analysis can contain
errors — treat every claim as unverified until independently confirmed.

---

## License

MIT
