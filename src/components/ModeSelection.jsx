import React from 'react'
import { MODES } from '../modules/modes.js'

const STORIES = [
  {
    mode: 'traveler',
    accent: '#10b981',
    quote: 'She scanned a QR code at Jakarta airport. It was a scam link.',
    context: 'A traveler landed without knowing a fake visa-on-arrival registration had been circulating at the terminal for weeks. Athena would have told her before she boarded.',
  },
  {
    mode: 'traveler',
    accent: '#10b981',
    quote: 'He ate street food in Jakarta. Three days of illness followed.',
    context: 'No travel advisory mentions which districts locals avoid. Athena searches what people actually say — not what governments publish.',
  },
  {
    mode: 'business',
    accent: '#d4a843',
    quote: 'I wanted to research a US stock. I reprompted ChatGPT twelve times.',
    context: 'General AI gives general answers. Athena returns a structured business risk brief — judgments, red flags, confidence level — from live sources. No prompting required.',
  },
]

const S = {
  wrap: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '20px 20px 80px',
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroWrap: {
    textAlign: 'center',
    padding: '48px 20px 52px',
    marginBottom: '8px',
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#22d3ee',
    fontFamily: 'var(--font-mono)',
    marginBottom: '20px',
  },
  headline: {
    fontSize: 'clamp(28px, 5vw, 46px)',
    fontWeight: 900,
    color: 'var(--text)',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    marginBottom: '20px',
    maxWidth: '720px',
    margin: '0 auto 20px',
  },
  sub: {
    fontSize: '16px',
    color: 'var(--muted)',
    maxWidth: '560px',
    margin: '0 auto 36px',
    lineHeight: 1.7,
  },

  // ── Stat row ──────────────────────────────────────────────────────────────
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    flexWrap: 'wrap',
    marginBottom: '52px',
  },
  stat: {
    textAlign: 'center',
  },
  statNum: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginTop: '2px',
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    fontFamily: 'var(--font-mono)',
    marginBottom: '24px',
  },

  // ── Story cards ───────────────────────────────────────────────────────────
  storyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '14px',
    marginBottom: '52px',
  },
  storyCard: (accent) => ({
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderLeft: `3px solid ${accent}`,
    borderRadius: '8px',
    padding: '20px 20px 18px',
    textAlign: 'left',
  }),
  storyQuote: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1.5,
    marginBottom: '10px',
    fontStyle: 'italic',
  },
  storyContext: {
    fontSize: '12px',
    color: 'var(--muted)',
    lineHeight: 1.65,
  },

  // ── Why not ChatGPT ───────────────────────────────────────────────────────
  whyWrap: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '28px 32px',
    marginBottom: '52px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
  },
  whyItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  whyLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#22d3ee',
    fontFamily: 'var(--font-mono)',
  },
  whyTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text)',
  },
  whyDesc: {
    fontSize: '13px',
    color: 'var(--muted)',
    lineHeight: 1.6,
  },

  // ── Mode cards ────────────────────────────────────────────────────────────
  modeLabel: {
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    fontFamily: 'var(--font-mono)',
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px',
  },
  card: (accent) => ({
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'left',
    width: '100%',
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    minHeight: '200px',
    borderTop: `3px solid ${accent}`,
  }),
  iconBox: (accent) => ({
    width: '52px',
    height: '52px',
    background: `${accent}1f`,
    border: `1px solid ${accent}55`,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }),
  cardTitle: { fontSize: '17px', fontWeight: 700, color: 'var(--text)' },
  cardSub: { fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 },
  cta: (accent) => ({
    fontSize: '12px',
    color: accent,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginTop: 'auto',
  }),
}

function ModeIcon({ src, label }) {
  return (
    <img
      src={src}
      alt={label}
      width={36}
      height={36}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}

export default function ModeSelection({ onSelect }) {
  return (
    <div style={S.wrap}>

      {/* ── Hero ── */}
      <div style={S.heroWrap}>
        <span style={S.eyebrow}>Open-Source Intelligence Platform</span>
        <h1 style={S.headline}>
          By the time you Google it,<br />it's too late.
        </h1>
        <p style={S.sub}>
          Athena searches live open sources, cross-references findings, and returns
          a structured intelligence brief — in seconds, not hours. No prompting. No analyst required.
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={S.statsRow}>
        {[
          { num: '< 30s',  label: 'Analysis time' },
          { num: '3',      label: 'Intelligence modes' },
          { num: 'Live',   label: 'Web sources' },
          { num: 'Free',   label: 'No subscription' },
        ].map(s => (
          <div key={s.label} style={S.stat}>
            <div style={S.statNum}>{s.num}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Real stories ── */}
      <div style={S.divider}>Real situations. Real gaps. Athena fills them.</div>
      <div style={S.storyGrid}>
        {STORIES.map((s, i) => (
          <div key={i} style={S.storyCard(s.accent)}>
            <div style={S.storyQuote}>"{s.quote}"</div>
            <div style={S.storyContext}>{s.context}</div>
          </div>
        ))}
      </div>

      {/* ── Why not ChatGPT ── */}
      <div style={S.whyWrap}>
        <div style={S.whyItem}>
          <div style={S.whyLabel}>vs ChatGPT / Claude</div>
          <div style={S.whyTitle}>No prompting required</div>
          <div style={S.whyDesc}>
            General AI makes you know what to ask. Athena already knows — it searches, cross-references, and structures the answer for your situation.
          </div>
        </div>
        <div style={S.whyItem}>
          <div style={S.whyLabel}>vs Google</div>
          <div style={S.whyTitle}>A verdict, not a list of links</div>
          <div style={S.whyDesc}>
            Google returns 10 pages. Athena returns one decision-ready brief with a risk level, key judgments, and recommended action.
          </div>
        </div>
        <div style={S.whyItem}>
          <div style={S.whyLabel}>vs Janes / Crisis24</div>
          <div style={S.whyTitle}>Built for everyone</div>
          <div style={S.whyDesc}>
            Enterprise intel platforms cost tens of thousands per year. Athena gives analyst-grade output to anyone who needs it, right now.
          </div>
        </div>
      </div>

      {/* ── Mode selector ── */}
      <div style={S.modeLabel}>Choose your intelligence mission</div>
      <div style={S.grid}>
        {MODES.map(m => (
          <button
            key={m.id}
            style={S.card(m.accent)}
            onClick={() => onSelect(m.id)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = m.accent
              e.currentTarget.style.boxShadow = `0 8px 24px -8px ${m.accent}44`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={S.iconBox(m.accent)}>
              <ModeIcon src={m.iconSrc} label={m.label} />
            </div>
            <div style={S.cardTitle}>{m.label}</div>
            <div style={S.cardSub}>{m.subtitle}</div>
            <div style={S.cta(m.accent)}>Select →</div>
          </button>
        ))}
      </div>

    </div>
  )
}
