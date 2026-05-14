import React from 'react'

const RELIABILITY = {
  HIGH:       { bg: '#10b98122', fg: '#10b981', border: '#10b98155' },
  MEDIUM:     { bg: '#f59e0b22', fg: '#f59e0b', border: '#f59e0b55' },
  LOW:        { bg: '#ef444422', fg: '#ef4444', border: '#ef444455' },
  UNVERIFIED: { bg: '#64748b22', fg: '#94a3b8', border: '#64748b55' },
}

function Pill({ children, bg, fg, border }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '10px',
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: '4px',
      background: bg,
      color: fg,
      border: `1px solid ${border || 'transparent'}`,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
    }}>{children}</span>
  )
}

export default function SourceList({ sources }) {
  const list = sources || []
  if (!list.length) {
    return <div style={{ color: 'var(--muted)', fontSize: '13px', fontStyle: 'italic' }}>No sources available.</div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {list.map((s, i) => {
        const rel = (s.reliability || s.credibility || 'UNVERIFIED').toUpperCase()
        const rs = RELIABILITY[rel] || RELIABILITY.UNVERIFIED
        return (
          <div key={i} style={{
            padding: '12px 14px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            background: 'var(--surface)',
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '6px',
              alignItems: 'center',
            }}>
              {s.type && (
                <Pill bg="#22d3ee22" fg="#22d3ee" border="#22d3ee55">{s.type}</Pill>
              )}
              {s.language && (
                <Pill bg="#d4a84322" fg="#d4a843" border="#d4a84355">{s.language}</Pill>
              )}
              <Pill {...rs}>{rel}</Pill>
              {s.date && (
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  {s.date}
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
              {s.title || s.source || s.domain || 'Untitled source'}
            </div>
            {s.note && (
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', lineHeight: 1.5 }}>
                {s.note}
              </div>
            )}
            {s.url && (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  wordBreak: 'break-all',
                }}
              >
                {s.url}
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
