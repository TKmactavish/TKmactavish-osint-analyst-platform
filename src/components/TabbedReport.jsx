import React, { useState } from 'react'
import { Section, BulletList, Paragraph, Callout } from './Section.jsx'
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
  business: [
    'Overview',
    'Key Judgments',
    'Situation',
    'Sources',
    'Business Risk',
    'Business Assessment',
    'Decision Guidance',
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
          <BulletList items={report.timeline} accent={accent} />
        </Section>
      )
    case 'Sources':
      return (
        <Section title="Source Assessment" accent={accent}>
          <SourceList sources={report.sourceAssessment} />
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
            <BulletList items={report.recommendedCollection} accent={accent} />
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
            <BulletList items={report.recommendedAction} accent={accent} />
          </Callout>
        </Section>
      )
    default:
      return null
  }
}

function BusinessPanels({ report, activeTab, accent }) {
  switch (activeTab) {
    case 'Overview':
      return (
        <>
          <Section title="Executive Summary" accent={accent}>
            <Paragraph>{report.executiveSummary}</Paragraph>
          </Section>
          <Section title="Situation Overview" accent={accent}>
            <Paragraph>{report.situationOverview}</Paragraph>
          </Section>
        </>
      )
    case 'Key Judgments':
      return (
        <Section title="Key Business Judgments" accent={accent}>
          <BulletList items={report.keyBusinessJudgments} accent={accent} />
        </Section>
      )
    case 'Situation':
      return (
        <>
          <Section title="Business Impact" accent={accent}>
            <Paragraph>{report.businessImpact}</Paragraph>
          </Section>
          <Section title="Operational Risk" accent={accent}>
            <Paragraph>{report.operationalRisk}</Paragraph>
          </Section>
          <Section title="Employee / Customer Exposure" accent={accent}>
            <Paragraph>{report.employeeCustomerExposure}</Paragraph>
          </Section>
          <Section title="Reputation Risk" accent={accent}>
            <Paragraph>{report.reputationRisk}</Paragraph>
          </Section>
          <Section title="Financial / Market Exposure" accent={accent}>
            <Paragraph>{report.financialMarketExposure}</Paragraph>
          </Section>
        </>
      )
    case 'Sources':
      return (
        <Section title="Source Assessment" accent={accent}>
          <SourceList sources={report.sourceAssessment} />
        </Section>
      )
    case 'Business Risk':
      return (
        <>
          <Section title="Business Risk Level" accent={accent}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '8px' }}>
              {getRiskLabelForMode('business').toUpperCase()}
            </div>
            <RiskBadge level={report.businessRiskLevel} mode="business" size="lg" />
          </Section>
          <Section title="Business Continuity" accent={accent}>
            <Paragraph>{report.businessContinuity}</Paragraph>
          </Section>
        </>
      )
    case 'Business Assessment':
      return (
        <>
          <Section title="Recommended Business Action" accent={accent}>
            <Callout color={accent} label="ACTION">
              <BulletList items={report.recommendedBusinessAction} accent={accent} />
            </Callout>
          </Section>
          <Section title="Monitoring Triggers" accent={accent}>
            <BulletList items={report.monitoringTriggers} accent={accent} />
          </Section>
          <Section title="Confidence Level" accent={accent}>
            <Callout color={accent} label={report.confidenceLevel}>
              <Paragraph>{report.confidenceJustification}</Paragraph>
            </Callout>
          </Section>
        </>
      )
    case 'Decision Guidance':
      return (
        <Section title="Decision Guidance" accent={accent}>
          <Callout color={accent} label="GUIDANCE">
            <BulletList items={report.decisionGuidance} accent={accent} />
          </Callout>
        </Section>
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
          <SourceList sources={report.sourceAssessment} />
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
    mode === 'business' ? <BusinessPanels report={report} activeTab={activeTab} accent={activeAccent} /> :
    mode === 'traveler' ? <TravelerPanels report={report} activeTab={activeTab} accent={activeAccent} /> :
    <SecurityPanels report={report} activeTab={activeTab} accent={activeAccent} />

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: '2px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '18px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
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
