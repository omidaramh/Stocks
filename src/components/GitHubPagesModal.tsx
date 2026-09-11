import React, { useState } from 'react';
import { X, Github, Download, ExternalLink, Check, Copy, FileCode, Sparkles } from 'lucide-react';
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
  const isPs = lang === 'ps';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 md:p-6 shadow-2xl relative text-slate-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center border border-slate-700 shadow">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg md:text-xl font-bold text-white">
                {isFa
                  ? 'راهنمای اجرای کامل روی هاست گیت‌هاب (GitHub Pages)'
                  : isPs
                  ? 'په GitHub Pages کې د سایټ چلولو بشپړ لارښود'
                  : 'Host on GitHub Pages (100% Compatible)'}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                آماده
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFa
                ? 'فایل HTML خالص و مستقل برای آپلود مستقیم، بدون نیاز به نصب هیچ برنامه‌ای'
                : 'Zero-dependency standalone HTML file & GitHub Actions workflow included'}
            </p>
          </div>
        </div>

        {/* Quick Action: Download index.html */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-amber-300">
                  {isFa ? 'روش اول: دانلود مستقیم تک‌فایل index.html خالص' : 'Method 1: Download Standalone index.html'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isFa
                  ? 'این فایل تمام جاوااسکریپت، استایل‌ها، چار‌ت‌های SVG و نوسان ثانیه‌ای را در یک فایل دارد. کافیست آن را داخل ریپازیتوری گیت‌هاب خود به نام index.html بگذارید.'
                  : 'Single file containing all HTML, CSS, live ticks, and SVG charts. Rename/commit as index.html on GitHub.'}
              </p>
            </div>
            <button
              onClick={handleDownloadStandalone}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'در حال دریافت...' : 'دانلود فایل index.html'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="mt-6 space-y-4 text-xs text-slate-300">
          <h4 className="font-bold text-white text-sm">
            {isFa ? 'نحوه فعال‌سازی GitHub Pages در گیت‌هاب:' : 'How to deploy on GitHub Pages:'}
          </h4>

          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-sm">۱. ایجاد مخزن (Repository) جدید در گیت‌هاب</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              در حساب گیت‌هاب خود به آدرس <span className="font-mono text-slate-200">github.com/new</span> بروید و یک مخزن عمومی (Public) بسازید.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-sm">۲. آپلود فایل index.html</span>
              <button
                onClick={() => handleCopy('git add index.html && git commit -m "Deploy to GitHub Pages" && git push', 2)}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[10px]"
              >
                {copiedStep === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی کامند</span>
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed">
              فایل <strong className="text-white">index.html</strong> دانلود شده را به ریشه (Root) مخزن خود اضافه و Commit نمایید.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-400 text-sm">۳. فعال‌سازی Pages در تنظیمات گیت‌هاب</span>
            <p className="text-slate-400 leading-relaxed">
              به تب <strong className="text-white">Settings</strong> ریپازیتوری خود بروید، از منوی سمت چپ روی <strong className="text-white">Pages</strong> کلیک کنید. زیر بخش <strong className="text-white">Branch</strong>، گزینه <strong className="text-emerald-400">main</strong> و پوشه <strong className="text-emerald-400">/ (root)</strong> را انتخاب کرده و <strong className="text-white">Save</strong> بزنید.
            </p>
            <p className="text-emerald-400 font-mono text-[11px] pt-1">
              سایت شما فوراً در آدرس: https://your-username.github.io/your-repo/ فعال خواهد شد!
            </p>
          </div>

          {/* Option B: Modern Vite Build with GitHub Actions */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-sky-300 text-xs">
                {isFa ? 'روش دوم: استقرار خودکار با GitHub Actions (پروژه کامل)' : 'Method 2: Automated GitHub Actions'}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              فایل استقرار خودکار <span className="font-mono text-slate-200">.github/workflows/deploy.yml</span> و تنظیم آدرس نسبی <span className="font-mono text-slate-200">base: './'</span> در پروژه اضافه شده است. اگر کل ریپازیتوری را Push کنید، گیت‌هاب به طور خودکار برنامه را بیلد و دیپلوی می‌کند!
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <a
            href="/standalone.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 underline font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>مشاهده پیش‌نمایش فایل HTML مستقل در تب جدید</span>
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
