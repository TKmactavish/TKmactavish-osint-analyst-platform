import React from 'react'

export function Section({ title, accent = 'var(--accent)', children, style = {} }) {
  return (
    <section style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '18px 20px',
      marginBottom: '14px',
      ...style,
    }}>
      <h3 style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: accent,
        marginBottom: '12px',
        fontFamily: 'var(--font-mono)',
      }}>
        {title}
      </h3>
      <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.65 }}>
        {children}
      </div>
    </section>
  )
}

export function BulletList({ items, accent = 'var(--accent)' }) {
  if (!items || !items.length) {
    return <div style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '13px' }}>Not provided.</div>
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, i) => (
        <li key={i} style={{
          paddingLeft: '14px',
          position: 'relative',
          fontSize: '14px',
          lineHeight: 1.6,
          color: 'var(--text)',
        }}>
          <span style={{
            position: 'absolute',
            left: 0,
            top: '0.7em',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: accent,
          }} />
          {typeof item === 'string' ? item : JSON.stringify(item)}
        </li>
      ))}
    </ul>
  )
}

export function Callout({ children, color = 'var(--accent)', label }) {
  return (
    <div style={{
      borderLeft: `3px solid ${color}`,
      padding: '10px 14px',
      background: `${color}0c`,
      borderRadius: '0 6px 6px 0',
      fontSize: '13px',
      lineHeight: 1.6,
      color: 'var(--text)',
    }}>
      {label && (
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color,
          marginBottom: '4px',
          fontFamily: 'var(--font-mono)',
        }}>{label}</div>
      )}
      {children}
    </div>
  )
}

export function Paragraph({ children }) {
  if (children == null || children === '') {
    return <div style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '13px' }}>Not provided.</div>
  }
  return <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text)' }}>{children}</p>
}
