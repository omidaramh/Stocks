import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  ChevronDown,
  Coins,
  Fuel,
} from 'lucide-react';
import {
  Commodity,
  AnyUnitKey,
  DisplayMode,
  Language,
} from '../types';
import { UNIT_DEFINITIONS } from '../data/units';
import {
  calculateConvertedPrice,
  formatPrice,
} from '../utils/formatters';
import { useTranslation } from '../utils/translations';

interface CommoditiesGridProps {
  commodities: Commodity[];
  usdToAfnRate: number;
  currencyMode: DisplayMode;
  lang: Language;
  onSelectCommodity: (commodityId: string, unit?: AnyUnitKey) => void;
  selectedCommodityId: string;
}

export const CommoditiesGrid: React.FC<CommoditiesGridProps> = ({
  commodities,
  usdToAfnRate,
  currencyMode,
  lang,
  onSelectCommodity,
  selectedCommodityId,
}) => {
  const t = useTranslation(lang);
  const [filterCategory, setFilterCategory] = useState<'all' | 'metals' | 'energy'>('all');
  const [cardUnits, setCardUnits] = useState<Record<string, AnyUnitKey>>({});

  const filteredCommodities = commodities.filter((c) => {
    if (filterCategory === 'metals') return c.category === 'precious_metals';
    if (filterCategory === 'energy') return c.category === 'energy';
    return true;
  });

  const getSelectedUnit = (commodity: Commodity): AnyUnitKey => {
    return cardUnits[commodity.id] || commodity.defaultUnit;
  };

  const handleUnitChange = (commodityId: string, unit: AnyUnitKey) => {
    setCardUnits((prev) => ({ ...prev, [commodityId]: unit }));
  };

  return (
    <div id="commodities-grid-section" className="space-y-4">
      {/* Category filter tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          <button
            id="filter-all-btn"
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.allAssets}
          </button>
          <button
            id="filter-metals-btn"
            onClick={() => setFilterCategory('metals')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterCategory === 'metals'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{t.metalsTab}</span>
          </button>
          <button
            id="filter-energy-btn"
            onClick={() => setFilterCategory('energy')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterCategory === 'energy'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>{t.energyTab}</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          {filteredCommodities.length} {lang === 'fa' ? 'کالای فعال با نوسان زنده' : 'active spot markets'}
        </span>
      </div>

      {/* Grid of Commodity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommodities.map((commodity) => {
          const unitKey = getSelectedUnit(commodity);
          const unitDef = UNIT_DEFINITIONS[unitKey] || UNIT_DEFINITIONS[commodity.defaultUnit];
          const isSelected = selectedCommodityId === commodity.id;

          const priceAFN = calculateConvertedPrice(
            commodity.basePriceUSD,
            unitKey,
            'AFN',
            usdToAfnRate
          );
          const priceUSD = calculateConvertedPrice(
            commodity.basePriceUSD,
            unitKey,
            'USD',
            usdToAfnRate
          );

          const highAFN = calculateConvertedPrice(
            commodity.high24hUSD,
            unitKey,
            'AFN',
            usdToAfnRate
          );
          const lowAFN = calculateConvertedPrice(
            commodity.low24hUSD,
            unitKey,
            'AFN',
            usdToAfnRate
          );

          const isUp = commodity.lastTickDirection === 'up';
          const isDown = commodity.lastTickDirection === 'down';
          const isPositiveDay = commodity.change24hUSD >= 0;

          const flashClass = isUp ? 'flash-up' : isDown ? 'flash-down' : '';

          return (
            <div
              key={commodity.id}
              id={`commodity-card-${commodity.id}`}
              className={`bg-white dark:bg-slate-900/90 border rounded-2xl p-4 transition-all relative flex flex-col justify-between shadow-xs ${
                isSelected
                  ? 'border-amber-500 ring-2 ring-amber-500/30 dark:shadow-lg dark:shadow-amber-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Title, Symbol, and Unit Dropdown */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: commodity.accentColor }}
                      />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {lang === 'fa' ? commodity.nameFa : commodity.nameEn}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {commodity.symbol}
                    </span>
                  </div>

                  {/* Unit Selector inside Card: Gram & Ounce for metals, Barrel & Liter for oil */}
                  <div className="relative">
                    <select
                      id={`unit-select-${commodity.id}`}
                      value={unitKey}
                      onChange={(e) => handleUnitChange(commodity.id, e.target.value as AnyUnitKey)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-amber-700 dark:text-amber-300 text-xs rounded-lg px-2.5 py-1 pr-6 font-semibold appearance-none cursor-pointer focus:outline-none transition-colors"
                      title={commodity.category === 'precious_metals' ? 'نمایش بر اساس گرام و اونس' : 'نمایش بر اساس بشکه و لیتر'}
                    >
                      {commodity.supportedUnits.map((u) => {
                        const uInfo = UNIT_DEFINITIONS[u];
                        return (
                          <option key={u} value={u} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {lang === 'fa' ? uInfo.nameFa : uInfo.nameEn}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Dedicated Gold Karat Selector Dropdown for Gold */}
                {commodity.id === 'gold' && (
                  <div className="mt-2.5 flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-700/60">
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      {lang === 'fa' ? 'انتخاب عیار طلا:' : 'Gold Karat:'}
                    </span>
                    <select
                      id="gold-card-karat-dropdown"
                      value={unitKey.includes('18k') ? '18K' : unitKey.includes('21k') ? '21K' : '24K'}
                      onChange={(e) => {
                        const k = e.target.value;
                        const isOz = unitKey.startsWith('troy_oz');
                        if (k === '24K') handleUnitChange('gold', isOz ? 'troy_oz' : 'gram_24k');
                        else if (k === '21K') handleUnitChange('gold', isOz ? 'troy_oz_21k' : 'gram_21k');
                        else if (k === '18K') handleUnitChange('gold', isOz ? 'troy_oz_18k' : 'gram_18k');
                      }}
                      className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-extrabold rounded-md px-2 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="24K">{lang === 'fa' ? '۲۴ عیار (خالص ۹۹.۹٪)' : '24 Karat (99.9% Pure)'}</option>
                      <option value="21K">{lang === 'fa' ? '۲۱ عیار (۸۷.۵٪ خلوص)' : '21 Karat (87.5% Purity)'}</option>
                      <option value="18K">{lang === 'fa' ? '۱۸ عیار (۷۵.۰٪ خلوص)' : '18 Karat (75.0% Purity)'}</option>
                    </select>
                  </div>
                )}

                {/* Price Display with Live 1s Flash */}
                <div className={`mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 ${flashClass}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      {lang === 'fa' ? unitDef.symbolFa : unitDef.symbol}
                    </span>
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-semibold font-mono ${
                        isPositiveDay ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositiveDay ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {isPositiveDay ? '+' : ''}
                        {commodity.changePercent24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Pricing Values */}
                  <div className="mt-1">
                    {currencyMode === 'AFN' && (
                      <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {formatPrice(priceAFN, 'AFN')}
                      </div>
                    )}

                    {currencyMode === 'USD' && (
                      <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {formatPrice(priceUSD, 'USD')}
                      </div>
                    )}

                    {currencyMode === 'BOTH' && (
                      <div>
                        <div className="text-lg font-mono font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                          {formatPrice(priceAFN, 'AFN')}
                        </div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatPrice(priceUSD, 'USD')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 24h High / Low */}
                <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs font-mono">
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">{t.high24h}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {currencyMode === 'USD'
                        ? formatPrice(commodity.high24hUSD * unitDef.multiplierFromBase, 'USD')
                        : formatPrice(highAFN, 'AFN')}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">{t.low24h}</span>
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      {currencyMode === 'USD'
                        ? formatPrice(commodity.low24hUSD * unitDef.multiplierFromBase, 'USD')
                        : formatPrice(lowAFN, 'AFN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: Load in main chart */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {commodity.category === 'precious_metals'
                    ? (lang === 'fa' ? 'فلز گرانبها (گرام / اونس)' : 'Precious Metal (gr/oz)')
                    : (lang === 'fa' ? 'سوخت و انرژی (بشکه / لیتر)' : 'Fuel & Oil (bbl/L)')}
                </span>
                <button
                  id={`view-chart-btn-${commodity.id}`}
                  onClick={() => onSelectCommodity(commodity.id, unitKey)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>{isSelected ? (lang === 'fa' ? 'در حال نمایش' : 'Active Chart') : t.viewChart}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
