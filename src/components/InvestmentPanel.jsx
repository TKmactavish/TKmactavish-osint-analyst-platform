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
    : 'Scan across all sectors — AI, defense, semiconductors, space, biotech, energy, quantum, robotics.'

  return `RADAR SCAN COMMAND — output RADAR SCAN schema only.

Objective: Find 3-4 micro-cap or small-cap U.S.-listed stocks (strictly under $2B market cap) with the highest probability of moving 5-20%+ in the next 3-7 days. The user's strategy: buy the signal today → hold 3-7 days as FOMO builds → sell at the peak. Scan for genuine early-mover opportunities only.

${themeClause}

Scan for candidates from ALL three signal categories and return the strongest regardless of category:

1. PARTNERSHIP PLAY — Small company just announced a contract, licensing deal, or partnership with a tech giant (NVIDIA, Microsoft, Amazon AWS, Google, Meta, Qualcomm) or defense prime (Lockheed, Raytheon, Northrop, Boeing). The giant's validation hasn't been fully priced in yet by the market.

2. TECH NARRATIVE — Early-to-mid stage disruptive technology story gaining momentum before mainstream retail discovers it. Real technology, early adoption, catalyst incoming. Example: MRAM replacing NAND memory before it was widely covered.

3. SHORT SQUEEZE SETUP — Short interest above 15% of float AND a specific positive catalyst incoming (partnership, contract win, trial result, approval). Forced covering + FOMO = violent move up.

HARD RULES — no exceptions:
1. Market cap: micro-cap (<$300M) or small-cap ($300M–$2B) ONLY. Hard exclude any company above $2B. NEVER return NVDA, MSFT, GOOGL, AMZN, RTX, LMT, NOC, GD, AVGO, AMAT or any mega/large-cap. These cannot move 20% in a week.
2. Market awareness must be "Unnoticed" or "Emerging". Exclude "Widely Known" — already priced in, edge is gone.
3. Every candidate needs a specific, identifiable catalyst — not "may announce" or "possible upcoming" vague language.
4. Rank candidates by conviction — highest conviction first.
5. Return 3 strong picks rather than 5 padded ones. Quality over quantity.`
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
        {/* Title */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: accent, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: '4px' }}>
            WEEKLY OPPORTUNITY RADAR
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            What should I buy this week?
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
            Flux Intel scans for micro &amp; small-cap stocks with a real signal — partnership validations, tech narrative momentum, squeeze setups — that the crowd hasn't priced in yet. Buy the signal, hold 3-7 days, sell the FOMO peak.
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

        {/* What the scan covers */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '7px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          {[
            { icon: '◈', color: '#22d3ee', label: 'Partnership Play', desc: 'Tech giant or defense prime just validated a small company' },
            { icon: '◈', color: '#d4a843', label: 'Tech Narrative',   desc: 'Disruptive story gaining momentum before mainstream discovers it' },
            { icon: '◈', color: '#f97316', label: 'Squeeze Setup',    desc: 'High short interest + specific catalyst = forced buying wave' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: item.color, fontSize: '12px', marginTop: '1px', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)', marginRight: '6px' }}>{item.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.desc}</span>
              </div>
            </div>
          ))}
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px', fontStyle: 'italic' }}>
            Micro &amp; small-cap only (&lt;$2B). Mega-cap excluded — they cannot rerate 20% in a week.
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
          {loading ? 'SCANNING...' : 'SCAN THIS WEEK\'S OPPORTUNITIES →'}
        </button>
      </div>

      {/* ── TICKER DEEP DIVE ── */}
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
            Already heard about a stock? Validate whether the signal is real, early enough, and clean of red flags before you buy.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>EXAMPLES</div>
          {[
            'MRAM — is the memory narrative real?',
            'RKLB — insider buying signal?',
            'ASTS — partnership priced in yet?',
            'LUNR — early or late in the story?',
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
