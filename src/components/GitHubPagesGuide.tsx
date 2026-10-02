import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  GitBranch,
  Github,
  Globe,
  Terminal,
  Zap,
} from 'lucide-react';

export const GitHubPagesGuide: React.FC = () => {
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);

  const workflowYaml = `name: Deploy SihatKu to GitHub Pages

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Vite Applet
        run: npm run build

      - name: Upload GitHub Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  const gitCommands = `# 1. Inisialisasi Git & Commit
git init
git add .
git commit -m "Inisialisasi Portal Rekod Kesihatan SihatKu dengan CI/CD"

# 2. Hubungkan ke repositori GitHub anda
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git

# 3. Tolak ke branch main (CI/CD GitHub Actions akan bermula automatik!)
git push -u origin main`;

  const copyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadWorkflowFile = () => {
    const blob = new Blob([workflowYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                <Github className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Panduan Hosting GitHub Pages & Konfigurasi CI/CD
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Fail aliran kerja automatik (GitHub Actions) telah disediakan di dalam projek ini (<code>/.github/workflows/deploy.yml</code>). Setiap kali kod ditolak (git push) ke branch <code>main</code>, portal SihatKu akan dibina dan dihoskan secara automatik dan percuma di GitHub Pages!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadWorkflowFile}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Muat Turun deploy.yml
            </button>
          </div>
        </div>
      </div>

      {/* 4 Steps Deployment Process */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-sm flex items-center justify-center">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Cipta Repositori GitHub
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pergi ke GitHub dan cipta repositori baharu (contoh: <code>sihatku-portal</code>) dengan status Public.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-sm flex items-center justify-center">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Aktifkan GitHub Pages (Workflow)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Dalam Settings &gt; Pages repositori anda, pada bahagian <strong>Source</strong>, pilih <strong>&quot;GitHub Actions&quot;</strong>.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-sm flex items-center justify-center">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tolak Kod ke Main
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Jalankan arahan <code>git push origin main</code>. GitHub Actions akan mengesan <code>deploy.yml</code> dan memulakan binaan.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-sm flex items-center justify-center">
            4
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Portal Siap Beroperasi!
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Portal anda sedia diakses di URL <code>https://&lt;username&gt;.github.io/&lt;nama-repo&gt;/</code> dengan sijil HTTPS percuma.
          </p>
        </div>
      </div>

      {/* Terminal Commands Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Arahan Terminal Git Untuk Push Projek
            </h3>
          </div>
          <button
            onClick={() => copyText(gitCommands, setCopiedGitCmd)}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            {copiedGitCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedGitCmd ? 'Disalin!' : 'Salin Arahan Terminal'}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          {gitCommands}
        </pre>
      </div>

      {/* Workflow YAML Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kandungan Fail <code>.github/workflows/deploy.yml</code>
            </h3>
          </div>
          <button
            onClick={() => copyText(workflowYaml, setCopiedWorkflow)}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            {copiedWorkflow ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedWorkflow ? 'Disalin!' : 'Salin Konfigurasi CI/CD'}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
          {workflowYaml}
        </pre>
      </div>
    </div>
  );
};
