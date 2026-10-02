import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  Info,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Watch,
  Zap,
} from 'lucide-react';
import { HealthRecord, UserProfile, ReminderSetting, SystemBroadcast, WearableDevice } from '../types/health';
import {
  getBPCategoryColor,
  getBMICategoryColor,
  calculateStats,
} from '../utils/healthCalculations';

interface DashboardOverviewProps {
  records: HealthRecord[];
  profile: UserProfile;
  reminders: ReminderSetting[];
  broadcasts: SystemBroadcast[];
  wearable: WearableDevice;
  onOpenAddModal: () => void;
  onNavigate: (tab: string) => void;
  onOpenWearableModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  records,
  profile,
  reminders,
  broadcasts,
  wearable,
  onOpenAddModal,
  onNavigate,
  onOpenWearableModal,
}) => {
  // Sort descending by timestamp
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const latestRecord = sortedRecords[0] || null;
  const previousRecord = sortedRecords[1] || null;

  const stats = calculateStats(records);
  const activeBroadcast = broadcasts.find((b) => b.active);

  // Systolic difference vs previous
  const sysDiff = previousRecord && latestRecord ? latestRecord.systolic - previousRecord.systolic : 0;
  // Weight difference vs target
  const weightToTarget = latestRecord ? Number((latestRecord.weight - profile.targetWeight).toFixed(1)) : 0;

  // BP colors
  const bpColors = latestRecord ? getBPCategoryColor(latestRecord.bpCategory) : null;
  const bmiColors = latestRecord ? getBMICategoryColor(latestRecord.bmiCategory) : null;

  return (
    <div className="space-y-6">
      {/* System Broadcast Announcement if present */}
      {activeBroadcast && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-4 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-blue-900 dark:text-blue-200 block">
              {activeBroadcast.title}
            </span>
            <span className="text-blue-700 dark:text-blue-300">
              {activeBroadcast.message}
            </span>
          </div>
          <span className="text-xs text-blue-500 whitespace-nowrap">
            {activeBroadcast.createdDate}
          </span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 p-6 sm:p-8 text-white shadow-lg shadow-rose-600/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Pemantauan Kesihatan Pintar & Dinamik</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Kembali, {profile.name}!
            </h1>
            <p className="text-white/90 text-sm leading-relaxed">
              Pemantauan berterusan membantu mencegah risiko komplikasi kardiovaskular. Anda mempunyai{' '}
              <strong className="underline underline-offset-2">{records.length} bacaan</strong> direkodkan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="bg-white text-rose-600 hover:bg-slate-100 font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
            >
              + Catat Bacaan Hari Ini
            </button>
            <button
              onClick={() => onNavigate('trends')}
              className="bg-rose-700/60 hover:bg-rose-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl backdrop-blur transition-colors"
            >
              Lihat Graf Mingguan
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-36 -top-12 w-32 h-32 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tekanan Darah Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tekanan Darah Terkini
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {latestRecord ? `${latestRecord.systolic}/${latestRecord.diastolic}` : '--/--'}
            </span>
            <span className="text-xs font-medium text-slate-500">mmHg</span>
          </div>

          {latestRecord && bpColors && (
            <div className="mt-3 flex items-center justify-between">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${bpColors.badge}`}
              >
                {latestRecord.bpCategory.replace('-', ' ')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                {sysDiff > 0 ? (
                  <span className="text-rose-500 flex items-center font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{sysDiff}
                  </span>
                ) : sysDiff < 0 ? (
                  <span className="text-emerald-500 flex items-center font-medium">
                    <ArrowDownRight className="w-3.5 h-3.5" /> {sysDiff}
                  </span>
                ) : (
                  <span>Kekal</span>
                )}
              </span>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Sasaran: &lt; {profile.targetSystolic}/{profile.targetDiastolic}</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {latestRecord ? latestRecord.date : '-'}
            </span>
          </div>
        </div>

        {/* 2. Berat Badan & BMI Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Berat Badan & BMI
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {latestRecord ? latestRecord.weight : '--'}
            </span>
            <span className="text-xs font-medium text-slate-500">kg</span>
            {latestRecord && (
              <span className="ml-auto text-sm font-semibold text-slate-700 dark:text-slate-300">
                BMI: {latestRecord.bmi}
              </span>
            )}
          </div>

          {latestRecord && bmiColors && (
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${bmiColors.badge}`}>
                {latestRecord.bmiCategory.replace('-', ' ')}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {weightToTarget > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    +{weightToTarget} kg ke sasaran
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Capai sasaran!
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Sasaran: {profile.targetWeight} kg</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Tinggi: {profile.height} cm</span>
          </div>
        </div>

        {/* 3. Denyutan Jantung & Wearable */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Denyutan Nadi (BPM)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Heart className="w-4 h-4 fill-emerald-500/20" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {wearable.connected && wearable.currentLivePulse ? wearable.currentLivePulse : latestRecord ? latestRecord.pulse : '--'}
            </span>
            <span className="text-xs font-medium text-slate-500">bpm</span>
            {wearable.connected && (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Wearable
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              {latestRecord ? latestRecord.pulseCategory : 'Normal'}
            </span>
            <button
              onClick={onOpenWearableModal}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <Watch className="w-3 h-3" />
              Urus Peranti
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Julat Normal: 60 - 100</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {wearable.name.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* 4. Purata & Kepatuhan Mingguan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Prestasi 14 Hari
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.avgSystolic}/{stats.avgDiastolic}
            </span>
            <span className="text-xs font-medium text-slate-500">purata</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">
              Perubahan Berat:
            </span>
            <span className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              {stats.weeklyWeightChange < 0 ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5" /> {stats.weeklyWeightChange} kg
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5" /> +{stats.weeklyWeightChange} kg
                </>
              )}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{stats.count} bacaan tersimpan</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              98% Kepatuhan
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Mini Weekly Trend + Today's Reminders + Quick Personal Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Trend Snapshot */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Trend Pantas Tekanan Darah (7 Hari Terkini)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Garis Sistolik (Atas) & Diastolik (Bawah)
              </p>
            </div>
            <button
              onClick={() => onNavigate('trends')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              Lihat Graf Penuh <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simple Mini Visualizer */}
          <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2">
            {sortedRecords.slice(0, 7).reverse().map((rec) => {
              const sysHeight = Math.max(20, Math.min(100, ((rec.systolic - 80) / (160 - 80)) * 100));
              const isHigh = rec.systolic >= 140;

              return (
                <div key={rec.id} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-rose-600 transition-colors">
                    {rec.systolic}
                  </span>
                  <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800 rounded-t-lg flex flex-col justify-end h-32 p-1 overflow-hidden">
                    <div
                      style={{ height: `${sysHeight}%` }}
                      className={`w-full rounded-md transition-all ${
                        isHigh
                          ? 'bg-gradient-to-t from-rose-500 to-rose-400'
                          : 'bg-gradient-to-t from-emerald-500 to-teal-400'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                    {rec.date.substring(5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal (&lt;130)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Melebihi Sasaran
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Sasaran klinikal: 120/80 mmHg
            </span>
          </div>
        </div>

        {/* Right 1 Col: Peringatan Harian & Peranti */}
        <div className="space-y-4">
          {/* Reminders Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Jadual Peringatan Hari Ini
                </h3>
              </div>
              <button
                onClick={() => onNavigate('reminders')}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
              >
                Urus
              </button>
            </div>

            <div className="space-y-2.5">
              {reminders.slice(0, 3).map((rem) => (
                <div
                  key={rem.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                      {rem.time}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {rem.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Aktif
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 text-center">
              <button
                onClick={() => onNavigate('reminders')}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                + Tambah Peringatan Tersuai
              </button>
            </div>
          </div>

          {/* Wearable Connection Status Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Watch className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold">Peranti Boleh Pakai</h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <p className="text-xs text-slate-300 mb-3">
              {wearable.name} • Bateri {wearable.batteryLevel}%
            </p>

            <div className="flex items-center justify-between text-xs bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-slate-400">Denyutan Semasa:</span>
              <span className="font-mono font-extrabold text-emerald-400 text-sm">
                {wearable.currentLivePulse || 72} BPM
              </span>
            </div>

            <button
              onClick={onOpenWearableModal}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
            >
              Buka Monitor Nadi Langsung
            </button>
          </div>
        </div>
      </div>

      {/* Recent Records Table Snippet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Log Rekod Terbaharu
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Termasuk catatan ubat & nota peribadi
            </p>
          </div>
          <button
            onClick={() => onNavigate('journal')}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            Lihat Semua ({records.length} Rekod) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 font-semibold">Tarikh & Masa</th>
                <th className="py-2.5 font-semibold">Tekanan Darah</th>
                <th className="py-2.5 font-semibold">Status Kategori</th>
                <th className="py-2.5 font-semibold">Nadi (BPM)</th>
                <th className="py-2.5 font-semibold">Berat / BMI</th>
                <th className="py-2.5 font-semibold">Nota & Ubat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedRecords.slice(0, 5).map((rec) => {
                const color = getBPCategoryColor(rec.bpCategory);
                return (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                      <div>{rec.date}</div>
                      <div className="text-[11px] text-slate-400">{rec.time}</div>
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white text-sm">
                      {rec.systolic} / {rec.diastolic}{' '}
                      <span className="text-[11px] font-normal text-slate-400">mmHg</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${color.badge}`}>
                        {rec.bpCategory.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {rec.pulse} bpm
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">{rec.weight} kg</span>{' '}
                      <span className="text-slate-400 text-[11px]">(BMI {rec.bmi})</span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {rec.medicationTaken && (
                        <span className="inline-block bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-[10px] mr-1 font-medium">
                          {rec.medicationTaken}
                        </span>
                      )}
                      <span>{rec.notes || '-'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
