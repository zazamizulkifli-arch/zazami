import {
  HealthRecord,
  UserProfile,
  ReminderSetting,
  CMSArticle,
  SystemBroadcast,
  WearableDevice,
} from '../types/health';
import { classifyBloodPressure, calculateBMI, classifyPulse } from './healthCalculations';

const STORAGE_KEYS = {
  RECORDS: 'sihatku_records_v1',
  USER_PROFILE: 'sihatku_user_profile_v1',
  ALL_USERS: 'sihatku_all_users_v1',
  REMINDERS: 'sihatku_reminders_v1',
  CMS_ARTICLES: 'sihatku_cms_articles_v1',
  BROADCASTS: 'sihatku_broadcasts_v1',
  WEARABLE: 'sihatku_wearable_v1',
  THEME: 'sihatku_theme_mode',
  CLOUD_SYNC_STATUS: 'sihatku_cloud_sync_info',
};

// Seed default Malaysian patient
export const defaultUserProfile: UserProfile = {
  id: 'usr_001',
  name: 'Ahmad Danial bin Razak',
  email: 'ahmad.danial@gmail.com',
  age: 46,
  gender: 'Lelaki',
  height: 172,
  targetWeight: 72.0,
  targetSystolic: 120,
  targetDiastolic: 80,
  doctorName: 'Dr. Norazlina binti Sulaiman',
  doctorEmail: 'dr.norazlina@kkm.gov.my',
  emergencyContact: 'Siti Sarah (Isteri)',
  emergencyPhone: '012-3456789',
  knownConditions: ['Hipertensi Tahap 1', 'Kolesterol Sederhana'],
  currentMedications: ['Amlodipine 5mg (1x pagi)', 'Perindopril 4mg (1x pagi)'],
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
};

// Seed second user for CMS user management demo
export const secondaryUsers: UserProfile[] = [
  defaultUserProfile,
  {
    id: 'usr_002',
    name: 'Faridah binti Osman',
    email: 'faridah.osman@yahoo.com',
    age: 52,
    gender: 'Perempuan',
    height: 158,
    targetWeight: 58.0,
    targetSystolic: 125,
    targetDiastolic: 80,
    doctorName: 'Dr. Ramesh Kumar',
    doctorEmail: 'dr.ramesh@ppum.edu.my',
    emergencyContact: 'Hafiz (Anak)',
    emergencyPhone: '019-8765432',
    knownConditions: ['Diabetes Jenis 2', 'Pra-Hipertensi'],
    currentMedications: ['Metformin 500mg', 'Lisinopril 5mg'],
  },
  {
    id: 'usr_003',
    name: 'Tan Wei Hong',
    email: 'weihong.tan@gmail.com',
    age: 38,
    gender: 'Lelaki',
    height: 178,
    targetWeight: 75.0,
    targetSystolic: 118,
    targetDiastolic: 78,
    doctorName: 'Dr. Norazlina binti Sulaiman',
    doctorEmail: 'dr.norazlina@kkm.gov.my',
    emergencyContact: 'Linda Tan',
    emergencyPhone: '017-6543210',
    knownConditions: ['Gaya Hidup Sedentari'],
    currentMedications: ['Suplemen Omega 3'],
  },
];

// Helper to generate dates relative to current date (2026-10-01)
function getOffsetDate(daysAgo: number, timeStr: string): { date: string; time: string; timestamp: string } {
  const base = new Date('2026-10-01T20:00:00');
  base.setDate(base.getDate() - daysAgo);
  const [h, m] = timeStr.split(':');
  base.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

  const date = base.toISOString().split('T')[0];
  return {
    date,
    time: timeStr,
    timestamp: base.toISOString(),
  };
}

