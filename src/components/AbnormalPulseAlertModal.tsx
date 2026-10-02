import React from 'react';
import {
  AlertOctagon,
  Heart,
  PhoneCall,
  ShieldAlert,
  X,
  Send,
  CheckCircle,
} from 'lucide-react';
import { UserProfile } from '../types/health';

interface AbnormalPulseAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  bpm: number;
  message: string;
  profile: UserProfile;
  onOpenDoctorModal: () => void;
}

export const AbnormalPulseAlertModal: React.FC<AbnormalPulseAlertModalProps> = ({
  isOpen,
  onClose,
  bpm,
  message,
  profile,
  onOpenDoctorModal,
}) => {
  if (!isOpen) return null;

  const isHigh = bpm > 100;
  const isCritical = bpm >= 140 || bpm <= 45;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden my-8">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white text-center relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-3 animate-pulse">
            <Heart className="w-8 h-8 fill-white text-white" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wide">
            Amaran Nadi Tidak Normal!
          </h2>
          <p className="text-white/90 text-xs mt-1">
            Sistem Pemantauan Autonomi SihatKu Mengesan Anomali Kardia
          </p>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Main Reading Highlight */}
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-center">
            <span className="text-xs uppercase font-bold text-red-600 dark:text-red-400">
              Kadar Denyutan Terkini
            </span>
            <div className="my-1 flex items-baseline justify-center gap-2">
              <span className="text-5xl font-extrabold text-red-700 dark:text-red-400 font-mono">
                {bpm}
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">BPM</span>
            </div>
            <p className="text-xs font-semibold text-red-800 dark:text-red-300">
              {isHigh ? 'Takikardia (Denyutan Laju Waktu Rehat)' : 'Bradikardia (Denyutan Terlalu Perlahan)'}
            </p>
            <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{message}</p>
          </div>

          {/* Action Steps Checklist */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Langkah Keselamatan Segera:
            </h3>

            <div className="space-y-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>Bertenang dan Duduk Bersandar:</strong> Hentikan semua aktiviti fizikal, lepaskan pakaian ketat, dan bernafas perlahan-lahan.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>Minum Air Kosong Suam:</strong> Dehidrasi adalah punca biasa denyutan jantung laju (takikardia).
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>Uji Bacaan Semula Dalam 5 Minit:</strong> Jika bacaan berterusan tidak normal, segera hubungi doktor atau waris.
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Hotline Contact */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200 block">
                Talian Kecemasan Malaysia (MERS 999)
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-300">
                Waris Kecemasan: {profile.emergencyContact || 'Keluarga Terdekat'} ({profile.emergencyPhone || '012-XXXXXXX'})
              </span>
            </div>
            <a
              href="tel:999"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              999
            </a>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenDoctorModal();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              E-mel Laporan Kepada Doktor
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Saya Faham, Teruskan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
