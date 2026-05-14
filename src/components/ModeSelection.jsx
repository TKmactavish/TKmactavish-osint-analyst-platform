import React from 'react'
import { MODES } from '../modules/modes.js'

const S = {
  wrap: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 20px 80px',
  },
  hero: { textAlign: 'center', marginBottom: '40px' },
  heroTitle: {
    fontSize: '32px',
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
    marginBottom: '12px',
  },
  heroSub: {
    fontSize: '15px',
    color: 'var(--muted)',
    maxWidth: '640px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px',
  },
  card: (accent) => ({
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'left',
    width: '100%',
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    minHeight: '200px',
    borderTop: `3px solid ${accent}`,
  }),
  iconBox: (accent) => ({
    width: '52px',
    height: '52px',
    background: `${accent}1f`,
    border: `1px solid ${accent}55`,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }),
  title: { fontSize: '17px', fontWeight: 700, color: 'var(--text)' },
  subtitle: { fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 },
  cta: (accent) => ({
    fontSize: '12px',
    color: accent,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginTop: 'auto',
  }),
}

function ModeIcon({ src, label }) {
  return (
    <img
      src={src}
      alt={label}
      width={36}
      height={36}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}

export default function ModeSelection({ onSelect }) {
  return (
    <div style={S.wrap}>
      <div style={S.hero}>
        <h1 style={S.heroTitle}>Choose Your Intelligence Mission</h1>
        <p style={S.heroSub}>
          Athena generates different intelligence products depending on your role,
          mission, and decision need.
        </p>
      </div>

      <div style={S.grid}>
        {MODES.map(m => (
          <button
            key={m.id}
            style={S.card(m.accent)}
            onClick={() => onSelect(m.id)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = m.accent
              e.currentTarget.style.boxShadow = `0 8px 24px -8px ${m.accent}44`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={S.iconBox(m.accent)}>
              <ModeIcon src={m.iconSrc} label={m.label} />
            </div>
            <div style={S.title}>{m.label}</div>
            <div style={S.subtitle}>{m.subtitle}</div>
            <div style={S.cta(m.accent)}>Select →</div>
          </button>
        ))}
      </div>
    </div>
  )
}
