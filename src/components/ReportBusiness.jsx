import React from 'react'
import { Section, BulletList, Paragraph, Callout } from './Section.jsx'
import SourceList from './SourceList.jsx'
import RiskBadge, { getRiskLabelForMode } from './RiskBadge.jsx'

export default function ReportBusiness({ report }) {
  return (
    <>
      <Section title="1. Executive Summary" accent="#d4a843">
        <Paragraph>{report.executiveSummary}</Paragraph>
      </Section>

      <Section title="2. Key Business Judgments" accent="#d4a843">
        <BulletList items={report.keyBusinessJudgments} accent="#d4a843" />
      </Section>

      <Section title="3. Situation Overview" accent="#d4a843">
        <Paragraph>{report.situationOverview}</Paragraph>
      </Section>

      <Section title="4. Business Impact" accent="#d4a843">
        <Paragraph>{report.businessImpact}</Paragraph>
      </Section>

      <Section title="5. Operational Risk" accent="#d4a843">
        <Paragraph>{report.operationalRisk}</Paragraph>
      </Section>

      <Section title="6. Employee and Customer Exposure" accent="#d4a843">
        <Paragraph>{report.employeeCustomerExposure}</Paragraph>
      </Section>

      <Section title="7. Reputation Risk" accent="#d4a843">
        <Paragraph>{report.reputationRisk}</Paragraph>
      </Section>

      <Section title="8. Financial or Market Exposure" accent="#d4a843">
        <Paragraph>{report.financialMarketExposure}</Paragraph>
      </Section>

      <Section title="9. Business Continuity Concern" accent="#d4a843">
        <Paragraph>{report.businessContinuity}</Paragraph>
      </Section>

      <Section title="10. Business Risk Level" accent="#d4a843">
        <div style={{
          fontSize: '10px',
          color: 'var(--muted)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}>{getRiskLabelForMode('business').toUpperCase()}</div>
        <RiskBadge level={report.businessRiskLevel} mode="business" size="lg" />
      </Section>

      <Section title="11. Recommended Business Action" accent="#d4a843">
        <Callout color="#d4a843" label="MANAGEMENT ACTIONS">
          <Paragraph>{report.recommendedBusinessAction}</Paragraph>
        </Callout>
      </Section>

      <Section title="12. Decision Guidance" accent="#d4a843">
        <Callout color="#d4a843" label="GO / HOLD / SCALE-BACK / PAUSE">
          <Paragraph>{report.decisionGuidance}</Paragraph>
        </Callout>
      </Section>

      <Section title="13. Monitoring Triggers" accent="#f59e0b">
        <Callout color="#f59e0b" label="REASSESS IF…">
          <BulletList items={report.monitoringTriggers} accent="#f59e0b" />
        </Callout>
      </Section>

      <Section title="14. Confidence" accent="#d4a843">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <RiskBadge level={report.confidenceLevel} mode="security" size="lg" />
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{report.confidenceJustification}</span>
        </div>
      </Section>

      <Section title="15. Sources" accent="#d4a843">
        <SourceList sources={report.sourceAssessment} />
      </Section>
    </>
  )
}
