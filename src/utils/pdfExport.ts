import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { JobEntry } from '@/types';
import { calculatePay } from './payCalc';
import { WEEKLY_DRIVE_PAY } from '@/data/payRates';

const DAYS_EN = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAYS_ES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

const NAVY = [13, 27, 78]   as [number, number, number];
const CYAN = [29, 200, 255] as [number, number, number];

export function exportWeeklyPayPDF(
  employeeName: string,
  weekLabel: string,
  jobs: JobEntry[],
  lang: 'en' | 'es' = 'en'
) {
  const DAYS = lang === 'es' ? DAYS_ES : DAYS_EN;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // ─── Header ───────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 36, 'F');

  doc.setTextColor(29, 200, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SPIFFY CLEANING COMPANY', 14, 14);

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text(lang === 'es' ? 'Comprobante de Pago Semanal' : 'Weekly Pay Statement', 14, 21);

  doc.setFontSize(9);
  doc.setTextColor(180, 210, 255);
  doc.text(`${lang === 'es' ? 'Empleado' : 'Employee'}: ${employeeName}`, 14, 29);
  doc.text(`${lang === 'es' ? 'Semana' : 'Week'}: ${weekLabel}`, W / 2, 29);
  doc.text(`${lang === 'es' ? 'Fecha' : 'Generated'}: ${new Date().toLocaleDateString()}`, W - 14, 29, { align: 'right' });

  // ─── Jobs by Day ──────────────────────────────────────────────────────────
  let y = 46;

  const jobsByDay: Record<number, JobEntry[]> = {};
  jobs.forEach(j => {
    if (!jobsByDay[j.dayOfWeek]) jobsByDay[j.dayOfWeek] = [];
    jobsByDay[j.dayOfWeek].push(j);
  });

  const col = {
    property: lang === 'es' ? 'Propiedad'     : 'Property',
    type:     lang === 'es' ? 'Tipo'           : 'Type',
    qty:      lang === 'es' ? 'Cant.'          : 'Qty',
    team:     lang === 'es' ? 'Equipo'         : 'Team',
    status:   lang === 'es' ? 'Estado'         : 'Status',
    pay:      lang === 'es' ? 'Pago'           : 'Pay',
    pending:  lang === 'es' ? 'Pendiente'      : 'Pending',
    approved: lang === 'es' ? 'Aprobado'       : 'Approved',
    locked:   lang === 'es' ? 'Bloqueado'      : 'Locked',
    daily:    lang === 'es' ? 'Total del Día'  : 'Day Total',
  };

  let totalApproved = 0;
  let totalPending  = 0;

  DAYS.forEach((dayName, idx) => {
    const dayJobs = jobsByDay[idx];
    if (!dayJobs || dayJobs.length === 0) return;

    const rows = dayJobs.map(j => {
      const pay = calculatePay(j);
      const myPay = pay?.myPay ?? 0;
      if (j.status === 'approved' || j.status === 'locked') totalApproved += myPay;
      else totalPending += myPay;

      return [
        j.property || '—',
        j.jobType.replace(/_/g, ' '),
        j.quantity.toString(),
        `${j.teamSize}`,
        j.status === 'approved' ? col.approved : j.status === 'locked' ? col.locked : col.pending,
        `$${myPay.toFixed(2)}`,
      ];
    });

    const dayTotal = dayJobs.reduce((s, j) => s + (calculatePay(j)?.myPay ?? 0), 0);

    autoTable(doc, {
      startY: y,
      head: [[{ content: dayName.toUpperCase(), colSpan: 6, styles: { fillColor: NAVY, textColor: CYAN, fontStyle: 'bold', fontSize: 9 } }],
             [col.property, col.type, col.qty, col.team, col.status, col.pay]],
      body: rows,
      foot: [[{ content: col.daily, colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `$${dayTotal.toFixed(2)}`]],
      theme: 'striped',
      headStyles: { fillColor: [240, 244, 255], textColor: NAVY, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [30, 30, 60] },
      footStyles: { fillColor: [240, 244, 255], textColor: NAVY, fontStyle: 'bold', fontSize: 8 },
      columnStyles: { 5: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 14, right: 14 },
      didParseCell(data) {
        if (data.section === 'body' && data.column.index === 4) {
          const v = data.cell.raw as string;
          if (v === col.approved) data.cell.styles.textColor = [22, 163, 74];
          else if (v === col.pending) data.cell.styles.textColor = [202, 138, 4];
          else data.cell.styles.textColor = [100, 100, 120];
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  });

  // ─── Pay Summary ──────────────────────────────────────────────────────────
  y += 4;
  doc.setFillColor(...NAVY);
  doc.roundedRect(14, y, W - 28, 46, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setTextColor(29, 200, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? 'RESUMEN DE PAGO' : 'PAY SUMMARY', 20, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 255);

  const lineY = (n: number) => y + 10 + n * 8;

  const row = (label: string, val: string, lineN: number, highlight = false) => {
    doc.setTextColor(highlight ? 255 : 180, highlight ? 255 : 210, highlight ? 255 : 255);
    doc.setFont('helvetica', highlight ? 'bold' : 'normal');
    doc.setFontSize(highlight ? 10 : 9);
    doc.text(label, 20, lineY(lineN));
    doc.text(val, W - 18, lineY(lineN), { align: 'right' });
  };

  row(lang === 'es' ? 'Trabajos Aprobados' : 'Approved Jobs Pay',  `$${totalApproved.toFixed(2)}`, 1);
  if (totalPending > 0)
    row(lang === 'es' ? 'Trabajos Pendientes' : 'Pending Jobs Pay',`$${totalPending.toFixed(2)}`,  2);
  row(lang === 'es' ? 'Pago de Manejo' : 'Drive Pay',               `$${WEEKLY_DRIVE_PAY.toFixed(2)}`, totalPending > 0 ? 3 : 2);
  row(lang === 'es' ? 'Total' : 'Total Pay',                        `$${(totalApproved + WEEKLY_DRIVE_PAY).toFixed(2)}`, totalPending > 0 ? 4 : 3, true);

  // ─── Footer ───────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 180);
  doc.setFont('helvetica', 'normal');
  doc.text('Spiffy Cleaning Company · Confidential Pay Statement', W / 2, pageH - 8, { align: 'center' });

  doc.save(`spiffy-pay-${employeeName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0,10)}.pdf`);
}

export function exportManagerPayrollPDF(
  weekLabel: string,
  rows: { name: string; jobs: number; pending: number; jobsPay: number; drivePay: number; total: number }[],
  lang: 'en' | 'es' = 'en'
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 32, 'F');

  doc.setTextColor(29, 200, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SPIFFY CLEANING COMPANY', 14, 13);

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text(lang === 'es' ? `Nómina de Equipo — ${weekLabel}` : `Team Payroll — ${weekLabel}`, 14, 21);
  doc.text(`${lang === 'es' ? 'Fecha' : 'Generated'}: ${new Date().toLocaleDateString()}`, W - 14, 21, { align: 'right' });

  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  const totalJobs  = rows.reduce((s, r) => s + r.jobs, 0);

  autoTable(doc, {
    startY: 40,
    head: [[
      lang === 'es' ? 'Empleado'  : 'Employee',
      lang === 'es' ? 'Trabajos'  : 'Jobs',
      lang === 'es' ? 'Pendiente' : 'Pending',
      lang === 'es' ? 'Pago Trab.': 'Jobs Pay',
      lang === 'es' ? 'Manejo'    : 'Drive Pay',
      lang === 'es' ? 'Total'     : 'Total Pay',
    ]],
    body: rows.map(r => [
      r.name,
      r.jobs,
      r.pending > 0 ? `${r.pending} ⚠` : '—',
      `$${r.jobsPay.toFixed(2)}`,
      `$${r.drivePay.toFixed(2)}`,
      `$${r.total.toFixed(2)}`,
    ]),
    foot: [[
      lang === 'es' ? 'TOTAL' : 'TOTAL',
      totalJobs,
      '',
      `$${rows.reduce((s,r) => s + r.jobsPay, 0).toFixed(2)}`,
      `$${rows.reduce((s,r) => s + r.drivePay, 0).toFixed(2)}`,
      `$${grandTotal.toFixed(2)}`,
    ]],
    theme: 'striped',
    headStyles: { fillColor: NAVY, textColor: CYAN, fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 60] },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 2 && String(data.cell.raw).includes('⚠')) {
        data.cell.styles.textColor = [202, 138, 4];
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.section === 'body' && data.column.index === 5) {
        data.cell.styles.textColor = NAVY;
      }
    },
  });

  doc.save(`spiffy-payroll-${new Date().toISOString().slice(0,10)}.pdf`);
}
