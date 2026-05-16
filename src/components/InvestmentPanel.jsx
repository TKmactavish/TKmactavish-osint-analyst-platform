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
  return themes.length ? `RADAR:${themes.join(',')}` : 'RADAR:ALL';
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
            Find Bloomberg news before Bloomberg covers it.
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
            Scans for strong, real signals — major partnerships, revenue inflections, contract wins — that exist in public sources but haven't been amplified by mainstream media yet. Any size $500M–$30B. Buy the gap, hold while FOMO builds, sell the peak.
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
            { color: '#22d3ee', label: 'Major Partnership',    desc: 'Named deal with NVIDIA, AWS, SpaceX, DOD — real, confirmed, not yet on Bloomberg', example: 'DGXX + Cerebras' },
            { color: '#d4a843', label: 'Revenue Inflection',  desc: 'Earnings surprise +50%+ YoY — moves valuation before analysts reprice it', example: 'RCAT +2500% QoQ' },
            { color: '#f97316', label: 'Contract / Approval', desc: 'Government award or regulatory milestone with specific dollar value', example: 'PL $260M Germany deal' },
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
            $500M–$30B market cap. Signal must be strong enough to eventually make Bloomberg — but you buy it first.
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
