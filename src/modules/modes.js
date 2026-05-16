// Mode catalog — single source of truth for UI labels and styling

export const MODES = [
  {
    id: 'security',
    label: 'Security / Intelligence',
    subtitle: 'For crime, threat, conflict, investigation, suspicious activity, and escalation indicators.',
    reportTitle: 'Intelligence Report',
    riskLabel:   'Threat Level',
    iconSrc: '/icons/security.png',
    accent: '#22d3ee',
  },
  {
    id: 'investment',
    label: 'Investment Intelligence',
    subtitle: 'For early catalyst detection, insider activity, government contracts, and OSINT-driven stock signals.',
    reportTitle: 'Investment Intelligence Report',
    riskLabel:   'Catalyst Rating',
    iconSrc: '/icons/business.png',
    accent: '#d4a843',
  },
  {
    id: 'traveler',
    label: 'Traveler / Public Safety',
    subtitle: 'For area safety, travel advice, local warning, route awareness, and go/no-go decisions.',
    reportTitle: 'Travel Safety Advisory',
    riskLabel:   'Travel Advice',
    iconSrc: '/icons/traveler.png',
    accent: '#10b981',
  },
]

export function modeById(id) {
  return MODES.find(m => m.id === id) || null
}
