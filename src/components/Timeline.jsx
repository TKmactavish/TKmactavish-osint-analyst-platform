import React from 'react'

export default function Timeline({ events }) {
  const list = events || []
  if (!list.length) {
    return <div style={{ color: 'var(--muted)', fontSize: '13px', fontStyle: 'italic' }}>No dated events available.</div>
  }
  const sorted = [...list]
    .filter(e => e.date || e.event)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return (
    <div style={{ position: 'relative', paddingLeft: '4px' }}>
      <div style={{
        position: 'absolute', left: '92px', top: 6, bottom: 6,
        width: '1px', background: 'var(--border)',
      }} />
      {sorted.map((e, i) => (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '88px 18px 1fr',
          gap: '0 12px',
          paddingBottom: '14px',
          alignItems: 'start',
        }}>
          <div style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            textAlign: 'right',
            paddingTop: '2px',
          }}>{e.date || '????-??-??'}</div>
          <div style={{
            width: '9px', height: '9px', borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid var(--bg)',
            justifySelf: 'center',
            marginTop: '5px',
            zIndex: 1,
          }} />
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.55 }}>{e.event || ''}</div>
            {e.source_url && (
              <a
                href={e.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  wordBreak: 'break-all',
                  display: 'inline-block',
                  marginTop: '3px',
                }}
              >
                {e.source_url}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
