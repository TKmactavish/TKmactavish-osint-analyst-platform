// PDF export — mode-aware, programmatic generation with jsPDF.

import { jsPDF } from 'jspdf'

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 20
const LINE_W = PAGE_W - MARGIN * 2
const FOOTER_H = 12

const MODE_META = {
  security: {
    title: 'Intelligence Report',
    accent: [34, 211, 238],   // cyan
    riskLabel: 'Threat Level',
    riskField: 'threatLevel',
  },
  business: {
    title: 'Business Risk Brief',
    accent: [212, 168, 67],   // gold
    riskLabel: 'Business Risk Level',
    riskField: 'businessRiskLevel',
  },
  traveler: {
    title: 'Travel Safety Advisory',
    accent: [16, 185, 129],   // green
    riskLabel: 'Travel Advice',
    riskField: 'travelAdviceLevel',
  },
}

const DISCLAIMER = 'This report is generated from open-source information. It should support, not replace, professional judgment, official guidance, or real-time local authority instructions.'

// ── Logo loader (browser) ───────────────────────────────────────────────────
let _logoDataUrl = null
let _logoTried = false
async function loadLogoDataUrl() {
  if (_logoTried) return _logoDataUrl
  _logoTried = true
  try {
    const res = await fetch('/athena-logo.png')
    if (!res.ok) return null
    const blob = await res.blob()
    _logoDataUrl = await new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = reject
      fr.readAsDataURL(blob)
    })
    return _logoDataUrl
  } catch { return null }
}

// ── Layout helpers ──────────────────────────────────────────────────────────
function addPageIfNeeded(doc, y, needed = 20) {
  if (y + needed > PAGE_H - MARGIN - FOOTER_H) {
    doc.addPage()
    return MARGIN + 10
  }
  return y
}

function addWrapped(doc, text, x, y, maxW, lineH = 5.2) {
  const lines = doc.splitTextToSize(String(text || ''), maxW)
  doc.text(lines, x, y)
  return y + lines.length * lineH
}

function sectionHeader(doc, y, n, title, accent) {
  doc.setFillColor(...accent)
  doc.rect(MARGIN, y - 3.4, 1.2, 4.4, 'F')

  doc.setFontSize(10.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text(`${n}. ${title.toUpperCase()}`, MARGIN + 3.5, y)

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y + 3, PAGE_W - MARGIN, y + 3)

  return y + 9
}

function paragraph(doc, y, text) {
  if (!text) {
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(140, 140, 140)
    doc.text('Not provided.', MARGIN, y)
    return y + 6
  }
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)
  return addWrapped(doc, text, MARGIN, y, LINE_W, 5.5) + 3
}

function bullets(doc, y, items, accent) {
  if (!items || !items.length) {
    doc.setFontSize(9.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(140, 140, 140)
    doc.text('Not provided.', MARGIN, y); return y + 6
  }
  doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50)
  for (const item of items) {
    y = addPageIfNeeded(doc, y, 10)
    const text = typeof item === 'string' ? item : JSON.stringify(item)
    doc.setFillColor(...accent)
    doc.circle(MARGIN + 1.5, y - 1.4, 0.8, 'F')
    y = addWrapped(doc, text, MARGIN + 5, y, LINE_W - 5, 5.2)
    y += 2
  }
  return y + 2
}

// ── Footer / Cover ──────────────────────────────────────────────────────────
function addFooter(doc, accent, title) {
  const total = doc.internal.getNumberOfPages()
  const date = new Date().toISOString().split('T')[0]
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setDrawColor(200, 200, 200)
    doc.line(MARGIN, PAGE_H - MARGIN, PAGE_W - MARGIN, PAGE_H - MARGIN)

    doc.setFillColor(...accent)
    doc.roundedRect(MARGIN, PAGE_H - MARGIN + 2, 6, 5, 0.8, 0.8, 'F')
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('A', MARGIN + 2.1, PAGE_H - MARGIN + 5.8)

    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...accent)
    doc.text('ATHENA INTEL', MARGIN + 8, PAGE_H - MARGIN + 5)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(150, 150, 150)
    doc.text(` | ${title} | ${date}`, MARGIN + 8 + doc.getTextWidth('ATHENA INTEL'), PAGE_H - MARGIN + 5)

    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(150, 150, 150)
    doc.text(`Page ${i} / ${total}`, PAGE_W - MARGIN, PAGE_H - MARGIN + 5, { align: 'right' })
  }
}

