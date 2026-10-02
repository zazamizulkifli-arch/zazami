import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Database,
  Download,
  Edit,
  FileText,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  Eye,
  Megaphone,
} from 'lucide-react';
import {
  UserProfile,
  HealthRecord,
  CMSArticle,
  SystemBroadcast,
} from '../types/health';
import { exportFullDataBackup, restoreDataFromBackup } from '../utils/storage';

interface AdminCMSPortalProps {
  allUsers: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  records: HealthRecord[];
  onUpdateRecords: (records: HealthRecord[]) => void;
  articles: CMSArticle[];
  onUpdateArticles: (articles: CMSArticle[]) => void;
  broadcasts: SystemBroadcast[];
  onUpdateBroadcasts: (broadcasts: SystemBroadcast[]) => void;
}

export const AdminCMSPortal: React.FC<AdminCMSPortalProps> = ({
  allUsers,
  onUpdateUsers,
  currentUser,
  onSelectUser,
  records,
  onUpdateRecords,
  articles,
  onUpdateArticles,
  broadcasts,
  onUpdateBroadcasts,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticated for convenience
  const [adminPin, setAdminPin] = useState<string>('');
  const [activeCmsTab, setActiveCmsTab] = useState<'users' | 'content' | 'broadcasts' | 'system'>('users');

  // New user form state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserAge, setNewUserAge] = useState(40);
  const [newUserGender, setNewUserGender] = useState<'Lelaki' | 'Perempuan'>('Lelaki');
  const [newUserHeight, setNewUserHeight] = useState(170);
  const [newUserTargetWeight, setNewUserTargetWeight] = useState(70);

  // New Article Form state
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState<CMSArticle['category']>('Hipertensi');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artAuthor, setArtAuthor] = useState('Pentadbir SihatKu');

  // New Broadcast Form State
  const [showAddBroadcast, setShowAddBroadcast] = useState(false);
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcSeverity, setBcSeverity] = useState<'info' | 'warning' | 'urgent'>('info');

  // Backup & Restore state
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'admin123' || adminPin === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Katalaluan Pentadbir tidak sah! Gunakan demo PIN: admin123');
    }
  };

  // Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      age: newUserAge,
      gender: newUserGender,
      height: newUserHeight,
      targetWeight: newUserTargetWeight,
      targetSystolic: 120,
      targetDiastolic: 80,
      doctorName: 'Dr. Norazlina binti Sulaiman',
      doctorEmail: 'dr.norazlina@kkm.gov.my',
    };

    onUpdateUsers([...allUsers, newUser]);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleDeleteUser = (id: string) => {
    if (allUsers.length <= 1) {
      alert('Tidak boleh memadamkan satu-satunya pengguna dalam sistem.');
      return;
    }
    if (confirm('Padamkan pengguna ini berserta profil mereka?')) {
      const remaining = allUsers.filter((u) => u.id !== id);
      onUpdateUsers(remaining);
      if (currentUser.id === id) {
        onSelectUser(remaining[0]);
      }
    }
  };

  // Article Management
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArticleId) {
      const updated = articles.map((a) =>
        a.id === editingArticleId
          ? {
              ...a,
              title: artTitle,
              category: artCategory,
              summary: artSummary,
              content: artContent,
              author: artAuthor,
            }
          : a
      );
      onUpdateArticles(updated);
    } else {
      const newArt: CMSArticle = {
        id: `art_${Date.now()}`,
        title: artTitle,
        category: artCategory,
        summary: artSummary,
        content: artContent,
        author: artAuthor,
        publishedDate: new Date().toISOString().split('T')[0],
        readTimeMinutes: Math.max(2, Math.ceil(artContent.length / 500)),
        isPublished: true,
      };
      onUpdateArticles([...articles, newArt]);
    }

    setShowAddArticleModal(false);
    setEditingArticleId(null);
    setArtTitle('');
    setArtSummary('');
    setArtContent('');
  };

  const handleEditArticle = (art: CMSArticle) => {
    setEditingArticleId(art.id);
    setArtTitle(art.title);
    setArtCategory(art.category);
    setArtSummary(art.summary);
    setArtContent(art.content);
    setArtAuthor(art.author);
    setShowAddArticleModal(true);
  };

  const handleToggleArticlePublish = (id: string) => {
    const updated = articles.map((a) =>
      a.id === id ? { ...a, isPublished: !a.isPublished } : a
    );
    onUpdateArticles(updated);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Padamkan artikel ini?')) {
      onUpdateArticles(articles.filter((a) => a.id !== id));
    }
  };

  // Broadcast Management
  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const newBc: SystemBroadcast = {
      id: `bc_${Date.now()}`,
      title: bcTitle,
      message: bcMessage,
      severity: bcSeverity,
      active: true,
      createdDate: new Date().toISOString().split('T')[0],
    };
    onUpdateBroadcasts([newBc, ...broadcasts]);
    setShowAddBroadcast(false);
    setBcTitle('');
    setBcMessage('');
  };

  const handleToggleBroadcast = (id: string) => {
    const updated = broadcasts.map((b) =>
      b.id === id ? { ...b, active: !b.active } : b
    );
    onUpdateBroadcasts(updated);
  };

  const handleDeleteBroadcast = (id: string) => {
    onUpdateBroadcasts(broadcasts.filter((b) => b.id !== id));
  };

  // Full Backup Export
  const handleExportJSON = () => {
    const json = exportFullDataBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SihatKu_PangkalanData_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // File Upload Restore
  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = restoreDataFromBackup(content);
      if (success) {
        setRestoreStatus('Pangkalan data berjaya dipulihkan dari sandaran awan!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setRestoreStatus('Ralat: Format fail sandaran JSON tidak sah.');
      }
    };
    reader.readAsText(file);
  };

  // If not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Portal Kawalan Pentadbir (CMS)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Sila masukkan kata laluan / PIN pentadbir untuk menguruskan data pengguna dan kandungan portal.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={adminPin}
            onChange={(e) => setAdminPin(e.target.value)}
            placeholder="Masukkan PIN (Demo: admin123)"
            className="w-full text-center tracking-widest px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-purple-600/20"
          >
            Log Masuk Pentadbir
          </button>
        </form>

        <p className="text-[11px] text-slate-400 mt-4">
          Kata laluan lalai demo: <code className="font-mono text-purple-600">admin123</code>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CMS Header & Stat Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Pusat Kawalan & CMS Pentadbir
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Urus akaun pesakit, terbitkan panduan kesihatan, siarkan pengumuman klinik, dan arkib pangkalan data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Sandaran Penuh (JSON)
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveCmsTab('users')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeCmsTab === 'users'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Pengurusan Pengguna ({allUsers.length})
          </button>

          <button
            onClick={() => setActiveCmsTab('content')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeCmsTab === 'content'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            CMS Panduan & Artikel ({articles.length})
          </button>

          <button
            onClick={() => setActiveCmsTab('broadcasts')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeCmsTab === 'broadcasts'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Pengumuman Portal ({broadcasts.length})
          </button>

          <button
            onClick={() => setActiveCmsTab('system')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeCmsTab === 'system'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Penyegerakan & Pangkalan Data
          </button>
        </div>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeCmsTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Senarai Profil Pesakit & Pengguna Berdaftar
            </h2>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar Pesakit Baharu
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allUsers.map((user) => {
              const isCurrent = currentUser.id === user.id;

              return (
                <div
                  key={user.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-white dark:bg-slate-900 border-purple-500 ring-2 ring-purple-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {user.name}
                      </h3>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        Aktif
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                    <p>Umur / Jantina: {user.age} Tahun • {user.gender}</p>
                    <p>Sasaran Berat: {user.targetWeight} kg (Tinggi: {user.height} cm)</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Doktor: {user.doctorName || 'Klinik Kerajaan'}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={() => onSelectUser(user)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isCurrent
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isCurrent ? 'Profil Sedang Digunakan' : 'Tukar ke Profil Ini'}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                      title="Padam Pengguna"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ARTICLES CMS */}
      {activeCmsTab === 'content' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Pengurusan Artikel Panduan Kesihatan
            </h2>
            <button
              onClick={() => {
                setEditingArticleId(null);
                setArtTitle('');
                setArtSummary('');
                setArtContent('');
                setShowAddArticleModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Cipta Artikel Baharu
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-bold">Tajuk Artikel</th>
                    <th className="py-3 px-4 font-bold">Kategori</th>
                    <th className="py-3 px-4 font-bold">Pengarang</th>
                    <th className="py-3 px-4 font-bold">Tarikh</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {art.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-semibold text-[11px]">
                          {art.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{art.author}</td>
                      <td className="py-3 px-4 text-slate-400">{art.publishedDate}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleArticlePublish(art.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            art.isPublished
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {art.isPublished ? 'Diterbitkan' : 'Draf'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleEditArticle(art)}
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100"
                            title="Sunting"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Padam"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BROADCASTS CMS */}
      {activeCmsTab === 'broadcasts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Pengumuman & Notis Portal
            </h2>
            <button
              onClick={() => setShowAddBroadcast(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Siarkan Pengumuman Baharu
            </button>
          </div>

          <div className="space-y-3">
            {broadcasts.map((bc) => (
              <div
                key={bc.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {bc.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {bc.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{bc.message}</p>
                  <span className="text-[10px] text-slate-400 block">{bc.createdDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBroadcast(bc.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      bc.active
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {bc.active ? 'Sedang Dipaparkan' : 'Disembunyikan'}
                  </button>

                  <button
                    onClick={() => handleDeleteBroadcast(bc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                    title="Padam Pengumuman"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM & CLOUD DATA CONTROLS */}
      {activeCmsTab === 'system' && (
        <div className="space-y-6">
          {restoreStatus && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-semibold">
              {restoreStatus}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backup Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Eksport Sandaran Penuh (JSON)
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Muat turun fail arkib JSON yang mengandungi semua rekod kesihatan, profil pengguna, jadual peringatan, dan artikel CMS untuk sandaran selamat.
              </p>
              <button
                onClick={handleExportJSON}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Muat Turun Sandaran Sistem Sekarang
              </button>
            </div>

            {/* Restore Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pulihkan Dari Sandaran (JSON)
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih fail sandaran JSON yang telah dimuat turun sebelum ini untuk memulihkan seluruh rekod portal ke peranti ini.
              </p>
              <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Pilih Fail Sandaran JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daftar Pesakit / Pengguna Baharu
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Penuh</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Contoh: Siti Aisyah binti Daud"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">E-mel</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="siti.aisyah@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Umur (Tahun)</label>
                  <input
                    type="number"
                    value={newUserAge}
                    onChange={(e) => setNewUserAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jantina</label>
                  <select
                    value={newUserGender}
                    onChange={(e) => setNewUserGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="Lelaki">Lelaki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tinggi (cm)</label>
                  <input
                    type="number"
                    value={newUserHeight}
                    onChange={(e) => setNewUserHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Sasaran Berat (kg)</label>
                  <input
                    type="number"
                    value={newUserTargetWeight}
                    onChange={(e) => setNewUserTargetWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-2 text-slate-500 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                >
                  Simpan Pesakit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Article Modal */}
      {showAddArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingArticleId ? 'Sunting Panduan Kesihatan' : 'Cipta Panduan Baharu'}
            </h3>
            <form onSubmit={handleSaveArticle} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tajuk Panduan</label>
                <input
                  type="text"
                  required
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  placeholder="Contoh: 5 Tips Mengurangkan Natrium Dalam Masakan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kategori</label>
                  <select
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="Hipertensi">Hipertensi</option>
                    <option value="Pemakanan">Pemakanan</option>
                    <option value="Gaya Hidup">Gaya Hidup</option>
                    <option value="Denyutan Jantung">Denyutan Jantung</option>
                    <option value="Pencegahan">Pencegahan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nama Pengarang / Sumber</label>
                  <input
                    type="text"
                    required
                    value={artAuthor}
                    onChange={(e) => setArtAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Ringkasan Pendek</label>
                <textarea
                  rows={2}
                  required
                  value={artSummary}
                  onChange={(e) => setArtSummary(e.target.value)}
                  placeholder="Ringkasan 1-2 ayat..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Kandungan Penuh</label>
                <textarea
                  rows={6}
                  required
                  value={artContent}
                  onChange={(e) => setArtContent(e.target.value)}
                  placeholder="Isi kandungan artikel..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddArticleModal(false)}
                  className="px-3 py-2 text-slate-500 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                >
                  {editingArticleId ? 'Simpan Suntingan' : 'Terbitkan Panduan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Broadcast Modal */}
      {showAddBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Siarkan Pengumuman Baharu
            </h3>
            <form onSubmit={handleCreateBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tajuk Pengumuman</label>
                <input
                  type="text"
                  required
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  placeholder="Contoh: Kempen Pemeriksaan Jantung Percuma"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mesej Notis</label>
                <textarea
                  rows={3}
                  required
                  value={bcMessage}
                  onChange={(e) => setBcMessage(e.target.value)}
                  placeholder="Keterangan pengumuman untuk dipaparkan di portal..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tahap Kepentingan</label>
                <select
                  value={bcSeverity}
                  onChange={(e) => setBcSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="info">Info (Biasa)</option>
                  <option value="warning">Amaran (Sederhana)</option>
                  <option value="urgent">Kecemasan / Penting</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBroadcast(false)}
                  className="px-3 py-2 text-slate-500 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                >
                  Siarkan Notis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
