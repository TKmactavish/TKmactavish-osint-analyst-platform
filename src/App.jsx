import React, { useState, useRef, useCallback, useEffect } from 'react'
import SearchBar from './components/SearchBar.jsx'
import LoadingState from './components/LoadingState.jsx'
import ErrorState from './components/ErrorState.jsx'
import ModeSelection from './components/ModeSelection.jsx'
import ModeBadge from './components/ModeBadge.jsx'
import TabbedReport from './components/TabbedReport.jsx'
import DownloadButton from './components/DownloadButton.jsx'
import { collectAnalysis } from './modules/collect.js'
import { modeById } from './modules/modes.js'

const S = {
  wrap: { maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 80px' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { width: 44, height: 44, borderRadius: 8, objectFit: 'contain', flexShrink: 0 },
  logoName: { fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' },
  logoSub: {
    fontSize: '11px',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  notice: {
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.25)',
    borderRadius: '7px',
    padding: '10px 16px',
    fontSize: '12px',
    color: '#f59e0b',
    marginBottom: '20px',
    lineHeight: 1.5,
  },
  modeBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },
  reportHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '18px',
    padding: '14px 16px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
  },
  reportTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.01em',
  },
  reportSub: { fontSize: '12px', color: 'var(--muted)', marginTop: '4px' },
  btn: {
    height: '36px',
    padding: '0 14px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--muted)',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  btnPrimary: {
    height: '36px',
    padding: '0 16px',
    background: 'var(--primary)',
    border: '1px solid var(--primary)',
    borderRadius: '6px',
    color: '#0a0e1a',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  btnAccent: {
    height: '36px',
    padding: '0 16px',
    background: 'var(--accent)',
    border: '1px solid var(--accent)',
    borderRadius: '6px',
    color: '#0a0e1a',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('athena-theme') || 'dark')
  const [activeAnalysisMode, setActiveAnalysisMode] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const [pendingMode, setPendingMode] = useState(null) // mode to re-analyze with
  const stepTimerRef = useRef(null)

  const loadingSteps = [
    'Detecting region and language',
    'Searching open sources',
    'Cross-referencing findings',
    'Generating mode-specific brief',
    'Validating analytic tradecraft',
  ]

  const resetReportState = () => {
    setReport(null)
    setError(null)
    setPendingMode(null)
    if (stepTimerRef.current) clearInterval(stepTimerRef.current)
  }

  const handleSelectMode = (id) => {
    setActiveAnalysisMode(id)
    resetReportState()
    setQuery('')
  }

  const handleChangeMode = () => {
    setActiveAnalysisMode(null)
    resetReportState()
    setQuery('')
  }

  const handleNewSearch = () => {
    resetReportState()
    setQuery('')
  }

  const runAnalysis = useCallback(async (modeOverride) => {
    const q = query.trim()
    const mode = modeOverride || activeAnalysisMode
    if (!q || !mode || loading) return

    resetReportState()
    setLoading(true)
    setLoadingStep(0)

    let step = 0
    stepTimerRef.current = setInterval(() => {
      step = Math.min(step + 1, loadingSteps.length - 1)
      setLoadingStep(step)
    }, 3500)

    try {
      const raw = await collectAnalysis(q, mode)
      setReport({ ...raw, _mode: mode, _query: q })
    } catch (err) {
      setError(err.message || 'Analysis failed.')
    } finally {
      clearInterval(stepTimerRef.current)
      setLoading(false)
    }
  }, [query, activeAnalysisMode, loading])

  // If user changes mode after report exists, flag for re-analyze instead of mutating
  const handleModeChangeWithReport = (newMode) => {
    if (report && newMode !== report._mode) {
      setPendingMode(newMode)
    } else {
      setActiveAnalysisMode(newMode)
    }
  }

  const reAnalyze = () => {
    if (!pendingMode) return
    setActiveAnalysisMode(pendingMode)
    runAnalysis(pendingMode)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('athena-theme', theme)
  }, [theme])

  useEffect(() => () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current)
  }, [])

  const activeMode = modeById(activeAnalysisMode)

  return (
    <div style={S.wrap}>
      {/* Header */}
      <header className="app-header" style={S.header}>
        <div style={S.logoRow}>
          <img
            src="/athena-logo.png"
            alt="Athena Intel"
            style={S.logo}
            onError={(e) => {
              const parent = e.currentTarget.parentNode
              e.currentTarget.style.display = 'none'
              const fallback = document.createElement('div')
              Object.assign(fallback.style, {
                width: '38px', height: '38px',
                background: '#d4a843', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: '900', color: '#0a0e1a',
                flexShrink: '0',
              })
              fallback.textContent = 'A'
              parent.insertBefore(fallback, parent.firstChild)
            }}
          />
          <div>
            <div style={S.logoName}>Athena Intel</div>
            <div style={S.logoSub}>Open-Source Intelligence Platform</div>
          </div>
        </div>
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          style={{ ...S.btn, fontSize: '12px', padding: '0 12px' }}
          title="Toggle light/dark mode"
        >
          {theme === 'dark' ? '☀ Light' : '◑ Dark'}
        </button>
      </header>

      {/* Legal notice */}
      <div style={S.notice}>
        Machine-assisted OSINT may contain errors. Verify all claims independently before operational use.
        Use only lawful public sources. Do not collect private personal data or use this platform
        for stalking, harassment, doxxing, or targeting of individuals.
      </div>

      {/* Mode selection landing — shown when no mode is active */}
      {!activeAnalysisMode && (
        <ModeSelection onSelect={handleSelectMode} />
      )}

      {/* Search + report flow — only when mode is active */}
      {activeAnalysisMode && (
        <>
          <div style={S.modeBar}>
            <ModeBadge modeId={activeAnalysisMode} onChange={handleChangeMode} />
            {report && (
              <button style={S.btn} onClick={handleNewSearch}>+ New Search</button>
            )}
          </div>

          {/* Search input (hidden until mode is selected) */}
          {!loading && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--muted)',
                marginBottom: '6px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em',
              }}>WHAT DO YOU WANT ATHENA TO ANALYZE?</div>
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={() => runAnalysis()}
                loading={loading}
                placeholder="Example: protest near Bangkok, shooting in Pattaya, scam compound near border, is Phnom Penh safe"
              />
            </div>
          )}

          {/* Pending re-analyze prompt */}
          {pendingMode && report && (
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--accent)',
              borderRadius: '8px',
              padding: '14px 18px',
              marginBottom: '18px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                Mode change pending: <strong>{modeById(pendingMode)?.label}</strong>.
                Rerun this query to generate a new report.
              </div>
              <button style={S.btnAccent} onClick={reAnalyze}>
                Re-analyze with {modeById(pendingMode)?.label}
              </button>
            </div>
          )}

          {loading && <LoadingState step={loadingStep} steps={loadingSteps} />}

          {!loading && error && (
            <ErrorState
              message={error}
              onRetry={() => { setError(null); }}
            />
          )}

          {!loading && report && (
            <ReportView
              report={report}
              activeMode={activeAnalysisMode}
            />
          )}
        </>
      )}
    </div>
  )
}

function ReportView({ report, activeMode }) {
  const m = modeById(activeMode)

  return (
    <div className="fade-in">
      {/* Report header band */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px',
        padding: '14px 18px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${m.accent}`,
        borderRadius: '8px',
      }}>
        <div>
          <div style={{
            fontSize: '10px',
            color: m.accent,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            {report.reportTitle || m.reportTitle}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
            {report._query || report.query}
          </div>
        </div>
        <DownloadButton report={report} />
      </div>

      <TabbedReport report={report} mode={activeMode} accent={m.accent} />

      {/* Disclaimer */}
      <div style={{
        marginTop: '18px',
        padding: '12px 16px',
        background: 'var(--surface)',
        border: '1px dashed var(--border)',
        borderRadius: '6px',
        fontSize: '11px',
        color: 'var(--muted)',
        lineHeight: 1.6,
        fontStyle: 'italic',
      }}>
        This report is generated from open-source information. It should support, not replace,
        professional judgment, official guidance, or real-time local authority instructions.
      </div>
    </div>
  )
}