async function drawCover(doc, report, mode, meta) {
  const logo = await loadLogoDataUrl()
  const now = new Date().toISOString()
  const y = MARGIN

  // Top accent stripe (gold = brand)
  doc.setFillColor(212, 168, 67)
  doc.rect(0, 0, PAGE_W, 3, 'F')

  const HEADER_H = 70
  doc.setFillColor(10, 14, 26)
  doc.rect(0, 3, PAGE_W, HEADER_H, 'F')

  if (logo) {
    try { doc.addImage(logo, 'PNG', MARGIN, y + 1, 18, 18) }
    catch { /* ignore */ }
  } else {
    doc.setFillColor(212, 168, 67)
    doc.roundedRect(MARGIN, y + 3, 11, 10, 1.5, 1.5, 'F')
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(10, 14, 26)
    doc.text('A', MARGIN + 3.2, y + 11.5)
  }

  const brandX = MARGIN + (logo ? 22 : 14)
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(212, 168, 67)
  doc.text('ATHENA INTEL', brandX, y + 8)

  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 140, 150)
  doc.text('Open-Source Intelligence Platform', brandX, y + 13)

  // Mode-colored report title
  doc.setFontSize(17); doc.setFont('helvetica', 'bold'); doc.setTextColor(...meta.accent)
  doc.text(meta.title.toUpperCase(), MARGIN, y + 32)

  // Active mode chip
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...meta.accent)
  doc.text(`ACTIVE MODE: ${mode.toUpperCase()}`, MARGIN, y + 39)

  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 140, 150)
  doc.text(`Generated: ${now}`, MARGIN, y + 46)
  doc.text('Classification: UNCLASSIFIED — FOR INFORMATIONAL USE ONLY', MARGIN, y + 52)

  return HEADER_H + 16
}

function drawQueryAndRisk(doc, y, report, mode, meta) {
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30)
  y = addWrapped(doc, `Subject: ${report._query || report.query || ''}`, MARGIN, y, LINE_W, 7)
  y += 3

  const risk = report[meta.riskField]
  if (risk) {
    doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80)
    doc.text(`${meta.riskLabel}: `, MARGIN, y)
    const w = doc.getTextWidth(`${meta.riskLabel}: `)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...meta.accent)
    doc.text(String(risk).toUpperCase(), MARGIN + w, y)
    y += 6
  }

  const cl = report.confidenceLevel
  if (cl) {
    doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80)
    doc.text(`Confidence Level: `, MARGIN, y)
    const w = doc.getTextWidth(`Confidence Level: `)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...meta.accent)
    doc.text(String(cl).toUpperCase(), MARGIN + w, y)
    y += 8
  }
  return y
}

// ── Renderers per mode ──────────────────────────────────────────────────────
function renderSecurity(doc, y, report, accent) {
  const sections = [
    ['Intelligence Summary',        () => paragraph(doc, y, report.intelligenceSummary)],
    ['Key Judgments',                () => bullets(doc, y, report.keyJudgments, accent)],
    ['Incident Overview',            () => paragraph(doc, y, report.incidentOverview)],
    ['Location and Area Context',    () => paragraph(doc, y, report.locationContext)],
    ['Actors / Persons / Groups',    () => {
      const list = report.actors || []
      if (!list.length) return paragraph(doc, y, null)
      doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50)
      for (const a of list) {
        y = addPageIfNeeded(doc, y, 12)
        doc.setFont('helvetica', 'bold')
        doc.text(a.name || 'Unknown', MARGIN, y)
        doc.setFont('helvetica', 'normal'); doc.setTextColor(110, 110, 110)
        doc.text(` (${[a.type, a.role, a.status].filter(Boolean).join(' · ')})`, MARGIN + doc.getTextWidth(a.name || 'Unknown'), y)
        doc.setTextColor(50, 50, 50)
        y += 6
      }
      return y + 2
    }],
    ['Modus Operandi',               () => paragraph(doc, y, report.modusOperandi)],
    ['Indicators and Patterns',      () => bullets(doc, y, report.indicatorsAndPatterns, accent)],
    ['Threat Assessment',            () => paragraph(doc, y, report.threatAssessment)],
    ['Intelligence Gaps',            () => bullets(doc, y, report.intelligenceGaps, [245, 158, 11])],
    ['Recommended Collection',       () => paragraph(doc, y, report.recommendedCollection)],
    ['Recommended Action',           () => paragraph(doc, y, report.recommendedAction)],
    ['Confidence Justification',     () => paragraph(doc, y, report.confidenceJustification)],
  ]
  let n = 1
  for (const [title, fn] of sections) {
    y = addPageIfNeeded(doc, y, 24)
    y = sectionHeader(doc, y, n++, title, accent)
    y = fn()
  }
  return { y, n }
}

