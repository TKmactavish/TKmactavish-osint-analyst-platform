import React from 'react'

const STYLES = {
  HIGH:     { bg: '#da3633', color: '#fff' },
  MEDIUM:   { bg: '#d29922', color: '#fff' },
  LOW:      { bg: '#238636', color: '#fff' },
  CRITICAL: { bg: '#da3633', color: '#fff', pulse: true },
}

export default function RiskBadge({ level }) {
  const s = STYLES[level?.toUpperCase()] || STYLES.MEDIUM
  return (
    <span
      className={s.pulse ? 'pulse' : ''}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        fontFamily: 'var(--font-mono)',
        background: s.bg,
        color: s.color,
      }}
    >
      {level?.toUpperCase() || 'UNKNOWN'}
    </span>
  )
}
