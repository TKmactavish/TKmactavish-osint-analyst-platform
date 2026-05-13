import React from 'react'

export default function ReportCard({ label, children, style }) {
  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px 22px',
        ...style,
      }}
    >
      {label && (
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: '14px',
          fontFamily: 'var(--font-mono)',
        }}>
          {label}
        </div>
      )}
      {children}
    </div>
  )
}
