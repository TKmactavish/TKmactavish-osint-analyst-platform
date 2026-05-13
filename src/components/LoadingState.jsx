import React from 'react'

export default function LoadingState({ step, steps }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      gap: '24px',
    }}>
      {/* Spinner */}
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--teal)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />

      {/* Current step */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '15px',
          color: 'var(--text)',
          marginBottom: '8px',
          fontWeight: 500,
        }}>
          {steps[step] || 'Processing...'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
          This may take 15–30 seconds
        </div>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i <= step ? 'var(--teal)' : 'var(--border)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
