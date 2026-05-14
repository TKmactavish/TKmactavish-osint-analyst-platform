import React, { useRef, useEffect } from 'react'

const DEFAULT_PLACEHOLDER = 'Example: protest near Bangkok, shooting in Pattaya, scam compound near border, is Phnom Penh safe'

export default function SearchBar({ value, onChange, onSubmit, loading, placeholder }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !loading) onSubmit()
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted)',
            fontSize: '16px',
            pointerEvents: 'none',
          }}>⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder={placeholder || DEFAULT_PLACEHOLDER}
            style={{
              width: '100%',
              height: '48px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              color: 'var(--text)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              padding: '0 14px 0 40px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          style={{
            height: '48px',
            padding: '0 24px',
            background: loading ? 'var(--border)' : 'var(--primary)',
            color: '#0a0e1a',
            fontSize: '14px',
            fontWeight: 700,
            border: 'none',
            borderRadius: '7px',
            cursor: loading || !value.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !value.trim() ? 0.6 : 1,
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </div>
  )
}
