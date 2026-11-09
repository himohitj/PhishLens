import { jsPDF } from 'jspdf';
import { SessionStateResponse } from '../types/phishlens.ts';
import { CATEGORY_LABELS } from '../server/data.ts';

export function exportPerformanceReportPdf(session: SessionStateResponse): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 44;
  let y = 48;

  // Header Brand Block
  doc.setFillColor(8, 13, 26);
  doc.rect(0, 0, pageWidth, 108, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(241, 245, 249);
  doc.text('PhishLens', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(56, 189, 248);
  doc.text('See through the deception. — Personal Learning & Performance Report', margin, y + 18);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Anonymous Session ID: ${session.sessionId.slice(0, 22)}...   |   Generated: ${dateStr}`, margin, y + 36);

  y = 136;

  // Assessment Comparison Section
  const basePct = session.baselineAssessment ? session.baselineAssessment.percentage : 0;
  const finalPct = session.finalAssessment ? session.finalAssessment.percentage : 0;
  const baseScore = session.baselineAssessment ? `${session.baselineAssessment.score}/${session.baselineAssessment.totalQuestions}` : 'Not completed';
  const finalScore = session.finalAssessment ? `${session.finalAssessment.score}/${session.finalAssessment.totalQuestions}` : 'Not completed';
  const ppChange = finalPct - basePct;
  const ppFormatted = ppChange >= 0 ? `+${ppChange} percentage points` : `${ppChange} percentage points`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Assessment Performance Summary', margin, y);
  y += 16;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 72, 6, 6, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Baseline Assessment', margin + 18, y + 24);
  doc.text('Final Assessment', margin + 190, y + 24);
  doc.text('Measured Change', margin + 355, y + 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`${basePct}% (${baseScore})`, margin + 18, y + 48);
  doc.text(`${finalPct}% (${finalScore})`, margin + 190, y + 48);

  if (ppChange > 0) {
    doc.setTextColor(5, 150, 105);
  } else if (ppChange < 0) {
    doc.setTextColor(217, 119, 6);
  } else {
    doc.setTextColor(15, 23, 42);
  }
  doc.text(ppFormatted, margin + 355, y + 48);

  y += 96;

  // Simulation Performance Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Interactive Phishing Simulations (5 Scenarios)', margin, y);
  y += 18;

  const simIds = ['sim-1', 'sim-2', 'sim-3', 'sim-4', 'sim-5'];
  simIds.forEach((id, idx) => {
    const fb = session.simulationFeedbacks[id];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const title = fb ? fb.scenarioTitle : `Scenario ${idx + 1}`;
    const status = fb
      ? `${fb.outcomeClassification.toUpperCase()} (${fb.scoreEarned}/100) — Action: ${fb.selectedActionLabel}`
      : 'Not yet completed';
    doc.text(title, margin, y);
    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const splitStatus = doc.splitTextToSize(status, pageWidth - margin * 2);
    doc.text(splitStatus, margin + 10, y);
    y += splitStatus.length * 12 + 6;
  });

  y += 8;

  // Category Analysis & Learning Modules
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Category Strengths & Learning Progress', margin, y);
  y += 18;

  // Compute strongest & practice categories
  const feedbacks = Object.values(session.simulationFeedbacks);
  let strongestLabel = 'Email Phishing & Header Verification';
  let practiceLabel = 'Live Social Engineering & MFA Defense';

  if (feedbacks.length > 0) {
    const sorted = [...feedbacks].sort((a, b) => b.scoreEarned - a.scoreEarned);
    strongestLabel = CATEGORY_LABELS[sorted[0].attackType] || sorted[0].attackTypeLabel;
    practiceLabel =
      CATEGORY_LABELS[sorted[sorted.length - 1].attackType] || sorted[sorted.length - 1].attackTypeLabel;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Strongest Demonstrated Area: ${strongestLabel}`, margin, y);
  y += 16;
  doc.text(`• Area Recommended for Continued Practice: ${practiceLabel}`, margin, y);
  y += 16;
  doc.text(
    `• Learning Centre Modules Completed: ${session.completedModuleSlugs.length} of 8 modules`,
    margin,
    y
  );
  y += 26;

  // Practical Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Practical Security Recommendations', margin, y);
  y += 18;

  const recs = [
    '1. Verify the Effective Domain: Always inspect the registered domain immediately before the first single slash (/) rather than trusting display names or HTTPS padlocks.',
    '2. Never Share One-Time Passcodes (OTPs): No legitimate IT helpdesk, security analyst, or financial institution will ever ask you to read back an SMS/authenticator code or approve an uninitiated MFA push.',
    '3. Treat QR Codes Like Unknown Shortlinks: Preview the decoded destination domain before opening any QR code in PDFs or public spaces, and never sign in to corporate accounts via an emailed QR code.',
    '4. Use Out-of-Band Verification: When an SMS, email, or chat creates artificial countdown pressure, verify independently using a known bookmark or official directory phone number.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  recs.forEach((rec) => {
    const lines = doc.splitTextToSize(rec, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 6;
  });

  y += 12;

  // Honest Scope Note
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 54, 4, 4, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const disclaimer =
    'Scope & Interpretation Note: This report reflects performance across controlled educational simulations during a single PhishLens session. Measured percentage-point improvement demonstrates stronger recognition of warning signs, but real-world security requires ongoing vigilance, phishing-resistant MFA, and safe reporting habits.';
  const discLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2 - 20);
  doc.text(discLines, margin + 10, y + 18);

  doc.save(`PhishLens_Report_${session.sessionId.slice(0, 12)}.pdf`);
}
