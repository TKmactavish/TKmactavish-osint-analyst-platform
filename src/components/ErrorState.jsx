import React from 'react'

export default function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      background: 'rgba(218,54,51,0.08)',
      border: '1px solid rgba(218,54,51,0.3)',
      borderRadius: '8px',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>⚠</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#f85149' }}>
          Analysis Failed
        </span>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
        {message || 'An unexpected error occurred. Please try again.'}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 18px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  )
}
