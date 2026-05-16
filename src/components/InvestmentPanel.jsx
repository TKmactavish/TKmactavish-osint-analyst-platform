import React, { useState } from 'react'

const SIGNAL_TYPES = [
  {
    id: 'partnership',
    label: 'Partnership Play',
    icon: '⟳',
    desc: 'Small-cap just got validated by a tech giant or defense prime (NVDA, MSFT, Amazon, Lockheed, etc.)',
    example: 'Like RXT surging 500% after NVDA contract',
    color: '#22d3ee',
  },
  {
    id: 'narrative',
    label: 'Tech Narrative',
    icon: '◈',
    desc: 'Disruptive technology story building momentum before mainstream discovers it',
    example: 'Like MRAM before the "replaces NRAM" narrative exploded',
    color: '#d4a843',
  },
  {
    id: 'squeeze',
    label: 'Squeeze Setup',
    icon: '↑',
    desc: 'High short interest + specific positive catalyst incoming = violent upside',
    example: 'High SI% + contract win or partnership announcement',
    color: '#f97316',
  },
]

const THEMES = [
  { id: 'AI / Machine Learning',       label: 'AI / ML' },
  { id: 'Defense Technology',          label: 'Defense Tech' },
  { id: 'Semiconductor / Chip',        label: 'Semiconductors' },
  { id: 'Space Technology',            label: 'Space Tech' },
  { id: 'Biotech / Medtech',           label: 'Biotech' },
  { id: 'Energy / Power Grid',         label: 'Energy' },
  { id: 'Quantum Computing',           label: 'Quantum' },
  { id: 'Drones / Robotics',           label: 'Robotics' },
]

const MARKET_CAPS = [
  { id: 'micro', label: 'Micro', desc: '<$300M' },
  { id: 'small', label: 'Small', desc: '$300M–$2B' },
]

function buildRadarQuery(signalType, themes, marketCaps) {
  const themeStr = themes.length ? themes.join(', ') : 'AI, Defense Technology, Semiconductors, Space, Biotech, Quantum, Robotics'
  const capStr = marketCaps.length
    ? marketCaps.map(c => c === 'micro' ? 'micro-cap (under $300M)' : 'small-cap ($300M–$2B)').join(' or ')
    : 'micro-cap or small-cap (strictly under $2B)'

  const signal = SIGNAL_TYPES.find(s => s.id === signalType)

  let focus = ''

  if (signalType === 'partnership') {
    focus = `SIGNAL TYPE: Partnership Play.
Focus: Identify ${capStr} U.S.-listed companies that have recently announced a partnership, contract, licensing deal, or customer relationship with a major technology company (NVIDIA, Microsoft, Amazon AWS, Google, Meta, Apple, Qualcomm) or major defense prime (Lockheed Martin, Raytheon, Northrop, Boeing, L3Harris). The key signal is: a giant just validated a small company. The market often underprices what this means for the small company's future revenue.
Look for: 8-K filings announcing material agreements, press releases naming a major customer, joint development agreements, technology licensing to a major platform.
The candidate must be small enough that the partnership represents a transformational revenue event (not routine for a mega-cap partner).`
  } else if (signalType === 'narrative') {
    focus = `SIGNAL TYPE: Technology Narrative Play.
Focus: Identify ${capStr} U.S.-listed companies that are in the early-to-mid stage of a major disruptive technology narrative in sectors: ${themeStr}. The key signal is: a technology story that is real and building momentum but has not yet been fully discovered by mainstream retail investors or widely covered by major financial media.
Examples of past narrative plays: MRAM replacing NAND memory, satellite internet (before Starlink dominated), small nuclear reactors, quantum error correction, photonic chips, solid-state batteries.
The candidate should: have a real technology (not vaporware), be early in market adoption, have a catalyst that is bringing the narrative to wider attention soon (conference, product launch, partnership, trial result).
IMPORTANT: The narrative must still have room to run — not already widely known and priced in.`
  } else if (signalType === 'squeeze') {
    focus = `SIGNAL TYPE: Short Squeeze Setup.
Focus: Identify ${capStr} U.S.-listed companies with BOTH: (1) high short interest as a percentage of float (above 15%, preferably above 20%), AND (2) a specific positive catalyst that is incoming or has just occurred — partnership announcement, contract win, trial result, regulatory approval, earnings beat, or technology narrative gaining traction.
The squeeze math: shorts are forced to buy to cover → amplifies any positive move → retail FOMO follows.
The candidate must have a real catalyst — not just high short interest alone, which is a trap. The catalyst is what converts short interest from a risk to a weapon.`
  }

  return `RADAR SCAN COMMAND — output RADAR SCAN schema only.

${focus}

HARD RULES:
1. Market cap: ${capStr} ONLY. Hard exclude any company above $2B market cap. Never return NVDA, MSFT, GOOGL, AMZN, RTX, LMT, NOC, GD, AVGO, AMAT or any mega/large-cap.
2. Only return candidates where market awareness is "Unnoticed" or "Emerging". Exclude "Widely Known" — already priced in.
3. Each candidate needs a specific identifiable signal — not "may announce something" or "routine operations".
4. Return 3-4 genuinely strong candidates. Return fewer if real ones are scarce rather than padding with large-caps.
5. For each candidate: explain exactly why the market has NOT fully priced this in yet.`
}

