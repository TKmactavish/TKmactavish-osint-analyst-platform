import React, { useState } from 'react'
import { generatePDF } from '../modules/pdf.js'

export default function DownloadButton({ report }) {
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    if (generating) return
    setGenerating(true)
    try {
      await generatePDF(report)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF generation failed: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 22px',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '7px',
        color: generating ? 'var(--muted)' : 'var(--text)',
        fontSize: '13px',
        fontWeight: 500,
        cursor: generating ? 'wait' : 'pointer',
        transition: 'border-color 0.2s, color 0.2s',
      }}
      onMouseEnter={e => {
        if (!generating) e.currentTarget.style.borderColor = 'var(--accent)'
      }}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <span style={{ fontSize: '15px' }}>{generating ? '⌛' : '⬇'}</span>
      {generating ? 'Generating PDF...' : 'Download PDF Report'}
    </button>
  )
}
