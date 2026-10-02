import { jsPDF } from 'jspdf';
import { HealthRecord, UserProfile } from '../types/health';
import { calculateStats } from './healthCalculations';

export function generateMonthlyHealthPDF(
  records: HealthRecord[],
  profile: UserProfile,
  monthName: string,
  year: number
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 16;

  // Header Banner
  doc.setFillColor(15, 76, 129); // Classic healthcare navy #0f4c81
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LAPORAN BULANAN REKOD KESIHATAN PERIBADI', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Portal SihatKu • Pemantauan Tekanan Darah, Berat Badan & Ritma Jantung', margin + 6, y + 16);

  y += 28;

  // Patient & Clinical Information Card
  doc.setDrawColor(200, 210, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('MAKLUMAT PESAKIT & RUJUKAN', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  // Column 1
  doc.text(`Nama Pesakit: ${profile.name}`, margin + 4, y + 13);
  doc.text(`Umur / Jantina: ${profile.age} Tahun / ${profile.gender}`, margin + 4, y + 19);
  doc.text(`Tinggi Badan: ${profile.height} cm`, margin + 4, y + 25);

  // Column 2
  const col2X = margin + 70;
  doc.text(`Bulan / Tahun: ${monthName} ${year}`, col2X, y + 13);
  doc.text(`Sasaran Tekanan Darah: < ${profile.targetSystolic}/${profile.targetDiastolic} mmHg`, col2X, y + 19);
  doc.text(`Sasaran Berat Badan: ${profile.targetWeight} kg`, col2X, y + 25);

  // Column 3
  const col3X = margin + 125;
  doc.text(`Doktor Rujukan: ${profile.doctorName || 'Tidak dinyatakan'}`, col3X, y + 13);
  doc.text(`E-mel Klinik: ${profile.doctorEmail || '-'}`, col3X, y + 19);
  doc.text(`Tarikh Jana Dokumen: ${new Date().toLocaleDateString('ms-MY')}`, col3X, y + 25);

  y += 34;

  // Stats Summary Box
  const stats = calculateStats(records);

  doc.setFillColor(238, 246, 255);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 64, 175);
  doc.text('RINGKASAN STATISTIK BULANAN (PURATA & STATUS)', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const statColWidth = (pageWidth - margin * 2 - 8) / 4;
  
  // Stat 1: BP
  doc.setFont('helvetica', 'bold');
  doc.text(`Purata Tekanan Darah:`, margin + 4, y + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${stats.avgSystolic} / ${stats.avgDiastolic} mmHg`, margin + 4, y + 17);

  // Stat 2: Weight & BMI
  doc.setFont('helvetica', 'bold');
  doc.text(`Purata Berat / BMI:`, margin + 4 + statColWidth, y + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${stats.avgWeight} kg (BMI: ${stats.avgBMI})`, margin + 4 + statColWidth, y + 17);

  // Stat 3: Pulse
  doc.setFont('helvetica', 'bold');
  doc.text(`Purata Denyutan Nadi:`, margin + 4 + statColWidth * 2, y + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${stats.avgPulse} bpm`, margin + 4 + statColWidth * 2, y + 17);

  // Stat 4: Compliance
  doc.setFont('helvetica', 'bold');
  doc.text(`Jumlah Rekod & Anomali:`, margin + 4 + statColWidth * 3, y + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${stats.count} bacaan | ${stats.abnormalPulseCount} anomali nadi`, margin + 4 + statColWidth * 3, y + 17);

  y += 28;

  // Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`LOG LOG REKOD PEMANTAUAN HARIAN (${records.length} BACAAN)`, margin, y);
  y += 4;

  const headers = ['Tarikh & Masa', 'TD (mmHg)', 'Kategori TD', 'Nadi (bpm)', 'Berat (kg)', 'BMI', 'Nota / Ubat / Simptom'];
  const colWidths = [28, 22, 28, 20, 20, 15, 49];

  // Render header row
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);

  let curX = margin;
  headers.forEach((h, idx) => {
    doc.text(h, curX + 2, y + 4.8);
    curX += colWidths[idx];
  });

  y += 7;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  // Sort records descending by date
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  sortedRecords.slice(0, 16).forEach((rec, index) => {
    // Alternating background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 6.8, 'F');
    }

    curX = margin;

    // Date & Time
    doc.text(`${rec.date} ${rec.time}`, curX + 2, y + 4.6);
    curX += colWidths[0];

    // BP
    doc.setFont('helvetica', 'bold');
    doc.text(`${rec.systolic}/${rec.diastolic}`, curX + 2, y + 4.6);
    doc.setFont('helvetica', 'normal');
    curX += colWidths[1];

    // BP Category
    const catShort = rec.bpCategory.replace('-', ' ');
    doc.text(catShort, curX + 2, y + 4.6);
    curX += colWidths[2];

    // Pulse
    doc.text(`${rec.pulse}`, curX + 2, y + 4.6);
    curX += colWidths[3];

    // Weight
    doc.text(`${rec.weight}`, curX + 2, y + 4.6);
    curX += colWidths[4];

    // BMI
    doc.text(`${rec.bmi}`, curX + 2, y + 4.6);
    curX += colWidths[5];

    // Notes
    let noteText = rec.notes || '-';
    if (rec.medicationTaken) {
      noteText = `[${rec.medicationTaken}] ` + noteText;
    }
    if (noteText.length > 32) {
      noteText = noteText.substring(0, 30) + '...';
    }
    doc.text(noteText, curX + 2, y + 4.6);

    y += 6.8;

    // If approaching bottom, stop
    if (y > pageHeight - 38) {
      return;
    }
  });

  // Doctor's Review & Signature Section at bottom
  y = pageHeight - 34;
  doc.setDrawColor(200, 210, 220);
  doc.line(margin, y, pageWidth - margin, y);

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('ULASAN & PENGESAHAN DOKTOR PAKAR / PEGAWAI PERUBATAN:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Nota Klinikal: ____________________________________________________________________________________', margin, y + 5);
  doc.text('Pelan Rawatan / Ubat: _________________________________  Tandatangan & Cop Rasmi: ____________________', margin, y + 11);

  // Footer Disclaimer
  doc.setFontSize(6.5);
  doc.text(
    'Nota Penafian: Laporan ini dijana oleh aplikasi SihatKu berasaskan data pemantauan kendiri pesakit. Rujuk doktor bertauliah sebelum mengubah dos ubat.',
    margin,
    pageHeight - 6
  );

  return doc;
}