export function generateSeedRecords(): HealthRecord[] {
  const seedConfigs = [
    { daysAgo: 14, time: '08:15', sys: 138, dia: 88, weight: 79.5, pulse: 78, notes: 'Bangun tidur, rasa sedikit tegang leher.', meds: 'Amlodipine 5mg', symptoms: ['Pening Sedikit'] },
    { daysAgo: 13, time: '08:30', sys: 135, dia: 86, weight: 79.2, pulse: 75, notes: 'Sarapan oat & teh hijau suam.', meds: 'Amlodipine 5mg' },
    { daysAgo: 12, time: '20:10', sys: 134, dia: 85, weight: 79.0, pulse: 82, notes: 'Selepas jalan santai 30 minit di taman tasik.', meds: 'Perindopril 4mg' },
    { daysAgo: 11, time: '08:00', sys: 132, dia: 84, weight: 78.8, pulse: 74, notes: 'Tidur cukup 7 jam semalam.', meds: 'Amlodipine 5mg' },
    { daysAgo: 10, time: '08:20', sys: 130, dia: 83, weight: 78.6, pulse: 76, notes: 'Mengurangkan garam dalam masakan tengah hari.', meds: 'Amlodipine 5mg' },
    { daysAgo: 9, time: '20:30', sys: 142, dia: 91, weight: 78.7, pulse: 104, notes: 'Kerja lebih masa, stres mesyuarat pejabat. Jantung berdegup laju sedikit.', symptoms: ['Berdebar', 'Stres'], stress: 4 },
    { daysAgo: 8, time: '08:10', sys: 131, dia: 83, weight: 78.4, pulse: 73, notes: 'Tekanan darah kembali stabil selepas rehat.', meds: 'Amlodipine 5mg' },
    { daysAgo: 7, time: '08:00', sys: 128, dia: 82, weight: 78.2, pulse: 72, notes: 'Mula minggu baharu, minum 2.5L air kosong.', meds: 'Amlodipine 5mg' },
    { daysAgo: 6, time: '08:15', sys: 127, dia: 81, weight: 78.0, pulse: 70, notes: 'Bacaan cantik, diet rendah sodium diteruskan.', meds: 'Amlodipine 5mg' },
    { daysAgo: 5, time: '20:00', sys: 129, dia: 82, weight: 77.8, pulse: 71, notes: 'Senaman regangan ringan sebelum mandi malam.' },
    { daysAgo: 4, time: '08:20', sys: 126, dia: 80, weight: 77.6, pulse: 69, notes: 'Berat badan turun 400g dari minggu lepas.', meds: 'Amlodipine 5mg' },
    { daysAgo: 3, time: '08:05', sys: 125, dia: 79, weight: 77.4, pulse: 68, notes: 'Tekanan darah capai sasaran normal/pra-hipertensi!', meds: 'Amlodipine 5mg' },
    { daysAgo: 2, time: '08:15', sys: 124, dia: 78, weight: 77.2, pulse: 67, notes: 'Rasa bertenaga dan segar sepanjang hari.', meds: 'Amlodipine 5mg' },
    { daysAgo: 1, time: '08:10', sys: 123, dia: 78, weight: 77.0, pulse: 68, notes: 'Ujian darah puasa dijadualkan bulan depan di klinik.', meds: 'Amlodipine 5mg' },
    { daysAgo: 0, time: '08:00', sys: 122, dia: 77, weight: 76.8, pulse: 66, notes: 'Bacaan pagi ini sangat baik. Sasaran berat badan makin hampir.', meds: 'Amlodipine 5mg' },
  ];

  const height = defaultUserProfile.height;

  return seedConfigs.map((cfg, idx) => {
    const { date, time, timestamp } = getOffsetDate(cfg.daysAgo, cfg.time);
    const { bmi, category: bmiCategory } = calculateBMI(cfg.weight, height);
    const bpCategory = classifyBloodPressure(cfg.sys, cfg.dia);
    const pulseCategory = classifyPulse(cfg.pulse);

    return {
      id: `rec_${1000 + idx}`,
      userId: defaultUserProfile.id,
      timestamp,
      date,
      time,
      systolic: cfg.sys,
      diastolic: cfg.dia,
      bpCategory,
      weight: cfg.weight,
      height,
      bmi,
      bmiCategory,
      pulse: cfg.pulse,
      pulseCategory,
      source: idx % 4 === 0 ? 'wearable_bluetooth' : 'manual',
      notes: cfg.notes,
      symptoms: cfg.symptoms || [],
      medicationTaken: cfg.meds || '',
      stressLevel: (cfg.stress as any) || 2,
      activityContext: cfg.time.startsWith('08') ? 'bangun_tidur' : 'rehat',
    };
  });
}

export const defaultReminders: ReminderSetting[] = [
  {
    id: 'rem_1',
    title: 'Pemeriksaan Tekanan Darah Pagi',
    time: '08:00',
    days: ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'],
    enabled: true,
    type: 'tekanan_darah',
    soundEnabled: true,
  },
  {
    id: 'rem_2',
    title: 'Pengambilan Ubat Anti-Hipertensi',
    time: '08:30',
    days: ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'],
    enabled: true,
    type: 'ubat',
    soundEnabled: true,
  },
  {
    id: 'rem_3',
    title: 'Timbang Berat Badan Mingguan',
    time: '07:30',
    days: ['Isnin', 'Jumaat'],
    enabled: true,
    type: 'berat_badan',
    soundEnabled: false,
  },
  {
    id: 'rem_4',
    title: 'Pemeriksaan Tekanan Darah Petang/Malam',
    time: '20:00',
    days: ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'],
    enabled: true,
    type: 'tekanan_darah',
    soundEnabled: true,
  },
];

