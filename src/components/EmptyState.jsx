import React from 'react'

export default function EmptyState({ message }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      gap: '12px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '32px', opacity: 0.4 }}>◎</div>
      <div style={{ fontSize: '16px', color: 'var(--text)', fontWeight: 500 }}>
        {message || 'No reliable open-source information found for this query.'}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '420px', lineHeight: 1.6 }}>
        Try refining your query with more specific terms, names, locations, or dates.
      </div>
    </div>
  )
}
