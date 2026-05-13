import React from 'react'
import ConfidenceBadge from './ConfidenceBadge.jsx'
import LanguageTag from './LanguageTag.jsx'
import ReportCard from './ReportCard.jsx'

const CREDIBILITY_COLORS = {
  HIGH:   '#238636',
  MEDIUM: '#d29922',
  LOW:    '#da3633',
}

function credibilityBar(level) {
  const pct = level === 'HIGH' ? 90 : level === 'MEDIUM' ? 55 : 25
  const color = CREDIBILITY_COLORS[level?.toUpperCase()] || CREDIBILITY_COLORS.LOW
  return (
    <div style={{
      height: '3px',
      background: 'var(--border)',
      borderRadius: '2px',
      marginTop: '6px',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: color,
        borderRadius: '2px',
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

export default function SourceList({ sources }) {
  if (!sources?.length) {
    return (
      <ReportCard label="Source Assessment">
        <div style={{ color: 'var(--muted)', fontSize: '13px' }}>No sources available.</div>
      </ReportCard>
    )
  }

  return (
    <ReportCard label={`Source Assessment — ${sources.length} source(s)`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sources.map((s, i) => (
          <div
            key={i}
            style={{
              border: '1px solid var(--border)',
              borderRadius: '7px',
              padding: '14px 16px',
            }}
          >
            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text)',
              lineHeight: 1.4,
              marginBottom: '8px',
            }}>
              {s.title || s.source || 'Source'}
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '6px',
            }}>
              <LanguageTag code={s.language} />
              {s.credibility && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: CREDIBILITY_COLORS[s.credibility?.toUpperCase()] || 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {s.credibility?.toUpperCase()}
                </span>
              )}
              {s.type && (
                <span style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '3px',
                  background: 'rgba(31,111,235,0.1)',
                  color: '#58a6ff',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {s.type}
                </span>
              )}
              {s.domain && (
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  {s.domain}
                </span>
              )}
              {s.date && (
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  {s.date}
                </span>
              )}
            </div>

            {s.credibility && credibilityBar(s.credibility)}

            {s.url && (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  color: 'var(--accent)',
                  display: 'block',
                  marginTop: '8px',
                  wordBreak: 'break-all',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {s.url}
              </a>
            )}
          </div>
        ))}
      </div>
    </ReportCard>
  )
}
