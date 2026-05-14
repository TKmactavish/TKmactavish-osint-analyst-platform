import React from 'react'
import { modeById } from '../modules/modes.js'

export default function ModeBadge({ modeId, onChange }) {
  const m = modeById(modeId)
  if (!m) return null
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '6px 12px 6px 8px',
      background: `${m.accent}14`,
      border: `1px solid ${m.accent}55`,
      borderRadius: '999px',
      fontSize: '12px',
      fontFamily: 'var(--font-mono)',
    }}>
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: m.accent, boxShadow: `0 0 0 3px ${m.accent}22`,
      }} />
      <span style={{ color: 'var(--muted)' }}>ACTIVE MODE</span>
      <span style={{ color: m.accent, fontWeight: 700 }}>{m.label}</span>
      {onChange && (
        <button
          onClick={onChange}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            fontSize: '10px',
            padding: '3px 8px',
            borderRadius: '999px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          CHANGE MODE
        </button>
      )}
    </div>
  )
}
