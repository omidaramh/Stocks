import React, { useState } from 'react';
import { X, Github, Download, Check, Copy, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadStandalone = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch('/standalone.html');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = (text: string, stepId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const isFa = lang === 'fa';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 md:p-6 shadow-2xl relative text-slate-800 dark:text-slate-100 transition-colors">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                {isFa
                  ? 'راهنمای اجرای روی هاست گیت‌هاب (GitHub Pages)'
                  : 'Host on GitHub Pages'}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {isFa ? 'آماده' : 'Ready'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isFa
                ? 'فایل HTML خالص و مستقل برای آپلود مستقیم، بدون نیاز به نصب برنامه'
                : 'Zero-dependency standalone HTML file ready for GitHub Pages'}
            </p>
          </div>
        </div>

        {/* Quick Action: Download index.html */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-sm text-amber-700 dark:text-amber-300">
                  {isFa ? 'دانلود مستقیم تک‌فایل index.html خالص' : 'Download Standalone index.html'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isFa
                  ? 'این فایل تمام استایل‌ها، چارت‌ها و نوسان زنده را در یک فایل فشرده دارد. کافیست آن را داخل مخزن گیت‌هاب قرار دهید.'
                  : 'Single file containing all HTML, CSS, live ticks, and SVG charts. Rename/commit as index.html on GitHub.'}
              </p>
            </div>
            <button
              onClick={handleDownloadStandalone}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? (isFa ? 'در حال دریافت...' : 'Downloading...') : (isFa ? 'دانلود فایل index.html' : 'Download index.html')}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="mt-6 space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            {isFa ? 'نحوه فعال‌سازی GitHub Pages در گیت‌هاب:' : 'How to deploy on GitHub Pages:'}
          </h4>

          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
              {isFa ? '۱. ایجاد مخزن (Repository) جدید در گیت‌هاب' : '1. Create a GitHub Repository'}
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {isFa
                ? 'در حساب گیت‌هاب خود به آدرس github.com/new بروید و یک مخزن عمومی (Public) بسازید.'
                : 'Go to github.com/new and create a public repository.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                {isFa ? '۲. آپلود فایل index.html' : '2. Push index.html to main branch'}
              </span>
              <button
                onClick={() => handleCopy('git add index.html && git commit -m "Deploy to GitHub Pages" && git push', 2)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-mono text-[10px] cursor-pointer"
              >
                {copiedStep === 2 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isFa ? 'کپی کامند' : 'Copy'}</span>
              </button>
            </div>
            <code className="block p-2 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded font-mono text-[11px] overflow-x-auto">
              git add index.html && git commit -m "Deploy to GitHub Pages" && git push
            </code>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
              {isFa ? '۳. فعال‌سازی Pages در تنظیمات (Settings > Pages)' : '3. Enable GitHub Pages in Settings'}
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {isFa
                ? 'در تب Settings مخزن، بخش Pages را باز کنید و Branch را روی main و مسیر را روی /(root) بگذارید.'
                : 'In your repository Settings > Pages, select main branch and /(root) directory.'}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
