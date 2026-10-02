import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  Download,
  Edit2,
  Filter,
  Plus,
  Search,
  Trash2,
  Watch,
  Heart,
  Pill,
  FileSpreadsheet,
} from 'lucide-react';
import { HealthRecord, BloodPressureCategory } from '../types/health';
import { getBPCategoryColor, getBMICategoryColor } from '../utils/healthCalculations';

interface RecordsJournalProps {
  records: HealthRecord[];
  onOpenAddModal: () => void;
  onEditRecord: (record: HealthRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const RecordsJournal: React.FC<RecordsJournalProps> = ({
  records,
  onOpenAddModal,
  onEditRecord,
  onDeleteRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'sys_desc' | 'weight_desc'>('date_desc');

  // Filter and sort records
  const filtered = records.filter((r) => {
    // Search query matches date, notes, medications, symptoms
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      r.date.includes(query) ||
      (r.notes && r.notes.toLowerCase().includes(query)) ||
      (r.medicationTaken && r.medicationTaken.toLowerCase().includes(query)) ||
      (r.symptoms && r.symptoms.some((s) => s.toLowerCase().includes(query)));

    // Category filter
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'hipertensi') {
        matchesCategory =
          r.bpCategory === 'Hipertensi-Tahap-1' ||
          r.bpCategory === 'Hipertensi-Tahap-2' ||
          r.bpCategory === 'Krisis-Hipertensi';
      } else {
        matchesCategory = r.bpCategory.toLowerCase() === selectedCategory.toLowerCase();
      }
    }

    return matchesSearch && matchesCategory;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date_desc') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    if (sortBy === 'date_asc') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    if (sortBy === 'sys_desc') {
      return b.systolic - a.systolic;
    }
    if (sortBy === 'weight_desc') {
      return b.weight - a.weight;
    }
    return 0;
  });

  // CSV Export
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Tarikh',
      'Masa',
      'Sistolik (mmHg)',
      'Diastolik (mmHg)',
      'Kategori Tekanan Darah',
      'Kadar Nadi (bpm)',
      'Kategori Nadi',
      'Berat (kg)',
      'Tinggi (cm)',
      'BMI',
      'Kategori BMI',
      'Sumber',
      'Ubat Diambil',
      'Simptom',
      'Nota Peribadi',
    ];

    const rows = sorted.map((r) => [
      r.id,
      r.date,
      r.time,
      r.systolic,
      r.diastolic,
      `"${r.bpCategory}"`,
      r.pulse,
      `"${r.pulseCategory}"`,
      r.weight,
      r.height,
      r.bmi,
      `"${r.bmiCategory}"`,
      r.source,
      `"${r.medicationTaken || ''}"`,
      `"${(r.symptoms || []).join(', ')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekod_Kesihatan_SihatKu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              Jurnal Rekod Kesihatan Peribadi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Jumlah {records.length} rekod tersimpan. Pantau sejarah bacaan, ubat, dan nota peribadi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Eksport CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekod</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Cari nota, ubat (contoh: Amlodipine), atau simptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">Semua Status BP</option>
              <option value="Normal">Normal</option>
              <option value="Pra-Hipertensi">Pra-Hipertensi</option>
              <option value="hipertensi">Hipertensi (Tahap 1 & 2)</option>
              <option value="Hipotensi">Hipotensi</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="date_desc">Tarikh (Terkini)</option>
              <option value="date_asc">Tarikh (Terdahulu)</option>
              <option value="sys_desc">Sistolik Tertinggi</option>
              <option value="weight_desc">Berat Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {sorted.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Tiada rekod memenuhi kriteria carian. Sila cuba kata kunci lain atau tambah rekod baru.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-bold">Tarikh & Masa</th>
                  <th className="py-3 px-4 font-bold">Tekanan Darah</th>
                  <th className="py-3 px-4 font-bold">Status Kategori</th>
                  <th className="py-3 px-4 font-bold">Nadi (BPM)</th>
                  <th className="py-3 px-4 font-bold">Berat / BMI</th>
                  <th className="py-3 px-4 font-bold">Ubat & Nota Peribadi</th>
                  <th className="py-3 px-4 font-bold text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sorted.map((rec) => {
                  const bpColors = getBPCategoryColor(rec.bpCategory);
                  const bmiColors = getBMICategoryColor(rec.bmiCategory);

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {rec.date}
                          {rec.source === 'wearable_bluetooth' && (
                            <span title="Data dari Smartwatch BLE">
                              <Watch className="w-3.5 h-3.5 text-blue-500" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{rec.time}</div>
                      </td>

                      {/* Blood Pressure */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white text-sm">
                        {rec.systolic} / {rec.diastolic}{' '}
                        <span className="text-[11px] font-normal text-slate-400">mmHg</span>
                      </td>

                      {/* BP Category Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${bpColors.badge}`}
                        >
                          {rec.bpCategory.replace('-', ' ')}
                        </span>
                      </td>

                      {/* Pulse */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {rec.pulse}
                        </span>{' '}
                        <span className="text-slate-400 text-[11px]">bpm</span>
                      </td>

                      {/* Weight & BMI */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {rec.weight} kg
                        </div>
                        <div className={`text-[11px] font-medium ${bmiColors.text}`}>
                          BMI: {rec.bmi}
                        </div>
                      </td>

                      {/* Notes & Meds */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="space-y-1">
                          {rec.medicationTaken && (
                            <div className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-blue-200 dark:border-blue-900">
                              <Pill className="w-2.5 h-2.5" />
                              {rec.medicationTaken}
                            </div>
                          )}

                          {rec.symptoms && rec.symptoms.length > 0 && rec.symptoms[0] !== 'Tiada Simptom (Sihat)' && (
                            <div className="flex flex-wrap gap-1">
                              {rec.symptoms.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

                          {rec.notes ? (
                            <p className="text-slate-600 dark:text-slate-300 italic text-xs leading-relaxed">
                              &ldquo;{rec.notes}&rdquo;
                            </p>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onEditRecord(rec)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Sunting Rekod"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Adakah anda pasti ingin memadamkan rekod ini?')) {
                                onDeleteRecord(rec.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                            title="Padam Rekod"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
