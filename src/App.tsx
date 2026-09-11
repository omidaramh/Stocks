import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Commodity,
  Timeframe,
  AnyUnitKey,
  DisplayMode,
  Language,
  ChartDataPoint,
} from './types';
import { INITIAL_COMMODITIES, INITIAL_USD_AFN_RATE } from './data/commodities';
import { generateHistoricalData } from './data/historyGenerator';
import { Header } from './components/Header';
import { TickerRibbon } from './components/TickerRibbon';
import { InteractiveChart } from './components/InteractiveChart';
import { SaraiShahzadaBoard } from './components/SaraiShahzadaBoard';
import { CommoditiesGrid } from './components/CommoditiesGrid';
import { ConversionCalculator } from './components/ConversionCalculator';
import { UnitGuideModal } from './components/UnitGuideModal';
import { GitHubPagesModal } from './components/GitHubPagesModal';

export default function App() {
  // Commodities state
  const [commodities, setCommodities] = useState<Commodity[]>(INITIAL_COMMODITIES);
  const [usdToAfnRate, setUsdToAfnRate] = useState<number>(INITIAL_USD_AFN_RATE);
  const [currencyMode, setCurrencyMode] = useState<DisplayMode>('AFN');
  const [lang, setLang] = useState<Language>('fa'); // Persian/Dari default for Afghan context

  // Active chart state
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('gold');
  const [selectedUnit, setSelectedUnit] = useState<AnyUnitKey>('miscal_24k');
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [chartCurrency, setChartCurrency] = useState<'AFN' | 'USD'>('AFN');

  // Streaming state
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [tickCount, setTickCount] = useState<number>(0);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);

  // Historical data cache for active commodity & timeframe
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);

  const activeCommodity =
    commodities.find((c) => c.id === selectedCommodityId) || commodities[0];

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

      setCommodities((prevCommodities) => {
        return prevCommodities.map((comm) => {
          // Micro-tick: -0.04% to +0.04% random fluctuation with slight momentum
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

      // Update the latest point in historical chart if active
      setHistoricalData((prevPoints) => {
        if (prevPoints.length === 0) return prevPoints;
        const lastIdx = prevPoints.length - 1;
        const lastPt = prevPoints[lastIdx];

        // Retrieve current active commodity's latest price
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
    }, 1000); // Exactly every second

    return () => clearInterval(interval);
  }, [isStreaming, selectedCommodityId]);

  // Direction handling for Dari / Pashto vs English
  const isRTL = lang === 'fa' || lang === 'ps';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950"
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
        onOpenUnitGuide={() => setIsGuideOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        tickCount={tickCount}
      />

      {/* Live Second-by-Second Ticker Ribbon */}
      <TickerRibbon
        commodities={commodities}
        usdToAfnRate={usdToAfnRate}
        currencyMode={currencyMode}
        lang={lang}
        onSelectCommodity={handleSelectCommodity}
        selectedId={selectedCommodityId}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Interactive Chart Section - Switching for every unit, hour/day/month/year/alltime */}
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

        {/* Official Sarai Shahzada Kabul Gold & Oil Exchange Board */}
        <section id="sarai-shahzada-board-section">
          <SaraiShahzadaBoard
            commodities={commodities}
            usdToAfnRate={usdToAfnRate}
            currencyMode={currencyMode}
            lang={lang}
            onSelectCommodityWithUnit={handleSelectCommodityWithUnit}
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

        {/* All Commodities & Expensive Metals Deck with independent unit switchers */}
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
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <p>
              {lang === 'fa'
                ? 'مرکز نرخ‌های لحظه‌ای طلا، نقره و نفت افغانستان - همگام با صرافی سرای شهزاده کابل'
                : lang === 'ps'
                ? 'په افغانستان کې د سرو زرو او نفتو د بیو رسمي سرچینه'
                : 'Afghanistan Precious Metals & Crude Oil Live Feed - Kabul Sarai Shahzada Standard'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>دانلود فایل تک‌صفحه‌ای index.html برای GitHub Host</span>
            </button>
            <span>•</span>
            <span>۱ مثقال = ۴.۶۰۸ گرام</span>
            <span>•</span>
            <span>۱ بیرل = ۱۵۹ لیتر</span>
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
