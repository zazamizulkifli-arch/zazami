import React, { useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  ChevronDown,
  Clock,
  Heart,
  Info,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { HealthRecord, UserProfile } from '../types/health';
import { calculateStats, getBPCategoryColor } from '../utils/healthCalculations';

interface WeeklyTrendsChartProps {
  records: HealthRecord[];
  profile: UserProfile;
  onOpenAddModal: () => void;
}

export const WeeklyTrendsChart: React.FC<WeeklyTrendsChartProps> = ({
  records,
  profile,
  onOpenAddModal,
}) => {
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30' | 'all'>('7');
  const [activeMetric, setActiveMetric] = useState<'bp' | 'weight' | 'pulse'>('bp');
  const [hoveredPoint, setHoveredPoint] = useState<HealthRecord | null>(null);

  // Filter records based on selected range
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let filteredRecords = sortedRecords;
  if (timeRange === '7') {
    filteredRecords = sortedRecords.slice(-7);
  } else if (timeRange === '14') {
    filteredRecords = sortedRecords.slice(-14);
  } else if (timeRange === '30') {
    filteredRecords = sortedRecords.slice(-30);
  }

  const stats = calculateStats(filteredRecords);

  // SVG Chart Dimensions
  const svgWidth = 720;
  const svgHeight = 280;
  const padding = { top: 30, right: 30, bottom: 45, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Compute Scales
  const count = filteredRecords.length;

  // For Blood Pressure Chart:
  const minBP = Math.min(50, ...filteredRecords.map((r) => r.diastolic));
  const maxBP = Math.max(160, ...filteredRecords.map((r) => r.systolic));
  const bpRange = Math.max(1, maxBP - minBP);

  const getBPY = (val: number) => {
    return padding.top + graphHeight - ((val - minBP) / bpRange) * graphHeight;
  };

  // For Weight Chart:
  const weights = filteredRecords.map((r) => r.weight);
  const minWeight = Math.floor(Math.min(profile.targetWeight - 2, ...weights));
  const maxWeight = Math.ceil(Math.max(profile.targetWeight + 2, ...weights));
  const weightRange = Math.max(1, maxWeight - minWeight);

  const getWeightY = (val: number) => {
    return padding.top + graphHeight - ((val - minWeight) / weightRange) * graphHeight;
  };

  // For Pulse Chart:
  const pulses = filteredRecords.map((r) => r.pulse);
  const minPulse = Math.min(45, ...pulses);
  const maxPulse = Math.max(120, ...pulses);
  const pulseRange = Math.max(1, maxPulse - minPulse);

  const getPulseY = (val: number) => {
    return padding.top + graphHeight - ((val - minPulse) / pulseRange) * graphHeight;
  };

  const getX = (index: number) => {
    if (count <= 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (count - 1)) * graphWidth;
  };

  // Build SVG Path strings
  const systolicPoints = filteredRecords.map((r, i) => `${getX(i)},${getBPY(r.systolic)}`).join(' ');
  const diastolicPoints = filteredRecords.map((r, i) => `${getX(i)},${getBPY(r.diastolic)}`).join(' ');
  const weightPoints = filteredRecords.map((r, i) => `${getX(i)},${getWeightY(r.weight)}`).join(' ');
  const pulsePoints = filteredRecords.map((r, i) => `${getX(i)},${getPulseY(r.pulse)}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-rose-500" />
              Graf Perkembangan & Analisis Trend
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualisasi pola mingguan/bulanan bagi menyokong diagnosis dan pemantauan kendiri.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Switcher */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
              <button
                onClick={() => setActiveMetric('bp')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeMetric === 'bp'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Tekanan Darah
              </button>
              <button
                onClick={() => setActiveMetric('weight')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeMetric === 'weight'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Berat Badan
              </button>
              <button
                onClick={() => setActiveMetric('pulse')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeMetric === 'pulse'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                Nadi (BPM)
              </button>
            </div>

            {/* Time Filter */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
              <button
                onClick={() => setTimeRange('7')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  timeRange === '7'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setTimeRange('14')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  timeRange === '14'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                14 Hari
              </button>
              <button
                onClick={() => setTimeRange('30')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  timeRange === '30'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                30 Hari
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  timeRange === 'all'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
            </div>
          </div>
        </div>

        {/* Quick Analytical Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
              Purata Tekanan Darah:
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
              {stats.avgSystolic} / {stats.avgDiastolic} <span className="text-xs font-normal">mmHg</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
              Purata Berat & BMI:
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
              {stats.avgWeight} kg <span className="text-xs font-normal">({stats.avgBMI})</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
              Purata Nadi Rehat:
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
              {stats.avgPulse} <span className="text-xs font-normal">bpm</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
              Trend Perubahan Berat:
            </span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              {stats.weeklyWeightChange <= 0 ? (
                <>
                  <TrendingDown className="w-4 h-4" /> {stats.weeklyWeightChange} kg
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" /> +{stats.weeklyWeightChange} kg
                </>
              )}
            </span>
          </div>
        </div>

        {/* The Interactive Chart Container */}
        <div className="mt-6 relative">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              Tiada rekod ditemui untuk tempoh ini. Sila tambah rekod baharu.
            </div>
          ) : (
            <div className="w-full overflow-x-auto pb-2">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full min-w-[640px] h-72 select-none"
              >
                {/* Background Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const yPos = padding.top + ratio * graphHeight;
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={yPos}
                        x2={svgWidth - padding.right}
                        y2={yPos}
                        stroke="currentColor"
                        strokeDasharray="3 3"
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}

                {/* Metric Specific Visuals */}
                {activeMetric === 'bp' && (
                  <>
                    {/* Normal Target Reference Line (120 mmHg) */}
                    <line
                      x1={padding.left}
                      y1={getBPY(120)}
                      x2={svgWidth - padding.right}
                      y2={getBPY(120)}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />
                    <text
                      x={svgWidth - padding.right - 4}
                      y={getBPY(120) - 4}
                      textAnchor="end"
                      className="fill-emerald-600 text-[10px] font-bold"
                    >
                      Sasaran Sistolik: 120 mmHg
                    </text>

                    {/* Stage 1 Hypertension threshold (130 mmHg) */}
                    <line
                      x1={padding.left}
                      y1={getBPY(130)}
                      x2={svgWidth - padding.right}
                      y2={getBPY(130)}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />

                    {/* Systolic Line */}
                    <polyline
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={systolicPoints}
                    />

                    {/* Diastolic Line */}
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={diastolicPoints}
                    />

                    {/* Points & Interactive Hit Area */}
                    {filteredRecords.map((r, i) => {
                      const cx = getX(i);
                      const cySys = getBPY(r.systolic);
                      const cyDia = getBPY(r.diastolic);
                      const isHovered = hoveredPoint?.id === r.id;

                      return (
                        <g
                          key={r.id}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(r)}
                          onClick={() => setHoveredPoint(r)}
                        >
                          {/* Systolic dot */}
                          <circle
                            cx={cx}
                            cy={cySys}
                            r={isHovered ? 6 : 4}
                            className="fill-white stroke-rose-600"
                            strokeWidth="2.5"
                          />
                          {/* Diastolic dot */}
                          <circle
                            cx={cx}
                            cy={cyDia}
                            r={isHovered ? 5 : 3.5}
                            className="fill-white stroke-blue-500"
                            strokeWidth="2"
                          />

                          {/* X-axis label */}
                          <text
                            x={cx}
                            y={svgHeight - padding.bottom + 16}
                            textAnchor="middle"
                            className="fill-slate-500 text-[9px]"
                          >
                            {r.date.substring(5)}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {activeMetric === 'weight' && (
                  <>
                    {/* Target Weight Baseline */}
                    <line
                      x1={padding.left}
                      y1={getWeightY(profile.targetWeight)}
                      x2={svgWidth - padding.right}
                      y2={getWeightY(profile.targetWeight)}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />
                    <text
                      x={svgWidth - padding.right - 4}
                      y={getWeightY(profile.targetWeight) - 4}
                      textAnchor="end"
                      className="fill-emerald-600 text-[10px] font-bold"
                    >
                      Sasaran: {profile.targetWeight} kg
                    </text>

                    {/* Weight Polyline */}
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={weightPoints}
                    />

                    {filteredRecords.map((r, i) => {
                      const cx = getX(i);
                      const cy = getWeightY(r.weight);
                      const isHovered = hoveredPoint?.id === r.id;

                      return (
                        <g
                          key={r.id}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(r)}
                          onClick={() => setHoveredPoint(r)}
                        >
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isHovered ? 6 : 4}
                            className="fill-white stroke-blue-600"
                            strokeWidth="2.5"
                          />
                          <text
                            x={cx}
                            y={svgHeight - padding.bottom + 16}
                            textAnchor="middle"
                            className="fill-slate-500 text-[9px]"
                          >
                            {r.date.substring(5)}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {activeMetric === 'pulse' && (
                  <>
                    {/* Normal threshold lines (60 & 100 bpm) */}
                    <line
                      x1={padding.left}
                      y1={getPulseY(100)}
                      x2={svgWidth - padding.right}
                      y2={getPulseY(100)}
                      stroke="#f43f5e"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={svgWidth - padding.right - 4}
                      y={getPulseY(100) - 4}
                      textAnchor="end"
                      className="fill-rose-500 text-[10px] font-medium"
                    >
                      Ambang Takikardia: 100 BPM
                    </text>

                    <line
                      x1={padding.left}
                      y1={getPulseY(60)}
                      x2={svgWidth - padding.right}
                      y2={getPulseY(60)}
                      stroke="#0ea5e9"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={svgWidth - padding.right - 4}
                      y={getPulseY(60) - 4}
                      textAnchor="end"
                      className="fill-sky-500 text-[10px] font-medium"
                    >
                      Ambang Bradikardia: 60 BPM
                    </text>

                    {/* Pulse Polyline */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pulsePoints}
                    />

                    {filteredRecords.map((r, i) => {
                      const cx = getX(i);
                      const cy = getPulseY(r.pulse);
                      const isHovered = hoveredPoint?.id === r.id;
                      const isHigh = r.pulse > 100;

                      return (
                        <g
                          key={r.id}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(r)}
                          onClick={() => setHoveredPoint(r)}
                        >
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isHovered ? 6 : 4}
                            className={`fill-white ${
                              isHigh ? 'stroke-rose-600' : 'stroke-emerald-600'
                            }`}
                            strokeWidth="2.5"
                          />
                          <text
                            x={cx}
                            y={svgHeight - padding.bottom + 16}
                            textAnchor="middle"
                            className="fill-slate-500 text-[9px]"
                          >
                            {r.date.substring(5)}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {/* Y-Axis Value Labels on Left */}
                {activeMetric === 'bp' && (
                  <>
                    <text x={padding.left - 8} y={getBPY(160)} textAnchor="end" className="fill-slate-400 text-[9px]">160</text>
                    <text x={padding.left - 8} y={getBPY(140)} textAnchor="end" className="fill-slate-400 text-[9px]">140</text>
                    <text x={padding.left - 8} y={getBPY(120)} textAnchor="end" className="fill-slate-400 text-[9px]">120</text>
                    <text x={padding.left - 8} y={getBPY(80)} textAnchor="end" className="fill-slate-400 text-[9px]">80</text>
                    <text x={padding.left - 8} y={getBPY(60)} textAnchor="end" className="fill-slate-400 text-[9px]">60</text>
                  </>
                )}

                {activeMetric === 'weight' && (
                  <>
                    <text x={padding.left - 8} y={getWeightY(maxWeight)} textAnchor="end" className="fill-slate-400 text-[9px]">{maxWeight}</text>
                    <text x={padding.left - 8} y={getWeightY(profile.targetWeight)} textAnchor="end" className="fill-slate-400 text-[9px]">{profile.targetWeight}</text>
                    <text x={padding.left - 8} y={getWeightY(minWeight)} textAnchor="end" className="fill-slate-400 text-[9px]">{minWeight}</text>
                  </>
                )}

                {activeMetric === 'pulse' && (
                  <>
                    <text x={padding.left - 8} y={getPulseY(120)} textAnchor="end" className="fill-slate-400 text-[9px]">120</text>
                    <text x={padding.left - 8} y={getPulseY(100)} textAnchor="end" className="fill-slate-400 text-[9px]">100</text>
                    <text x={padding.left - 8} y={getPulseY(80)} textAnchor="end" className="fill-slate-400 text-[9px]">80</text>
                    <text x={padding.left - 8} y={getPulseY(60)} textAnchor="end" className="fill-slate-400 text-[9px]">60</text>
                  </>
                )}
              </svg>
            </div>
          )}

          {/* Interactive Floating Hover Details Card */}
          {hoveredPoint && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {hoveredPoint.date} ({hoveredPoint.time})
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      getBPCategoryColor(hoveredPoint.bpCategory).badge
                    }`}
                  >
                    {hoveredPoint.bpCategory.replace('-', ' ')}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  {hoveredPoint.medicationTaken && (
                    <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">
                      Ubat: {hoveredPoint.medicationTaken}
                    </span>
                  )}
                  <span>Nota: {hoveredPoint.notes || 'Tiada nota tambahan.'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tekanan Darah:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    {hoveredPoint.systolic}/{hoveredPoint.diastolic} mmHg
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Berat:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {hoveredPoint.weight} kg
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Nadi:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {hoveredPoint.pulse} bpm
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          {activeMetric === 'bp' && (
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-rose-600 rounded-sm" /> Sistolik (Atas)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-blue-500 rounded-sm" /> Diastolik (Bawah)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-emerald-500" /> Had Sasaran (120 mmHg)
              </span>
            </div>
          )}

          {activeMetric === 'weight' && (
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-blue-600 rounded-sm" /> Berat Badan (kg)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-emerald-500" /> Sasaran Anda ({profile.targetWeight} kg)
              </span>
            </div>
          )}

          {activeMetric === 'pulse' && (
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-600 rounded-sm" /> Denyutan Jantung (BPM)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-rose-500" /> Takikardia &gt; 100
              </span>
            </div>
          )}

          <button
            onClick={onOpenAddModal}
            className="text-rose-600 dark:text-rose-400 font-semibold hover:underline"
          >
            + Tambah Bacaan Baharu
          </button>
        </div>
      </div>
    </div>
  );
};
