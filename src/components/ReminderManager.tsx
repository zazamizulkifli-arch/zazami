import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Check,
  Clock,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { ReminderSetting } from '../types/health';

interface ReminderManagerProps {
  reminders: ReminderSetting[];
  onUpdateReminders: (reminders: ReminderSetting[]) => void;
}

const DAYS_OF_WEEK: ('Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat' | 'Sabtu' | 'Ahad')[] = [
  'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'
];

export const ReminderManager: React.FC<ReminderManagerProps> = ({
  reminders,
  onUpdateReminders,
}) => {
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [testNotificationToast, setTestNotificationToast] = useState<string | null>(null);

  // Form states for adding reminder
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [type, setType] = useState<ReminderSetting['type']>('tekanan_darah');
  const [selectedDays, setSelectedDays] = useState<typeof DAYS_OF_WEEK>([
    'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'
  ]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Request browser Web Notification permission
  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('SihatKu: Kebenaran Diberikan!', {
          body: 'Pemberitahuan peringatan harian anda kini aktif.',
        });
      }
    }
  };

  // Immediate Test Notification
  const handleTestNotification = () => {
    const msg = `Peringatan: Masa untuk memeriksa Tekanan Darah dan merekodkannya dalam SihatKu!`;
    setTestNotificationToast(msg);

    // Audio chime synthesis using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio fallback silent
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('SihatKu Peringatan Harian', {
        body: msg,
      });
    }

    setTimeout(() => {
      setTestNotificationToast(null);
    }, 5000);
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    onUpdateReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    onUpdateReminders(updated);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReminder: ReminderSetting = {
      id: `rem_${Date.now()}`,
      title: title.trim(),
      time,
      days: selectedDays,
      enabled: true,
      type,
      soundEnabled,
    };

    onUpdateReminders([...reminders, newReminder]);
    setShowAddForm(false);
    setTitle('');
  };

  const toggleDay = (day: (typeof DAYS_OF_WEEK)[number]) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Notification Banner Toast */}
      {testNotificationToast && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 p-4 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white animate-bounce">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-100 text-sm block">
                Ujian Pemberitahuan Berjaya!
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 text-xs">
                {testNotificationToast}
              </span>
            </div>
          </div>
          <button
            onClick={() => setTestNotificationToast(null)}
            className="text-xs font-bold text-emerald-800 dark:text-emerald-200 px-3 py-1.5 rounded-lg bg-emerald-200/60 dark:bg-emerald-900/60 hover:bg-emerald-200"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header & Permission Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-500" />
              Sistem Pemberitahuan & Peringatan Harian
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tetapkan jadual peringatan automatik untuk mengukur tekanan darah, timbang berat badan, dan jadual ubat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestNotification}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              <BellRing className="w-4 h-4 text-rose-500" />
              <span>Uji Peringatan Sekarang</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Tutup Borang' : 'Tambah Peringatan'}</span>
            </button>
          </div>
        </div>

        {/* Browser Permission Status */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-700 dark:text-slate-300">
              Status Notifikasi Pelayar:{' '}
              <strong className="capitalize">
                {notificationPermission === 'granted'
                  ? 'Diaktifkan (Dibenarkan)'
                  : 'Belum Dibenarkan'}
              </strong>
            </span>
          </div>

          {notificationPermission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
            >
              Benarkan Notifikasi Pelayar
            </button>
          )}
        </div>
      </div>

      {/* Add New Reminder Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateReminder}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-500" />
            Cipta Jadual Peringatan Baharu
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tajuk Peringatan
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Ukur TD Petang / Ubat Kolesterol"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Waktu Pemberitahuan
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Peringatan
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="tekanan_darah">Pemeriksaan Tekanan Darah</option>
                <option value="berat_badan">Timbang Berat Badan</option>
                <option value="ubat">Pengambilan Ubat</option>
                <option value="senaman">Aktiviti Senaman</option>
                <option value="air">Minum Air Kosong</option>
              </select>
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Hari Berulang
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                      active
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              Mainkan nada bunyi loceng semasa peringatan
            </label>

            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              Simpan Peringatan
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-5 rounded-2xl border transition-all ${
              rem.enabled
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-black text-slate-900 dark:text-white">
                    {rem.time}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    {rem.type.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {rem.title}
                </h3>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => handleToggleReminder(rem.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  rem.enabled ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    rem.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Days list */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1 text-[11px] truncate max-w-[220px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{rem.days.join(', ')}</span>
              </div>

              <div className="flex items-center gap-2">
                {rem.soundEnabled ? (
                  <span title="Bunyi diaktifkan">
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                  </span>
                ) : (
                  <span title="Senyap">
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  </span>
                )}
                <button
                  onClick={() => handleDeleteReminder(rem.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                  title="Padam"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
