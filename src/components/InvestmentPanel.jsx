import React, { useState } from 'react'

const SECTORS = [
  { id: 'AI Infrastructure',   label: 'AI Infra' },
  { id: 'Defense Technology',  label: 'Defense Tech' },
  { id: 'Biotech / Medtech',   label: 'Biotech' },
  { id: 'Semiconductors',      label: 'Semiconductors' },
  { id: 'Energy / Grid',       label: 'Energy / Grid' },
  { id: 'Drones / Robotics',   label: 'Drones / Robotics' },
  { id: 'Crypto Mining Infra', label: 'Crypto Mining' },
  { id: 'Space Technology',    label: 'Space Tech' },
]

const TIMEFRAMES = [
  { id: '7d',  label: 'Next 7 days' },
  { id: '14d', label: 'Next 2 weeks' },
  { id: '1m',  label: 'Next month' },
]

const MARKET_CAPS = [
  { id: 'micro', label: 'Micro-cap', desc: '$50M–$300M', range: '$50M–$300M market cap' },
  { id: 'small', label: 'Small-cap', desc: '$300M–$2B',  range: '$300M–$2B market cap' },
  { id: 'mid',   label: 'Mid-cap',   desc: '$2B–$10B',   range: '$2B–$10B market cap' },
]

function buildRadarQuery(sectors, timeframeId, marketCaps) {
  const sectorStr = sectors.length
    ? sectors.join(', ')
    : 'AI Infrastructure, Defense Technology, Biotech, Semiconductors, Energy, Space Technology'
  const tfLabel = { '7d': 'next 7 days', '14d': 'next 2 weeks', '1m': 'next month' }[timeframeId] || 'next 7 days'

  const caps = marketCaps.length ? marketCaps : ['micro', 'small']
  const capRanges = caps.map(c => MARKET_CAPS.find(m => m.id === c)?.range).filter(Boolean).join(' or ')

  return `RADAR SCAN COMMAND — output RADAR SCAN schema only.

CRITICAL CONSTRAINTS — strictly enforced:
1. MARKET CAP: Only include companies with ${capRanges}. HARD EXCLUDE any company with market cap above $10B. Never return NVDA, RTX, LMT, GD, NOC, AVGO, AMAT, or any mega/large-cap stock. These cannot rerate meaningfully in 1-2 weeks.
2. AWARENESS FILTER: EXCLUDE any candidate where market awareness is "Widely Known". Only return stocks where awareness is "Unnoticed" or "Emerging" — that is the edge.
3. MOVE POTENTIAL: Only include stocks where the catalyst could realistically move the stock 20%+ in 1-2 weeks.
4. PREFER: low float (under 50M shares), high short interest, or confirmed insider open-market buying — these amplify moves.
5. If you cannot find 4 qualifying small/micro-cap candidates, return 2-3 strong ones rather than padding with large-caps.

TARGET: Identify 4 U.S.-listed small/micro-cap stocks with specific upcoming public catalysts in the ${tfLabel}. Sectors: ${sectorStr}.

CATALYST PRIORITY ORDER:
1. FDA PDUFA decision date — exact date known, binary outcome, huge move potential
2. Form 4 insider open-market cluster — 2+ insiders buying personally within 14 days
3. Government contract award — small company, contract value significant relative to market cap
4. Clinical trial primary completion or readout date — registered on ClinicalTrials.gov
5. Short squeeze setup — short interest >15% of float + specific positive catalyst incoming

For each candidate: specific catalyst date if known, why market has not priced it in, float size if known, red flags.`
}

