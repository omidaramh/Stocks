import React, { useState, useEffect } from 'react';
import {
  Activity,
  Pause,
  Play,
  Clock,
  Globe2,
  DollarSign,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Check,
  Github,
} from 'lucide-react';
import { Currency, DisplayMode, Language } from '../types';
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
  onOpenUnitGuide: () => void;
  onOpenGitHubModal: () => void;
  tickCount: number;
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
  onOpenUnitGuide,
  onOpenGitHubModal,
  tickCount,
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
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Top micro-bar: Timezones, Live status & exchange rate */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-b border-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Live streaming status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold tracking-wider text-[11px] text-slate-200">
              {isStreaming ? t.liveStreaming : t.paused}
            </span>
            <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-1.5 ml-1">
              1s
            </span>
          </div>

          <button
            onClick={onToggleStreaming}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${
              isStreaming
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700'
            }`}
            title={isStreaming ? t.pauseStream : t.resumeStream}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>{t.pauseStream}</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                <span>{t.resumeStream}</span>
              </>
            )}
          </button>

          <span className="hidden md:inline-block text-slate-400 text-[11px]">
            {t.liveTicksRegistered}: <span className="text-slate-300 font-mono font-medium">{tickCount}</span>
          </span>
        </div>

        {/* Live Sarai Shahzada Exchange Rate */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 text-[11px]">USD/AFN:</span>
            {isEditingRate ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.05"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-16 px-1 py-0.5 bg-slate-800 text-amber-300 border border-amber-500/50 rounded text-xs font-mono focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveRate}
                  className="p-1 hover:bg-emerald-900/50 text-emerald-400 rounded"
                  title="Save Rate"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempRate(usdToAfnRate.toString());
                  setIsEditingRate(true);
                }}
                className="group flex items-center gap-1 font-mono font-bold text-amber-400 hover:text-amber-300"
                title="Click to adjust Kabul exchange rate"
              >
                <span>1$ = {usdToAfnRate.toFixed(2)} ؋</span>
                <span className="text-[10px] font-normal text-slate-400 group-hover:text-amber-400 underline decoration-dotted">
                  ({t.editRate})
                </span>
              </button>
            )}
          </div>

          {/* Kabul & UTC Time clocks */}
          <div className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-200">{timeInfo.timeStr}</span>
            <span className="text-[10px] text-amber-400/90">AFT (Kabul)</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-950/40 border border-amber-300/30">
            <TrendingUp className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{t.appTitle}</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                سرای شهزاده
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action controls: Currency, Units info, Language */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Currency Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => onChangeCurrencyMode('AFN')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                currencyMode === 'AFN'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              افغانی (AFN ؋)
            </button>
            <button
              onClick={() => onChangeCurrencyMode('USD')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                currencyMode === 'USD'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => onChangeCurrencyMode('BOTH')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                currencyMode === 'BOTH'
                  ? 'bg-slate-800 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display both currencies"
            >
              AFN + USD
            </button>
          </div>

          {/* Unit guide modal trigger */}
          <button
            onClick={onOpenUnitGuide}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t.unitGuideTitle}</span>
            <span className="sm:hidden">راهنما</span>
          </button>

          {/* GitHub Pages Host button */}
          <button
            onClick={onOpenGitHubModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            title="آماده‌سازی برای میزبانی در هاست گیت‌هاب (GitHub Pages)"
          >
            <Github className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">GitHub Host</span>
            <span className="sm:hidden">GitHub</span>
          </button>

          {/* Language selector */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-medium">
            <button
              onClick={() => onChangeLang('fa')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'fa'
                  ? 'bg-slate-800 text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              دری
            </button>
            <button
              onClick={() => onChangeLang('ps')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'ps'
                  ? 'bg-slate-800 text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              پښتو
            </button>
            <button
              onClick={() => onChangeLang('en')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'en'
                  ? 'bg-slate-800 text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