function renderBusiness(doc, y, report, accent) {
  const sections = [
    ['Executive Summary',                () => paragraph(doc, y, report.executiveSummary)],
    ['Key Business Judgments',           () => bullets(doc, y, report.keyBusinessJudgments, accent)],
    ['Situation Overview',               () => paragraph(doc, y, report.situationOverview)],
    ['Business Impact',                  () => paragraph(doc, y, report.businessImpact)],
    ['Operational Risk',                 () => paragraph(doc, y, report.operationalRisk)],
    ['Employee and Customer Exposure',   () => paragraph(doc, y, report.employeeCustomerExposure)],
    ['Reputation Risk',                  () => paragraph(doc, y, report.reputationRisk)],
    ['Financial or Market Exposure',     () => paragraph(doc, y, report.financialMarketExposure)],
    ['Business Continuity Concern',      () => paragraph(doc, y, report.businessContinuity)],
    ['Recommended Business Action',      () => paragraph(doc, y, report.recommendedBusinessAction)],
    ['Decision Guidance',                () => paragraph(doc, y, report.decisionGuidance)],
    ['Monitoring Triggers',              () => bullets(doc, y, report.monitoringTriggers, [245, 158, 11])],
    ['Confidence Justification',         () => paragraph(doc, y, report.confidenceJustification)],
  ]
  let n = 1
  for (const [title, fn] of sections) {
    y = addPageIfNeeded(doc, y, 24)
    y = sectionHeader(doc, y, n++, title, accent)
    y = fn()
  }
  return { y, n }
}

function renderTraveler(doc, y, report, accent) {
  const sections = [
    ['Safety Summary',         () => paragraph(doc, y, report.safetySummary)],
    ['Is It Safe?',            () => paragraph(doc, y, report.isItSafe)],
    ['Areas to Avoid',         () => bullets(doc, y, report.areasToAvoid, [239, 68, 68])],
    ['Main Safety Concerns',   () => bullets(doc, y, report.mainSafetyConcerns, [245, 158, 11])],
    ['What You Should Do',     () => bullets(doc, y, report.whatYouShouldDo, accent)],
    ['What You Should Avoid',  () => bullets(doc, y, report.whatYouShouldAvoid, [239, 68, 68])],
    ['Movement Advice',        () => paragraph(doc, y, report.movementAdvice)],
    ['Emergency Awareness',    () => paragraph(doc, y, report.emergencyAwareness)],
    ['Final Recommendation',   () => paragraph(doc, y, report.finalRecommendation)],
    ['Confidence Justification', () => paragraph(doc, y, report.confidenceJustification)],
  ]
  let n = 1
  for (const [title, fn] of sections) {
    y = addPageIfNeeded(doc, y, 24)
    y = sectionHeader(doc, y, n++, title, accent)
    y = fn()
  }
  return { y, n }
}

function renderSources(doc, y, sources, accent, n) {
  if (!sources || !sources.length) return y
  y = addPageIfNeeded(doc, y, 24)
  y = sectionHeader(doc, y, n, 'Sources', accent)
  doc.setFontSize(9)
  for (const s of sources) {
    y = addPageIfNeeded(doc, y, 18)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30)
    const titleLine = `${s.title || s.domain || 'Source'}`
    y = addWrapped(doc, titleLine, MARGIN, y, LINE_W, 5)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(110, 110, 110)
    const meta = [
      s.type && `Type: ${s.type}`,
      s.language && `Lang: ${s.language}`,
      s.reliability && `Reliability: ${String(s.reliability).toUpperCase()}`,
      s.date,
    ].filter(Boolean).join('  ·  ')
    if (meta) y = addWrapped(doc, meta, MARGIN, y, LINE_W, 4.5)
    if (s.note) {
      doc.setFont('helvetica', 'italic')
      y = addWrapped(doc, s.note, MARGIN, y, LINE_W, 4.5)
    }
    if (s.url) {
      doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100); doc.setFontSize(8.5)
      y = addWrapped(doc, s.url, MARGIN + 3, y, LINE_W - 3, 4.2)
      doc.setFontSize(9)
    }
    y += 4
  }
  return y
}

function drawDisclaimer(doc) {
  const total = doc.internal.getNumberOfPages()
  doc.setPage(total)
  let y = PAGE_H - MARGIN - FOOTER_H - 18
  doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2)
  doc.line(MARGIN, y - 2, PAGE_W - MARGIN, y - 2)
  doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(120, 120, 120)
  addWrapped(doc, DISCLAIMER, MARGIN, y + 2, LINE_W, 4.2)
}

// ── Public API ──────────────────────────────────────────────────────────────
export async function generatePDF(report) {
  const mode = report._mode || report.mode || 'security'
  const meta = MODE_META[mode] || MODE_META.security
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  let y = await drawCover(doc, report, mode, meta)
  y = drawQueryAndRisk(doc, y, report, mode, meta)

  let next
  if (mode === 'business')      next = renderBusiness(doc, y, report, meta.accent)
  else if (mode === 'traveler') next = renderTraveler(doc, y, report, meta.accent)
  else                          next = renderSecurity(doc, y, report, meta.accent)

  next.y = renderSources(doc, next.y, report.sourceAssessment, meta.accent, next.n)

  drawDisclaimer(doc)
  addFooter(doc, meta.accent, meta.title)

  const q = (report._query || report.query || 'report').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)
  doc.save(`athena-${mode}-${q}-${Date.now()}.pdf`)
}
