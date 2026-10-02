import React, { useState } from 'react';
import {
  Download,
  FileText,
  Printer,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { HealthRecord, UserProfile } from '../types/health';
import { generateMonthlyHealthPDF } from '../utils/pdfGenerator';
import { calculateStats, getBPCategoryColor } from '../utils/healthCalculations';

interface PdfReportGeneratorProps {
  records: HealthRecord[];
  profile: UserProfile;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

export const PdfReportGenerator: React.FC<PdfReportGeneratorProps> = ({
  records,
  profile,
}) => {
  const currentMonthIdx = 9; // October (0-indexed)
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Filter records for the selected month and year
  const monthPad = String(selectedMonth + 1).padStart(2, '0');
  const monthKey = `${selectedYear}-${monthPad}`;

  const monthRecords = records.filter((r) => r.date.startsWith(monthKey));
  // If no records in exact month, fallback to all recent for demo preview so the report isn't completely empty
  const displayRecords = monthRecords.length > 0 ? monthRecords : records.slice(0, 15);

  const stats = calculateStats(displayRecords);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      const doc = generateMonthlyHealthPDF(
        displayRecords,
        profile,
        MONTH_NAMES[selectedMonth],
        selectedYear
      );
      doc.save(`Laporan_Kesihatan_SihatKu_${MONTH_NAMES[selectedMonth]}_${selectedYear}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Penjana Laporan Bulanan Kesihatan (Format PDF)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Jana dokumen PDF rasmi berprofil klinikal untuk dibawa ke temujanji klinik atau simpanan peribadi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>Cetak Laporan</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Menjana PDF...' : 'Muat Turun PDF'}</span>
            </button>
          </div>
        </div>

        {/* Month & Year Selectors */}
        <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Pilih Bulan Laporan:
          </span>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>

          <span className="text-slate-400 ml-auto">
            {displayRecords.length} bacaan sedia untuk dicetak dalam dokumen ini.
          </span>
        </div>
      </div>

      {/* High-Fidelity Printable Clinical Report Document Sheet */}
      <div className="bg-white text-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-8 sm:p-10 shadow-lg max-w-4xl mx-auto font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-indigo-900 pb-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-indigo-950 tracking-tight">
                  PORTAL SIHATKU
                </span>
                <span className="px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-900 text-[10px] font-extrabold uppercase">
                  Rasmi
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-700 mt-1">
                LAPORAN BULANAN REKOD KESIHATAN PERIBADI
              </h2>
              <p className="text-xs text-slate-500">
                Pemeriksaan Kendiri Tekanan Darah, Berat Badan & Ritma Jantung (HBPM)
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold text-slate-700 block">
                Bulan: {MONTH_NAMES[selectedMonth]} {selectedYear}
              </span>
              <span className="text-slate-500">
                Tarikh Cetakan: {new Date().toLocaleDateString('ms-MY')}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Profile & Clinical Target Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block">
              Maklumat Pesakit
            </span>
            <span className="font-extrabold text-sm text-slate-900 block mt-0.5">
              {profile.name}
            </span>
            <span className="text-slate-600 block mt-0.5">
              {profile.age} Tahun • {profile.gender}
            </span>
            <span className="text-slate-600">Tinggi: {profile.height} cm</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block">
              Sasaran Klinikal
            </span>
            <span className="text-slate-700 block mt-0.5">
              Sasaran TD: <strong>&lt; {profile.targetSystolic}/{profile.targetDiastolic} mmHg</strong>
            </span>
            <span className="text-slate-700 block mt-0.5">
              Sasaran Berat: <strong>{profile.targetWeight} kg</strong>
            </span>
            <span className="text-slate-600">
              Ubat: {(profile.currentMedications || []).join(', ') || 'Tiada'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block">
              Doktor / Klinik Rujukan
            </span>
            <span className="font-bold text-slate-800 block mt-0.5">
              {profile.doctorName || 'Klinik Kesihatan Kerajaan'}
            </span>
            <span className="text-slate-600 block mt-0.5">
              {profile.doctorEmail || '-'}
            </span>
            <span className="text-slate-500">
              Waris Kecemasan: {profile.emergencyContact} ({profile.emergencyPhone})
            </span>
          </div>
        </div>

        {/* Aggregate Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 mb-6 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Purata Tekanan Darah</span>
            <span className="text-base font-extrabold text-indigo-950">
              {stats.avgSystolic}/{stats.avgDiastolic} <span className="text-xs font-normal">mmHg</span>
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Purata Berat / BMI</span>
            <span className="text-base font-extrabold text-indigo-950">
              {stats.avgWeight} kg <span className="text-xs font-normal">({stats.avgBMI})</span>
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Purata Nadi Rehat</span>
            <span className="text-base font-extrabold text-indigo-950">
              {stats.avgPulse} <span className="text-xs font-normal">bpm</span>
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Status Kepatuhan</span>
            <span className="text-base font-extrabold text-emerald-700">
              {stats.count} Bacaan Catatan
            </span>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Log Terperinci Bacaan Bulanan ({displayRecords.length} Rekod)
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-2 px-3">Tarikh / Masa</th>
                  <th className="py-2 px-3">Tekanan Darah</th>
                  <th className="py-2 px-3">Status Kategori</th>
                  <th className="py-2 px-3">Nadi</th>
                  <th className="py-2 px-3">Berat / BMI</th>
                  <th className="py-2 px-3">Catatan / Ubat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayRecords.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="py-2 px-3">
                      <span className="font-semibold text-slate-800">{r.date}</span>{' '}
                      <span className="text-[10px] text-slate-500">{r.time}</span>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {r.systolic}/{r.diastolic} mmHg
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-medium text-slate-700">
                        {r.bpCategory.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700">{r.pulse} bpm</td>
                    <td className="py-2 px-3 text-slate-700">
                      {r.weight} kg (BMI {r.bmi})
                    </td>
                    <td className="py-2 px-3 text-slate-600 max-w-xs truncate">
                      {r.medicationTaken ? `[${r.medicationTaken}] ` : ''}
                      {r.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Sign-Off Area */}
        <div className="mt-8 pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs">
          <div>
            <span className="font-bold text-slate-800 block mb-1">
              Catatan & Pelan Rawatan Doktor:
            </span>
            <div className="h-16 border border-dashed border-slate-300 rounded-lg p-2 text-slate-400 italic">
              Ruang ulasan klinikal dan pelarasan dos ubat...
            </div>
          </div>

          <div className="flex flex-col justify-end text-right">
            <div className="border-b border-slate-400 pb-1 mb-1 w-48 ml-auto" />
            <span className="font-bold text-slate-800 block">
              Tandatangan & Cop Rasmi Doktor
            </span>
            <span className="text-slate-400 text-[10px]">
              Tarikh Semakan Temujanji
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
