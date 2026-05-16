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
    : 'Scan across all sectors — AI, defense, semiconductors, space, biotech, energy, quantum, robotics, finance, consumer tech.'

  return `RADAR SCAN COMMAND — output RADAR SCAN schema only.

Objective: Find 3-4 stocks of ANY market cap size where there is specific incoming news or a developing catalyst that is NOT yet widely known by the majority of the market. The edge is the information gap — the news is real but the crowd hasn't priced it in yet.

The user's strategy: buy before the news becomes widely known → hold 3-7 days while FOMO builds as more people discover it → sell when it reaches peak mainstream awareness.

${themeClause}

THE ONLY FILTER THAT MATTERS: Is the market aware of this yet?
- "Unnoticed" = almost nobody knows → strongest edge, buy immediately
- "Emerging" = starting to get attention → still early, good entry
- "Widely Known" = already in headlines, already priced in → EXCLUDE, no edge left

Scan for candidates from ALL signal types:
1. PARTNERSHIP PLAY — A company just announced or is about to announce a major contract, deal, or partnership that the market has not fully priced in. The partner could be any tech giant or institution.
2. TECH NARRATIVE — A disruptive technology story that is real and building momentum, but mainstream retail has not discovered it yet. Could be any company — large or small — at the center of an emerging narrative.
3. SHORT SQUEEZE SETUP — High short interest + specific incoming positive catalyst. When shorts are forced to cover, it amplifies any move regardless of company size.
4. UPCOMING CATALYST — Any specific event: earnings surprise setup, regulatory approval, contract award, product launch, index inclusion — where the outcome is likely positive and not yet priced in.

HARD RULES:
1. AWARENESS: Only return "Unnoticed" or "Emerging" candidates. NEVER return "Widely Known" — the edge is already gone.
2. SPECIFIC CATALYST REQUIRED: Every candidate must have a real, identifiable upcoming event or news development. No vague "may announce something."
3. ANY SIZE: Do not filter by market cap. A large-cap with hidden news is as valid as a micro-cap. What matters is the information gap, not the size.
4. Rank by conviction — highest information edge and clearest upcoming catalyst first.
5. Return 3 strong picks with clear reasoning. Quality over quantity.`
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
            Flux Intel scans for stocks with incoming news the majority hasn't priced in — any size, any sector. Buy the information gap, hold while awareness spreads, sell when it reaches the crowd.
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

        {/* What the scan hunts */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '7px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '2px' }}>THE AWARENESS FILTER</div>
          {[
            { color: '#10b981', label: 'Unnoticed',    desc: 'Almost nobody knows yet — strongest edge' },
            { color: '#f59e0b', label: 'Emerging',     desc: 'Starting to get attention — still early' },
            { color: '#ef4444', label: 'Widely Known', desc: 'Already in headlines — excluded, no edge left' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: item.color, background: `${item.color}18`,
                border: `1px solid ${item.color}44`, borderRadius: '3px',
                padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0,
              }}>{item.label.toUpperCase()}</span>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.desc}</span>
            </div>
          ))}
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', fontStyle: 'italic' }}>
            Any market cap. The filter is the information gap — not the company size.
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
