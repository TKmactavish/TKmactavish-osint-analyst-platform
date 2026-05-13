import React, { useState, useRef, useCallback } from 'react'
import SearchBar from './components/SearchBar.jsx'
import ReportCard from './components/ReportCard.jsx'
import Timeline from './components/Timeline.jsx'
import SourceList from './components/SourceList.jsx'
import RiskBadge from './components/RiskBadge.jsx'
import ConfidenceBadge from './components/ConfidenceBadge.jsx'
import DownloadButton from './components/DownloadButton.jsx'
import LoadingState from './components/LoadingState.jsx'
import EmptyState from './components/EmptyState.jsx'
import ErrorState from './components/ErrorState.jsx'
import { collectAnalysis } from './modules/collect.js'
import { parseReport, getOverallRisk } from './modules/analyze.js'
import { buildSearchContext, getLoadingSteps } from './modules/search.js'
import { formatRecommendations } from './modules/recommend.js'

const TABS = [
  'Overview',
  'Key Facts',
  'Timeline',
  'Sources',
  'Risk & Impact',
  'Intelligence Assessment',
  'Recommendations',
]

// ── Inline styles as objects ──────────────────────────────────────────────────
const S = {
  wrap: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '28px 20px 60px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoMark: {
    width: '38px', height: '38px',
    background: 'var(--teal)',
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: 900,
    color: '#0d1117',
    flexShrink: 0,
    fontFamily: 'var(--font-sans)',
  },
  logoName: {
    fontSize: '18px', fontWeight: 700,
    color: '#fff', letterSpacing: '-0.02em',
  },
  logoSub: {
    fontSize: '11px', color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '0.1em',
  },
  hdrRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  pill: {
    fontSize: '12px', color: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: '20px', padding: '5px 12px',
    whiteSpace: 'nowrap',
  },
  newSearchBtn: {
    height: '34px', padding: '0 14px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--muted)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  },
  notice: {
    background: 'rgba(210,153,34,0.08)',
    border: '1px solid rgba(210,153,34,0.25)',
    borderRadius: '7px',
    padding: '10px 16px',
    fontSize: '12px',
    color: '#d29922',
    marginBottom: '20px',
    lineHeight: 1.5,
  },
  tabsRow: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    marginBottom: '20px',
    overflowX: 'auto',
  },
  tab: (active) => ({
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--teal)' : '2px solid transparent',
    color: active ? 'var(--teal)' : 'var(--muted)',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    marginBottom: '-1px',
    transition: 'color 0.15s',
    fontFamily: 'var(--font-sans)',
  }),
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.6fr',
    gap: '14px',
    marginBottom: '14px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
    marginBottom: '14px',
  },
  statRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border)',
  },
  factItem: (status) => ({
    display: 'flex',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    marginBottom: '8px',
    alignItems: 'flex-start',
  }),
  factStatus: (status) => ({
    fontSize: '10px',
    fontWeight: 700,
    padding: '3px 7px',
    borderRadius: '3px',
    background: status === 'CONFIRMED'
      ? 'rgba(35,134,54,0.15)'
      : 'rgba(210,153,34,0.15)',
    color: status === 'CONFIRMED' ? '#3fb950' : '#d29922',
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    marginTop: '2px',
  }),
  redFlagItem: {
    borderLeft: '3px solid var(--warning)',
    padding: '10px 14px',
    background: 'rgba(210,153,34,0.06)',
    borderRadius: '0 6px 6px 0',
    marginBottom: '8px',
    fontSize: '13px',
    color: 'var(--text)',
    lineHeight: 1.5,
  },
  impactCat: {
    padding: '12px 14px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  gapItem: {
    padding: '8px 14px',
    borderLeft: '2px solid var(--border)',
    marginBottom: '6px',
    fontSize: '13px',
    color: 'var(--muted)',
    lineHeight: 1.5,
  },
  recSection: (color) => ({
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderTop: `3px solid ${color}`,
    borderRadius: '8px',
    padding: '16px 18px',
  }),
  recContent: {
    fontSize: '13px',
    color: 'var(--text)',
    lineHeight: 1.6,
    marginTop: '8px',
    whiteSpace: 'pre-wrap',
  },
}

// ── Helper components ─────────────────────────────────────────────────────────

