import React, { useState, useEffect } from 'react';
import {
  Pause,
  Play,
  Clock,
  Globe2,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Check,
  Github,
  Sun,
  Moon,
} from 'lucide-react';
import { DisplayMode, Language, Theme } from '../types';
import { formatAfghanistanTime } from '../utils/formatters';
import { useTranslation } from '../utils/translations';

interface HeaderProps {
  usdToAfnRate: number;
  onUpdateExchangeRate: (newRate: number) => void;
  currencyMode: DisplayMode;
  onChangeCurrencyMode: (mode: DisplayMode) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  lang: Language;
  onChangeLang: (l: Language) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenUnitGuide: () => void;
  onOpenGitHubModal: () => void;
  tickCount: number;
  apiSource?: string;
  isFetchingApi?: boolean;
  onRefreshPrices?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  usdToAfnRate,
  onUpdateExchangeRate,
  currencyMode,
  onChangeCurrencyMode,
  isStreaming,
  onToggleStreaming,
  lang,
  onChangeLang,
  theme,
  onToggleTheme,
  onOpenUnitGuide,
  onOpenGitHubModal,
  tickCount,
  apiSource = 'GoldPrice.org (Live Feed)',
  isFetchingApi = false,
  onRefreshPrices,
}) => {
  const t = useTranslation(lang);
  const [timeInfo, setTimeInfo] = useState(formatAfghanistanTime());
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(usdToAfnRate.toString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(formatAfghanistanTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveRate = () => {
    const parsed = parseFloat(tempRate);
    if (!isNaN(parsed) && parsed > 10 && parsed < 200) {
      onUpdateExchangeRate(parsed);
      setIsEditingRate(false);
    }
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Top micro-bar: Timezones, Live status & exchange rate */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-b border-slate-100 dark:border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Live streaming status */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-emerald-500 dark:bg-emerald-400 animate-ping' : 'bg-amber-500 dark:bg-amber-400'
              }`}
            />
            <span className="font-semibold tracking-wider text-[11px] text-slate-800 dark:text-slate-200">
              {isStreaming ? t.liveStreaming : t.paused}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-1.5 ml-1">
              1s
            </span>
          </div>

          <button
            id="header-toggle-stream-btn"
            onClick={onToggleStreaming}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border cursor-pointer ${
              isStreaming
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
            }`}
            title={isStreaming ? t.pauseStream : t.resumeStream}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3 h-3 text-amber-500" />
                <span>{t.pauseStream}</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-500" />
                <span>{t.resumeStream}</span>
              </>
            )}
          </button>

          <span className="hidden md:inline-block text-slate-500 dark:text-slate-400 text-[11px]">
            {t.liveTicksRegistered}: <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">{tickCount}</span>
          </span>

          {/* Official API Source Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px]">
            <Globe2 className="w-3 h-3 text-amber-500" />
            <span className="font-semibold">GoldPrice.org</span>
            <span className="hidden lg:inline text-[10px] text-amber-600 dark:text-amber-400/80">(رسمی)</span>
          </div>

          {/* Live Sync Trigger */}
          {onRefreshPrices && (
            <button
              id="header-refresh-prices-btn"
              onClick={onRefreshPrices}
              disabled={isFetchingApi}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
              title="بروزرسانی داده‌ها از وب‌سرویس رسمی GoldPrice.org و بورس"
            >
              <RefreshCw className={`w-3 h-3 text-amber-500 ${isFetchingApi ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isFetchingApi ? 'در حال دریافت...' : 'بروزرسانی'}</span>
            </button>
          )}
        </div>

        {/* Live Sarai Shahzada Exchange Rate & Clocks */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">USD/AFN:</span>
            {isEditingRate ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.05"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-16 px-1 py-0.5 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-300 border border-amber-500 rounded text-xs font-mono focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveRate}
                  className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded cursor-pointer"
                  title="Save Rate"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                id="header-edit-rate-btn"
                onClick={() => {
                  setTempRate(usdToAfnRate.toString());
                  setIsEditingRate(true);
                }}
                className="group flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 cursor-pointer"
                title="Click to adjust Kabul exchange rate"
              >
                <span>1$ = {usdToAfnRate.toFixed(2)} ؋</span>
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 group-hover:text-amber-500 underline decoration-dotted">
                  ({t.editRate})
                </span>
              </button>
            )}
          </div>

          {/* Kabul Time Clock */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
            <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{timeInfo.timeStr}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400/90">AFT (Kabul)</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-300/40 shrink-0">
            <TrendingUp className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.appTitle}</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                سرای شهزاده
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action controls: Currency, Theme Switch, Language, Unit Guide */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* Currency Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              id="currency-afn-btn"
              onClick={() => onChangeCurrencyMode('AFN')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                currencyMode === 'AFN'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              افغانی (AFN ؋)
            </button>
            <button
              id="currency-usd-btn"
              onClick={() => onChangeCurrencyMode('USD')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                currencyMode === 'USD'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              id="currency-both-btn"
              onClick={() => onChangeCurrencyMode('BOTH')}
              className={`px-2 sm:px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                currencyMode === 'BOTH'
                  ? 'bg-slate-200 dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Display both currencies"
            >
              AFN + USD
            </button>
          </div>

          {/* Dark / Light Theme Switch Button */}
          <button
            id="theme-switch-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline">{t.lightMode}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">{t.darkMode}</span>
              </>
            )}
          </button>

          {/* TWO LANGUAGES ONLY: English and Persian */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 text-xs font-medium">
            <button
              id="lang-fa-btn"
              onClick={() => onChangeLang('fa')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                lang === 'fa'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              فارسی / دری
            </button>
            <button
              id="lang-en-btn"
              onClick={() => onChangeLang('en')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              English
            </button>
          </div>

          {/* Unit guide modal trigger */}
          <button
            id="unit-guide-open-btn"
            onClick={onOpenUnitGuide}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{t.unitGuideTitle}</span>
            <span className="sm:hidden">راهنما</span>
          </button>

          {/* GitHub Pages Host button */}
          <button
            id="github-host-open-btn"
            onClick={onOpenGitHubModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-amber-500/40 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            title="آماده‌سازی برای میزبانی در هاست گیت‌هاب (GitHub Pages)"
          >
            <Github className="w-3.5 h-3.5 text-slate-800 dark:text-white" />
            <span className="hidden sm:inline">GitHub Host</span>
            <span className="sm:hidden">GitHub</span>
          </button>
        </div>
      </div>
    </header>
  );
};
