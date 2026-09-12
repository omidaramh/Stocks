import React, { useState } from 'react';
import {
  Calculator,
  Sparkles,
} from 'lucide-react';
import { Commodity, AnyUnitKey, Language } from '../types';
import { UNIT_DEFINITIONS } from '../data/units';
import { formatPrice } from '../utils/formatters';
import { useTranslation } from '../utils/translations';

interface ConversionCalculatorProps {
  commodities: Commodity[];
  usdToAfnRate: number;
  lang: Language;
}

export const ConversionCalculator: React.FC<ConversionCalculatorProps> = ({
  commodities,
  usdToAfnRate,
  lang,
}) => {
  const t = useTranslation(lang);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('gold');
  const [selectedUnitKey, setSelectedUnitKey] = useState<AnyUnitKey>('gram_24k');
  const [inputAmount, setInputAmount] = useState<string>('5');
  const [mode, setMode] = useState<'quantity_to_money' | 'cash_to_quantity'>('quantity_to_money');
  const [cashCurrency, setCashCurrency] = useState<'AFN' | 'USD'>('AFN');
  const [cashAmount, setCashAmount] = useState<string>('50000');

  const selectedCommodity =
    commodities.find((c) => c.id === selectedCommodityId) || commodities[0];
  const unitDef = UNIT_DEFINITIONS[selectedUnitKey] || UNIT_DEFINITIONS[selectedCommodity.defaultUnit];

  // Price for 1 single unit of this commodity
  const unitPriceUSD = selectedCommodity.basePriceUSD * unitDef.multiplierFromBase;
  const unitPriceAFN = unitPriceUSD * usdToAfnRate;

  // Mode 1: Quantity to Money
  const qty = parseFloat(inputAmount) || 0;
  const totalUSD = qty * unitPriceUSD;
  const totalAFN = qty * unitPriceAFN;

  // Mode 2: Cash to Quantity
  const cash = parseFloat(cashAmount) || 0;
  const convertedQty = cashCurrency === 'AFN'
    ? (unitPriceAFN > 0 ? cash / unitPriceAFN : 0)
    : (unitPriceUSD > 0 ? cash / unitPriceUSD : 0);

  const presets = selectedCommodity.id === 'gold'
    ? [
        { label: '1 Gr 24K', unit: 'gram_24k' as AnyUnitKey, qty: '1' },
        { label: '1 Gr 21K', unit: 'gram_21k' as AnyUnitKey, qty: '1' },
        { label: '1 Gr 18K', unit: 'gram_18k' as AnyUnitKey, qty: '1' },
        { label: '10 Gr 21K', unit: 'gram_21k' as AnyUnitKey, qty: '10' },
        { label: '10 Gr 18K', unit: 'gram_18k' as AnyUnitKey, qty: '10' },
        { label: '1 Oz 24K', unit: 'troy_oz' as AnyUnitKey, qty: '1' },
      ]
    : selectedCommodity.category === 'precious_metals'
    ? [
        { label: '1 Gram (gr)', unit: 'gram_24k' as AnyUnitKey, qty: '1' },
        { label: '5 Grams (gr)', unit: 'gram_24k' as AnyUnitKey, qty: '5' },
        { label: '10 Grams (gr)', unit: 'gram_24k' as AnyUnitKey, qty: '10' },
        { label: '50 Grams (gr)', unit: 'gram_24k' as AnyUnitKey, qty: '50' },
        { label: '1 Ounce (oz)', unit: 'troy_oz' as AnyUnitKey, qty: '1' },
        { label: '5 Ounces (oz)', unit: 'troy_oz' as AnyUnitKey, qty: '5' },
      ]
    : [
        { label: '1 Liter', unit: 'liter' as AnyUnitKey, qty: '1' },
        { label: '50 Liters', unit: 'liter' as AnyUnitKey, qty: '50' },
        { label: '100 Liters', unit: 'liter' as AnyUnitKey, qty: '100' },
        { label: '1 Barrel', unit: 'barrel' as AnyUnitKey, qty: '1' },
        { label: '10 Barrels', unit: 'barrel' as AnyUnitKey, qty: '10' },
      ];

  return (
    <div id="conversion-calculator-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm transition-colors">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.calculatorTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.calculatorSubtitle}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          <button
            id="calc-mode-qty-btn"
            onClick={() => setMode('quantity_to_money')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              mode === 'quantity_to_money'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'fa' ? 'محاسبه ارزش مقدار' : 'By Quantity'}
          </button>
          <button
            id="calc-mode-cash-btn"
            onClick={() => setMode('cash_to_quantity')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              mode === 'cash_to_quantity'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'fa' ? 'محاسبه قدرت خرید با پول' : 'By Budget'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Commodity Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t.selectCommodity}:
              </label>
              <select
                id="calc-commodity-select"
                value={selectedCommodityId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedCommodityId(newId);
                  const comm = commodities.find((c) => c.id === newId);
                  if (comm) setSelectedUnitKey(comm.defaultUnit);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-amber-500"
              >
                {commodities.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {lang === 'fa' ? c.nameFa : c.nameEn} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t.selectUnit}:
              </label>
              <select
                id="calc-unit-select"
                value={selectedUnitKey}
                onChange={(e) => setSelectedUnitKey(e.target.value as AnyUnitKey)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-amber-700 dark:text-amber-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
              >
                {selectedCommodity.supportedUnits.map((u) => {
                  const def = UNIT_DEFINITIONS[u];
                  return (
                    <option key={u} value={u} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {lang === 'fa' ? def.nameFa : def.nameEn}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Quick Karat Dropdown for Gold in Calculator */}
          {selectedCommodity.id === 'gold' && (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                {lang === 'fa' ? 'عیار انتخابی طلا در منوی کشویی:' : 'Gold Karat Selection:'}
              </span>
              <select
                id="calc-gold-karat-dropdown"
                value={
                  selectedUnitKey.includes('18k')
                    ? '18K'
                    : selectedUnitKey.includes('21k')
                    ? '21K'
                    : '24K'
                }
                onChange={(e) => {
                  const k = e.target.value;
                  const isOz = selectedUnitKey.startsWith('troy_oz');
                  if (k === '24K') setSelectedUnitKey(isOz ? 'troy_oz' : 'gram_24k');
                  else if (k === '21K') setSelectedUnitKey(isOz ? 'troy_oz_21k' : 'gram_21k');
                  else if (k === '18K') setSelectedUnitKey(isOz ? 'troy_oz_18k' : 'gram_18k');
                }}
                className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-extrabold rounded-lg px-2.5 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="24K">{lang === 'fa' ? 'طلای ۲۴ عیار (خالص ۹۹.۹٪)' : '24 Karat (99.9% Pure)'}</option>
                <option value="21K">{lang === 'fa' ? 'طلای ۲۱ عیار (۸۷.۵٪ خلوص)' : '21 Karat (87.5% Purity)'}</option>
                <option value="18K">{lang === 'fa' ? 'طلای ۱۸ عیار (۷۵.۰٪ خلوص)' : '18 Karat (75.0% Purity)'}</option>
              </select>
            </div>
          )}

          {/* Value Inputs */}
          {mode === 'quantity_to_money' ? (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t.inputAmount} ({lang === 'fa' ? unitDef.symbolFa : unitDef.symbol}):
              </label>
              <div className="relative">
                <input
                  id="calc-amount-input"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-base font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500"
                  placeholder="0.00"
                />
                <span className="absolute right-3.5 top-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'fa' ? unitDef.nameFa : unitDef.nameEn}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {lang === 'fa' ? 'بودجه / مبلغ نقدی موجود' : 'Cash Budget'}:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="calc-cash-input"
                    type="number"
                    min="0"
                    step="1000"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-base font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500"
                    placeholder="0"
                  />
                </div>
                <select
                  id="calc-cash-currency-select"
                  value={cashCurrency}
                  onChange={(e) => setCashCurrency(e.target.value as 'AFN' | 'USD')}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-amber-700 dark:text-amber-300 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="AFN">افغانی (؋)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1.5 font-medium">
              {lang === 'fa' ? 'مقادیر پرکاربرد سریع' : 'Quick Presets'}:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedUnitKey(p.unit);
                    setInputAmount(p.qty);
                    setMode('quantity_to_money');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Box (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-amber-500/5 to-amber-500/10 dark:from-slate-950 dark:to-slate-900 border border-amber-500/30 rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.outputValuation}</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                1s Live Spot
              </span>
            </div>

            {mode === 'quantity_to_money' ? (
              <div className="mt-4 space-y-3">
                {/* Total in AFN */}
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">
                    {lang === 'fa' ? 'مبلغ به پول افغانی' : 'Value in Afghanis (AFN)'}:
                  </span>
                  <div className="text-2xl md:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-300 tracking-tight mt-0.5">
                    {formatPrice(totalAFN, 'AFN')}
                  </div>
                </div>

                {/* Total in USD */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">
                    {lang === 'fa' ? 'معادل به دالر آمریکایی' : 'Equivalent in USD'}:
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {formatPrice(totalUSD, 'USD')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">
                    {lang === 'fa' ? 'مقدار قابل خرید با این بودجه' : 'Quantity You Can Buy'}:
                  </span>
                  <div className="text-2xl md:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-300 tracking-tight mt-0.5">
                    {convertedQty.toFixed(3)}{' '}
                    <span className="text-base text-slate-700 dark:text-slate-300 font-sans">
                      {lang === 'fa' ? unitDef.symbolFa : unitDef.symbol}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                    {lang === 'fa' ? unitDef.nameFa : unitDef.nameEn}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer note: rate explanation */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>{lang === 'fa' ? 'نرخ فی واحد' : 'Unit spot rate'}:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {formatPrice(unitPriceAFN, 'AFN')} ({formatPrice(unitPriceUSD, 'USD')})
              </span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'fa' ? 'نرخ دالر به افغانی' : 'USD/AFN'}:</span>
              <span className="font-mono text-amber-600 dark:text-amber-400">1$ = {usdToAfnRate.toFixed(2)} ؋</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
