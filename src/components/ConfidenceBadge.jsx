import React from 'react'

const STYLES = {
  HIGH:   { bg: 'rgba(35,134,54,0.15)',  color: '#3fb950', border: 'rgba(35,134,54,0.4)' },
  MEDIUM: { bg: 'rgba(210,153,34,0.15)', color: '#d29922', border: 'rgba(210,153,34,0.4)' },
  LOW:    { bg: 'rgba(218,54,51,0.15)',  color: '#f85149', border: 'rgba(218,54,51,0.4)' },
}

export default function ConfidenceBadge({ level }) {
  const s = STYLES[level?.toUpperCase()] || STYLES.LOW
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      fontFamily: 'var(--font-mono)',
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {level?.toUpperCase() || 'UNKNOWN'}
    </span>
  )
}
