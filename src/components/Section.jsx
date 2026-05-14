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

function safeText(item) {
  if (typeof item === 'string') return item
  if (item == null) return ''
  return item.text || item.event || item.description || item.name || item.summary || JSON.stringify(item)
}

export function BulletList({ items, accent = 'var(--accent)' }) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) {
    return <div style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '13px' }}>Not provided.</div>
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {list.map((item, i) => (
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
          {safeText(item)}
        </li>
      ))}
    </ul>
  )
}

export function TimelineList({ items, accent = 'var(--accent)' }) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) {
    return <div style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '13px' }}>Not provided.</div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {list.map((item, i) => {
        if (typeof item === 'string') {
          return (
            <div key={i} style={{
              paddingLeft: '14px',
              borderLeft: `2px solid ${accent}`,
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--text)',
            }}>
              {item}
            </div>
          )
        }
        return (
          <div key={i} style={{
            paddingLeft: '14px',
            borderLeft: `2px solid ${accent}`,
          }}>
            {item.date && (
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: accent,
                fontWeight: 700,
                letterSpacing: '0.06em',
                marginBottom: '4px',
              }}>
                {item.date}
                {item.confidence && (
                  <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '8px' }}>
                    [{item.confidence}]
                  </span>
                )}
              </div>
            )}
            <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, marginBottom: item.source_url ? '6px' : 0 }}>
              {item.event || item.description || item.text || ''}
            </div>
            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  wordBreak: 'break-all',
                  opacity: 0.8,
                }}
              >
                {item.source_url}
              </a>
            )}
          </div>
        )
      })}
    </div>
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
  // Guard against objects crashing React render
  const text = typeof children === 'object' ? JSON.stringify(children, null, 2) : String(children)
  return <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{text}</p>
}
