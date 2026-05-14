// Mode catalog — single source of truth for UI labels and styling

export const MODES = [
  {
    id: 'security',
    label: 'Security / Intelligence',
    subtitle: 'For crime, threat, conflict, investigation, suspicious activity, and escalation indicators.',
    reportTitle: 'Intelligence Report',
    riskLabel:   'Threat Level',
    iconPath: 'M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Zm0 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-3 5.4 3-1.3 3 1.3v.6c-1 .4-2 .6-3 .6s-2-.2-3-.6v-.6Z',
    accent: '#22d3ee',
  },
  {
    id: 'business',
    label: 'Business / Risk',
    subtitle: 'For business impact, operations, reputation, investment, supply chain, and continuity.',
    reportTitle: 'Business Risk Brief',
    riskLabel:   'Business Risk Level',
    iconPath: 'M4 7h16v12H4V7Zm5-3h6v3H9V4Zm0 5h6v2H9V9Z',
    accent: '#d4a843',
  },
  {
    id: 'traveler',
    label: 'Traveler / Public Safety',
    subtitle: 'For area safety, travel advice, local warning, route awareness, and go/no-go decisions.',
    reportTitle: 'Travel Safety Advisory',
    riskLabel:   'Travel Advice',
    iconPath: 'M12 2C7.5 2 4 5.5 4 10c0 6 8 12 8 12s8-6 8-12c0-4.5-3.5-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z',
    accent: '#10b981',
  },
]

export function modeById(id) {
  return MODES.find(m => m.id === id) || null
}
