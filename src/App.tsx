/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { WeeklyTrendsChart } from './components/WeeklyTrendsChart';
import { RecordsJournal } from './components/RecordsJournal';
import { WearableSyncModal } from './components/WearableSyncModal';
import { AbnormalPulseAlertModal } from './components/AbnormalPulseAlertModal';
import { DoctorShareModal } from './components/DoctorShareModal';
import { PdfReportGenerator } from './components/PdfReportGenerator';
import { ReminderManager } from './components/ReminderManager';
import { HealthArticlesView } from './components/HealthArticlesView';
import { AdminCMSPortal } from './components/AdminCMSPortal';
import { GitHubPagesGuide } from './components/GitHubPagesGuide';
import { AddRecordModal } from './components/AddRecordModal';

import {
  HealthRecord,
  UserProfile,
  ReminderSetting,
  CMSArticle,
  SystemBroadcast,
  WearableDevice,
} from './types/health';
import {
  getStoredRecords,
  saveStoredRecords,
  getStoredUserProfile,
  saveStoredUserProfile,
  getAllUsers,
  saveAllUsers,
  getStoredReminders,
  saveStoredReminders,
  getStoredArticles,
  saveStoredArticles,
  getStoredBroadcasts,
  saveStoredBroadcasts,
  getStoredWearable,
  saveStoredWearable,
} from './utils/storage';
import { classifyBloodPressure, calculateBMI, classifyPulse } from './utils/healthCalculations';

