// Recommendation section formatting helpers

export const RECOMMENDATION_SECTIONS = [
  { key: 'whatToWatch',        label: 'What to Watch',          icon: '👁', color: '#1f6feb' },
  { key: 'whatToAvoid',        label: 'What to Avoid',          icon: '🚫', color: '#da3633' },
  { key: 'recommendedAction',  label: 'Recommended Action',     icon: '✅', color: '#238636' },
  { key: 'travelSafetyAdvice', label: 'Travel Safety Advice',   icon: '✈', color: '#d29922' },
  { key: 'monitoringPriority', label: 'Monitoring Priority',    icon: '📡', color: '#2ea4a1' },
  { key: 'nextSteps',          label: 'Next Steps',             icon: '▶', color: '#8957e5' },
];

export function formatRecommendations(rec) {
  if (!rec) return [];
  return RECOMMENDATION_SECTIONS
    .map(section => ({
      ...section,
      content: rec[section.key] || null,
    }))
    .filter(s => s.content);
}
