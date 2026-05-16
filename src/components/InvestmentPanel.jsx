import React, { useState } from 'react'

const THEMES = [
  { id: 'AI / Machine Learning',  label: 'AI / ML' },
  { id: 'Defense Technology',     label: 'Defense Tech' },
  { id: 'Semiconductor / Chip',   label: 'Semiconductors' },
  { id: 'Space Technology',       label: 'Space Tech' },
  { id: 'Biotech / Medtech',      label: 'Biotech' },
  { id: 'Energy / Power Grid',    label: 'Energy' },
  { id: 'Quantum Computing',      label: 'Quantum' },
  { id: 'Drones / Robotics',      label: 'Robotics' },
]

function buildRadarQuery(themes) {
  const themeClause = themes.length
    ? `Focus the scan on sectors: ${themes.join(', ')}.`
    : 'Scan broadly — AI infrastructure, Edge AI, space tech, defense tech, semiconductors, quantum, robotics, biotech.'

  return `RADAR SCAN COMMAND — output RADAR SCAN schema only.

Objective: Find 3 stocks where a real, confirmed signal (partnership, supply chain role, contract) exists in public sources — but the crowd has NOT discovered it yet because the company has almost no Wall Street analyst coverage. The information gap only survives where coverage is thin. Buy the gap, hold 2-5 days while awareness spreads to retail, sell at peak FOMO.

REAL EXAMPLES OF EXACTLY WHAT TO FIND:
- DGXX: tiny company, confirmed Cerebras partnership in public filings — zero analyst coverage meant it sat hidden for days before retail found it
- RDW: small company, documented RKLB and SpaceX partnerships — no mainstream analyst coverage, gap lasted a week
- OSS: micro-cap, confirmed key hardware role for Edge AI deployments — undiscovered because nobody was covering the stock

${themeClause}

THE CORE RULE — WHY THE GAP EXISTS:
An information gap can ONLY survive where Wall Street analyst coverage is thin or absent.
- 15+ analysts covering the stock → AVGO, SAIC, MSTR territory → nothing stays hidden, institutions price it in within hours → EXCLUDE
- 0-3 analysts covering the stock → DGXX, RDW, OSS territory → gap can survive 3-7 days → THIS IS THE TARGET

ANALYST COVERAGE IS THE PRIMARY FILTER:
Target companies with fewer than 5 sell-side analysts. Strongly prefer 0-2 analysts.
Do NOT return: any S&P 500 company, any company with market cap above $2B, any heavily covered defense prime, semiconductor giant, or established software company.

SIGNAL TYPES TO SCAN:
1. HIDDEN PARTNERSHIP — Confirmed deal (8-K, press release, customer reference page) with a major AI/Space/Defense/Cloud player — but because the company has no analyst coverage, no Wall Street report has flagged it yet. Examples of major partners: Cerebras, NVIDIA, SpaceX, RKLB, AWS, Azure, Lockheed, L3Harris.
2. SUPPLY CHAIN / INFRASTRUCTURE ROLE — Confirmed as key component supplier or hardware enabler for a major emerging trend (Edge AI hardware, space manufacturing, defense AI) — documented on company website or in filings but retail hasn't discovered it yet due to zero coverage.
3. IMMINENT SIGNAL — OSINT evidence (conference schedule, 8-K filing pattern, executive interviews, patent filings) strongly points to a major announcement in the next few days — stock has not moved yet.

THE KEY TEST: Would Bloomberg covering this tomorrow cause a 20-100% move? AND does the company have fewer than 5 analysts? If both yes — that is the play.

HARD RULES:
1. FEWER THAN 5 ANALYSTS — This is non-negotiable. No AVGO, SAIC, MSTR, RTX, LMT, NVDA or any large/mid cap with heavy coverage. The information gap cannot exist there.
2. REAL SIGNAL — Traceable to a specific public source (name the filing, press release, or conference). No speculation.
3. AWARENESS — "Unnoticed" or "Emerging" only. If it is already on Bloomberg, CNBC, or Seeking Alpha front page — excluded.
4. MARKET CAP — Strongly prefer under $500M. Maximum $2B. Information gaps do not survive at large-cap scale.
5. RANK BY EDGE — How thin is the coverage? How specific is the signal? How imminent is discovery by the crowd? Best edge first.`
}

