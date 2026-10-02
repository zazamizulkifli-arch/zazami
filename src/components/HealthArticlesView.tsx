import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Heart,
  Share2,
  Sparkles,
  User,
  ChevronRight,
} from 'lucide-react';
import { CMSArticle } from '../types/health';

interface HealthArticlesViewProps {
  articles: CMSArticle[];
}

export const HealthArticlesView: React.FC<HealthArticlesViewProps> = ({ articles }) => {
  const published = articles.filter((a) => a.isPublished);
  const [selectedArticle, setSelectedArticle] = useState<CMSArticle | null>(
    published[0] || null
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Pusat Pengetahuan & Panduan Kesihatan SihatKu
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Artikel saintifik dan petua kawalan tekanan darah berlandaskan Garis Panduan Amalan Klinikal (CPG) Malaysia.
        </p>
      </div>

      {/* Main Layout: Selected Article Reader + Side List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Reader */}
        {selectedArticle ? (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {selectedArticle.category}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {selectedArticle.readTimeMinutes} minit bacaan
                </span>
                <span>{selectedArticle.publishedDate}</span>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {selectedArticle.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Oleh: <strong>{selectedArticle.author}</strong></span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
              {selectedArticle.summary}
            </div>

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-4">
              {selectedArticle.content}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center text-slate-400">
            Pilih artikel dari senarai untuk membaca.
          </div>
        )}

        {/* Right 1 Col: Articles List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Artikel Kesihatan Terkini
          </h3>

          {published.map((art) => (
            <button
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedArticle?.id === art.id
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {art.category}
                </span>
                <span>{art.readTimeMinutes} min</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                {art.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                {art.summary}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
