// Parse and validate the structured report from the API

const REQUIRED_FIELDS = [
  'query', 'type', 'executiveSummary', 'keyFacts',
  'timeline', 'sourceAssessment', 'riskIndicators',
  'impactAssessment', 'intelligenceAssessment',
  'confidenceLevel', 'informationGaps', 'recommendations',
];

export function parseReport(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid report: expected an object');
  }

  const missing = REQUIRED_FIELDS.filter(f => !(f in raw));
  if (missing.length > 0) {
    console.warn('Report missing fields:', missing);
  }

  return {
    query:                  raw.query                  || '',
    type:                   raw.type                   || 'unknown',
    executiveSummary:       raw.executiveSummary        || '',
    keyFacts:               Array.isArray(raw.keyFacts) ? raw.keyFacts : [],
    timeline:               Array.isArray(raw.timeline) ? raw.timeline : [],
    sourceAssessment:       Array.isArray(raw.sourceAssessment) ? raw.sourceAssessment : [],
    riskIndicators:         Array.isArray(raw.riskIndicators) ? raw.riskIndicators : [],
    impactAssessment:       raw.impactAssessment        || {},
    intelligenceAssessment: raw.intelligenceAssessment  || '',
    confidenceLevel:        raw.confidenceLevel         || 'LOW',
    confidenceJustification: raw.confidenceJustification || '',
    informationGaps:        Array.isArray(raw.informationGaps) ? raw.informationGaps : [],
    recommendations:        raw.recommendations         || {},
    // Legacy field support from old schema
    risk:                   raw.risk                    || null,
    summary:                raw.summary                 || raw.executiveSummary || '',
    sources:                raw.sources                 || raw.sourceAssessment || [],
    flags:                  raw.flags                   || [],
    risk_assessment:        raw.risk_assessment         || null,
    analytical_perspective: raw.analytical_perspective  || raw.intelligenceAssessment || '',
  };
}

export function getOverallRisk(report) {
  if (report.risk) return report.risk;
  if (report.risk_assessment?.level) return report.risk_assessment.level;
  const level = report.confidenceLevel;
  return ['HIGH', 'MEDIUM', 'LOW'].includes(level) ? 'MEDIUM' : 'MEDIUM';
}
