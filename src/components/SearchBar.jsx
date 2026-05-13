import React, { useRef, useEffect } from 'react'

export default function SearchBar({ value, onChange, onSubmit, loading }) {
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
          }}>
            ⌕
          </span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder="Enter a person, incident, location, organization, or event..."
            style={{
              width: '100%',
              height: '48px',
              background: '#0d1117',
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
            background: loading ? 'var(--border)' : 'var(--accent)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderRadius: '7px',
            cursor: loading || !value.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !value.trim() ? 0.6 : 1,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.2s, background 0.2s',
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      <div style={{
        marginTop: '10px',
        fontSize: '12px',
        color: 'var(--muted)',
        fontFamily: 'var(--font-mono)',
      }}>
        Examples: "Yala insurgency 2024" · "Wagner Group Mali" · "Hamas Gaza October 7" · "Sinaloa cartel routes"
      </div>
    </div>
  )
}
