import React from 'react'
import ConfidenceBadge from './ConfidenceBadge.jsx'
import ReportCard from './ReportCard.jsx'

export default function Timeline({ events }) {
  if (!events?.length) {
    return (
      <ReportCard label="Timeline of Events">
        <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
          No dated events found for this query.
        </div>
      </ReportCard>
    )
  }

  const sorted = [...events]
    .filter(e => e.date || e.event)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return (
    <ReportCard label={`Timeline of Events — ${sorted.length} entry(s)`}>
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '94px',
          top: '8px',
          bottom: '8px',
          width: '1px',
          background: 'var(--border)',
        }} />

        {sorted.map((e, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '90px 16px 1fr',
              gap: '0 12px',
              paddingBottom: '20px',
              alignItems: 'start',
            }}
          >
            {/* Date */}
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--teal)',
              fontFamily: 'var(--font-mono)',
              paddingTop: '3px',
              textAlign: 'right',
            }}>
              {e.date || ''}
            </div>

            {/* Dot */}
            <div style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: 'var(--teal)',
              border: '2px solid var(--bg)',
              marginTop: '4px',
              position: 'relative',
              zIndex: 1,
              justifySelf: 'center',
            }} />

            {/* Content */}
            <div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text)',
                lineHeight: 1.5,
                marginBottom: '6px',
              }}>
                {e.event || ''}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {e.confidence && <ConfidenceBadge level={e.confidence} />}
                {e.source_title && (
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {e.source_title}
                  </span>
                )}
              </div>
              {e.source_url && (
                <a
                  href={e.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '11px',
                    color: 'var(--accent)',
                    display: 'block',
                    marginTop: '4px',
                    wordBreak: 'break-all',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {e.source_url}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </ReportCard>
  )
}
