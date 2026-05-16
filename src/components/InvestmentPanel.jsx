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

Objective: Find 3 stocks where a REAL, CONFIRMED connection to a major trend or player exists in public sources — but mainstream financial media has NOT covered it yet and the stock price has NOT moved to reflect it. The user buys the information gap, holds 2-5 days while awareness spreads to the crowd, and sells at peak FOMO.

REAL EXAMPLES OF EXACTLY WHAT TO FIND:
- DGXX had a confirmed partnership with Cerebras (AI chip company) before Bloomberg/CNBC covered it — early buyers got 2-5 days before the crowd
- RDW had documented partnerships with RKLB and SpaceX before it became well-known as a space play — undiscovered in plain sight
- OSS was a key hardware supplier for Edge AI deployments before mainstream investors discovered their role — supply chain hidden in plain sight

${themeClause}

SIGNAL TYPES TO SCAN — return the strongest regardless of type:

1. HIDDEN PARTNERSHIP — Company has a confirmed (press release, 8-K filing, customer reference, conference mention) partnership or contract with a major AI/Space/Defense/Cloud player — but it has NOT appeared in Bloomberg, CNBC, WSJ, or Seeking Alpha front page yet. The signal is real and public, just not yet amplified by financial media. Major partners to scan for: AI (Cerebras, NVIDIA, AMD, Groq, Anthropic, OpenAI), Space (SpaceX, Rocket Lab/RKLB, Blue Origin, ULA), Defense (L3Harris, Raytheon, Northrop, Lockheed), Cloud (AWS, Azure, Google Cloud).

2. SUPPLY CHAIN / INFRASTRUCTURE ROLE — Company is a confirmed key enabler, component supplier, or infrastructure provider for a high-growth emerging sector (Edge AI hardware, space manufacturing, defense AI, autonomous systems, quantum computing infrastructure) but their role is not yet known by most retail investors. Like OSS for Edge AI — the role is real, documented, just not yet famous.

3. IMMINENT ANNOUNCEMENT — Clear public signals (SEC filings, conference schedule, patent filings, executive public statements, customer references already live on company website) strongly indicate a major partnership or contract announcement is coming within days — and the stock price has not moved yet.

THE KEY TEST FOR EVERY CANDIDATE: If this information were published as a headline on Bloomberg tomorrow — would the stock move 10-50%? If yes, and the stock has NOT moved yet to reflect it, that is the play.

HARD RULES:
1. REAL SIGNAL ONLY — The partnership, role, or announcement must be traceable to a public source (8-K, press release, company website, conference recording, patent filing). No speculation, no "may announce."
2. NOT YET PRICED IN — Market awareness must be "Unnoticed" or "Emerging". If it is already on financial media front pages, it is "Widely Known" — exclude it, the edge is gone.
3. ANY MARKET CAP — Do not filter by size. DGXX, RDW, OSS were all small — but the filter is information gap, not company size.
4. RANK BY CLARITY OF EDGE — How specific is the signal? How certain is it that the crowd doesn't know yet? Put the clearest information gap first.
5. For each candidate: state exactly WHERE the signal comes from (which filing, which press release, which conference) and WHY the market hasn't priced it in yet.`
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
            Scans for stocks where a real partnership, supply chain role, or contract exists in public sources — but mainstream financial media hasn't amplified it yet. Buy the gap, hold 2-5 days, sell the FOMO peak.
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
            Any market cap. Filter = information gap, not company size. Widely Known = excluded.
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
