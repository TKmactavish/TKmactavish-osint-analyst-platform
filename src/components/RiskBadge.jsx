import React from 'react'

// Mode-aware risk styling
const PALETTE = {
  green:    { bg: '#10b981', fg: '#021810' },
  yellow:   { bg: '#f59e0b', fg: '#1a1300' },
  orange:   { bg: '#f97316', fg: '#150700' },
  red:      { bg: '#ef4444', fg: '#fff' },
  darkRed:  { bg: '#7f1d1d', fg: '#fff', pulse: true },
}

const SECURITY_MAP = {
  'low': 'green', 'moderate': 'yellow', 'medium': 'orange', 'high': 'red', 'critical': 'darkRed',
}
const INVESTMENT_MAP = {
  'strong': 'green', 'moderate': 'yellow', 'weak': 'orange', 'red flag': 'darkRed',
}
const TRAVELER_MAP = {
  'safe': 'green', 'use caution': 'yellow', 'avoid area': 'orange', 'no-go': 'red',
}

const LEGACY_MAP = {
  'low': 'green', 'medium': 'yellow', 'high': 'red',
}

export function getRiskLabelForMode(mode) {
  switch (mode) {
    case 'security':   return 'Threat Level'
    case 'investment': return 'Catalyst Rating'
    case 'traveler':   return 'Travel Advice'
    default:           return 'Risk Level'
  }
}

export default function RiskBadge({ level, mode, size = 'md' }) {
  if (!level) return null
  const key = String(level).toLowerCase()
  const map = mode === 'investment' ? INVESTMENT_MAP : mode === 'traveler' ? TRAVELER_MAP : mode === 'security' ? SECURITY_MAP : LEGACY_MAP
  const paletteKey = map[key] || 'yellow'
  const p = PALETTE[paletteKey]

  const fontSize = size === 'lg' ? '14px' : size === 'sm' ? '10px' : '12px'
  const padding  = size === 'lg' ? '6px 14px' : size === 'sm' ? '2px 8px' : '4px 11px'

  return (
    <span
      className={p.pulse ? 'pulse' : ''}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding,
        borderRadius: '4px',
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)',
        background: p.bg,
        color: p.fg,
      }}
    >
      {String(level).toUpperCase()}
    </span>
  )
}