export default function App() {
  // App state
  const [records, setRecords] = useState<HealthRecord[]>(() => getStoredRecords());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getStoredUserProfile());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => getAllUsers());
  const [reminders, setReminders] = useState<ReminderSetting[]>(() => getStoredReminders());
  const [articles, setArticles] = useState<CMSArticle[]>(() => getStoredArticles());
  const [broadcasts, setBroadcasts] = useState<SystemBroadcast[]>(() => getStoredBroadcasts());
  const [wearable, setWearable] = useState<WearableDevice>(() => getStoredWearable());

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sihatku_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [isWearableModalOpen, setIsWearableModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  // Abnormal Pulse Alert
  const [abnormalPulseAlert, setAbnormalPulseAlert] = useState<{
    isOpen: boolean;
    bpm: number;
    message: string;
  }>({
    isOpen: false,
    bpm: 72,
    message: '',
  });

  // Cloud Sync Status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Sync Dark mode to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sihatku_dark_mode', String(darkMode));
  }, [darkMode]);

  // Periodic Cloud Sync simulation
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
      }, 1200);
    }, 60000); // sync every 1 min

    return () => clearInterval(syncInterval);
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncToast('Data berjaya disegerakkan ke pelayan awan selamat.');
      setTimeout(() => setSyncToast(null), 3000);
    }, 1000);
  };

  // Record handlers
  const handleSaveRecord = (newRec: HealthRecord) => {
    let updated: HealthRecord[];
    if (records.some((r) => r.id === newRec.id)) {
      updated = records.map((r) => (r.id === newRec.id ? newRec : r));
    } else {
      updated = [newRec, ...records];
    }
    setRecords(updated);
    saveStoredRecords(updated);
    setEditingRecord(null);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveStoredRecords(updated);
  };

  // User management
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    saveStoredUserProfile(user);
  };

  const handleUpdateUsers = (users: UserProfile[]) => {
    setAllUsers(users);
    saveAllUsers(users);
  };

  // Reminders
  const handleUpdateReminders = (newReminders: ReminderSetting[]) => {
    setReminders(newReminders);
    saveStoredReminders(newReminders);
  };

  // Articles
  const handleUpdateArticles = (newArticles: CMSArticle[]) => {
    setArticles(newArticles);
    saveStoredArticles(newArticles);
  };

  // Broadcasts
  const handleUpdateBroadcasts = (newBc: SystemBroadcast[]) => {
    setBroadcasts(newBc);
    saveStoredBroadcasts(newBc);
  };

  // Wearable
  const handleUpdateWearable = (newWearable: WearableDevice) => {
    setWearable(newWearable);
    saveStoredWearable(newWearable);
  };

  // Auto save pulse from wearable into a record
  const handleAutoSaveWearablePulse = (bpm: number) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Use latest systolic & diastolic or default normal
    const latest = records[0];
    const sys = latest ? latest.systolic : 120;
    const dia = latest ? latest.diastolic : 80;
    const weight = latest ? latest.weight : currentUser.targetWeight;
    const bpCategory = classifyBloodPressure(sys, dia);
    const { bmi, category: bmiCategory } = calculateBMI(weight, currentUser.height);
    const pulseCategory = classifyPulse(bpm);

    const newRecord: HealthRecord = {
      id: `rec_${Date.now()}`,
      userId: currentUser.id,
      timestamp: now.toISOString(),
      date,
      time,
      systolic: sys,
      diastolic: dia,
      bpCategory,
      weight,
      height: currentUser.height,
      bmi,
      bmiCategory,
      pulse: bpm,
      pulseCategory,
      source: 'wearable_bluetooth',
      notes: `Bacaan automatik disegerakkan dari ${wearable.name}.`,
      symptoms: ['Tiada Simptom (Sihat)'],
      activityContext: 'rehat',
    };

    handleSaveRecord(newRecord);
    setSyncToast(`Nadi ${bpm} BPM berjaya direkodkan dari ${wearable.name}!`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Abnormal Pulse Trigger
  const handleTriggerAbnormalPulseAlert = (bpm: number, message: string) => {
    setAbnormalPulseAlert({
      isOpen: true,
      bpm,
      message,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Toast Notification for Sync & Actions */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        onOpenAddModal={() => {
          setEditingRecord(null);
          setIsAddModalOpen(true);
        }}
        unreadAlertCount={abnormalPulseAlert.isOpen ? 1 : 0}
      />

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            records={records}
            profile={currentUser}
            reminders={reminders}
            broadcasts={broadcasts}
            wearable={wearable}
            onOpenAddModal={() => {
              setEditingRecord(null);
              setIsAddModalOpen(true);
            }}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenWearableModal={() => setIsWearableModalOpen(true)}
          />
        )}

        {activeTab === 'trends' && (
          <WeeklyTrendsChart
            records={records}
            profile={currentUser}
            onOpenAddModal={() => {
              setEditingRecord(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'journal' && (
          <RecordsJournal
            records={records}
            onOpenAddModal={() => {
              setEditingRecord(null);
              setIsAddModalOpen(true);
            }}
            onEditRecord={(rec) => {
              setEditingRecord(rec);
              setIsAddModalOpen(true);
            }}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeTab === 'wearable' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Pengurusan Peranti Boleh Pakai (Smartwatch & HRM)
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pantau denyutan jantung masa nyata dan segerakkan data ke jurnal kesihatan secara automatik.
                </p>
              </div>
              <button
                onClick={() => setIsWearableModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Buka Monitor Nadi Langsung
              </button>
            </div>

            <WearableSyncModal
              isOpen={true}
              onClose={() => {}}
              wearable={wearable}
              onUpdateWearable={handleUpdateWearable}
              onAutoSaveWearablePulse={handleAutoSaveWearablePulse}
              onTriggerAbnormalPulseAlert={handleTriggerAbnormalPulseAlert}
            />
          </div>
        )}

        {activeTab === 'reminders' && (
          <ReminderManager
            reminders={reminders}
            onUpdateReminders={handleUpdateReminders}
          />
        )}

        {activeTab === 'pdf' && (
          <PdfReportGenerator
            records={records}
            profile={currentUser}
          />
        )}

        {activeTab === 'doctor' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Kongsi Laporan Kesihatan Kepada Doktor Pakar
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                E-mel ringkasan klinikal rasmi kepada doktor rujukan klinik anda.
              </p>
              <button
                onClick={() => setIsDoctorModalOpen(true)}
                className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Buka Borang E-mel Klinikal
              </button>
            </div>

            <DoctorShareModal
              isOpen={true}
              onClose={() => {}}
              records={records}
              profile={currentUser}
            />
          </div>
        )}

        {activeTab === 'articles' && (
          <HealthArticlesView articles={articles} />
        )}

        {activeTab === 'admin' && (
          <AdminCMSPortal
            allUsers={allUsers}
            onUpdateUsers={handleUpdateUsers}
            currentUser={currentUser}
            onSelectUser={handleSelectUser}
            records={records}
            onUpdateRecords={(recs) => {
              setRecords(recs);
              saveStoredRecords(recs);
            }}
            articles={articles}
            onUpdateArticles={handleUpdateArticles}
            broadcasts={broadcasts}
            onUpdateBroadcasts={handleUpdateBroadcasts}
          />
        )}

        {activeTab === 'github' && (
          <GitHubPagesGuide />
        )}
      </main>

      {/* Floating Add Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        onSaveRecord={handleSaveRecord}
        profile={currentUser}
        initialRecord={editingRecord}
        onTriggerAbnormalPulseAlert={handleTriggerAbnormalPulseAlert}
      />

      {/* Wearable Modal (when opened from other tabs) */}
      {isWearableModalOpen && activeTab !== 'wearable' && (
        <WearableSyncModal
          isOpen={isWearableModalOpen}
          onClose={() => setIsWearableModalOpen(false)}
          wearable={wearable}
          onUpdateWearable={handleUpdateWearable}
          onAutoSaveWearablePulse={handleAutoSaveWearablePulse}
          onTriggerAbnormalPulseAlert={handleTriggerAbnormalPulseAlert}
        />
      )}

      {/* Doctor Modal (when opened from other tabs) */}
      {isDoctorModalOpen && activeTab !== 'doctor' && (
        <DoctorShareModal
          isOpen={isDoctorModalOpen}
          onClose={() => setIsDoctorModalOpen(false)}
          records={records}
          profile={currentUser}
        />
      )}

      {/* Emergency Abnormal Pulse Alert Modal */}
      <AbnormalPulseAlertModal
        isOpen={abnormalPulseAlert.isOpen}
        onClose={() => setAbnormalPulseAlert((prev) => ({ ...prev, isOpen: false }))}
        bpm={abnormalPulseAlert.bpm}
        message={abnormalPulseAlert.message}
        profile={currentUser}
        onOpenDoctorModal={() => {
          setAbnormalPulseAlert((prev) => ({ ...prev, isOpen: false }));
          setIsDoctorModalOpen(true);
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs py-6 text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 <strong>SihatKu</strong> — Portal Rekod Kesihatan Peribadi, Pemantauan Tekanan Darah & CMS Pentadbir.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Garis Panduan CPG Malaysia (KKM)</span>
            <span>•</span>
            <button onClick={() => setActiveTab('github')} className="hover:underline">
              GitHub Pages CI/CD
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('admin')} className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
              Portal CMS
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
