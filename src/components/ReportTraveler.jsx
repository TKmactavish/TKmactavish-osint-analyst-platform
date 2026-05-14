import React from 'react'
import { Section, BulletList, Paragraph, Callout } from './Section.jsx'
import SourceList from './SourceList.jsx'
import RiskBadge, { getRiskLabelForMode } from './RiskBadge.jsx'

export default function ReportTraveler({ report }) {
  return (
    <>
      <Section title="1. Safety Summary" accent="#10b981">
        <Paragraph>{report.safetySummary}</Paragraph>
      </Section>

      <Section title="2. Is It Safe?" accent="#10b981">
        <Paragraph>{report.isItSafe}</Paragraph>
      </Section>

      <Section title="3. Travel Advice Level" accent="#10b981">
        <div style={{
          fontSize: '10px',
          color: 'var(--muted)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}>{getRiskLabelForMode('traveler').toUpperCase()}</div>
        <RiskBadge level={report.travelAdviceLevel} mode="traveler" size="lg" />
      </Section>

      <Section title="4. Areas to Avoid" accent="#ef4444">
        <BulletList items={report.areasToAvoid} accent="#ef4444" />
      </Section>

      <Section title="5. Main Safety Concerns" accent="#f59e0b">
        <BulletList items={report.mainSafetyConcerns} accent="#f59e0b" />
      </Section>

      <Section title="6. What You Should Do" accent="#10b981">
        <Callout color="#10b981" label="DO">
          <BulletList items={report.whatYouShouldDo} accent="#10b981" />
        </Callout>
      </Section>

      <Section title="7. What You Should Avoid" accent="#ef4444">
        <Callout color="#ef4444" label="AVOID">
          <BulletList items={report.whatYouShouldAvoid} accent="#ef4444" />
        </Callout>
      </Section>

      <Section title="8. Movement Advice" accent="#10b981">
        <Paragraph>{report.movementAdvice}</Paragraph>
      </Section>

      <Section title="9. Emergency Awareness" accent="#f59e0b">
        <Paragraph>{report.emergencyAwareness}</Paragraph>
      </Section>

      <Section title="10. Final Recommendation" accent="#10b981">
        <Callout color="#10b981" label="BOTTOM LINE">
          <Paragraph>{report.finalRecommendation}</Paragraph>
        </Callout>
      </Section>

      <Section title="11. Sources" accent="#10b981">
        <SourceList sources={report.sourceAssessment} />
      </Section>
    </>
  )
}