export default function InvestmentPanel({ onRunRadar, onAnalyzeTicker, loading }) {
  const [selectedThemes, setSelectedThemes] = useState([])
  const [ticker, setTicker]                 = useState('')
  const accent = '#d4a843'

  const toggleTheme = id =>
    setSelectedThemes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  const handleRunRadar = () => {
    if (loading) return
    onRunRadar(buildRadarQuery(selectedThemes))
  }

  const handleTickerSubmit = e => {
    e.preventDefault()
    const t = ticker.trim()
    if (!t || loading) return
    onAnalyzeTicker(t)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '14px', marginBottom: '24px' }}>

      {/* ── WEEKLY RADAR ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${accent}`,
        borderRadius: '10px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: accent, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: '4px' }}>
            HIDDEN NEWS RADAR
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            What does the crowd not know yet?
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
            Information gaps only survive where Wall Street analyst coverage is thin. Targets stocks with 0-3 analysts — where a real partnership or supply chain role can sit hidden in public filings for days before retail discovers it.
          </div>
        </div>

        {/* Sector filter */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '7px' }}>
            SECTOR FOCUS <span style={{ color: 'var(--border)', fontWeight: 400 }}>— leave blank to scan everything</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {THEMES.map(t => {
              const active = selectedThemes.includes(t.id)
              return (
                <button key={t.id} onClick={() => toggleTheme(t.id)} style={{
                  padding: '5px 11px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  border: active ? `1px solid ${accent}` : '1px solid var(--border)',
                  background: active ? `${accent}18` : 'var(--surface)',
                  color: active ? accent : 'var(--muted)',
                  transition: 'all 0.12s',
                }}>{t.label}</button>
              )
            })}
          </div>
        </div>

        {/* Signal types + real examples */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '7px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '2px' }}>WHAT IT HUNTS</div>
          {[
            { color: '#22d3ee', label: 'Hidden Partnership', desc: 'Confirmed deal with NVDA/SpaceX/AWS etc. — not yet in Bloomberg/CNBC', example: 'DGXX + Cerebras' },
            { color: '#d4a843', label: 'Supply Chain Role',  desc: 'Key component or enabler for a major trend, undiscovered by retail', example: 'OSS → Edge AI' },
            { color: '#a78bfa', label: 'Imminent Signal',   desc: '8-K filings, conference schedule, or executive statements point to news coming', example: 'RDW + RKLB / SpaceX' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '1px', paddingLeft: '8px', borderLeft: `2px solid ${item.color}55` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)' }}>{item.label}</span>
                <span style={{ fontSize: '10px', color: item.color, background: `${item.color}18`, border: `1px solid ${item.color}33`, borderRadius: '3px', padding: '1px 5px', fontFamily: 'var(--font-mono)' }}>{item.example}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.desc}</div>
            </div>
          ))}
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px', paddingTop: '6px', borderTop: '1px solid var(--border)', fontStyle: 'italic' }}>
            Target: 0–3 analyst coverage, under $2B market cap. AVGO/SAIC/MSTR have 15+ analysts — nothing stays hidden there.
          </div>
        </div>

        {/* Run button */}
        <button onClick={handleRunRadar} disabled={loading} style={{
          height: '48px',
          background: loading ? 'var(--border)' : accent,
          border: 'none',
          borderRadius: '8px',
          color: loading ? 'var(--muted)' : '#0a0e1a',
          fontSize: '14px',
          fontWeight: 800,
          letterSpacing: '0.06em',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-sans)',
          transition: 'background 0.2s',
        }}>
          {loading ? 'SCANNING...' : "SCAN FOR HIDDEN NEWS →"}
        </button>
      </div>

      {/* ── VALIDATE A TICKER ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: '3px solid #22d3ee',
        borderRadius: '10px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '4px' }}>
            VALIDATE A TICKER
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
            Already heard about a stock? Validate whether the news is real, still early, and clean of red flags before you buy.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>EXAMPLES</div>
          {[
            'DGXX — is the Cerebras partnership priced in?',
            'RDW — how early is the SpaceX/RKLB story?',
            'OSS — is Edge AI role still undiscovered?',
            'ASTS — is the satellite narrative still early?',
          ].map((ex, i) => (
            <div key={i} style={{
              fontSize: '11px', color: 'var(--muted)',
              paddingLeft: '8px', borderLeft: '2px solid #22d3ee44', lineHeight: 1.5,
            }}>{ex}</div>
          ))}
        </div>

        <form onSubmit={handleTickerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
          <input
            type="text"
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            placeholder="Ticker, company, or question..."
            disabled={loading}
            style={{
              height: '42px', padding: '0 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              color: 'var(--text)',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <button type="submit" disabled={loading || !ticker.trim()} style={{
            height: '42px',
            background: loading || !ticker.trim() ? 'var(--border)' : '#22d3ee',
            border: 'none',
            borderRadius: '7px',
            color: loading || !ticker.trim() ? 'var(--muted)' : '#0a0e1a',
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            cursor: loading || !ticker.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-sans)',
          }}>
            VALIDATE SIGNAL →
          </button>
        </form>
      </div>

    </div>
  )
}
