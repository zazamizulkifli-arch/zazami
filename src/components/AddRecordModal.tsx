import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Heart,
  Pill,
  Scale,
  Sparkles,
  X,
} from 'lucide-react';
import { HealthRecord, UserProfile } from '../types/health';
import {
  classifyBloodPressure,
  calculateBMI,
  classifyPulse,
  isAbnormalPulse,
  getBPCategoryColor,
} from '../utils/healthCalculations';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (record: HealthRecord) => void;
  profile: UserProfile;
  initialRecord?: HealthRecord | null;
  onTriggerAbnormalPulseAlert: (bpm: number, message: string) => void;
}

const COMMON_SYMPTOMS = [
  'Tiada Simptom (Sihat)',
  'Pening / Sakit Kepala',
  'Jantung Berdebar',
  'Rasa Letih / Lesu',
  'Sakit / Ketat Dada',
  'Sesak Nafas Ringan',
  'Kebas Jari / Kaki',
  'Kabus Fikiran / Stres',
];

const COMMON_ACTIVITIES = [
  { id: 'bangun_tidur', label: 'Bangun Tidur (Pagi)' },
  { id: 'rehat', label: 'Waktu Rehat / Duduk' },
  { id: 'selepas_makan', label: 'Selepas Makan' },
  { id: 'selepas_senaman', label: 'Selepas Senaman' },
  { id: 'sebelum_tidur', label: 'Sebelum Tidur (Malam)' },
];

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onSaveRecord,
  profile,
  initialRecord,
  onTriggerAbnormalPulseAlert,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const [date, setDate] = useState(initialRecord ? initialRecord.date : defaultDate);
  const [time, setTime] = useState(initialRecord ? initialRecord.time : defaultTime);
  const [systolic, setSystolic] = useState<number>(initialRecord ? initialRecord.systolic : 120);
  const [diastolic, setDiastolic] = useState<number>(initialRecord ? initialRecord.diastolic : 80);
  const [weight, setWeight] = useState<number>(initialRecord ? initialRecord.weight : 75.0);
  const [pulse, setPulse] = useState<number>(initialRecord ? initialRecord.pulse : 72);
  const [notes, setNotes] = useState<string>(initialRecord?.notes || '');
  const [medicationTaken, setMedicationTaken] = useState<string>(
    initialRecord?.medicationTaken || (profile.currentMedications ? profile.currentMedications[0] : '')
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    initialRecord?.symptoms || ['Tiada Simptom (Sihat)']
  );
  const [stressLevel, setStressLevel] = useState<number>(initialRecord?.stressLevel || 2);
  const [activityContext, setActivityContext] = useState<any>(
    initialRecord?.activityContext || 'rehat'
  );

  // Dynamic preview calculations
  const bpCategory = classifyBloodPressure(systolic, diastolic);
  const bpColors = getBPCategoryColor(bpCategory);
  const { bmi, category: bmiCategory } = calculateBMI(weight, profile.height);
  const pulseCategory = classifyPulse(pulse);
  const pulseAlert = isAbnormalPulse(pulse);

  const toggleSymptom = (sym: string) => {
    if (sym === 'Tiada Simptom (Sihat)') {
      setSelectedSymptoms(['Tiada Simptom (Sihat)']);
      return;
    }
    const filtered = selectedSymptoms.filter((s) => s !== 'Tiada Simptom (Sihat)');
    if (filtered.includes(sym)) {
      const remaining = filtered.filter((s) => s !== sym);
      setSelectedSymptoms(remaining.length === 0 ? ['Tiada Simptom (Sihat)'] : remaining);
    } else {
      setSelectedSymptoms([...filtered, sym]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date(`${date}T${time}:00`).toISOString();

    const newRecord: HealthRecord = {
      id: initialRecord ? initialRecord.id : `rec_${Date.now()}`,
      userId: profile.id,
      timestamp,
      date,
      time,
      systolic,
      diastolic,
      bpCategory,
      weight,
      height: profile.height,
      bmi,
      bmiCategory,
      pulse,
      pulseCategory,
      source: initialRecord?.source || 'manual',
      notes: notes.trim(),
      symptoms: selectedSymptoms,
      medicationTaken: medicationTaken.trim(),
      stressLevel: stressLevel as any,
      activityContext,
    };

    onSaveRecord(newRecord);

    // If abnormal pulse is detected, trigger the alert notification immediately!
    if (pulseAlert.isAbnormal) {
      onTriggerAbnormalPulseAlert(pulse, pulseAlert.message);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500 text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialRecord ? 'Kemaskini Rekod Kesihatan' : 'Catat Rekod Kesihatan Baharu'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pesakit: {profile.name} (Tinggi: {profile.height} cm)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tarikh Pemeriksaan
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Masa Pemeriksaan
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Section 1: Tekanan Darah (Systolic & Diastolic) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-500" />
                Tekanan Darah (Blood Pressure - mmHg)
              </label>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${bpColors.badge}`}>
                {bpCategory.replace('-', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Sistolik (Atas)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="70"
                    max="240"
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    required
                    className="w-full text-xl font-bold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-400">mmHg</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Diastolik (Bawah)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="40"
                    max="140"
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    required
                    className="w-full text-xl font-bold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-400">mmHg</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sasaran normal individu dewasa: &lt; 120/80 mmHg (CPG Hipertensi Malaysia).
            </p>
          </div>

          {/* Section 2: Berat Badan & Denyutan Jantung */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weight */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-500" />
                  Berat Badan
                </label>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  BMI: {bmi} ({bmiCategory})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  required
                  className="w-full text-xl font-bold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400">kg</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sasaran: {profile.targetWeight} kg (Tinggi: {profile.height} cm)
              </p>
            </div>

            {/* Pulse */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Denyutan Jantung (Nadi)
                </label>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    pulseAlert.isAbnormal
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {pulseCategory}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="35"
                  max="220"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                  required
                  className="w-full text-xl font-bold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400">BPM</span>
              </div>
              {pulseAlert.isAbnormal ? (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {pulseAlert.message}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500">Julat normal rehat: 60 - 100 bpm</p>
              )}
            </div>
          </div>

          {/* Section 3: Keadaan Aktiviti & Tahap Stres */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Konteks / Keadaan Pemeriksaan
              </label>
              <select
                value={activityContext}
                onChange={(e) => setActivityContext(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                {COMMON_ACTIVITIES.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tahap Stres (1: Tenang - 5: Sangat Stres)
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setStressLevel(lvl)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      stressLevel === lvl
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Simptom Yang Dirasai */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Simptom Yang Dialami Waktu Bacaan
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800 font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Ubat Yang Diambil */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-blue-500" />
              Ubat Yang Diambil (Jika Ada)
            </label>
            <input
              type="text"
              value={medicationTaken}
              onChange={(e) => setMedicationTaken(e.target.value)}
              placeholder="Contoh: Amlodipine 5mg, Perindopril 4mg"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Section 6: Nota Peribadi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nota Peribadi / Catatan Makanan & Rutin
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kurang tidur semalam kerana kerja syif. Minum 2 cawan kopi waktu tengah hari..."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors"
            >
              {initialRecord ? 'Simpan Perubahan' : 'Simpan Rekod Kesihatan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
