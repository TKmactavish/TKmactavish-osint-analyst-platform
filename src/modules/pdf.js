// PDF export — programmatic generation with jsPDF

import { jsPDF } from 'jspdf';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const LINE_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 12;
const CONTENT_H = PAGE_H - MARGIN * 2 - FOOTER_H;

function addWrappedText(doc, text, x, y, maxW, lineH) {
  const lines = doc.splitTextToSize(String(text || ''), maxW);
  doc.text(lines, x, y);
  return y + lines.length * lineH;
}

function addPageIfNeeded(doc, y, needed = 20) {
  if (y + needed > PAGE_H - MARGIN - FOOTER_H) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
}

function addFooter(doc) {
  const total = doc.internal.getNumberOfPages();
  const date = new Date().toISOString().split('T')[0];
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);

    // Footer separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, PAGE_H - MARGIN, PAGE_W - MARGIN, PAGE_H - MARGIN);

    // Teal "A" logo mark in footer
    doc.setFillColor(46, 164, 161);
    doc.roundedRect(MARGIN, PAGE_H - MARGIN + 2, 6, 5, 0.8, 0.8, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('A', MARGIN + 2.1, PAGE_H - MARGIN + 5.8);

    // Brand + platform name
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 164, 161);
    doc.text('ATHENA INTEL', MARGIN + 8, PAGE_H - MARGIN + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(` | OSINT Intelligence Platform | ${date}`, MARGIN + 8 + doc.getTextWidth('ATHENA INTEL'), PAGE_H - MARGIN + 5);

    // Page number
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} / ${total}`, PAGE_W - MARGIN, PAGE_H - MARGIN + 5, { align: 'right' });
  }
}

function sectionHeader(doc, y, title) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.setDrawColor(180, 180, 180);
  doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2);
  doc.text(title.toUpperCase(), MARGIN, y);
  return y + 8;
}

export async function generatePDF(report) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const now = new Date().toISOString();
  let y = MARGIN;

  // ── Cover / Title ──
  // Teal accent stripe at very top
  doc.setFillColor(46, 164, 161);
  doc.rect(0, 0, PAGE_W, 3, 'F');

  // Dark header background
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 3, PAGE_W, 52, 'F');

  // "A" logo mark box (teal)
  doc.setFillColor(46, 164, 161);
  doc.roundedRect(MARGIN, y + 3, 11, 10, 1.5, 1.5, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 17, 23);
  doc.text('A', MARGIN + 3.2, y + 11.5);

  // Brand name "ATHENA INTEL"
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 164, 161);
  doc.text('ATHENA INTEL', MARGIN + 14, y + 8);

  // Sub-label "Open-Source Intelligence Platform"
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 120, 130);
  doc.text('Open-Source Intelligence Platform', MARGIN + 14, y + 13);

  // Main report title
  doc.setFontSize(19);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(230, 237, 243);
  doc.text('OSINT INTELLIGENCE REPORT', MARGIN, y + 26);

  // Metadata line
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 120, 130);
  doc.text(`Generated: ${now}`, MARGIN, y + 34);
  doc.text('Classification: UNCLASSIFIED — FOR INFORMATIONAL USE ONLY', MARGIN, y + 40);

  y = 63;

  // Query
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  const queryText = `Subject: ${report.query || report.executiveSummary?.slice(0, 80)}`;
  y = addWrappedText(doc, queryText, MARGIN, y, LINE_W, 7);
  y += 4;

  // Confidence + Risk row
  const conf = report.confidenceLevel || report.risk || 'UNKNOWN';
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Confidence Level: ${conf}    |    Query Type: ${(report.type || '').replace(/_/g, ' ').toUpperCase()}`, MARGIN, y);
  y += 8;

  // ── Executive Summary ──
  y = addPageIfNeeded(doc, y, 30);
  y = sectionHeader(doc, y, '1. Executive Summary');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  y = addWrappedText(doc, report.executiveSummary || report.summary || '', MARGIN, y, LINE_W, 5.5);
  y += 6;

  // ── Key Facts ──
  const facts = report.keyFacts || [];
  if (facts.length) {
    y = addPageIfNeeded(doc, y, 20);
    y = sectionHeader(doc, y, '2. Key Facts');
    doc.setFontSize(9.5);
    for (const f of facts) {
      y = addPageIfNeeded(doc, y, 12);
      const status = f.status || 'UNCONFIRMED';
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(status === 'CONFIRMED' ? 35 : 180, status === 'CONFIRMED' ? 134 : 50, 50);
      doc.text(`[${status}]`, MARGIN, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      y = addWrappedText(doc, `  ${f.fact || f}`, MARGIN + 22, y, LINE_W - 22, 5.2);
      y += 2;
    }
    y += 4;
  }

  // ── Timeline ──
  const timeline = report.timeline || [];
  if (timeline.length) {
    y = addPageIfNeeded(doc, y, 20);
    y = sectionHeader(doc, y, '3. Timeline of Events');
    doc.setFontSize(9.5);
    for (const e of timeline) {
      y = addPageIfNeeded(doc, y, 12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 111, 235);
      doc.text(e.date || '????-??-??', MARGIN, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      y = addWrappedText(doc, `  ${e.event || ''}`, MARGIN + 28, y, LINE_W - 28, 5.2);
      y += 2;
    }
    y += 4;
  }

  // ── Risk Indicators ──
  const risks = report.riskIndicators || report.flags || [];
  if (risks.length) {
    y = addPageIfNeeded(doc, y, 20);
    y = sectionHeader(doc, y, '4. Risk Indicators / Red Flags');
    doc.setFontSize(9.5);
    for (const r of risks) {
      y = addPageIfNeeded(doc, y, 10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const text = typeof r === 'string' ? r : `${r.name || ''}: ${r.description || ''}`;
      y = addWrappedText(doc, `• ${text}`, MARGIN, y, LINE_W, 5.2);
      y += 1;
    }
    y += 4;
  }

  // ── Impact Assessment ──
  const impact = report.impactAssessment || {};
  if (Object.keys(impact).length) {
    y = addPageIfNeeded(doc, y, 20);
    y = sectionHeader(doc, y, '5. Impact Assessment');
    const categories = ['civilian', 'political', 'economic', 'security'];
    doc.setFontSize(9.5);
    for (const cat of categories) {
      if (!impact[cat]) continue;
      y = addPageIfNeeded(doc, y, 14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(cat.toUpperCase(), MARGIN, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      y = addWrappedText(doc, impact[cat], MARGIN + 3, y, LINE_W - 3, 5.2);
      y += 3;
    }
    y += 2;
  }

  // ── Intelligence Assessment ──
  const ia = report.intelligenceAssessment || report.analytical_perspective || '';
  if (ia) {
    y = addPageIfNeeded(doc, y, 20);
    y = sectionHeader(doc, y, '6. Intelligence Assessment');
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    y = addWrappedText(doc, ia, MARGIN, y, LINE_W, 5.5);
    y += 6;
  }

  // ── Confidence Level ──
  y = addPageIfNeeded(doc, y, 16);
  y = sectionHeader(doc, y, '7. Confidence Level');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const cl = report.confidenceLevel || 'UNKNOWN';
  const clColor = cl === 'HIGH' ? [35, 134, 54] : cl === 'MEDIUM' ? [210, 153, 34] : [218, 54, 51];
  doc.setTextColor(...clColor);
  doc.text(cl, MARGIN, y);
  if (report.confidenceJustification) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    y = addWrappedText(doc, report.confidenceJustification, MARGIN + 20, y, LINE_W - 20, 5.5);
  } else {
    y += 6;
  }
  y += 4;

  // ── Information Gaps ──
  const gaps = report.informationGaps || [];
  if (gaps.length) {
    y = addPageIfNeeded(doc, y, 20);
    y = sectionHeader(doc, y, '8. Information Gaps');
    doc.setFontSize(9.5);
    for (const g of gaps) {
      y = addPageIfNeeded(doc, y, 10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      y = addWrappedText(doc, `• ${g}`, MARGIN, y, LINE_W, 5.2);
      y += 1;
    }
    y += 4;
  }

  // ── Recommendations ──
  const rec = report.recommendations || {};
  const recKeys = [
    ['whatToWatch', 'What to Watch'],
    ['whatToAvoid', 'What to Avoid'],
    ['recommendedAction', 'Recommended Action'],
    ['travelSafetyAdvice', 'Travel Safety Advice'],
    ['monitoringPriority', 'Monitoring Priority'],
    ['nextSteps', 'Next Steps'],
    // Legacy keys
    ['law_enforcement', 'Law Enforcement'],
    ['private_sector', 'Private Sector'],
    ['traveler', 'Traveler'],
  ];
  const hasRec = recKeys.some(([k]) => rec[k]);
  if (hasRec) {
    y = addPageIfNeeded(doc, y, 20);
    y = sectionHeader(doc, y, '9. Recommendations');
    doc.setFontSize(9.5);
    for (const [key, label] of recKeys) {
      if (!rec[key]) continue;
      y = addPageIfNeeded(doc, y, 14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(label.toUpperCase(), MARGIN, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const content = Array.isArray(rec[key]) ? rec[key].join('\n') : rec[key];
      y = addWrappedText(doc, content, MARGIN + 3, y, LINE_W - 3, 5.2);
      y += 3;
    }
    y += 2;
  }

  // ── Sources ──
  const sources = report.sourceAssessment || report.sources || [];
  if (sources.length) {
    y = addPageIfNeeded(doc, y, 20);
    y = sectionHeader(doc, y, '10. Sources');
    doc.setFontSize(9);
    for (const s of sources) {
      y = addPageIfNeeded(doc, y, 14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      const titleLine = `${s.title || s.source || 'Source'} [${(s.language || 'EN')}] — Credibility: ${(s.credibility || 'UNKNOWN').toUpperCase()}`;
      y = addWrappedText(doc, titleLine, MARGIN, y, LINE_W, 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      y = addWrappedText(doc, s.url || '', MARGIN + 3, y, LINE_W - 3, 5);
      y += 2;
    }
  }

  // ── Footers on all pages ──
  addFooter(doc);

  const filename = `osint-report-${(report.query || 'report').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)}-${Date.now()}.pdf`;
  doc.save(filename);
}
