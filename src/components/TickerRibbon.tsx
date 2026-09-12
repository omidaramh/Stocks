import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Commodity, DisplayMode, Language, StockCompany } from '../types';
import { calculateConvertedPrice, formatPrice } from '../utils/formatters';

interface TickerRibbonProps {
  commodities: Commodity[];
  stocks?: StockCompany[];
  usdToAfnRate: number;
  currencyMode: DisplayMode;
  lang: Language;
  onSelectCommodity: (id: string) => void;
  selectedId: string;
}

export const TickerRibbon: React.FC<TickerRibbonProps> = ({
  commodities,
  stocks = [],
  usdToAfnRate,
  currencyMode,
  lang,
  onSelectCommodity,
  selectedId,
}) => {
  // Key highlighted items strictly covering:
  // Metals: Gold, Silver, Platinum (Gram & Ounce)
  // Fuels: Diesel, Petrol, Gas (Barrel & Liter)
  const ribbonItems = [
    {
      commodityId: 'gold',
      unitKey: 'gram_24k' as const,
      labelEn: 'Gold (1 gr)',
      labelFa: 'طلا (۱ گرام)',
    },
    {
      commodityId: 'gold',
      unitKey: 'troy_oz' as const,
      labelEn: 'Gold (1 oz)',
      labelFa: 'طلا (۱ اونس)',
    },
    {
      commodityId: 'silver',
      unitKey: 'gram_24k' as const,
      labelEn: 'Silver (1 gr)',
      labelFa: 'نقره (۱ گرام)',
    },
    {
      commodityId: 'silver',
      unitKey: 'troy_oz' as const,
      labelEn: 'Silver (1 oz)',
      labelFa: 'نقره (۱ اونس)',
    },
    {
      commodityId: 'platinum',
      unitKey: 'gram_24k' as const,
      labelEn: 'Platinum (1 gr)',
      labelFa: 'پلاتین (۱ گرام)',
    },
    {
      commodityId: 'platinum',
      unitKey: 'troy_oz' as const,
      labelEn: 'Platinum (1 oz)',
      labelFa: 'پلاتین (۱ اونس)',
    },
    {
      commodityId: 'diesel',
      unitKey: 'liter' as const,
      labelEn: 'Diesel (1 L)',
      labelFa: 'دیزل (۱ لیتر)',
    },
    {
      commodityId: 'diesel',
      unitKey: 'barrel' as const,
      labelEn: 'Diesel (1 bbl)',
      labelFa: 'دیزل (۱ بشکه)',
    },
    {
      commodityId: 'petrol',
      unitKey: 'liter' as const,
      labelEn: 'Petrol (1 L)',
      labelFa: 'پترول (۱ لیتر)',
    },
    {
      commodityId: 'petrol',
      unitKey: 'barrel' as const,
      labelEn: 'Petrol (1 bbl)',
      labelFa: 'پترول (۱ بشکه)',
    },
    {
      commodityId: 'gas',
      unitKey: 'liter' as const,
      labelEn: 'Gas (1 L)',
      labelFa: 'گاز مایع (۱ لیتر)',
    },
    {
      commodityId: 'gas',
      unitKey: 'barrel' as const,
      labelEn: 'Gas (1 boe)',
      labelFa: 'گاز طبیعی (بشکه)',
    },
  ];

  return (
    <div id="ticker-ribbon" className="bg-white/80 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar py-2 px-4 transition-colors">
      <div className="flex items-center gap-3 min-w-max">
        {/* Live Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{lang === 'fa' ? 'تابلو زنده' : 'LIVE 1s TICKER'}</span>
        </div>

        {/* Commodity Tickers */}
        {ribbonItems.map((item, idx) => {
          const commodity = commodities.find((c) => c.id === item.commodityId);
          if (!commodity) return null;

          const priceAFN = calculateConvertedPrice(
            commodity.basePriceUSD,
            item.unitKey,
            'AFN',
            usdToAfnRate
          );
          const priceUSD = calculateConvertedPrice(
            commodity.basePriceUSD,
            item.unitKey,
            'USD',
            usdToAfnRate
          );

          const isSelected = selectedId === commodity.id;
          const label = lang === 'fa' ? item.labelFa : item.labelEn;

          const tickClass =
            commodity.lastTickDirection === 'up'
              ? 'text-emerald-600 dark:text-emerald-400'
              : commodity.lastTickDirection === 'down'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-800 dark:text-slate-200';

          return (
            <button
              key={`${item.commodityId}-${item.unitKey}-${idx}`}
              onClick={() => onSelectCommodity(commodity.id)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all text-xs text-left cursor-pointer bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 ${
                isSelected ? 'ring-1 ring-amber-500/60 shadow-xs' : ''
              }`}
            >
              <span className="font-semibold text-slate-700 dark:text-slate-300">{label}:</span>

              <div className="flex items-center gap-1.5 font-mono">
                {currencyMode === 'AFN' && (
                  <span className={`font-bold ${tickClass}`}>
                    {formatPrice(priceAFN, 'AFN')}
                  </span>
                )}
                {currencyMode === 'USD' && (
                  <span className={`font-bold ${tickClass}`}>
                    {formatPrice(priceUSD, 'USD')}
                  </span>
                )}
                {currencyMode === 'BOTH' && (
                  <div className="flex items-baseline gap-1">
                    <span className={`font-bold ${tickClass}`}>
                      {formatPrice(priceAFN, 'AFN')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({formatPrice(priceUSD, 'USD')})
                    </span>
                  </div>
                )}

                {/* Change percent */}
                <span
                  className={`inline-flex items-center text-[10px] font-bold ${
                    commodity.change24hUSD >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {commodity.change24hUSD >= 0 ? '+' : ''}
                  {commodity.changePercent24h.toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}

        {/* Stock Mini Tickers */}
        {stocks.slice(0, 5).map((stock) => {
          const isPositive = stock.changePercent24h >= 0;
          return (
            <div
              key={`ticker-stock-${stock.symbol}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
            >
              <span className="font-bold text-slate-800 dark:text-slate-200">{stock.symbol}:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">${stock.priceUSD.toFixed(2)}</span>
              <span
                className={`text-[10px] font-bold ${
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {stock.changePercent24h.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
