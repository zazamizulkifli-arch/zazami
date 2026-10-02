import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  Bluetooth,
  CheckCircle,
  Heart,
  Play,
  Square,
  Watch,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { WearableDevice, HealthRecord, UserProfile } from '../types/health';
import { bluetoothHRManager } from '../utils/bluetooth';
import { isAbnormalPulse } from '../utils/healthCalculations';

interface WearableSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  wearable: WearableDevice;
  onUpdateWearable: (device: WearableDevice) => void;
  onAutoSaveWearablePulse: (bpm: number) => void;
  onTriggerAbnormalPulseAlert: (bpm: number, message: string) => void;
}

const PRESET_WEARABLES = [
  { name: 'Apple Watch Series 9 (Ultra 2)', brand: 'Apple' as const, battery: 88 },
  { name: 'Samsung Galaxy Watch 6 Pro', brand: 'Samsung' as const, battery: 74 },
  { name: 'Garmin Forerunner 965 HRM', brand: 'Garmin' as const, battery: 92 },
  { name: 'Fitbit Sense 2 EDA/ECG', brand: 'Fitbit' as const, battery: 65 },
];

export const WearableSyncModal: React.FC<WearableSyncModalProps> = ({
  isOpen,
  onClose,
  wearable,
  onUpdateWearable,
  onAutoSaveWearablePulse,
  onTriggerAbnormalPulseAlert,
}) => {
  const [currentBpm, setCurrentBpm] = useState<number>(wearable.currentLivePulse || 72);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(wearable.isStreaming);
  const [bleStatusMsg, setBleStatusMsg] = useState<string>('');
  const [isScanningBLE, setIsScanningBLE] = useState<boolean>(false);
  const [autoRecordEnabled, setAutoRecordEnabled] = useState<boolean>(true);

  // Subscribe to Bluetooth manager stream
  useEffect(() => {
    const unsubscribe = bluetoothHRManager.subscribe((bpm) => {
      setCurrentBpm(bpm);
      onUpdateWearable({
        ...wearable,
        currentLivePulse: bpm,
        lastSyncTime: new Date().toISOString(),
      });

      // Check abnormal
      const alert = isAbnormalPulse(bpm);
      if (alert.isAbnormal) {
        onTriggerAbnormalPulseAlert(bpm, alert.message);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [wearable, onUpdateWearable, onTriggerAbnormalPulseAlert]);

  if (!isOpen) return null;

  // Toggle Live Streaming Simulator
  const toggleLiveStreaming = () => {
    if (isLiveStreaming) {
      bluetoothHRManager.stopSimulation();
      setIsLiveStreaming(false);
      onUpdateWearable({ ...wearable, isStreaming: false });
    } else {
      bluetoothHRManager.startSimulation(currentBpm, false);
      setIsLiveStreaming(true);
      onUpdateWearable({ ...wearable, isStreaming: true });
    }
  };

  // Connect via real Web Bluetooth
  const handleConnectBLE = async () => {
    setIsScanningBLE(true);
    setBleStatusMsg('Mengimbas peranti Bluetooth berdekatan...');
    const result = await bluetoothHRManager.connectRealDevice();
    setIsScanningBLE(false);

    if (result.success) {
      setBleStatusMsg(`Berjaya disambungkan ke ${result.deviceName}!`);
      onUpdateWearable({
        ...wearable,
        name: result.deviceName || 'Peranti Pintar BLE',
        connected: true,
      });
      setIsLiveStreaming(true);
    } else {
      setBleStatusMsg(result.error || 'Gagal menyambung ke peranti Bluetooth.');
    }
  };

  // Trigger simulated abnormal spike/dip
  const handleSimulateAbnormal = (type: 'tachycardia' | 'bradycardia') => {
    const abnormalBpm = type === 'tachycardia' ? 128 : 46;
    setCurrentBpm(abnormalBpm);
    onUpdateWearable({
      ...wearable,
      currentLivePulse: abnormalBpm,
      lastSyncTime: new Date().toISOString(),
    });

    const alert = isAbnormalPulse(abnormalBpm);
    onTriggerAbnormalPulseAlert(abnormalBpm, alert.message);
  };

  const handleManualRecordPulse = () => {
    onAutoSaveWearablePulse(currentBpm);
  };

  const pulseStatus = isAbnormalPulse(currentBpm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Integrasi Peranti Boleh Pakai (Wearable)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pemantauan Autonomi Kadar Nadi & Ritma Jantung
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
        <div className="p-6 space-y-6">
          {/* Live ECG Wave & Pulse Display Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                  {wearable.name}
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                Bateri {wearable.batteryLevel}%
              </span>
            </div>

            {/* Pulse Number */}
            <div className="my-5 flex items-baseline justify-center gap-3">
              <Heart
                className={`w-10 h-10 ${
                  pulseStatus.isAbnormal
                    ? 'text-rose-500 fill-rose-500 animate-bounce'
                    : 'text-rose-500 fill-rose-500 animate-pulse'
                }`}
              />
              <span className="text-6xl font-black font-mono tracking-tight">
                {currentBpm}
              </span>
              <span className="text-sm font-semibold text-slate-400">BPM</span>
            </div>

            {/* Simulated ECG SVG line */}
            <div className="h-14 w-full flex items-center justify-center overflow-hidden opacity-80">
              <svg viewBox="0 0 400 60" className="w-full h-full stroke-emerald-400 fill-none">
                <path
                  d="M0,30 L60,30 L75,30 L85,10 L95,50 L105,20 L115,35 L125,30 L200,30 L215,30 L225,8 L235,52 L245,18 L255,34 L265,30 L340,30 L355,30 L365,10 L375,50 L385,25 L400,30"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Pulse Status Alert Banner */}
            {pulseStatus.isAbnormal && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{pulseStatus.message}</span>
              </div>
            )}

            {/* Stream toggle button */}
            <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={toggleLiveStreaming}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  isLiveStreaming
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isLiveStreaming ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white" /> Hentikan Pemantauan Live
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" /> Mula Pemantauan Live
                  </>
                )}
              </button>

              <button
                onClick={handleManualRecordPulse}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                + Simpan Nadi Ini
              </button>
            </div>
          </div>

          {/* Test Abnormal Alerts Trigger */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Ujian Sistem Amaran Nadi Tidak Normal (Demo Anomali)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Uji tindak balas amaran kecemasan automatik jika jam pintar mengesan denyutan di luar zon selamat:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleSimulateAbnormal('tachycardia')}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800 transition-colors"
              >
                Uji Takikardia (128 BPM)
              </button>
              <button
                onClick={() => handleSimulateAbnormal('bradycardia')}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-sky-100 hover:bg-sky-200 text-sky-800 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800 transition-colors"
              >
                Uji Bradikardia (46 BPM)
              </button>
            </div>
          </div>

          {/* Preset Wearables Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Pilih Model Jam Pintar / Pengukur Nadi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_WEARABLES.map((dev) => (
                <button
                  key={dev.name}
                  onClick={() =>
                    onUpdateWearable({
                      ...wearable,
                      name: dev.name,
                      brand: dev.brand,
                      batteryLevel: dev.battery,
                    })
                  }
                  className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                    wearable.name === dev.name
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="block truncate">{dev.name}</span>
                    <span className="text-[10px] text-slate-400">Bateri {dev.battery}%</span>
                  </div>
                  {wearable.name === dev.name && (
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Real Web Bluetooth Connection */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Bluetooth className="w-4 h-4 text-blue-600" />
                Sambungan Peranti Bluetooth Sebenar (Web Bluetooth BLE)
              </span>
              <button
                onClick={handleConnectBLE}
                disabled={isScanningBLE}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isScanningBLE ? 'Mengimbas...' : 'Imbas Bluetooth'}
              </button>
            </div>
            {bleStatusMsg && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                {bleStatusMsg}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