export default function InvestmentPanel({ onRunRadar, onAnalyzeTicker, loading }) {
  const [signalType,       setSignalType]       = useState('partnership')
  const [selectedThemes,   setSelectedThemes]   = useState([])
  const [selectedCaps,     setSelectedCaps]     = useState(['micro', 'small'])
  const [ticker,           setTicker]           = useState('')

  const toggleTheme = id =>
    setSelectedThemes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  const toggleCap = id =>
    setSelectedCaps(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])

  const handleRunRadar = () => {
    if (loading) return
    const query = buildRadarQuery(signalType, selectedThemes, selectedCaps)
    onRunRadar(query)
  }

  const handleTickerSubmit = e => {
    e.preventDefault()
    const t = ticker.trim()
    if (!t || loading) return
    onAnalyzeTicker(t)
  }

  const activeSignal = SIGNAL_TYPES.find(s => s.id === signalType)
  const accent = activeSignal?.color || '#d4a843'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '14px', marginBottom: '24px' }}>

      {/* ── HIDDEN GEM RADAR ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${accent}`,
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        transition: 'border-top-color 0.2s',
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: accent, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '2px' }}>
            HIDDEN GEM RADAR
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
            Find the signal before the crowd. Buy the story → hold the FOMO → sell the peak.
          </div>
        </div>

        {/* Signal type selector */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '8px' }}>
            WHAT KIND OF SIGNAL ARE YOU HUNTING?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {SIGNAL_TYPES.map(s => {
              const active = signalType === s.id
              return (
                <button key={s.id} onClick={() => setSignalType(s.id)} style={{
                  padding: '10px 14px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: active ? `1px solid ${s.color}` : '1px solid var(--border)',
                  background: active ? `rgba(${s.color === '#22d3ee' ? '34,211,238' : s.color === '#d4a843' ? '212,168,67' : '249,115,22'},0.08)` : 'var(--surface)',
                  transition: 'all 0.12s',
                  fontFamily: 'var(--font-sans)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ color: s.color, fontSize: '13px', fontWeight: 700 }}>{s.label}</span>
                    {active && <span style={{ fontSize: '10px', color: s.color, fontFamily: 'var(--font-mono)', background: `${s.color}22`, padding: '1px 6px', borderRadius: '3px' }}>SELECTED</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4 }}>{s.desc}</div>
                  <div style={{ fontSize: '10px', color: s.color, marginTop: '3px', fontStyle: 'italic' }}>{s.example}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Theme (shown for narrative, optional for others) */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px' }}>
            THEME <span style={{ color: 'var(--border)', fontWeight: 400 }}>(optional — leave blank for broad scan)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {THEMES.map(t => {
              const active = selectedThemes.includes(t.id)
              return (
                <button key={t.id} onClick={() => toggleTheme(t.id)} style={{
                  padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                  border: active ? `1px solid ${accent}` : '1px solid var(--border)',
                  background: active ? `${accent}18` : 'var(--surface)',
                  color: active ? accent : 'var(--muted)',
                  transition: 'all 0.12s',
                }}>{t.label}</button>
              )
            })}
          </div>
        </div>

        {/* Market cap */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px' }}>
            MARKET CAP <span style={{ color: '#ef4444', fontWeight: 400 }}>(mega/large-cap excluded always)</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {MARKET_CAPS.map(mc => {
              const active = selectedCaps.includes(mc.id)
              return (
                <button key={mc.id} onClick={() => toggleCap(mc.id)} style={{
                  flex: 1, padding: '7px 0', borderRadius: '6px', cursor: 'pointer',
                  border: active ? `1px solid ${accent}` : '1px solid var(--border)',
                  background: active ? `${accent}18` : 'var(--surface)',
                  color: active ? accent : 'var(--muted)',
                  fontFamily: 'var(--font-sans)', transition: 'all 0.12s',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700 }}>{mc.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>{mc.desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Run */}
        <button onClick={handleRunRadar} disabled={loading} style={{
          height: '44px',
          background: loading ? 'var(--border)' : accent,
          border: 'none', borderRadius: '7px',
          color: loading ? 'var(--muted)' : '#0a0e1a',
          fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-sans)', transition: 'background 0.2s',
        }}>
          {loading ? 'SCANNING...' : `RUN ${activeSignal?.label.toUpperCase()} RADAR →`}
        </button>
      </div>

      {/* ── TICKER DEEP DIVE ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: '3px solid #22d3ee',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '2px' }}>
            TICKER DEEP DIVE
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
            Already heard about a company? Validate the signal — is it real, early enough, and clean of red flags?
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '2px' }}>VALIDATE A SIGNAL</div>
          {[
            'MRAM — is the memory narrative real?',
            'RKLB — insider buying signal?',
            'ASTS — partnership with AT&T priced in?',
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
            placeholder="Ticker, company name, or question..."
            disabled={loading}
            style={{
              height: '40px', padding: '0 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '7px',
              color: 'var(--text)', fontSize: '13px',
              fontFamily: 'var(--font-mono)', outline: 'none', width: '100%',
            }}
          />
          <button type="submit" disabled={loading || !ticker.trim()} style={{
            height: '42px',
            background: loading || !ticker.trim() ? 'var(--border)' : '#22d3ee',
            border: 'none', borderRadius: '7px',
            color: loading || !ticker.trim() ? 'var(--muted)' : '#0a0e1a',
            fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em',
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
