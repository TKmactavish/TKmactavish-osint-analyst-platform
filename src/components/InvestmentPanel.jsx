import React, { useState } from 'react'

const SECTORS = [
  { id: 'AI Infrastructure',     label: 'AI Infrastructure' },
  { id: 'Defense Technology',    label: 'Defense Tech' },
  { id: 'Biotech / Medtech',     label: 'Biotech / Medtech' },
  { id: 'Semiconductors',        label: 'Semiconductors' },
  { id: 'Energy / Grid',         label: 'Energy / Grid' },
  { id: 'Drones / Robotics',     label: 'Drones / Robotics' },
  { id: 'Crypto Mining Infra',   label: 'Crypto Mining' },
  { id: 'Space Technology',      label: 'Space Tech' },
]

const TIMEFRAMES = [
  { id: '7d',  label: 'Next 7 days' },
  { id: '14d', label: 'Next 2 weeks' },
  { id: '1m',  label: 'Next month' },
]

function buildRadarQuery(sectors, timeframeId) {
  const sectorStr = sectors.length
    ? sectors.join(', ')
    : 'AI Infrastructure, Defense Technology, Biotech, Semiconductors, Energy'
  const tfLabel = { '7d': 'next 7 days', '14d': 'next 2 weeks', '1m': 'next month' }[timeframeId] || 'next 7 days'
  return `RADAR SCAN COMMAND — output RADAR SCAN schema only. Identify exactly 4 U.S.-listed stocks with upcoming public catalysts in the ${tfLabel}. Target sectors: ${sectorStr}. Prioritise: FDA PDUFA decisions, USASpending.gov government contract awards, Form 4 insider open-market buying clusters, clinical trial readouts, short squeeze setups with confirmed positive catalyst. For each candidate include specific catalyst date if known, market awareness level, red flags, and confidence rating.`
}

export default function InvestmentPanel({ onRunRadar, onAnalyzeTicker, loading }) {
  const [selectedSectors, setSelectedSectors] = useState([])
  const [timeframe, setTimeframe]             = useState('7d')
  const [ticker, setTicker]                   = useState('')

  const toggleSector = (id) => {
    setSelectedSectors(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleRunRadar = () => {
    if (loading) return
    const query = buildRadarQuery(selectedSectors, timeframe)
    onRunRadar(query)
  }

  const handleTickerSubmit = (e) => {
    e.preventDefault()
    const t = ticker.trim()
    if (!t || loading) return
    onAnalyzeTicker(t)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>

      {/* ── Stock Radar panel ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: '3px solid #d4a843',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#d4a843', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '4px' }}>STOCK RADAR</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
            Select sectors and timeframe. Flux Alpha scans for upcoming catalysts and returns candidates to investigate.
          </div>
        </div>

        {/* Sector chips */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '8px' }}>SECTORS (optional — leave blank for broad scan)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SECTORS.map(s => {
              const active = selectedSectors.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSector(s.id)}
                  style={{
                    padding: '5px 11px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    border: active ? '1px solid #d4a843' : '1px solid var(--border)',
                    background: active ? 'rgba(212,168,67,0.12)' : 'var(--surface)',
                    color: active ? '#d4a843' : 'var(--muted)',
                    transition: 'all 0.12s',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '8px' }}>TIMEFRAME</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {TIMEFRAMES.map(tf => {
              const active = timeframe === tf.id
              return (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    border: active ? '1px solid #d4a843' : '1px solid var(--border)',
                    background: active ? 'rgba(212,168,67,0.12)' : 'var(--surface)',
                    color: active ? '#d4a843' : 'var(--muted)',
                    transition: 'all 0.12s',
                    flex: 1,
                  }}
                >
                  {tf.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Run button */}
        <button
          onClick={handleRunRadar}
          disabled={loading}
          style={{
            height: '42px',
            background: loading ? 'var(--border)' : '#d4a843',
            border: 'none',
            borderRadius: '7px',
            color: loading ? 'var(--muted)' : '#0a0e1a',
            fontSize: '13px',
            fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-sans)',
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? 'SCANNING...' : 'RUN RADAR SCAN →'}
        </button>
      </div>

      {/* ── Ticker Analysis panel ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: '3px solid #22d3ee',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '4px' }}>TICKER ANALYSIS</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
            Enter a specific ticker or company name. Get a full OSINT catalyst report with insider activity, filings, and red flags.
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
          <div style={{ marginBottom: '6px', fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>EXAMPLES</div>
          {['$ASTS — upcoming satellite catalyst', 'RKLB — recent insider buying?', 'PLTR — government contract pipeline', 'IONQ — FDA or DoD signals'].map((ex, i) => (
            <div key={i} style={{ fontSize: '11px', color: 'var(--muted)', paddingLeft: '8px', borderLeft: '2px solid #22d3ee44', marginBottom: '4px' }}>{ex}</div>
          ))}
        </div>

        <form onSubmit={handleTickerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
          <input
            type="text"
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            placeholder="$ASTS, RKLB, Palantir..."
            disabled={loading}
            style={{
              height: '40px',
              padding: '0 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              color: 'var(--text)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              width: '100%',
            }}
          />
          <button
            type="submit"
            disabled={loading || !ticker.trim()}
            style={{
              height: '42px',
              background: loading || !ticker.trim() ? 'var(--border)' : '#22d3ee',
              border: 'none',
              borderRadius: '7px',
              color: loading || !ticker.trim() ? 'var(--muted)' : '#0a0e1a',
              fontSize: '13px',
              fontWeight: 800,
              cursor: loading || !ticker.trim() ? 'not-allowed' : 'pointer',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-sans)',
              transition: 'opacity 0.15s',
            }}
          >
            ANALYZE TICKER →
          </button>
        </form>
      </div>

    </div>
  )
}
