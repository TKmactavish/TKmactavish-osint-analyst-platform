import React from 'react'
import { MODES } from '../modules/modes.js'

// Human-language question per mode — what a real person asks themselves
const MODE_HUMAN = {
  security: {
    label: 'Security Analyst',
    question: 'Is this situation dangerous?',
    examples: ['What\'s happening near this area?', 'Who are the actors involved?', 'Should my team be concerned?'],
  },
  business: {
    label: 'Business Analyst',
    question: 'Can I trust this company?',
    examples: ['Is this stock worth the risk?', 'What are the red flags?', 'Should I proceed with this deal?'],
  },
  traveler: {
    label: 'Traveler',
    question: 'Is it safe to go there?',
    examples: ['What should I avoid?', 'Is the airport area safe?', 'What do locals actually say?'],
  },
}

export default function ModeSelection({ onSelect }) {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 80px' }}>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', padding: '40px 0 48px' }}>
        <h1 style={{
          fontSize: 'clamp(26px, 4.5vw, 42px)',
          fontWeight: 900,
          color: 'var(--text)',
          letterSpacing: '-0.025em',
          lineHeight: 1.15,
          marginBottom: '16px',
        }}>
          What do you need to know<br />
          <span style={{ color: '#22d3ee' }}>right now?</span>
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--muted)',
          lineHeight: 1.75,
          maxWidth: '480px',
          margin: '0 auto',
        }}>
          Just ask. Athena searches live sources and gives you
          a clear answer — not a list of links, not a wall of text.
        </p>
      </div>

      {/* ── 3 real scenarios ── */}
      <div style={{ marginBottom: '48px' }}>
        <p style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          Real questions people asked — and didn't have a good answer for
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            {
              accent: '#10b981',
              who: 'Traveler flying into Jakarta',
              asked: 'Is the visa-on-arrival process safe? I keep seeing QR codes at the airport.',
              gap: 'A fake registration scam had been circulating for weeks. No one told her.',
            },
            {
              accent: '#10b981',
              who: 'Tourist in Bangkok',
              asked: 'Which street food areas should I actually avoid?',
              gap: 'Government advisories don\'t say this. Locals know. Athena finds what locals say.',
            },
            {
              accent: '#22d3ee',
              who: 'Corporate security manager',
              asked: 'There\'s a protest forming near our Bangkok office. Should I evacuate the team?',
              gap: 'News reports were vague. Athena found local police announcements, crowd estimates, and route closures — in under 30 seconds.',
            },
            {
              accent: '#d4a843',
              who: 'Individual investor',
              asked: 'Is this company a good investment right now?',
              gap: 'He reprompted ChatGPT 12 times and still didn\'t get a clear answer.',
            },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '16px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${s.accent}`,
              borderRadius: '8px',
              padding: '16px 18px',
              alignItems: 'flex-start',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '11px',
                  color: s.accent,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}>{s.who}</div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text)',
                  fontWeight: 600,
                  marginBottom: '6px',
                  lineHeight: 1.5,
                }}>
                  "{s.asked}"
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  {s.gap}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Simple comparison ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1px',
        background: 'var(--border)',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '48px',
      }}>
        {[
          { tool: 'Google', problem: 'Returns links. You still have to read everything and decide yourself.' },
          { tool: 'ChatGPT', problem: 'Needs the right prompt. Knowledge cutoff. No live web search.' },
          { tool: 'Athena', problem: null, highlight: 'Searches now. Reads for you. Returns a verdict.' },
        ].map((c, i) => (
          <div key={i} style={{
            background: c.highlight ? 'rgba(34,211,238,0.06)' : 'var(--card)',
            padding: '18px 20px',
            borderTop: c.highlight ? '2px solid #22d3ee' : '2px solid transparent',
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: c.highlight ? '#22d3ee' : 'var(--muted)',
              marginBottom: '6px',
            }}>{c.tool}</div>
            <div style={{ fontSize: '13px', color: c.highlight ? 'var(--text)' : 'var(--muted)', lineHeight: 1.6 }}>
              {c.highlight || c.problem}
            </div>
          </div>
        ))}
      </div>

      {/* ── Mode selector ── */}
      <p style={{
        fontSize: '15px',
        fontWeight: 700,
        color: 'var(--text)',
        textAlign: 'center',
        marginBottom: '16px',
      }}>
        What kind of question do you have?
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px',
      }}>
        {MODES.map(m => {
          const h = MODE_HUMAN[m.id]
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.borderColor = m.accent
                e.currentTarget.style.boxShadow = `0 10px 28px -8px ${m.accent}40`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderTop: `3px solid ${m.accent}`,
                borderRadius: '10px',
                padding: '22px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                background: `${m.accent}18`,
                border: `1px solid ${m.accent}44`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <img src={m.iconSrc} alt={m.label} width={32} height={32} style={{ objectFit: 'contain' }} />
              </div>

              {/* Mode label */}
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: m.accent,
                fontFamily: 'var(--font-mono)',
              }}>
                {h.label}
              </div>

              {/* Human question */}
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.3, marginTop: '-4px' }}>
                {h.question}
              </div>

              {/* Example queries */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {h.examples.map((ex, i) => (
                  <div key={i} style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    paddingLeft: '10px',
                    borderLeft: `2px solid ${m.accent}55`,
                    lineHeight: 1.5,
                  }}>
                    {ex}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                marginTop: '4px',
                fontSize: '12px',
                fontWeight: 700,
                color: m.accent,
                letterSpacing: '0.04em',
              }}>
                Ask Athena →
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Footer note ── */}
      <p style={{
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--muted)',
        marginTop: '32px',
        lineHeight: 1.6,
      }}>
        Free to use · No account required · Powered by live web sources
      </p>

    </div>
  )
}
