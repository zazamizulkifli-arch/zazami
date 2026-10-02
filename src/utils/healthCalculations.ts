import { BloodPressureCategory, BMICategory, PulseCategory, HealthRecord } from '../types/health';

/**
 * Malaysian Clinical Practice Guidelines (CPG) Management of Hypertension
 */
export function classifyBloodPressure(systolic: number, diastolic: number): BloodPressureCategory {
  if (systolic >= 180 || diastolic >= 120) {
    return 'Krisis-Hipertensi';
  }
  if (systolic >= 140 || diastolic >= 90) {
    return 'Hipertensi-Tahap-2';
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return 'Hipertensi-Tahap-1';
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return 'Pra-Hipertensi';
  }
  if (systolic < 90 || diastolic < 60) {
    return 'Hipotensi';
  }
  return 'Normal';
}

export function getBPCategoryColor(category: BloodPressureCategory): {
  bg: string;
  text: string;
  badge: string;
  border: string;
} {
  switch (category) {
    case 'Normal':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
        border: 'border-emerald-500',
      };
    case 'Pra-Hipertensi':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300 dark:border-amber-700',
        border: 'border-amber-500',
      };
    case 'Hipertensi-Tahap-1':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-700 dark:text-orange-300',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 border-orange-300 dark:border-orange-700',
        border: 'border-orange-500',
      };
    case 'Hipertensi-Tahap-2':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300 dark:border-rose-700',
        border: 'border-rose-500',
      };
    case 'Krisis-Hipertensi':
      return {
        bg: 'bg-red-100 dark:bg-red-950/70 animate-pulse',
        text: 'text-red-800 dark:text-red-200 font-bold',
        badge: 'bg-red-600 text-white font-bold border-red-700 shadow-sm',
        border: 'border-red-600',
      };
    case 'Hipotensi':
      return {
        bg: 'bg-sky-50 dark:bg-sky-950/40',
        text: 'text-sky-700 dark:text-sky-300',
        badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border-sky-300 dark:border-sky-700',
        border: 'border-sky-500',
      };
  }
}

/**
 * Asian-Pacific BMI criteria recommended by Ministry of Health Malaysia (KKM)
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: BMICategory;
} {
  if (heightCm <= 0 || weightKg <= 0) {
    return { bmi: 0, category: 'Normal' };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category: BMICategory = 'Normal';
  if (bmi < 18.5) {
    category = 'Kurang-Berat';
  } else if (bmi <= 24.9) {
    category = 'Normal';
  } else if (bmi <= 29.9) {
    category = 'Lebihan-Berat';
  } else {
    category = 'Obesiti';
  }

  return { bmi, category };
}

export function getBMICategoryColor(category: BMICategory): {
  badge: string;
  text: string;
} {
  switch (category) {
    case 'Normal':
      return {
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
        text: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'Kurang-Berat':
      return {
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
        text: 'text-blue-600 dark:text-blue-400',
      };
    case 'Lebihan-Berat':
      return {
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
        text: 'text-amber-600 dark:text-amber-400',
      };
    case 'Obesiti':
      return {
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
        text: 'text-rose-600 dark:text-rose-400',
      };
  }
}

/**
 * Resting Heart Rate Classification
 */
export function classifyPulse(pulse: number): PulseCategory {
  if (pulse < 50) return 'Bradikardia';
  if (pulse > 140) return 'Kritikal';
  if (pulse > 100) return 'Takikardia';
  return 'Normal';
}

export function isAbnormalPulse(pulse: number): {
  isAbnormal: boolean;
  type: 'bradycardia' | 'tachycardia' | 'critical' | 'none';
  message: string;
} {
  if (pulse >= 140) {
    return {
      isAbnormal: true,
      type: 'critical',
      message: `Denyutan nadi sangat tinggi (${pulse} bpm)! Rehat serta-merta dan dapatkan rawatan kecemasan jika disertai sakit dada atau sesak nafas.`,
    };
  }
  if (pulse > 100) {
    return {
      isAbnormal: true,
      type: 'tachycardia',
      message: `Takikardia dikesan (${pulse} bpm). Denyutan jantung laju melebihi 100 bpm pada waktu rehat.`,
    };
  }
  if (pulse < 50) {
    return {
      isAbnormal: true,
      type: 'bradycardia',
      message: `Bradikardia dikesan (${pulse} bpm). Denyutan jantung sangat perlahan (< 50 bpm).`,
    };
  }
  return {
    isAbnormal: false,
    type: 'none',
    message: 'Kadar denyutan jantung normal.',
  };
}

/**
 * Compute aggregate stats from records list
 */
export function calculateStats(records: HealthRecord[]) {
  if (records.length === 0) {
    return {
      count: 0,
      avgSystolic: 0,
      avgDiastolic: 0,
      avgPulse: 0,
      avgWeight: 0,
      avgBMI: 0,
      minSystolic: 0,
      maxSystolic: 0,
      minWeight: 0,
      maxWeight: 0,
      hypertensionCount: 0,
      abnormalPulseCount: 0,
      weeklyWeightChange: 0,
    };
  }

  const count = records.length;
  const sumSys = records.reduce((acc, r) => acc + r.systolic, 0);
  const sumDia = records.reduce((acc, r) => acc + r.diastolic, 0);
  const sumPulse = records.reduce((acc, r) => acc + r.pulse, 0);
  const sumWeight = records.reduce((acc, r) => acc + r.weight, 0);
  const sumBMI = records.reduce((acc, r) => acc + r.bmi, 0);

  const systolicValues = records.map((r) => r.systolic);
  const weightValues = records.map((r) => r.weight);

  const hypertensionCount = records.filter(
    (r) =>
      r.bpCategory === 'Hipertensi-Tahap-1' ||
      r.bpCategory === 'Hipertensi-Tahap-2' ||
      r.bpCategory === 'Krisis-Hipertensi'
  ).length;

  const abnormalPulseCount = records.filter(
    (r) => r.pulseCategory === 'Takikardia' || r.pulseCategory === 'Bradikardia' || r.pulseCategory === 'Kritikal'
  ).length;

  // weekly weight change (comparing latest vs record ~7 days ago or earliest in window)
  const sorted = [...records].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  let weeklyWeightChange = 0;
  if (sorted.length >= 2) {
    weeklyWeightChange = Number((sorted[0].weight - sorted[sorted.length - 1].weight).toFixed(1));
  }

  return {
    count,
    avgSystolic: Math.round(sumSys / count),
    avgDiastolic: Math.round(sumDia / count),
    avgPulse: Math.round(sumPulse / count),
    avgWeight: Number((sumWeight / count).toFixed(1)),
    avgBMI: Number((sumBMI / count).toFixed(1)),
    minSystolic: Math.min(...systolicValues),
    maxSystolic: Math.max(...systolicValues),
    minWeight: Math.min(...weightValues),
    maxWeight: Math.max(...weightValues),
    hypertensionCount,
    abnormalPulseCount,
    weeklyWeightChange,
  };
}
