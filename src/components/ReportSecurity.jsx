import React from 'react'
import { Section, BulletList, Paragraph, Callout } from './Section.jsx'
import SourceList from './SourceList.jsx'
import Timeline from './Timeline.jsx'
import RiskBadge, { getRiskLabelForMode } from './RiskBadge.jsx'

export default function ReportSecurity({ report }) {
  return (
    <>
      <Section title="1. Intelligence Summary" accent="#22d3ee">
        <Paragraph>{report.intelligenceSummary}</Paragraph>
      </Section>

      <Section title="2. Key Judgments" accent="#22d3ee">
        <BulletList items={report.keyJudgments} accent="#22d3ee" />
      </Section>

      <Section title="3. Incident Overview" accent="#22d3ee">
        <Paragraph>{report.incidentOverview}</Paragraph>
      </Section>

      <Section title="4. Timeline" accent="#22d3ee">
        <Timeline events={report.timeline} />
      </Section>

      <Section title="5. Location and Area Context" accent="#22d3ee">
        <Paragraph>{report.locationContext}</Paragraph>
      </Section>

      <Section title="6. Actors / Persons / Groups Involved" accent="#22d3ee">
        {(report.actors && report.actors.length) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.actors.map((a, i) => (
              <div key={i} style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--surface)',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                  {a.name || 'Unknown'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {[a.type, a.role, a.status].filter(Boolean).join(' · ').toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        ) : <Paragraph>Not identified.</Paragraph>}
      </Section>

      <Section title="7. Modus Operandi" accent="#22d3ee">
        <Paragraph>{report.modusOperandi}</Paragraph>
      </Section>

      <Section title="8. Indicators and Patterns" accent="#22d3ee">
        <BulletList items={report.indicatorsAndPatterns} accent="#22d3ee" />
      </Section>

      <Section title="9. Threat Assessment" accent="#22d3ee">
        <Paragraph>{report.threatAssessment}</Paragraph>
        <div style={{ marginTop: '12px' }}>
          <div style={{
            fontSize: '10px',
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            marginBottom: '6px',
          }}>{getRiskLabelForMode('security').toUpperCase()}</div>
          <RiskBadge level={report.threatLevel} mode="security" size="lg" />
        </div>
      </Section>

      <Section title="10. Intelligence Gaps" accent="#f59e0b">
        <Callout color="#f59e0b" label="WHAT WE DO NOT YET KNOW">
          {(report.intelligenceGaps && report.intelligenceGaps.length)
            ? <BulletList items={report.intelligenceGaps} accent="#f59e0b" />
            : 'No critical gaps identified.'}
        </Callout>
      </Section>

      <Section title="11. Recommended Collection" accent="#22d3ee">
        <Callout color="#22d3ee" label="COLLECTION PRIORITIES">
          <Paragraph>{report.recommendedCollection}</Paragraph>
        </Callout>
      </Section>

      <Section title="12. Recommended Action" accent="#22d3ee">
        <Callout color="#22d3ee" label="OPERATIONAL AWARENESS">
          <Paragraph>{report.recommendedAction}</Paragraph>
        </Callout>
      </Section>

      <Section title="13. Confidence Level" accent="#22d3ee">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <RiskBadge level={report.confidenceLevel} mode="security" size="lg" />
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{report.confidenceJustification}</span>
        </div>
      </Section>

      <Section title="14. Sources" accent="#22d3ee">
        <SourceList sources={report.sourceAssessment} />
      </Section>
    </>
  )
}
