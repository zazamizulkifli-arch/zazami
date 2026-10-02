import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Mail,
  Send,
  User,
  X,
  FileText,
} from 'lucide-react';
import { HealthRecord, UserProfile } from '../types/health';
import { calculateStats } from '../utils/healthCalculations';

interface DoctorShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HealthRecord[];
  profile: UserProfile;
}

export const DoctorShareModal: React.FC<DoctorShareModalProps> = ({
  isOpen,
  onClose,
  records,
  profile,
}) => {
  if (!isOpen) return null;

  const [doctorEmail, setDoctorEmail] = useState(profile.doctorEmail || 'dr.norazlina@kkm.gov.my');
  const [doctorName, setDoctorName] = useState(profile.doctorName || 'Dr. Norazlina binti Sulaiman');
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'all'>('7');
  const [copied, setCopied] = useState(false);

  // Filter records
  const sorted = [...records].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  let selectedRecords = sorted;
  if (timeRange === '7') {
    selectedRecords = sorted.slice(0, 7);
  } else if (timeRange === '30') {
    selectedRecords = sorted.slice(0, 30);
  }

  const stats = calculateStats(selectedRecords);

  const subject = `[Laporan Kesihatan SihatKu] Ringkasan Pemantauan Tekanan Darah & Nadi - ${profile.name}`;

  // Build clean clinical markdown/text
  const generateEmailBody = () => {
    let body = `Kepada: ${doctorName || 'Pegawai Perubatan / Doktor Pakar'}\n\n`;
    body += `Salam sejahtera doktor,\n\nBerikut merupakan ringkasan laporan pemantauan kesihatan kendiri saya melalui portal SihatKu bagi tempoh ${timeRange === '7' ? '7 hari' : timeRange === '30' ? '30 hari' : 'keseluruhan'}:\n\n`;
    body += `--- MAKLUMAT PESAKIT ---\n`;
    body += `Nama: ${profile.name}\n`;
    body += `Umur: ${profile.age} tahun | Jantina: ${profile.gender} | Tinggi: ${profile.height} cm\n`;
    body += `Ubat Semasa: ${(profile.currentMedications || []).join(', ') || 'Tiada'}\n\n`;

    body += `--- RINGKASAN STATISTIK PEMANTAUAN ---\n`;
    body += `• Purata Tekanan Darah: ${stats.avgSystolic} / ${stats.avgDiastolic} mmHg (Min: ${stats.minSystolic}, Max: ${stats.maxSystolic})\n`;
    body += `• Purata Berat Badan: ${stats.avgWeight} kg (BMI: ${stats.avgBMI})\n`;
    body += `• Purata Denyutan Nadi: ${stats.avgPulse} bpm\n`;
    body += `• Bilangan Bacaan Tekanan Tinggi: ${stats.hypertensionCount} kali\n`;
    body += `• Bilangan Bacaan Nadi Luar Biasa: ${stats.abnormalPulseCount} kali\n\n`;

    body += `--- LOG BACAAN TERPERINCI ---\n`;
    selectedRecords.forEach((r, idx) => {
      body += `${idx + 1}. [${r.date} ${r.time}] TD: ${r.systolic}/${r.diastolic} mmHg (${r.bpCategory}) | Nadi: ${r.pulse} bpm | Berat: ${r.weight}kg | Ubat/Nota: ${r.medicationTaken || '-'} ${r.notes ? `("${r.notes}")` : ''}\n`;
    });

    body += `\nMohon nasihat atau pandangan doktor bagi semakan dos ubat semasa temujanji akan datang.\n\nSekian, terima kasih.\nYang benar,\n${profile.name}\nTelefon: ${profile.emergencyPhone || '-'}`;
    return body;
  };

  const emailBody = generateEmailBody();

  const handleSendMailto = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(doctorEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500 text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Kongsi Laporan Kepada Doktor Pakar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hantar ringkasan klinikal terus melalui e-mel rasmi klinik/hospital
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-mel Doktor / Klinik Kesihatan
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={doctorEmail}
                  onChange={(e) => setDoctorEmail(e.target.value)}
                  placeholder="contoh: dr.norazlina@kkm.gov.my"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Doktor Rujukan
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="contoh: Dr. Norazlina Sulaiman"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Time range selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Skop Rekod Untuk Disertakan:
            </span>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 font-semibold">
              <button
                onClick={() => setTimeRange('7')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeRange === '7'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                7 Hari Terkini ({Math.min(7, records.length)})
              </button>
              <button
                onClick={() => setTimeRange('30')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeRange === '30'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                30 Hari ({Math.min(30, records.length)})
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeRange === 'all'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Semua ({records.length})
              </button>
            </div>
          </div>

          {/* Email Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pratonton Kandungan E-mel Klinikal:
              </label>
              <button
                onClick={handleCopyText}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Disalin ke Papan Keratan!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Teks E-mel
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              rows={10}
              value={emailBody}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 select-all focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Disalin' : 'Salin Teks'}
            </button>

            <button
              onClick={handleSendMailto}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Buka Aplikasi E-mel (Mailto)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
