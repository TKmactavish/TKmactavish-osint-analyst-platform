import React from 'react'
import { MODES } from '../modules/modes.js'

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

const STORIES = [
  {
    accent: '#22d3ee',
    who: 'Corporate security manager',
    asked: 'There\'s a protest forming near our Bangkok office. Should I evacuate the team?',
    gap: 'News reports were vague. Athena found local police announcements, crowd estimates, and route closures — in under 30 seconds.',
  },
  {
    accent: '#10b981',
    who: 'Traveler flying into Jakarta',
    asked: 'Is the visa-on-arrival process safe? I keep seeing QR codes at the airport.',
    gap: 'A fake registration scam had been circulating for weeks. No one told her.',
  },
  {
    accent: '#d4a843',
    who: 'Individual investor',
    asked: 'Is this company a good investment right now?',
    gap: 'He reprompted ChatGPT 12 times and still didn\'t get a clear answer.',
  },
]

const STEPS = [
  {
    num: '01',
    symbol: '?_',
    title: 'You ask',
    desc: 'Type any safety, security, or business question in plain language. No special syntax or training needed.',
  },
  {
    num: '02',
    symbol: '◎',
    title: 'Athena scans',
    desc: 'Live sources, local-language reporting, and official advisories — searched, read, and cross-referenced in seconds.',
  },
  {
    num: '03',
    symbol: '≡',
    title: 'You get a brief',
    desc: 'A structured, role-specific intelligence report. Verdict first. Evidence and sources behind it.',
  },
]

function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '52px 0 36px' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      <span style={{
        fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
      }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

export default function ModeSelection({ onSelect }) {
  return (
    <div className="landing-wrap" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 0 80px' }}>

      {/* ── Hero banner ── */}
      <div className="landing-hero" style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '32px',
        minHeight: '280px',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/background-image.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }} />
        {/* Heavy dark overlay left → fades right, completely hides image text on left */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(10,14,26,0.97) 0%, rgba(10,14,26,0.97) 38%, rgba(10,14,26,0.55) 62%, rgba(10,14,26,0.15) 100%)',
        }} />
        {/* Text pinned to left */}
        <div style={{ position: 'relative', textAlign: 'left', padding: '48px 48px', maxWidth: '520px' }}>
          <h1 style={{
            fontSize: 'clamp(24px, 3.8vw, 42px)', fontWeight: 900, color: '#fff',
            letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '14px',
          }}>
            Professional intelligence.<br />
            <span style={{ color: '#22d3ee' }}>Zero training required.</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: '380px' }}>
            Ask a question. Get a structured verdict — not a list of links.
          </p>
        </div>
      </div>

      {/* ── Content wrapper with padding ── */}
      <div style={{ padding: '0 20px' }}>

      {/* ── Mode selector — immediate CTA ── */}
      <p style={{
        fontSize: 'clamp(15px, 2.5vw, 18px)', fontWeight: 700, color: 'var(--text)',
        textAlign: 'center', letterSpacing: '-0.01em', marginBottom: '4px',
      }}>
        What do you need to know <span style={{ color: '#22d3ee' }}>right now?</span>
      </p>
      <p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', marginBottom: '16px' }}>
        Choose your role — Athena adjusts the analysis to match.
      </p>

      <div className="mode-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {MODES.map(m => {
          const h = MODE_HUMAN[m.id]
          return (
            <button
              key={m.id}
              className="mode-card"
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
                background: 'var(--card)', border: '1px solid var(--border)',
                borderTop: `3px solid ${m.accent}`, borderRadius: '10px',
                padding: '22px 20px', cursor: 'pointer', textAlign: 'left',
                transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
                display: 'flex', flexDirection: 'column', gap: '12px',
                fontFamily: 'var(--font-sans)', width: '100%',
              }}
            >
              <div style={{
                width: '48px', height: '48px', background: `${m.accent}18`,
                border: `1px solid ${m.accent}44`, borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                <img src={m.iconSrc} alt={m.label} width={32} height={32} style={{ objectFit: 'contain' }} />
              </div>
              <div className="mode-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: m.accent, fontFamily: 'var(--font-mono)' }}>
                  {h.label}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>
                  {h.question}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {h.examples.map((ex, i) => (
                    <div key={i} style={{ fontSize: '12px', color: 'var(--muted)', paddingLeft: '10px', borderLeft: `2px solid ${m.accent}55`, lineHeight: 1.5 }}>
                      {ex}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: m.accent, letterSpacing: '0.04em', marginTop: '4px' }}>
                  Ask Athena →
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── How it works ── */}
      <Divider label="How it works" />
      <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {STEPS.map((s) => (
          <div key={s.num} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: '#22d3ee', flexShrink: 0,
              }}>{s.symbol}</div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#22d3ee', fontWeight: 700, letterSpacing: '0.1em' }}>STEP {s.num}</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{s.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Who uses Athena ── */}
      <Divider label="Who uses Athena" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {STORIES.map((s, i) => (
          <div key={i} className="story-card" style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderLeft: `3px solid ${s.accent}`, borderRadius: '8px', padding: '16px 18px',
          }}>
            <div className="story-card-who" style={{ fontSize: '11px', color: s.accent, fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>{s.who}</div>
            <div className="story-card-asked" style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 600, marginBottom: '6px', lineHeight: 1.5 }}>"{s.asked}"</div>
            <div className="story-card-gap" style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{s.gap}</div>
          </div>
        ))}
      </div>

      {/* ── Why not just use... ── */}
      <Divider label="Why not just use..." />
      <div className="comparison-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden',
      }}>
        {[
          { tool: 'Google', text: 'Returns links. You still have to read everything and decide yourself.' },
          { tool: 'ChatGPT', text: 'Needs the right prompt. Knowledge cutoff. No live web search.' },
          { tool: 'Athena', text: 'Searches now. Reads for you. Returns a structured verdict.', highlight: true },
        ].map((c, i) => (
          <div key={i} style={{
            background: c.highlight ? 'rgba(34,211,238,0.06)' : 'var(--card)',
            padding: '18px 20px', borderTop: c.highlight ? '2px solid #22d3ee' : '2px solid transparent',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: c.highlight ? '#22d3ee' : 'var(--muted)', marginBottom: '6px' }}>{c.tool}</div>
            <div style={{ fontSize: '13px', color: c.highlight ? 'var(--text)' : 'var(--muted)', lineHeight: 1.6 }}>{c.text}</div>
          </div>
        ))}
      </div>

      {/* ── What Athena is not ── */}
      <Divider label="What Athena is not" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {[
          { label: 'Not a replacement for official advice', desc: 'Always follow local authority instructions. Athena supports your judgment — it does not replace it.' },
          { label: 'Not a real-time alert system', desc: 'Athena analyzes on demand. It does not push live notifications or monitor situations continuously.' },
          { label: 'Not a private data collector', desc: 'Athena uses only publicly available open sources. It does not access private records or personal data.' },
          { label: 'Not a guarantee', desc: 'Intelligence is probabilistic. Athena gives you the best available picture — not a promise about what will happen.' },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: '3px solid #ef4444', borderRadius: '8px', padding: '14px 16px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{item.label}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Footer note ── */}
      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)', marginTop: '40px', lineHeight: 1.6 }}>
        Free to use · No account required · Powered by live web sources
      </p>

      </div> {/* end content wrapper */}
    </div>
  )
}
