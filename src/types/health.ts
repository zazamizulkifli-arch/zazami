export type BloodPressureCategory = 
  | 'Hipotensi' 
  | 'Normal' 
  | 'Pra-Hipertensi' 
  | 'Hipertensi-Tahap-1' 
  | 'Hipertensi-Tahap-2' 
  | 'Krisis-Hipertensi';

export type BMICategory = 
  | 'Kurang-Berat' 
  | 'Normal' 
  | 'Lebihan-Berat' 
  | 'Obesiti';

export type PulseCategory = 
  | 'Bradikardia' 
  | 'Normal' 
  | 'Takikardia' 
  | 'Kritikal';

export interface HealthRecord {
  id: string;
  userId: string;
  timestamp: string; // ISO date string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  // Blood Pressure
  systolic: number; // mmHg
  diastolic: number; // mmHg
  bpCategory: BloodPressureCategory;
  // Weight & Height
  weight: number; // kg
  height: number; // cm
  bmi: number;
  bmiCategory: BMICategory;
  // Heart Rate
  pulse: number; // bpm
  pulseCategory: PulseCategory;
  source: 'manual' | 'wearable_bluetooth' | 'wearable_sync';
  // Personal Notes & Symptoms
  notes?: string;
  symptoms?: string[]; // e.g. ["Pening", "Sakit Dada", "Berdebar", "Letih"]
  medicationTaken?: string; // e.g. "Amlodipine 5mg"
  stressLevel?: 1 | 2 | 3 | 4 | 5; // 1 lowest, 5 highest
  activityContext?: 'rehat' | 'selepas_senaman' | 'sebelum_tidur' | 'selepas_makan' | 'bangun_tidur';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'Lelaki' | 'Perempuan';
  height: number; // cm
  targetWeight: number; // kg
  targetSystolic: number; // e.g. 120
  targetDiastolic: number; // e.g. 80
  doctorName?: string;
  doctorEmail?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  knownConditions?: string[];
  currentMedications?: string[];
  avatarUrl?: string;
}

export interface ReminderSetting {
  id: string;
  title: string;
  time: string; // HH:mm
  days: ('Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat' | 'Sabtu' | 'Ahad')[];
  enabled: boolean;
  type: 'tekanan_darah' | 'berat_badan' | 'ubat' | 'senaman' | 'air';
  soundEnabled: boolean;
}

export interface WearableDevice {
  id: string;
  name: string;
  brand: 'Apple' | 'Samsung' | 'Garmin' | 'Fitbit' | 'Generic_BLE';
  connected: boolean;
  batteryLevel: number;
  lastSyncTime: string;
  currentLivePulse?: number;
  isStreaming: boolean;
}

export interface CMSArticle {
  id: string;
  title: string;
  category: 'Hipertensi' | 'Pemakanan' | 'Gaya Hidup' | 'Denyutan Jantung' | 'Pencegahan';
  summary: string;
  content: string;
  author: string;
  publishedDate: string;
  readTimeMinutes: number;
  isPublished: boolean;
  featured?: boolean;
}

export interface SystemBroadcast {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  active: boolean;
  createdDate: string;
}
