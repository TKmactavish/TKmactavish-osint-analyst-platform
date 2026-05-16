import React, { useState } from 'react'
import SourceList from './SourceList.jsx'

const CATALYST_COLORS = {
  'Partnership Play':        '#22d3ee',
  'Tech Narrative':          '#d4a843',
  'Short Squeeze Setup':     '#f97316',
  'FDA PDUFA':               '#10b981',
  'Clinical Trial Readout':  '#8b5cf6',
  'Government Contract':     '#22d3ee',
  'Earnings Catalyst':       '#3b82f6',
  'Insider Buying Cluster':  '#d4a843',
  'Regulatory Decision':     '#f59e0b',
  'Partnership Announcement':'#22d3ee',
}

const CONFIDENCE_PALETTE = {
  'High':     { bg: '#10b981', fg: '#021810' },
  'Moderate': { bg: '#f59e0b', fg: '#1a1300' },
  'Low':      { bg: '#f97316', fg: '#150700' },
}

const AWARENESS_COLOR = {
  'Unnoticed':    '#10b981',
  'Emerging':     '#f59e0b',
  'Widely Known': '#ef4444',
}

function Chip({ label, color }) {
  if (!label) return null
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      background: `${color}18`,
      color,
      border: `1px solid ${color}44`,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function ConfidenceBadge({ level }) {
  const p = CONFIDENCE_PALETTE[level] || CONFIDENCE_PALETTE['Moderate']
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      background: p.bg,
      color: p.fg,
      flexShrink: 0,
    }}>{level || 'Moderate'}</span>
  )
}

function InfoPill({ label, value, color }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: color || 'var(--text)' }}>{value}</span>
    </div>
  )
}

function CandidateCard({ candidate, accent, rank }) {
  const catalystColor = CATALYST_COLORS[candidate.catalystType] || accent
  const awarenessColor = AWARENESS_COLOR[candidate.marketAwareness] || '#f59e0b'
  const hasRedFlags = candidate.redFlags && candidate.redFlags !== '' && candidate.redFlags !== 'None'

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderLeft: `4px solid ${catalystColor}`,
      borderRadius: '10px',
      padding: '20px 20px 16px',
      marginBottom: '12px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, color: 'var(--muted)',
            fontFamily: 'var(--font-mono)', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: '4px',
            padding: '2px 6px',
          }}>#{rank}</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: accent, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
            ${candidate.ticker}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{candidate.company}</span>
          <Chip label={candidate.sector} color="var(--muted)" />
          <Chip label={candidate.catalystType} color={catalystColor} />
        </div>
        <ConfidenceBadge level={candidate.confidence} />
      </div>

      {/* Catalyst summary */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '10px', color: catalystColor, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '4px' }}>CATALYST</div>
        <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.65 }}>{candidate.catalystSummary}</div>
      </div>

      {/* Why it might rerate */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '4px' }}>WHY IT MIGHT RERATE</div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>{candidate.whyItMightRerate}</div>
      </div>

      {/* Info strip */}
      <div style={{
        display: 'flex', gap: '20px', flexWrap: 'wrap',
        padding: '10px 12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        marginBottom: '10px',
      }}>
        <InfoPill label="CATALYST DATE" value={candidate.catalystDate} />
        <InfoPill label="AWARENESS" value={candidate.marketAwareness} color={awarenessColor} />
        <InfoPill label="TIME WINDOW" value={candidate.timeWindow} />
        {candidate.shortInterestNote && <InfoPill label="SHORT INTEREST" value={candidate.shortInterestNote} />}
      </div>

      {/* Insider activity */}
      {candidate.insiderActivityNote && (
        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
          <span style={{ color: '#d4a843', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.06em' }}>INSIDER  </span>
          {candidate.insiderActivityNote}
        </div>
      )}

      {/* Red flags */}
      {hasRedFlags && (
        <div style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#ef4444',
          lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.06em' }}>RED FLAG  </span>
          {candidate.redFlags}
        </div>
      )}
    </div>
  )
}

export default function RadarReport({ report, accent }) {
  const candidates = Array.isArray(report.candidates) ? report.candidates : []
  const watchList  = Array.isArray(report.watchList)  ? report.watchList  : []
  const avoidList  = Array.isArray(report.avoidList)  ? report.avoidList  : []
  const sources    = report.sourceAssessment || report.sources || []
  const [showSources, setShowSources] = useState(false)

  return (
    <div>
      {/* Scan summary */}
      {report.scanSummary && (
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderTop: `2px solid ${accent}`,
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '20px',
          fontSize: '13px',
          color: 'var(--muted)',
          lineHeight: 1.7,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', color: accent, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>HIDDEN GEM RADAR</span>
            <span style={{ fontSize: '10px', color: '#10b981', fontFamily: 'var(--font-mono)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '3px', padding: '1px 6px' }}>SMALL/MICRO-CAP ONLY</span>
            <span style={{ fontSize: '10px', color: '#ef4444', fontFamily: 'var(--font-mono)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '3px', padding: '1px 6px' }}>MEGA-CAP EXCLUDED</span>
          </div>
          {report.scanSummary}
        </div>
      )}

      {/* Candidate cards */}
      {candidates.length > 0 ? (
        <div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '12px' }}>
            {candidates.length} CANDIDATE{candidates.length !== 1 ? 'S' : ''} IDENTIFIED
          </div>
          {candidates.map((c, i) => (
            <CandidateCard key={i} candidate={c} accent={accent} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
          No candidates identified. Try a broader scan query.
        </div>
      )}

      {/* Watch + Avoid lists */}
      {(watchList.length > 0 || avoidList.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: watchList.length && avoidList.length ? '1fr 1fr' : '1fr', gap: '12px', marginTop: '8px', marginBottom: '16px' }}>
          {watchList.length > 0 && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderTop: '2px solid #10b981', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '10px', color: '#10b981', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '10px' }}>WATCH LIST</div>
              {watchList.map((item, i) => (
                <div key={i} style={{ fontSize: '12px', color: 'var(--text)', paddingLeft: '10px', borderLeft: '2px solid #10b98155', marginBottom: '6px', lineHeight: 1.5 }}>{item}</div>
              ))}
            </div>
          )}
          {avoidList.length > 0 && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderTop: '2px solid #ef4444', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '10px', color: '#ef4444', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '10px' }}>AVOID LIST</div>
              {avoidList.map((item, i) => (
                <div key={i} style={{ fontSize: '12px', color: 'var(--text)', paddingLeft: '10px', borderLeft: '2px solid #ef444455', marginBottom: '6px', lineHeight: 1.5 }}>{item}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confidence justification */}
      {report.confidenceJustification && (
        <div style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '14px', paddingLeft: '12px', borderLeft: '2px solid var(--border)' }}>
          {report.confidenceJustification}
        </div>
      )}

      {/* Sources toggle */}
      {sources.length > 0 && (
        <div>
          <button
            onClick={() => setShowSources(s => !s)}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '7px 14px',
              fontSize: '12px', color: 'var(--muted)', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
              marginBottom: '10px',
            }}
          >
            {showSources ? '▲ Hide Sources' : '▼ Show Sources'} ({sources.length})
          </button>
          {showSources && <SourceList sources={sources} />}
        </div>
      )}
    </div>
  )
}
