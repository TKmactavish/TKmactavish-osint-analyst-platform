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
        background: generating ? 'var(--border)' : 'var(--primary)',
        border: `1px solid ${generating ? 'var(--border)' : 'var(--primary)'}`,
        borderRadius: '7px',
        color: '#0a0e1a',
        fontSize: '13px',
        fontWeight: 700,
        cursor: generating ? 'wait' : 'pointer',
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ fontSize: '15px' }}>{generating ? '⌛' : '⬇'}</span>
      {generating ? 'Generating PDF...' : 'Export PDF'}
    </button>
  )
}
