import React from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  CloudCheck,
  CloudUpload,
  FileText,
  Heart,
  Moon,
  Sun,
  Watch,
  Send,
  ShieldCheck,
  Bell,
  BookOpen,
  GitBranch,
} from 'lucide-react';
import { UserProfile } from '../types/health';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  isSyncing: boolean;
  onManualSync: () => void;
  onOpenAddModal: () => void;
  unreadAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  currentUser,
  allUsers,
  onSelectUser,
  isSyncing,
  onManualSync,
  onOpenAddModal,
  unreadAlertCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-red-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  Sihat<span className="text-rose-600 dark:text-rose-500">Ku</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  Rekod Kesihatan
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Pemantauan Tekanan Darah & Nadi Bersepadu
              </p>
            </div>
          </div>

          {/* Quick Action & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Sync Status Button */}
            <button
              onClick={onManualSync}
              title="Status Penyegerakan Awan (Klik untuk segerak manual)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {isSyncing ? (
                <>
                  <CloudUpload className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span className="hidden md:inline">Menyegerak...</span>
                </>
              ) : (
                <>
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden md:inline">Awan Disegerak</span>
                </>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Tukar ke Mod Cerah' : 'Tukar ke Mod Gelap (Waktu Malam)'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Selector Dropdown */}
            <div className="relative">
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const found = allUsers.find((u) => u.id === e.target.value);
                  if (found) onSelectUser(found);
                }}
                className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name.split(' ')[0]} ({u.gender})
                  </option>
                ))}
              </select>
            </div>

            {/* Add Record Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm shadow-rose-600/20 transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>+ Rekod Baharu</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Utama
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === 'trends'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Graf Mingguan
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === 'journal'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Jurnal Rekod
          </button>

          <button
            onClick={() => setActiveTab('wearable')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === 'wearable'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Watch className="w-3.5 h-3.5 text-blue-500" />
            Peranti Pintar
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors relative ${
              activeTab === 'reminders'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Peringatan Harian
            {unreadAlertCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1.5 right-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === 'pdf'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            Laporan PDF
          </button>

          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === 'doctor'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-teal-500" />
            E-mel Doktor
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === 'articles'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            Panduan Kesihatan
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ml-auto ${
              activeTab === 'admin'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            CMS Admin
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeTab === 'github'
                ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            GitHub CI/CD
          </button>
        </div>
      </div>
    </header>
  );
};
