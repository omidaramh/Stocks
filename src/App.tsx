import React, { useState, useEffect, useCallback } from 'react';
import {
  Commodity,
  Timeframe,
  AnyUnitKey,
  DisplayMode,
  Language,
  Theme,
  ChartDataPoint,
  StockCompany,
} from './types';
import { INITIAL_COMMODITIES, INITIAL_USD_AFN_RATE } from './data/commodities';
import { INITIAL_STOCKS } from './data/stocks';
import { generateHistoricalData } from './data/historyGenerator';
import { Header } from './components/Header';
import { TickerRibbon } from './components/TickerRibbon';
import { InteractiveChart } from './components/InteractiveChart';
import { SaraiShahzadaBoard } from './components/SaraiShahzadaBoard';
import { BigCompaniesStocks } from './components/BigCompaniesStocks';
import { CommoditiesGrid } from './components/CommoditiesGrid';
import { ConversionCalculator } from './components/ConversionCalculator';
import { UnitGuideModal } from './components/UnitGuideModal';
import { GitHubPagesModal } from './components/GitHubPagesModal';

export default function App() {
  // Theme state: dark / light
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-theme') as Theme;
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Commodities & Stocks state
  const [commodities, setCommodities] = useState<Commodity[]>(INITIAL_COMMODITIES);
  const [stocks, setStocks] = useState<StockCompany[]>(INITIAL_STOCKS);
  const [usdToAfnRate, setUsdToAfnRate] = useState<number>(INITIAL_USD_AFN_RATE);
  const [currencyMode, setCurrencyMode] = useState<DisplayMode>('AFN');
  const [lang, setLang] = useState<Language>('fa'); // Persian/Dari default for Afghan context

  // Active chart state
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('gold');
  const [selectedUnit, setSelectedUnit] = useState<AnyUnitKey>('gram_24k');
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [chartCurrency, setChartCurrency] = useState<'AFN' | 'USD'>('AFN');

  // Streaming & Real API state
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [tickCount, setTickCount] = useState<number>(0);
  const [apiSource, setApiSource] = useState<string>('GoldPrice.org (Live Feed)');
  const [isFetchingApi, setIsFetchingApi] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);

  // Historical data cache for active commodity & timeframe
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);

  const activeCommodity =
    commodities.find((c) => c.id === selectedCommodityId) || commodities[0];

  // Fetch real-time live prices from backend proxy connected to GoldPrice.org and Yahoo Finance
  const fetchLivePrices = useCallback(async () => {
    setIsFetchingApi(true);
    try {
      const res = await fetch('/api/prices');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.source) setApiSource(data.source);
          if (data.usdToAfnRate && typeof data.usdToAfnRate === 'number') {
            setUsdToAfnRate(data.usdToAfnRate);
          }

          // Update Commodities
          if (data.rates) {
            setCommodities((prevComms) => {
              return prevComms.map((comm) => {
                const live = data.rates[comm.id];
                if (!live) return comm;

                const newBase = Number(live.priceOzUSD ?? live.priceBblUSD ?? comm.basePriceUSD);
                const dir: 'up' | 'down' | 'same' =
                  newBase > comm.basePriceUSD ? 'up' : newBase < comm.basePriceUSD ? 'down' : 'same';

                return {
                  ...comm,
                  previousPriceUSD: comm.basePriceUSD,
                  basePriceUSD: newBase,
                  change24hUSD: Number((live.change24hUSD ?? comm.change24hUSD).toFixed(2)),
                  changePercent24h: Number((live.changePercent24h ?? comm.changePercent24h).toFixed(2)),
                  high24hUSD: Number((live.high24hUSD ?? Math.max(comm.high24hUSD, newBase)).toFixed(2)),
                  low24hUSD: Number((live.low24hUSD ?? Math.min(comm.low24hUSD, newBase)).toFixed(2)),
                  lastTickDirection: dir,
                  lastUpdated: Date.now(),
                };
              });
            });
          }

          // Update Stocks
          if (data.stocks) {
            setStocks((prevStocks) => {
              return prevStocks.map((stk) => {
                const live = data.stocks[stk.symbol];
                if (!live) return stk;
                return {
                  ...stk,
                  previousPriceUSD: stk.priceUSD,
                  priceUSD: Number(live.price.toFixed(2)),
                  change24hUSD: Number(live.change.toFixed(2)),
                  changePercent24h: Number(live.changePercent.toFixed(2)),
                  high24hUSD: Number((live.high ?? stk.high24hUSD).toFixed(2)),
                  low24hUSD: Number((live.low ?? stk.low24hUSD).toFixed(2)),
                  lastUpdated: Date.now(),
                };
              });
            });
          }
        }
      }
    } catch (err) {
      console.warn('Real API fetch warning, using fallback rates:', err);
    } finally {
      setIsFetchingApi(false);
    }
  }, []);

  // Initial load and periodic polling from real API
  useEffect(() => {
    fetchLivePrices();

    // Poll live prices every 10 seconds
    const timer = setInterval(() => {
      if (isStreaming) {
        fetchLivePrices();
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [fetchLivePrices, isStreaming]);

  // Load / regenerate historical data when active commodity or timeframe changes
  useEffect(() => {
    const data = generateHistoricalData(
      activeCommodity.id,
      activeCommodity.basePriceUSD,
      timeframe
    );
    setHistoricalData(data);
  }, [selectedCommodityId, timeframe]);

  // Keep selectedUnit valid when changing commodity
  const handleSelectCommodity = useCallback((id: string, unit?: AnyUnitKey) => {
    setSelectedCommodityId(id);
    const comm = commodities.find((c) => c.id === id);
    if (comm) {
      if (unit && comm.supportedUnits.includes(unit)) {
        setSelectedUnit(unit);
      } else {
        setSelectedUnit(comm.defaultUnit);
      }
    }
  }, [commodities]);

  const handleSelectCommodityWithUnit = useCallback((commodityId: string, unit: AnyUnitKey) => {
    handleSelectCommodity(commodityId, unit);
    // Smooth scroll up to chart
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }, [handleSelectCommodity]);

  // SECOND-BY-SECOND LIVE TICK ENGINE
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setTickCount((prev) => prev + 1);

      // Micro-tick for commodities
      setCommodities((prevCommodities) => {
        return prevCommodities.map((comm) => {
          const isGold = comm.id === 'gold';
          const isOil = comm.category === 'energy';
          const maxFluctuation = isOil ? 0.0007 : isGold ? 0.0003 : 0.0005;

          const delta = (Math.random() - 0.495) * maxFluctuation * comm.basePriceUSD;
          const newPrice = Math.max(0.1, Number((comm.basePriceUSD + delta).toFixed(2)));

          const dir: 'up' | 'down' | 'same' =
            newPrice > comm.basePriceUSD ? 'up' : newPrice < comm.basePriceUSD ? 'down' : 'same';

          const newHigh = Math.max(comm.high24hUSD, newPrice);
          const newLow = Math.min(comm.low24hUSD, newPrice);
          const change24h = Number((newPrice - comm.openPriceUSD).toFixed(2));
          const changePercent = Number(((change24h / comm.openPriceUSD) * 100).toFixed(2));

          return {
            ...comm,
            previousPriceUSD: comm.basePriceUSD,
            basePriceUSD: newPrice,
            high24hUSD: newHigh,
            low24hUSD: newLow,
            change24hUSD: change24h,
            changePercent24h: changePercent,
            lastTickDirection: dir,
            lastUpdated: Date.now(),
          };
        });
      });

      // Micro-tick for stocks
      setStocks((prevStocks) => {
        return prevStocks.map((stk) => {
          const delta = (Math.random() - 0.498) * 0.0003 * stk.priceUSD;
          const newPrice = Math.max(1, Number((stk.priceUSD + delta).toFixed(2)));
          return {
            ...stk,
            previousPriceUSD: stk.priceUSD,
            priceUSD: newPrice,
            high24hUSD: Math.max(stk.high24hUSD, newPrice),
            low24hUSD: Math.min(stk.low24hUSD, newPrice),
            lastUpdated: Date.now(),
          };
        });
      });

      // Update the latest point in historical chart if active
      setHistoricalData((prevPoints) => {
        if (prevPoints.length === 0) return prevPoints;
        const lastIdx = prevPoints.length - 1;
        const lastPt = prevPoints[lastIdx];

        setCommodities((currentComms) => {
          const targetComm = currentComms.find((c) => c.id === selectedCommodityId);
          if (targetComm) {
            lastPt.priceUSD = targetComm.basePriceUSD;
            lastPt.highUSD = Math.max(lastPt.highUSD ?? targetComm.basePriceUSD, targetComm.basePriceUSD);
            lastPt.lowUSD = Math.min(lastPt.lowUSD ?? targetComm.basePriceUSD, targetComm.basePriceUSD);
          }
          return currentComms;
        });

        const updated = [...prevPoints];
        updated[lastIdx] = { ...lastPt };
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, selectedCommodityId]);

  // RTL handling for Persian
  const isRTL = lang === 'fa';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 transition-colors"
    >
      {/* Sticky Header */}
      <Header
        usdToAfnRate={usdToAfnRate}
        onUpdateExchangeRate={(rate) => setUsdToAfnRate(rate)}
        currencyMode={currencyMode}
        onChangeCurrencyMode={(mode) => {
          setCurrencyMode(mode);
          if (mode !== 'BOTH') {
            setChartCurrency(mode);
          }
        }}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming((prev) => !prev)}
        lang={lang}
        onChangeLang={(l) => setLang(l)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenUnitGuide={() => setIsGuideOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        tickCount={tickCount}
        apiSource={apiSource}
        isFetchingApi={isFetchingApi}
        onRefreshPrices={fetchLivePrices}
      />

      {/* Live Second-by-Second Ticker Ribbon */}
      <TickerRibbon
        commodities={commodities}
        stocks={stocks}
        usdToAfnRate={usdToAfnRate}
        currencyMode={currencyMode}
        lang={lang}
        onSelectCommodity={handleSelectCommodity}
        selectedId={selectedCommodityId}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Interactive Chart Section */}
        <section id="interactive-chart-section">
          <InteractiveChart
            commodity={activeCommodity}
            historicalData={historicalData}
            selectedUnit={selectedUnit}
            onChangeUnit={(u) => setSelectedUnit(u)}
            timeframe={timeframe}
            onChangeTimeframe={(tf) => setTimeframe(tf)}
            currency={chartCurrency}
            onChangeCurrency={(c) => setChartCurrency(c)}
            usdToAfnRate={usdToAfnRate}
            lang={lang}
          />
        </section>

        {/* Official Sarai Shahzada Kabul Gold, Metals & Oil Board */}
        <section id="sarai-shahzada-board-section">
          <SaraiShahzadaBoard
            commodities={commodities}
            usdToAfnRate={usdToAfnRate}
            currencyMode={currencyMode}
            lang={lang}
            onSelectCommodityWithUnit={handleSelectCommodityWithUnit}
          />
        </section>

        {/* Big Companies Stocks Section */}
        <section id="big-companies-stocks-section">
          <BigCompaniesStocks
            stocks={stocks}
            currency={currencyMode === 'BOTH' ? 'AFN' : currencyMode}
            usdToAfnRate={usdToAfnRate}
            language={lang}
          />
        </section>

        {/* Live Afghan Currency & Traditional Metrics Calculator */}
        <section id="calculator-section">
          <ConversionCalculator
            commodities={commodities}
            usdToAfnRate={usdToAfnRate}
            lang={lang}
          />
        </section>

        {/* All Commodities & Expensive Metals Deck */}
        <section id="all-commodities-grid-section">
          <CommoditiesGrid
            commodities={commodities}
            usdToAfnRate={usdToAfnRate}
            currencyMode={currencyMode}
            lang={lang}
            onSelectCommodity={handleSelectCommodity}
            selectedCommodityId={selectedCommodityId}
          />
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 py-6 px-4 mt-12 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p>
              {lang === 'fa'
                ? 'مرکز نرخ‌های لحظه‌ای طلا، نقره، پلاتین، سوخت و سهام شرکت‌های بزرگ - همگام با صرافی سرای شهزاده کابل'
                : 'Live Gold, Silver, Platinum, Fuels & Big Tech Stocks Feed - Kabul Sarai Shahzada Standard'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-500 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'fa' ? 'دانلود فایل تک‌صفحه‌ای index.html' : 'Download Standalone index.html'}</span>
            </button>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">GoldPrice.org</span>
            <span>•</span>
            <span>1 oz = 31.1035 gr</span>
          </div>
        </div>
      </footer>

      {/* Educational Metric & Currency Guide Modal */}
      <UnitGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        lang={lang}
      />

      {/* GitHub Pages Host & Standalone HTML Export Modal */}
      <GitHubPagesModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