export const defaultCMSArticles: CMSArticle[] = [
  {
    id: 'art_1',
    title: 'Panduan Mengawal Tekanan Darah Tinggi Mengikut CPG Malaysia',
    category: 'Hipertensi',
    summary: 'Ketahui langkah pengubahsuaian gaya hidup, had sodium harian kurang 2,000mg, dan kepatuhan jadual ubat mengikut garis panduan Kementerian Kesihatan Malaysia (KKM).',
    content: `Tekanan darah tinggi (Hipertensi) dikenali sebagai 'pembunuh senyap' kerana sering tidak menunjukkan sebarang simptom ketara. Berdasarkan Garis Panduan Amalan Klinikal (CPG) Malaysia:\n\n1. Kurangkan Natrium/Garam: Hadkan kepada 1 sudu teh garam sehari (kurang 2,000mg sodium). Elakkan makanan terproses dan sos berlebihan.\n2. Amalkan Diet DASH: Banyakkan buah-buahan, sayur-sayuran hijau, bijirin penuh, dan produk tenusu rendah lemak.\n3. Senaman Berkala: Lakukan aktiviti aerobik sederhana sekurang-kurangnya 150 minit seminggu (contoh: berjalan pantas 30 minit, 5 hari seminggu).\n4. Pantau & Catat: Lakukan pemantauan di rumah (Home Blood Pressure Monitoring - HBPM) setiap pagi dan malam.`,
    author: 'Dr. Norazlina Sulaiman (Pakar Perubatan Keluarga)',
    publishedDate: '2026-09-25',
    readTimeMinutes: 4,
    isPublished: true,
    featured: true,
  },
  {
    id: 'art_2',
    title: 'Kepentingan Mengetahui Kadar Denyutan Jantung Waktu Rehat',
    category: 'Denyutan Jantung',
    summary: 'Kadar denyutan jantung rehat (Resting Heart Rate) adalah penunjuk kritikal kesihatan kardiovaskular anda. Fahami julat normal dan tanda amaran.',
    content: `Kadar denyutan jantung normal bagi individu dewasa waktu rehat adalah antara 60 hingga 100 denyutan seminit (bpm).\n\n- Takikardia (Tachycardia): Bacaan melebihi 100 bpm pada waktu rehat. Boleh berpunca daripada stres, dehidrasi, demam, kafein tinggi, atau masalah ritma jantung.\n- Bradikardia (Bradycardia): Bacaan di bawah 60 bpm (atau <50 bpm). Biasanya normal bagi atlet terlatih, tetapi bagi individu lain mungkin menunjukkan masalah sistem elektrik jantung.\n\nJika anda mengalami denyutan kencang disertai pening atau sesak nafas, sila dapatkan nasihat perubatan segera.`,
    author: 'Klinik Kesihatan Malaysia',
    publishedDate: '2026-09-28',
    readTimeMinutes: 3,
    isPublished: true,
    featured: false,
  },
  {
    id: 'art_3',
    title: 'Strategi Penurunan Berat Badan Sihat Tanpa Menjejaskan Kesihatan',
    category: 'Pemakanan',
    summary: 'Penurunan 5% hingga 10% daripada berat badan semasa terbukti dapat menurunkan tekanan darah sistolik sehingga 5-10 mmHg secara signifikan.',
    content: `Kajian klinikal membuktikan setiap penurunan 1 kg berat badan mampu menurunkan tekanan darah sekitar 1 mmHg.\n\nStrategi Berkesan:\n1. Kawal Saiz Hidangan mengikut konsep Pinggan Sihat Malaysia: Suku-Suku Separuh (Suku Karbohidrat, Suku Protein, Separuh Sayur & Buah).\n2. Elakkan minuman manis bergula (teh tarik, air berkarbonat).\n3. Timbang berat badan pada waktu yang konsisten setiap minggu (sebaiknya selepas bangun tidur dan buang air kecil).`,
    author: 'Pegawai Dietetik KKM',
    publishedDate: '2026-09-30',
    readTimeMinutes: 5,
    isPublished: true,
    featured: false,
  },
];

