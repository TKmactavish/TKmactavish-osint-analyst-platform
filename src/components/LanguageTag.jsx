import React from 'react'

export default function LanguageTag({ code }) {
  if (!code || code === 'EN') return null
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 7px',
      borderRadius: '3px',
      fontSize: '10px',
      fontWeight: 700,
      fontFamily: 'var(--font-mono)',
      background: 'rgba(46,164,161,0.15)',
      color: '#2ea4a1',
      border: '1px solid rgba(46,164,161,0.3)',
      letterSpacing: '0.05em',
    }}>
      [{code}]
    </span>
  )
}
