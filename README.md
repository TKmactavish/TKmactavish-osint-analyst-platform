# Athena Intel

Open-source intelligence (OSINT) platform powered by Claude AI.
Enter any person, incident, location, or organization and get a structured
analyst brief with sources, timeline, red flags, risk assessment, and
tailored recommendations.

---

## Quickstart — deploy in ~10 minutes, no command line needed

You need two things: a **free Anthropic API key** and a **free Vercel account**.

---

### Step 1 — Get an Anthropic API key (3 minutes)

1. Go to **https://console.anthropic.com**
2. Click **Sign up** and create a free account
3. Go to **API Keys** in the left sidebar
4. Click **Create Key**, give it a name (e.g. "Athena Intel"), copy the key

> Keep this key private — do not paste it anywhere public.

---

### Step 2 — Deploy to Vercel (5 minutes, no command line)

Vercel hosts both the static frontend and the backend API in one click.

1. Go to **https://vercel.com** and click **Sign Up**
2. Choose **Continue with GitHub** — no new password needed
3. Click **Add New… → Project**
4. Find **TKmactavish-osint-analyst-platform** in the list and click **Import**
5. On the configuration screen, open **Environment Variables** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your key from Step 1
6. Click **Deploy**

Vercel will build and deploy the site. In about 30 seconds you'll get a live URL
like `https://tkmactavish-osint-analyst-platform.vercel.app`.

That's it — the site is live and fully functional. No other configuration needed.

---

### (Optional) Use a custom domain

In Vercel → Project → Settings → Domains, add any domain you own.

---

### (Optional) Use a Cloudflare Worker instead of Vercel

If you prefer Cloudflare Workers:

```bash
npm install -g wrangler
wrangler login
wrangler deploy
wrangler secret put ANTHROPIC_API_KEY
```

Then open the live site, click **⚙ Configure**, and enter your Worker URL
(`https://athena-intel.YOUR-SUBDOMAIN.workers.dev`).

---

## How it works

```
Browser  →  POST /api/analyze  →  Vercel Edge Function
                                       ├── Google News RSS  (live news)
                                       ├── Wikipedia API    (background context)
                                       ├── Wikidata API     (structured entities)
                                       └── Claude AI        (analysis + JSON brief)
```

The Anthropic API key lives only as an encrypted Vercel environment variable.
It is never sent to or stored in the browser.

---

## Output tabs

| Tab | Content |
|-----|---------|
| **Overview** | Executive summary, risk level, stat row, top sources |
| **Timeline** | Chronological events with dates and confidence badges |
| **Sources** | All sources with type, credibility bar, and confidence |
| **Red Flags** | Intelligence indicators with severity and evidence |
| **Risk Assessment** | HIGH / MEDIUM / LOW verdict with rationale |
| **Analytical Perspective** | Claude's interpretation — patterns, contradictions, geopolitical context |
| **Recommendations** | Action items for Law Enforcement, Private Sector, and Travelers |

---

## Geographic security context

The AI system prompt includes a built-in knowledge base of active conflict zones:
Thai Deep South insurgency (Yala / Narathiwat / Pattani), Myanmar civil war,
Sahel, Eastern DRC, Sudan, Haiti, and more. These are always flagged for
matching location queries — even when recent news doesn't mention the conflict.

---

## Disclaimer

Athena Intel uses **only lawful public sources** (news RSS, Wikipedia, Wikidata).
It does not scrape private data, bypass access controls, or store personal information.

**Do not** use this platform for stalking, harassment, doxxing, or targeting
private individuals. All AI-generated output requires human verification before
operational use.
