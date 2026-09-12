import React, { useState } from 'react';
import { StockCompany, Currency, Language } from '../types';
import { formatPrice } from '../utils/formatters';
import { TrendingUp, TrendingDown, Search, Building2, Globe2 } from 'lucide-react';
import { motion } from 'motion/react';

interface BigCompaniesStocksProps {
  stocks: StockCompany[];
  currency: Currency;
  usdToAfnRate: number;
  language: Language;
}

export const BigCompaniesStocks: React.FC<BigCompaniesStocksProps> = ({
  stocks,
  currency,
  usdToAfnRate,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isRtl = language === 'fa';

  const filteredStocks = stocks.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.symbol.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.nameFa.toLowerCase().includes(q) ||
      s.sectorEn.toLowerCase().includes(q) ||
      s.sectorFa.toLowerCase().includes(q)
    );
  });

  return (
    <div id="big-companies-stocks-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {language === 'fa' ? 'سهام شرکت‌های بزرگ جهان' : 'Big Companies Stocks'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'fa'
                ? 'نرخ رسمی سهام برترین شرکت‌های بین‌المللی با تبدیل لحظه‌ای به دالر و افغانی'
                : 'Live market valuation of leading global corporations converted to USD & AFN'}
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            id="stocks-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'fa' ? 'جستجوی نماد یا شرکت...' : 'Search company or ticker...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Stocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredStocks.map((stock) => {
          const isPositive = stock.changePercent24h >= 0;
          const displayPriceUSD = stock.priceUSD;
          const displayPriceAFN = stock.priceUSD * usdToAfnRate;

          return (
            <motion.div
              key={stock.id}
              id={`stock-card-${stock.symbol}`}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600/70 transition-all flex flex-col justify-between"
            >
              {/* Card Header: Symbol & Change */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {stock.symbol}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                      {language === 'fa' ? stock.nameFa : stock.nameEn}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      isPositive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositive ? '+' : ''}
                    {stock.changePercent24h.toFixed(2)}%
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 truncate">
                  {language === 'fa' ? stock.sectorFa : stock.sectorEn}
                </div>

                {/* Primary Price Display */}
                <div className="space-y-1 mb-3">
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {currency === 'AFN'
                      ? formatPrice(displayPriceAFN, 'AFN', 1)
                      : formatPrice(displayPriceUSD, 'USD', 2)}
                  </div>
                  {/* Secondary Currency Equivalent */}
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {currency === 'AFN'
                      ? formatPrice(displayPriceUSD, 'USD', 2)
                      : formatPrice(displayPriceAFN, 'AFN', 1)}
                  </div>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span title="Market Capitalization">
                  {language === 'fa' ? 'ارزش بازار:' : 'Cap:'}{' '}
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">{stock.marketCap || 'N/A'}</strong>
                </span>
                <span className="font-mono text-[10px]">
                  {language === 'fa' ? 'دامنه:' : 'Range:'}{' '}
                  ${stock.low24hUSD.toFixed(0)} - ${stock.high24hUSD.toFixed(0)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