export const defaultBroadcasts: SystemBroadcast[] = [
  {
    id: 'bc_1',
    title: 'Peringatan: Jadual Pemeriksaan Bulanan Klinik Kesihatan',
    message: 'Sila bawa laporan kesihatan PDF bulanan anda semasa temu janji klinik minggu hadapan.',
    severity: 'info',
    active: true,
    createdDate: '2026-10-01',
  },
  {
    id: 'bc_2',
    title: 'Kempen Kesedaran Tekanan Darah Kebangsaan 2026',
    message: 'Pantau bacaan anda setiap hari sepanjang bulan ini untuk mengekalkan kesihatan jantung yang optimum.',
    severity: 'info',
    active: true,
    createdDate: '2026-09-20',
  },
];

export const defaultWearable: WearableDevice = {
  id: 'wear_01',
  name: 'Apple Watch Series 9 (BLE)',
  brand: 'Apple',
  connected: true,
  batteryLevel: 85,
  lastSyncTime: '2026-10-01T20:45:00',
  currentLivePulse: 72,
  isStreaming: false,
};

// Storage operations
export function getStoredRecords(): HealthRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      const initial = generateSeedRecords();
      saveStoredRecords(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load records from localStorage', err);
    return generateSeedRecords();
  }
}

export function saveStoredRecords(records: HealthRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records', err);
  }
}

export function getStoredUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      saveStoredUserProfile(defaultUserProfile);
      return defaultUserProfile;
    }
    return JSON.parse(raw);
  } catch (err) {
    return defaultUserProfile;
  }
}

export function saveStoredUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile', err);
  }
}

export function getAllUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (!raw) {
      saveAllUsers(secondaryUsers);
      return secondaryUsers;
    }
    return JSON.parse(raw);
  } catch (err) {
    return secondaryUsers;
  }
}

export function saveAllUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save all users', err);
  }
}

export function getStoredReminders(): ReminderSetting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) {
      saveStoredReminders(defaultReminders);
      return defaultReminders;
    }
    return JSON.parse(raw);
  } catch (err) {
    return defaultReminders;
  }
}

export function saveStoredReminders(reminders: ReminderSetting[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (err) {
    console.error('Failed to save reminders', err);
  }
}

export function getStoredArticles(): CMSArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CMS_ARTICLES);
    if (!raw) {
      saveStoredArticles(defaultCMSArticles);
      return defaultCMSArticles;
    }
    return JSON.parse(raw);
  } catch (err) {
    return defaultCMSArticles;
  }
}

export function saveStoredArticles(articles: CMSArticle[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CMS_ARTICLES, JSON.stringify(articles));
  } catch (err) {
    console.error('Failed to save articles', err);
  }
}

export function getStoredBroadcasts(): SystemBroadcast[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BROADCASTS);
    if (!raw) {
      saveStoredBroadcasts(defaultBroadcasts);
      return defaultBroadcasts;
    }
    return JSON.parse(raw);
  } catch (err) {
    return defaultBroadcasts;
  }
}

export function saveStoredBroadcasts(broadcasts: SystemBroadcast[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BROADCASTS, JSON.stringify(broadcasts));
  } catch (err) {
    console.error('Failed to save broadcasts', err);
  }
}

export function getStoredWearable(): WearableDevice {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEARABLE);
    if (!raw) {
      saveStoredWearable(defaultWearable);
      return defaultWearable;
    }
    return JSON.parse(raw);
  } catch (err) {
    return defaultWearable;
  }
}

export function saveStoredWearable(device: WearableDevice): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEARABLE, JSON.stringify(device));
  } catch (err) {
    console.error('Failed to save wearable', err);
  }
}

export function exportFullDataBackup(): string {
  const data = {
    appName: 'SihatKu Personal Health Record',
    version: '1.0.0',
    exportTimestamp: new Date().toISOString(),
    profile: getStoredUserProfile(),
    records: getStoredRecords(),
    reminders: getStoredReminders(),
    articles: getStoredArticles(),
  };
  return JSON.stringify(data, null, 2);
}

export function restoreDataFromBackup(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.records && Array.isArray(data.records)) {
      saveStoredRecords(data.records);
    }
    if (data.profile) {
      saveStoredUserProfile(data.profile);
    }
    if (data.reminders && Array.isArray(data.reminders)) {
      saveStoredReminders(data.reminders);
    }
    return true;
  } catch (e) {
    console.error('Invalid backup JSON', e);
    return false;
  }
}
