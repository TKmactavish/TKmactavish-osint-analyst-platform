import React, { useState } from 'react'
import { Section, BulletList, TimelineList, Paragraph, Callout } from './Section.jsx'
import SourceList from './SourceList.jsx'
import RiskBadge, { getRiskLabelForMode } from './RiskBadge.jsx'

// ─── Tab definitions per mode ────────────────────────────────────────────────

const TABS_BY_MODE = {
  security: [
    'Overview',
    'Key Judgments',
    'Timeline',
    'Sources',
    'Threat Assessment',
    'Intelligence Assessment',
    'Recommended Action',
  ],
  investment: [
    'Catalyst',
    'Evidence',
    'Red Flags',
    'Market Gap',
    'Sources',
    'Verdict',
  ],
  traveler: [
    'Safety Summary',
    'Areas to Avoid',
    'What To Do',
    'Sources',
    'Travel Advice',
    'Movement',
    'Emergency',
  ],
}

// ─── Panel renderers per mode ─────────────────────────────────────────────────

function SecurityPanels({ report, activeTab, accent }) {
  switch (activeTab) {
    case 'Overview':
      return (
        <>
          <Section title="Intelligence Summary" accent={accent}>
            <Paragraph>{report.intelligenceSummary}</Paragraph>
          </Section>
          <Section title="Incident Overview" accent={accent}>
            <Paragraph>{report.incidentOverview}</Paragraph>
          </Section>
          <Section title="Location Context" accent={accent}>
            <Paragraph>{report.locationContext}</Paragraph>
          </Section>
        </>
      )
    case 'Key Judgments':
      return (
        <Section title="Key Judgments" accent={accent}>
          <BulletList items={report.keyJudgments} accent={accent} />
        </Section>
      )
    case 'Timeline':
      return (
        <Section title="Timeline" accent={accent}>
          <TimelineList items={report.timeline} accent={accent} />
        </Section>
      )
    case 'Sources':
      return (
        <Section title="Source Assessment" accent={accent}>
          <SourceList sources={report.sourceAssessment || report.sources || []} />
        </Section>
      )
    case 'Threat Assessment':
      return (
        <>
          <Section title="Threat Level" accent={accent}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '8px' }}>
              {getRiskLabelForMode('security').toUpperCase()}
            </div>
            <RiskBadge level={report.threatLevel} mode="security" size="lg" />
          </Section>
          <Section title="Threat Assessment" accent={accent}>
            <Paragraph>{report.threatAssessment}</Paragraph>
          </Section>
          <Section title="Actors" accent={accent}>
            <BulletList items={report.actors} accent={accent} />
          </Section>
          <Section title="Modus Operandi" accent={accent}>
            <BulletList items={report.modusOperandi} accent={accent} />
          </Section>
        </>
      )
    case 'Intelligence Assessment':
      return (
        <>
          <Section title="Indicators and Patterns" accent={accent}>
            <BulletList items={report.indicatorsAndPatterns} accent={accent} />
          </Section>
          <Section title="Intelligence Gaps" accent={accent}>
            <BulletList items={report.intelligenceGaps} accent={accent} />
          </Section>
          <Section title="Recommended Collection" accent={accent}>
            <Paragraph>{report.recommendedCollection}</Paragraph>
          </Section>
          <Section title="Confidence Level" accent={accent}>
            <Callout color={accent} label={report.confidenceLevel}>
              <Paragraph>{report.confidenceJustification}</Paragraph>
            </Callout>
          </Section>
        </>
      )
    case 'Recommended Action':
      return (
        <Section title="Recommended Action" accent={accent}>
          <Callout color={accent} label="ACTION">
            <Paragraph>{report.recommendedAction}</Paragraph>
          </Callout>
        </Section>
      )
    default:
      return null
  }
}

