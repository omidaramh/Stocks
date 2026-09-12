import React, { useState, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Layers,
  Maximize2,
  DollarSign,
  Activity,
  BarChart2,
  Info,
} from 'lucide-react';
import {
  Commodity,
  Timeframe,
  AnyUnitKey,
  Currency,
  Language,
  ChartDataPoint,
} from '../types';
import { UNIT_DEFINITIONS } from '../data/units';
import {
  calculateConvertedPrice,
  formatPrice,
  formatChange,
} from '../utils/formatters';
import { useTranslation } from '../utils/translations';

interface InteractiveChartProps {
  commodity: Commodity;
  historicalData: ChartDataPoint[];
  selectedUnit: AnyUnitKey;
  onChangeUnit: (unit: AnyUnitKey) => void;
  timeframe: Timeframe;
  onChangeTimeframe: (tf: Timeframe) => void;
  currency: Currency;
  onChangeCurrency: (c: Currency) => void;
  usdToAfnRate: number;
  lang: Language;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  commodity,
  historicalData,
  selectedUnit,
  onChangeUnit,
  timeframe,
  onChangeTimeframe,
  currency,
  onChangeCurrency,
  usdToAfnRate,
  lang,
}) => {
  const t = useTranslation(lang);
  const [chartMode, setChartMode] = useState<'line' | 'highlow'>('line');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unitDef = UNIT_DEFINITIONS[selectedUnit] || UNIT_DEFINITIONS[commodity.defaultUnit];
  const unitMultiplier = unitDef ? unitDef.multiplierFromBase : 1.0;
  const currencyMultiplier = currency === 'AFN' ? usdToAfnRate : 1.0;

  // Convert points to the selected unit and currency
  const convertedPoints = useMemo(() => {
    return historicalData.map((pt) => {
      const price = pt.priceUSD * unitMultiplier * currencyMultiplier;
      const high = (pt.highUSD ?? pt.priceUSD * 1.002) * unitMultiplier * currencyMultiplier;
      const low = (pt.lowUSD ?? pt.priceUSD * 0.998) * unitMultiplier * currencyMultiplier;
      const open = (pt.openUSD ?? pt.priceUSD) * unitMultiplier * currencyMultiplier;
      const close = (pt.closeUSD ?? pt.priceUSD) * unitMultiplier * currencyMultiplier;

      return {
        ...pt,
        convertedPrice: price,
        convertedHigh: high,
        convertedLow: low,
        convertedOpen: open,
        convertedClose: close,
      };
    });
  }, [historicalData, unitMultiplier, currencyMultiplier]);

  // Min, max, average, and net period change
  const stats = useMemo(() => {
    if (convertedPoints.length === 0) {
      return { min: 0, max: 0, avg: 0, change: 0, changePct: 0, current: 0 };
    }
    const prices = convertedPoints.map((p) => p.convertedPrice);
    const min = Math.min(...convertedPoints.map((p) => p.convertedLow));
    const max = Math.max(...convertedPoints.map((p) => p.convertedHigh));
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length;

    const firstPrice = convertedPoints[0].convertedPrice;
    const lastPrice = convertedPoints[convertedPoints.length - 1].convertedPrice;
    const change = lastPrice - firstPrice;
    const changePct = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;

    return {
      min,
      max,
      avg,
      change,
      changePct,
      current: lastPrice,
    };
  }, [convertedPoints]);

  const activePoint = hoverIndex !== null && convertedPoints[hoverIndex]
    ? convertedPoints[hoverIndex]
    : convertedPoints[convertedPoints.length - 1];

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 320;
  const padding = { top: 20, right: 20, bottom: 35, left: 65 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Price range with padding
  const priceRange = Math.max(0.0001, stats.max - stats.min);
  const yMin = stats.min - priceRange * 0.05;
  const yMax = stats.max + priceRange * 0.05;
  const yRange = yMax - yMin;

  const getY = (val: number) => {
    return padding.top + innerHeight - ((val - yMin) / yRange) * innerHeight;
  };

  const getX = (index: number) => {
    if (convertedPoints.length <= 1) return padding.left;
    return padding.left + (index / (convertedPoints.length - 1)) * innerWidth;
  };

  // Build SVG path
  const linePath = useMemo(() => {
    if (convertedPoints.length === 0) return '';
    return convertedPoints.reduce((path, pt, idx) => {
      const x = getX(idx);
      const y = getY(pt.convertedPrice);
      return idx === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, '');
  }, [convertedPoints, yMin, yRange]);

  const areaPath = useMemo(() => {
    if (convertedPoints.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(convertedPoints.length - 1);
    const bottomY = padding.top + innerHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, convertedPoints, innerHeight]);

  // Handle pointer tracking
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (clientX - (padding.left * rect.width) / svgWidth) / ((innerWidth * rect.width) / svgWidth)));
    const targetIdx = Math.round(ratio * (convertedPoints.length - 1));
    if (targetIdx >= 0 && targetIdx < convertedPoints.length) {
      setHoverIndex(targetIdx);
    }
  };

  const isUp = stats.change >= 0;
  const colorHex = isUp ? '#10b981' : '#f43f5e';
  const strokeColor = isUp ? 'stroke-emerald-400' : 'stroke-rose-400';
  const gradientId = `chart-grad-${commodity.id}-${timeframe}`;

  // Timeframe buttons
  const timeframes: { id: Timeframe; labelEn: string; labelFa: string }[] = [
    { id: '1H', labelEn: '1 Hour', labelFa: '۱ ساعت' },
    { id: '24H', labelEn: '24 Hours', labelFa: '۲۴ ساعت' },
    { id: '1M', labelEn: '1 Month', labelFa: '۱ ماه' },
    { id: '1Y', labelEn: '1 Year', labelFa: '۱ سال' },
    { id: 'ALL', labelEn: 'All-Time (10Y+)', labelFa: 'همه زمان‌ها (۱۰ سال)' },
  ];

  return (
    <div
      ref={containerRef}
      id="interactive-chart-container"
      className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm transition-colors"
    >
      {/* Chart Top Header: Asset Name, Current Converted Price, Unit Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: commodity.accentColor }}
            />
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {lang === 'fa' ? commodity.nameFa : commodity.nameEn}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
              {commodity.symbol}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
              {lang === 'fa' ? unitDef.nameFa : unitDef.nameEn}
            </span>
          </div>

          {/* Active Price display */}
          <div className="flex items-baseline gap-3 mt-1.5 flex-wrap">
            <div className="text-2xl md:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {activePoint ? formatPrice(activePoint.convertedPrice, currency) : '--'}
            </div>
            {activePoint && (
              <div
                className={`flex items-center gap-1 text-sm font-semibold font-mono ${
                  isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isUp ? '+' : ''}
                  {formatPrice(stats.change, currency)} ({isUp ? '+' : ''}
                  {stats.changePct.toFixed(2)}%)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">
                  ({timeframe})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Currency & Chart Visual Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Currency Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => onChangeCurrency('AFN')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                currency === 'AFN'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              افغانی (AFN ؋)
            </button>
            <button
              onClick={() => onChangeCurrency('USD')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              USD ($)
            </button>
          </div>

          {/* Chart Display Mode: Line vs Range */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setChartMode('line')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                chartMode === 'line'
                  ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t.lineArea}
            >
              {t.lineArea}
            </button>
            <button
              onClick={() => setChartMode('highlow')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                chartMode === 'highlow'
                  ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t.highLow}
            >
              {t.highLow}
            </button>
          </div>
        </div>
      </div>

      {/* UNIT SELECTOR ROW - Allows switching chart for every unit! */}
      <div className="py-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center flex-wrap gap-2.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.unitSelect}:</span>
            </span>

            {commodity.id === 'gold' && (
              <div className="flex items-center gap-1.5 p-1 px-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  {lang === 'fa' ? 'انتخاب عیار طلا:' : 'Gold Karat:'}
                </span>
                <select
                  id="chart-gold-karat-dropdown"
                  value={
                    selectedUnit.includes('18k')
                      ? '18K'
                      : selectedUnit.includes('21k')
                      ? '21K'
                      : '24K'
                  }
                  onChange={(e) => {
                    const k = e.target.value;
                    const isOz = selectedUnit.startsWith('troy_oz');
                    if (k === '24K') onChangeUnit(isOz ? 'troy_oz' : 'gram_24k');
                    else if (k === '21K') onChangeUnit(isOz ? 'troy_oz_21k' : 'gram_21k');
                    else if (k === '18K') onChangeUnit(isOz ? 'troy_oz_18k' : 'gram_18k');
                  }}
                  className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-extrabold rounded-md px-2 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="24K">{lang === 'fa' ? '۲۴ عیار (خالص ۹۹.۹٪)' : '24 Karat (99.9% Pure)'}</option>
                  <option value="21K">{lang === 'fa' ? '۲۱ عیار (۸۷.۵٪ خلوص)' : '21 Karat (87.5% Purity)'}</option>
                  <option value="18K">{lang === 'fa' ? '۱۸ عیار (۷۵.۰٪ خلوص)' : '18 Karat (75.0% Purity)'}</option>
                </select>
              </div>
            )}
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {unitDef.descriptionFa}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {commodity.supportedUnits.map((uKey) => {
            const uDef = UNIT_DEFINITIONS[uKey];
            if (!uDef) return null;
            const isCurrent = selectedUnit === uKey;

            return (
              <button
                key={uKey}
                onClick={() => onChangeUnit(uKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{lang === 'fa' ? uDef.nameFa : uDef.nameEn}</span>
                {uDef.purity && (
                  <span className="ml-1 text-[10px] opacity-75">
                    ({uDef.purity})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TIMEFRAME SELECTOR ROW */}
      <div className="flex items-center justify-between flex-wrap gap-2 py-2.5">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.timeframe}:</span>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => onChangeTimeframe(tf.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                timeframe === tf.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tf.id}</span>
              <span className="hidden sm:inline text-[10px] ml-1 opacity-80">
                ({lang === 'fa' ? tf.labelFa : tf.labelEn.split(' ')[1] || tf.labelEn})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* THE CHART SVG CANVAS */}
      <div className="relative mt-2 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 md:h-80 overflow-visible cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorHex} stopOpacity="0.3" />
              <stop offset="60%" stopColor={colorHex} stopOpacity="0.08" />
              <stop offset="100%" stopColor={colorHex} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + innerHeight * ratio;
            const priceVal = yMax - ratio * yRange;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  strokeOpacity="0.4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {formatPrice(priceVal, currency)}
                </text>
              </g>
            );
          })}

          {/* Area Gradient */}
          {chartMode === 'line' && (
            <path d={areaPath} fill={`url(#${gradientId})`} />
          )}

          {/* High-Low Bars mode */}
          {chartMode === 'highlow' &&
            convertedPoints.map((pt, idx) => {
              const x = getX(idx);
              const yHigh = getY(pt.convertedHigh);
              const yLow = getY(pt.convertedLow);
              const yClose = getY(pt.convertedPrice);
              const isBarUp = pt.convertedPrice >= (pt.convertedOpen ?? pt.convertedPrice);

              return (
                <g key={idx} opacity={hoverIndex === idx ? 1 : 0.85}>
                  {/* Stem */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={isBarUp ? '#10b981' : '#f43f5e'}
                    strokeWidth="2"
                  />
                  {/* Tick */}
                  <line
                    x1={x - 3}
                    y1={yClose}
                    x2={x + 3}
                    y2={yClose}
                    stroke={isBarUp ? '#10b981' : '#f43f5e'}
                    strokeWidth="2"
                  />
                </g>
              );
            })}

          {/* Main Price Line */}
          {chartMode === 'line' && (
            <path
              d={linePath}
              fill="none"
              stroke={colorHex}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* X-Axis Timestamps */}
          {convertedPoints.length > 0 &&
            [0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const idx = Math.min(
                convertedPoints.length - 1,
                Math.round(ratio * (convertedPoints.length - 1))
              );
              const pt = convertedPoints[idx];
              if (!pt) return null;
              const x = getX(idx);
              return (
                <text
                  key={i}
                  x={x}
                  y={svgHeight - 10}
                  textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {pt.timeLabel}
                </text>
              );
            })}

          {/* Hover Crosshair & Data Point Marker */}
          {hoverIndex !== null && convertedPoints[hoverIndex] && (
            <g>
              {/* Vertical line */}
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + innerHeight}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Horizontal line */}
              <line
                x1={padding.left}
                y1={getY(convertedPoints[hoverIndex].convertedPrice)}
                x2={svgWidth - padding.right}
                y2={getY(convertedPoints[hoverIndex].convertedPrice)}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Point circle */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(convertedPoints[hoverIndex].convertedPrice)}
                r="5"
                fill={colorHex}
                stroke="#0f172a"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Box */}
        {hoverIndex !== null && convertedPoints[hoverIndex] && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-amber-500/40 rounded-xl px-4 py-2 text-xs shadow-2xl backdrop-blur-md pointer-events-none flex items-center gap-4 z-20"
          >
            <div>
              <span className="text-[10px] text-slate-400 block">
                {convertedPoints[hoverIndex].timeLabel}
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {formatPrice(convertedPoints[hoverIndex].convertedPrice, currency)}
              </span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] text-slate-400 block">
                {lang === 'fa' ? 'واحد' : 'Unit'}
              </span>
              <span className="text-slate-200 font-medium">
                {lang === 'fa' ? unitDef.symbolFa : unitDef.symbol}
              </span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] text-slate-400 block">
                {currency === 'AFN' ? 'Equivalent in USD' : 'معادل به افغانی'}
              </span>
              <span className="font-mono text-slate-300">
                {currency === 'AFN'
                  ? formatPrice(
                      convertedPoints[hoverIndex].convertedPrice / usdToAfnRate,
                      'USD'
                    )
                  : formatPrice(
                      convertedPoints[hoverIndex].convertedPrice * usdToAfnRate,
                      'AFN'
                    )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Period Statistics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.periodHigh}</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            {formatPrice(stats.max, currency)}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.periodLow}</span>
          <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
            {formatPrice(stats.min, currency)}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.averagePrice}</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
            {formatPrice(stats.avg, currency)}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.periodChange}</span>
          <span
            className={`font-mono font-bold text-sm ${
              isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isUp ? '+' : ''}
            {formatPrice(stats.change, currency)} ({isUp ? '+' : ''}
            {stats.changePct.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