function StatBox({ value, label, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{
        fontSize: '22px',
        fontWeight: 800,
        color: color || 'var(--text)',
        fontFamily: 'var(--font-mono)',
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '11px',
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {label}
      </span>
    </div>
  )
}

// ── Tab panels ────────────────────────────────────────────────────────────────

function OverviewPanel({ report }) {
  const risk = getOverallRisk(report)
  const riskColor = risk === 'HIGH' ? '#da3633' : risk === 'MEDIUM' ? '#d29922' : '#238636'
  const sources = report.sourceAssessment || report.sources || []
  const flags = report.riskIndicators || report.flags || []

  return (
    <>
      <div style={S.grid2}>
        <ReportCard label="Executive Summary">
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '10px',
            lineHeight: 1.3,
          }}>
            {report.query}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
            {report.executiveSummary || report.summary}
          </p>
          <div style={S.statRow}>
            <StatBox value={sources.length} label="Sources" />
            <StatBox value={(report.timeline || []).length} label="Events" />
            <StatBox value={flags.length} label="Flags" />
            <StatBox
              value={risk}
              label="Risk Level"
              color={riskColor}
            />
          </div>
        </ReportCard>

        <ReportCard label="Classification">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>
                QUERY TYPE
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--text)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
              }}>
                {(report.type || 'unknown').replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>
                CONFIDENCE LEVEL
              </div>
              <ConfidenceBadge level={report.confidenceLevel} />
              {report.confidenceJustification && (
                <div style={{
                  fontSize: '12px',
                  color: 'var(--muted)',
                  marginTop: '6px',
                  lineHeight: 1.5,
                }}>
                  {report.confidenceJustification}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>
                OVERALL RISK
              </div>
              <RiskBadge level={risk} />
            </div>
          </div>
        </ReportCard>
      </div>

      {/* Risk indicators preview */}
      {flags.length > 0 && (
        <ReportCard label={`Risk Indicators — ${flags.length} flag(s)`}>
          {flags.slice(0, 4).map((flag, i) => (
            <div key={i} style={S.redFlagItem}>
              {typeof flag === 'string' ? flag : `${flag.name || ''}: ${flag.description || ''}`}
            </div>
          ))}
          {flags.length > 4 && (
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
              +{flags.length - 4} more in the Risk & Impact tab
            </div>
          )}
        </ReportCard>
      )}
    </>
  )
}

function KeyFactsPanel({ report }) {
  const facts = report.keyFacts || []
  if (!facts.length) {
    return <EmptyState message="No key facts extracted for this query." />
  }

  const confirmed = facts.filter(f => (f.status || '').toUpperCase() === 'CONFIRMED')
  const unconfirmed = facts.filter(f => (f.status || '').toUpperCase() !== 'CONFIRMED')

  return (
    <ReportCard label={`Key Facts — ${facts.length} total (${confirmed.length} confirmed, ${unconfirmed.length} unconfirmed)`}>
      {facts.map((f, i) => {
        const status = (f.status || 'UNCONFIRMED').toUpperCase()
        return (
          <div key={i} style={S.factItem(status)}>
            <span style={S.factStatus(status)}>{status}</span>
            <span style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
              {f.fact || f}
            </span>
          </div>
        )
      })}
    </ReportCard>
  )
}

function RiskImpactPanel({ report }) {
  const indicators = report.riskIndicators || report.flags || []
  const ra = report.risk_assessment || {}
  const impact = report.impactAssessment || {}
  const risk = getOverallRisk(report)
  const riskColor = risk === 'HIGH' ? '#da3633' : risk === 'MEDIUM' ? '#d29922' : '#238636'

  return (
    <>
      <div style={S.grid2}>
        <ReportCard label="Overall Risk Level">
          <div style={{
            fontSize: '52px',
            fontWeight: 900,
            color: riskColor,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: '10px',
            fontFamily: 'var(--font-mono)',
          }}>
            {risk}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
            {ra.rationale || 'Risk level derived from intelligence indicators and source assessment.'}
          </p>
        </ReportCard>

        <ReportCard label="Risk Factors">
          {(ra.factors || []).length > 0
            ? ra.factors.map((f, i) => (
                <div key={i} style={{
                  borderLeft: '2px solid var(--danger)',
                  padding: '6px 12px',
                  marginBottom: '6px',
                  fontSize: '13px',
                  color: 'var(--text)',
                }}>
                  {f}
                </div>
              ))
            : <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No specific factors listed.</div>
          }
        </ReportCard>
      </div>

      {indicators.length > 0 && (
        <ReportCard label={`Risk Indicators / Red Flags — ${indicators.length}`}>
          {indicators.map((flag, i) => (
            <div key={i} style={S.redFlagItem}>
              {typeof flag === 'string'
                ? flag
                : (
                  <>
                    <strong style={{ color: 'var(--warning)' }}>{flag.name}</strong>
                    {flag.description ? ` — ${flag.description}` : ''}
                    {flag.evidence && (
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                        Evidence: {flag.evidence}
                      </div>
                    )}
                  </>
                )
              }
            </div>
          ))}
        </ReportCard>
      )}

      {Object.keys(impact).length > 0 && (
        <ReportCard label="Impact Assessment">
          {['civilian', 'political', 'economic', 'security'].map(cat => {
            if (!impact[cat]) return null
            return (
              <div key={cat} style={S.impactCat}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {cat}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
                  {impact[cat]}
                </div>
              </div>
            )
          })}
        </ReportCard>
      )}
    </>
  )
}

function IntelAssessmentPanel({ report }) {
  const ia = report.intelligenceAssessment || report.analytical_perspective || ''
  const gaps = report.informationGaps || []

  return (
    <>
      <ReportCard label="Intelligence Assessment">
        {ia
          ? ia.split(/\n\n+/).filter(Boolean).map((p, i) => (
              <p key={i} style={{
                fontSize: '14px',
                color: 'var(--text)',
                lineHeight: 1.75,
                marginBottom: '14px',
              }}>
                {p}
              </p>
            ))
          : <EmptyState message="No intelligence assessment available." />
        }
      </ReportCard>

      {gaps.length > 0 && (
        <ReportCard label={`Information Gaps — ${gaps.length}`} style={{ marginTop: '14px' }}>
          {gaps.map((g, i) => (
            <div key={i} style={S.gapItem}>• {g}</div>
          ))}
        </ReportCard>
      )}
    </>
  )
}

function RecommendationsPanel({ report }) {
  const recs = formatRecommendations(report.recommendations || {})
  const legacyRec = report.recommendations || {}

  // Support both new schema (plain text) and old schema (arrays per audience)
  const hasNew = recs.length > 0
  const hasLegacy = Array.isArray(legacyRec.law_enforcement) ||
                    Array.isArray(legacyRec.private_sector) ||
                    Array.isArray(legacyRec.traveler)

  if (!hasNew && !hasLegacy) {
    return <EmptyState message="No recommendations generated for this query." />
  }

  const OPEN_INTEL_QUESTIONS = [
    'Which source has direct firsthand access to the subject?',
    'Is there a confirmed official government or institutional statement?',
    'Are there credible sources in other languages not yet consulted?',
    'What would escalate or de-escalate the assessed risk level?',
    'What single piece of information, if wrong, would change this entire assessment?',
    'Have you checked for coordinated disinformation or narrative manipulation?',
  ]

  return (
    <>
      {hasNew && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '14px',
          marginBottom: '14px',
        }}>
          {recs.map(({ key, label, icon, color, content }) => (
            <div key={key} style={S.recSection(color)}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                {icon} {label}
              </div>
              <div style={S.recContent}>{content}</div>
            </div>
          ))}
        </div>
      )}

      {hasLegacy && !hasNew && (
        <div style={S.grid3}>
          {[
            { key: 'law_enforcement', label: 'Law Enforcement & Intelligence', color: '#8957e5' },
            { key: 'private_sector', label: 'Private Sector & Corporate Security', color: '#1f6feb' },
            { key: 'traveler', label: 'Traveler & Personal Safety', color: '#238636' },
          ].map(({ key, label, color }) => {
            const items = legacyRec[key] || []
            if (!items.length) return null
            return (
              <div key={key} style={S.recSection(color)}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '10px',
                }}>
                  {label}
                </div>
                {items.map((item, i) => (
                  <div key={i} style={{
                    borderLeft: `2px solid ${color}`,
                    padding: '7px 12px',
                    marginBottom: '6px',
                    fontSize: '13px',
                    color: 'var(--text)',
                    lineHeight: 1.5,
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      <ReportCard label="Open Intelligence Questions">
        {OPEN_INTEL_QUESTIONS.map((q, i) => (
          <div key={i} style={{
            borderLeft: '2px solid var(--border)',
            padding: '7px 14px',
            marginBottom: '6px',
            fontSize: '13px',
            color: 'var(--muted)',
            lineHeight: 1.5,
          }}>
            {q}
          </div>
        ))}
      </ReportCard>
    </>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingSteps, setLoadingSteps] = useState([])
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')
  const [lastQuery, setLastQuery] = useState('')
  const stepTimerRef = useRef(null)
  const reportRef = useRef(null)

  const resetState = () => {
    setReport(null)
    setError(null)
    setActiveTab('Overview')
    if (stepTimerRef.current) clearInterval(stepTimerRef.current)
  }

  const handleNewSearch = useCallback(() => {
    resetState()
    setQuery('')
    setLoading(false)
  }, [])

  const handleSubmit = useCallback(async () => {
    const q = query.trim()
    if (!q || loading) return

    resetState()
    setLoading(true)
    setLoadingStep(0)
    setLastQuery(q)

    const ctx = buildSearchContext(q)
    const steps = getLoadingSteps(ctx)
    setLoadingSteps(steps)

    let step = 0
    stepTimerRef.current = setInterval(() => {
      step = Math.min(step + 1, steps.length - 1)
      setLoadingStep(step)
    }, 3500)

    try {
      const raw = await collectAnalysis(q)
      const parsed = parseReport(raw)
      setReport(parsed)
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      clearInterval(stepTimerRef.current)
      setLoading(false)
    }
  }, [query, loading])

  const renderTabPanel = () => {
    if (!report) return null
    switch (activeTab) {
      case 'Overview':                return <OverviewPanel report={report} />
      case 'Key Facts':               return <KeyFactsPanel report={report} />
      case 'Timeline':                return <Timeline events={report.timeline} />
      case 'Sources':                 return <SourceList sources={report.sourceAssessment || report.sources} />
      case 'Risk & Impact':           return <RiskImpactPanel report={report} />
      case 'Intelligence Assessment': return <IntelAssessmentPanel report={report} />
      case 'Recommendations':         return <RecommendationsPanel report={report} />
      default:                        return null
    }
  }

  return (
    <div style={S.wrap}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.logoRow}>
          <div style={S.logoMark}>A</div>
          <div>
            <div style={S.logoName}>Athena Intel</div>
            <div style={S.logoSub}>Open-Source Intelligence Platform</div>
          </div>
        </div>
        <div style={S.hdrRight}>
          <span style={S.pill}>Lawful public sources only</span>
          {report && (
            <button
              style={S.newSearchBtn}
              onClick={handleNewSearch}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text)'
                e.currentTarget.style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--muted)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              + New Search
            </button>
          )}
        </div>
      </header>

      {/* Legal notice */}
      <div style={S.notice}>
        Machine-assisted OSINT may contain errors. Verify all claims independently before operational use.
        Use only lawful public sources. Do not collect private personal data or use this platform
        for stalking, harassment, doxxing, or targeting of individuals.
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: '28px' }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>

      {/* Loading */}
      {loading && (
        <LoadingState step={loadingStep} steps={loadingSteps} />
      )}

      {/* Error */}
      {!loading && error && (
        <ErrorState
          message={error}
          onRetry={() => {
            setError(null)
            setQuery(lastQuery)
          }}
        />
      )}

      {/* Report */}
      {!loading && report && (
        <div ref={reportRef}>
          {/* Tab bar */}
          <div style={S.tabsRow}>
            {TABS.map(tab => (
              <button
                key={tab}
                style={S.tab(tab === activeTab)}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="fade-in">
            {renderTabPanel()}
          </div>

          {/* Download button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
          }}>
            <DownloadButton report={report} />
          </div>
        </div>
      )}

      {/* Empty state shown before first search */}
      {!loading && !report && !error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 0',
          gap: '8px',
          opacity: 0.5,
        }}>
          <div style={{ fontSize: '28px' }}>◎</div>
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Enter a query above to begin analysis
          </div>
        </div>
      )}
    </div>
  )
}