function InvestmentPanels({ report, activeTab, accent }) {
  switch (activeTab) {
    case 'Catalyst':
      return (
        <>
          <Section title="Catalyst Rating" accent={accent}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '8px' }}>
              {getRiskLabelForMode('investment').toUpperCase()}
            </div>
            <RiskBadge level={report.catalystRating} mode="investment" size="lg" />
          </Section>
          <Section title="Catalyst Summary" accent={accent}>
            <Paragraph>{report.catalystSummary}</Paragraph>
          </Section>
          <Section title="Why It Matters" accent={accent}>
            <Callout color={accent} label="PRICE IMPACT">
              <Paragraph>{report.whyItMatters}</Paragraph>
            </Callout>
          </Section>
        </>
      )
    case 'Evidence':
      return (
        <>
          <Section title="Key Findings" accent={accent}>
            <BulletList items={report.keyFindings} accent={accent} />
          </Section>
          <Section title="Insider Activity (Form 4)" accent={accent}>
            <Paragraph>{report.insiderActivity}</Paragraph>
          </Section>
          <Section title="Government Contracts" accent={accent}>
            <Paragraph>{report.governmentContracts}</Paragraph>
          </Section>
        </>
      )
    case 'Red Flags':
      return (
        <>
          <Section title="Red Flags Detected" accent="#ef4444">
            <BulletList items={report.redFlags} accent="#ef4444" />
          </Section>
          <Section title="Financial Health" accent={accent}>
            <Paragraph>{report.financialHealth}</Paragraph>
          </Section>
          <Section title="Risk Factors" accent="#f59e0b">
            <BulletList items={report.riskFactors} accent="#f59e0b" />
          </Section>
        </>
      )
    case 'Market Gap':
      return (
        <>
          <Section title="Market Awareness Gap" accent={accent}>
            <Callout color={accent} label="AWARENESS">
              <Paragraph>{report.marketAwarenessGap}</Paragraph>
            </Callout>
          </Section>
          <Section title="Time Window" accent={accent}>
            <Paragraph>{report.timeWindow}</Paragraph>
          </Section>
        </>
      )
    case 'Sources':
      return (
        <Section title="Source Assessment" accent={accent}>
          <SourceList sources={report.sourceAssessment || report.sources || []} />
        </Section>
      )
    case 'Verdict':
      return (
        <>
          <Section title="Recommended Action" accent={accent}>
            <Callout color={accent} label="VERDICT">
              <Paragraph>{report.recommendedAction}</Paragraph>
            </Callout>
          </Section>
          <Section title="Confidence Level" accent={accent}>
            <Callout color={accent} label={report.confidenceLevel}>
              <Paragraph>{report.confidenceJustification}</Paragraph>
            </Callout>
          </Section>
        </>
      )
    default:
      return null
  }
}

function TravelerPanels({ report, activeTab, accent }) {
  switch (activeTab) {
    case 'Safety Summary':
      return (
        <>
          <Section title="Safety Summary" accent={accent}>
            <Paragraph>{report.safetySummary}</Paragraph>
          </Section>
          <Section title="Is It Safe?" accent={accent}>
            <Paragraph>{report.isItSafe}</Paragraph>
          </Section>
          <Section title="Final Recommendation" accent={accent}>
            <Callout color={accent} label="BOTTOM LINE">
              <Paragraph>{report.finalRecommendation}</Paragraph>
            </Callout>
          </Section>
        </>
      )
    case 'Areas to Avoid':
      return (
        <>
          <Section title="Areas to Avoid" accent="#ef4444">
            <BulletList items={report.areasToAvoid} accent="#ef4444" />
          </Section>
          <Section title="Main Safety Concerns" accent="#f59e0b">
            <BulletList items={report.mainSafetyConcerns} accent="#f59e0b" />
          </Section>
        </>
      )
    case 'What To Do':
      return (
        <>
          <Section title="What You Should Do" accent={accent}>
            <Callout color={accent} label="DO">
              <BulletList items={report.whatYouShouldDo} accent={accent} />
            </Callout>
          </Section>
          <Section title="What You Should Avoid" accent="#ef4444">
            <Callout color="#ef4444" label="AVOID">
              <BulletList items={report.whatYouShouldAvoid} accent="#ef4444" />
            </Callout>
          </Section>
        </>
      )
    case 'Sources':
      return (
        <Section title="Source Assessment" accent={accent}>
          <SourceList sources={report.sourceAssessment || report.sources || []} />
        </Section>
      )
    case 'Travel Advice':
      return (
        <Section title="Travel Advice Level" accent={accent}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '8px' }}>
            {getRiskLabelForMode('traveler').toUpperCase()}
          </div>
          <RiskBadge level={report.travelAdviceLevel} mode="traveler" size="lg" />
        </Section>
      )
    case 'Movement':
      return (
        <Section title="Movement Advice" accent={accent}>
          <Paragraph>{report.movementAdvice}</Paragraph>
        </Section>
      )
    case 'Emergency':
      return (
        <Section title="Emergency Awareness" accent={accent}>
          <Paragraph>{report.emergencyAwareness}</Paragraph>
        </Section>
      )
    default:
      return null
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TabbedReport({ report, mode, accent }) {
  const tabs = TABS_BY_MODE[mode] || TABS_BY_MODE.security
  const [activeTab, setActiveTab] = useState(tabs[0])

  const activeAccent = accent || 'var(--accent)'

  const panels =
    mode === 'investment' ? <InvestmentPanels report={report} activeTab={activeTab} accent={activeAccent} /> :
    mode === 'traveler'   ? <TravelerPanels   report={report} activeTab={activeTab} accent={activeAccent} /> :
    <SecurityPanels report={report} activeTab={activeTab} accent={activeAccent} />

  return (
    <div>
      {/* Tab bar */}
      <div className="tab-bar" style={{
        display: 'flex',
        gap: '2px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '18px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {tabs.map(tab => {
          const isActive = tab === activeTab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '9px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? `2px solid ${activeAccent}` : '2px solid transparent',
                color: isActive ? activeAccent : 'var(--muted)',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginBottom: '-1px',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {tab.toUpperCase()}
            </button>
          )
        })}
      </div>

      {/* Active panel */}
      <div className="fade-in">
        {panels}
      </div>
    </div>
  )
}