export default function InvestmentPanel({ onRunRadar, onAnalyzeTicker, loading }) {
  const [selectedSectors,    setSelectedSectors]    = useState([])
  const [timeframe,          setTimeframe]           = useState('7d')
  const [selectedMarketCaps, setSelectedMarketCaps]  = useState(['micro', 'small'])
  const [ticker,             setTicker]              = useState('')

  const toggleSector = (id) =>
    setSelectedSectors(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const toggleMarketCap = (id) =>
    setSelectedMarketCaps(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])

  const handleRunRadar = () => {
    if (loading) return
    const query = buildRadarQuery(selectedSectors, timeframe, selectedMarketCaps)
    onRunRadar(query)
  }

  const handleTickerSubmit = (e) => {
    e.preventDefault()
    const t = ticker.trim()
    if (!t || loading) return
    onAnalyzeTicker(t)
  }

  const accent = '#d4a843'
  const teal   = '#22d3ee'

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
      }}>
        {/* Header */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: accent, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '2px' }}>
            HIDDEN GEM RADAR
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
            Scans for small/micro-cap catalysts before the crowd finds them.
            Buy the signal → hold the FOMO → sell the peak.
          </div>
        </div>

        {/* Market cap */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px' }}>
            MARKET CAP TARGET
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {MARKET_CAPS.map(mc => {
              const active = selectedMarketCaps.includes(mc.id)
              return (
                <button key={mc.id} onClick={() => toggleMarketCap(mc.id)} style={{
                  flex: 1, padding: '7px 0', borderRadius: '6px', cursor: 'pointer',
                  border: active ? `1px solid ${accent}` : '1px solid var(--border)',
                  background: active ? `rgba(212,168,67,0.12)` : 'var(--surface)',
                  color: active ? accent : 'var(--muted)',
                  fontFamily: 'var(--font-sans)', transition: 'all 0.12s',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700 }}>{mc.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>{mc.desc}</div>
                </button>
              )
            })}
          </div>
          {selectedMarketCaps.includes('mid') && !selectedMarketCaps.includes('micro') && !selectedMarketCaps.includes('small') && (
            <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
              Mid-cap stocks rerate slower — add Micro or Small for better short-term setups.
            </div>
          )}
        </div>

        {/* Sectors */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px' }}>
            SECTOR FOCUS <span style={{ color: 'var(--border)', fontWeight: 400 }}>(leave blank = broad scan)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {SECTORS.map(s => {
              const active = selectedSectors.includes(s.id)
              return (
                <button key={s.id} onClick={() => toggleSector(s.id)} style={{
                  padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                  border: active ? `1px solid ${accent}` : '1px solid var(--border)',
                  background: active ? `rgba(212,168,67,0.12)` : 'var(--surface)',
                  color: active ? accent : 'var(--muted)',
                  transition: 'all 0.12s',
                }}>{s.label}</button>
              )
            })}
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px' }}>
            HOLD WINDOW
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {TIMEFRAMES.map(tf => {
              const active = timeframe === tf.id
              return (
                <button key={tf.id} onClick={() => setTimeframe(tf.id)} style={{
                  flex: 1, padding: '7px 0', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                  border: active ? `1px solid ${accent}` : '1px solid var(--border)',
                  background: active ? `rgba(212,168,67,0.12)` : 'var(--surface)',
                  color: active ? accent : 'var(--muted)',
                  transition: 'all 0.12s',
                }}>{tf.label}</button>
              )
            })}
          </div>
        </div>

        {/* Run button */}
        <button onClick={handleRunRadar} disabled={loading} style={{
          height: '44px',
          background: loading ? 'var(--border)' : accent,
          border: 'none', borderRadius: '7px',
          color: loading ? 'var(--muted)' : '#0a0e1a',
          fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-sans)', transition: 'opacity 0.15s',
        }}>
          {loading ? 'SCANNING...' : 'RUN HIDDEN GEM RADAR →'}
        </button>

        {/* Strategy note */}
        <div style={{
          fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6,
          padding: '8px 10px', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: '6px',
        }}>
          Scan logic: FDA PDUFA dates · insider buying clusters · gov contracts (small co.) · short squeeze setups · trial readouts.
          Mega/large-caps excluded — they cannot rerate 20%+ in 1-2 weeks.
        </div>
      </div>

      {/* ── TICKER ANALYSIS ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${teal}`,
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: teal, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '2px' }}>
            TICKER DEEP DIVE
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
            Already have a target? Get full OSINT — catalysts, insider filings, contracts, red flags.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            '$ASTS — satellite launch catalyst',
            '$RKLB — insider buying signal',
            '$IONQ — DoD contract pipeline',
            '$LUNR — moon mission readout',
          ].map((ex, i) => (
            <div key={i} style={{
              fontSize: '11px', color: 'var(--muted)',
              paddingLeft: '8px', borderLeft: `2px solid ${teal}44`, lineHeight: 1.5,
            }}>{ex}</div>
          ))}
        </div>

        <form onSubmit={handleTickerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
          <input
            type="text"
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            placeholder="$ASTS, RKLB, LUNR..."
            disabled={loading}
            style={{
              height: '40px', padding: '0 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '7px',
              color: 'var(--text)', fontSize: '14px',
              fontFamily: 'var(--font-mono)', outline: 'none', width: '100%',
            }}
          />
          <button type="submit" disabled={loading || !ticker.trim()} style={{
            height: '42px',
            background: loading || !ticker.trim() ? 'var(--border)' : teal,
            border: 'none', borderRadius: '7px',
            color: loading || !ticker.trim() ? 'var(--muted)' : '#0a0e1a',
            fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em',
            cursor: loading || !ticker.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-sans)', transition: 'opacity 0.15s',
          }}>
            ANALYZE TICKER →
          </button>
        </form>
      </div>

    </div>
  )
}
