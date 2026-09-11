import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Commodity, DisplayMode, Language } from '../types';
import { calculateConvertedPrice, formatPrice } from '../utils/formatters';

interface TickerRibbonProps {
  commodities: Commodity[];
  usdToAfnRate: number;
  currencyMode: DisplayMode;
  lang: Language;
  onSelectCommodity: (id: string) => void;
  selectedId: string;
}

export const TickerRibbon: React.FC<TickerRibbonProps> = ({
  commodities,
  usdToAfnRate,
  currencyMode,
  lang,
  onSelectCommodity,
  selectedId,
}) => {
  // Key highlighted items for the rapid ticker ribbon
  const ribbonItems = [
    {
      commodityId: 'gold',
      unitKey: 'miscal_24k' as const,
      labelEn: 'Gold 24K (Miscal)',
      labelFa: 'طلای ۲۴ (مثقال)',
      labelPs: '۲۴ عیار طلا (مثقال)',
    },
    {
      commodityId: 'gold',
      unitKey: 'miscal_21k' as const,
      labelEn: 'Gold 21K (Miscal)',
      labelFa: 'طلای ۲۱ (مثقال - رایج)',
      labelPs: '۲۱ عیار طلا (مثقال)',
    },
    {
      commodityId: 'gold',
      unitKey: 'gram_24k' as const,
      labelEn: 'Gold (1 Gram)',
      labelFa: 'طلای ۲۴ (۱ گرام)',
      labelPs: 'طلا (۱ ګرام)',
    },
    {
      commodityId: 'silver',
      unitKey: 'miscal_24k' as const,
      labelEn: 'Silver (Miscal)',
      labelFa: 'نقره (مثقال)',
      labelPs: 'نقره (مثقال)',
    },
    {
      commodityId: 'brent_oil',
      unitKey: 'barrel' as const,
      labelEn: 'Brent Oil (Barrel)',
      labelFa: 'نفت برنت (بشکه)',
      labelPs: 'برینټ نفت (بیرل)',
    },
    {
      commodityId: 'brent_oil',
      unitKey: 'liter' as const,
      labelEn: 'Brent Oil (1 Liter)',
      labelFa: 'نفت (۱ لیتر)',
      labelPs: 'نفت (۱ لیتر)',
    },
    {
      commodityId: 'wti_oil',
      unitKey: 'barrel' as const,
      labelEn: 'WTI Oil (Barrel)',
      labelFa: 'نفت وست تگزاس (بشکه)',
      labelPs: 'ډبلیو ټي آی (بیرل)',
    },
    {
      commodityId: 'platinum',
      unitKey: 'gram_24k' as const,
      labelEn: 'Platinum (1g)',
      labelFa: 'پلاتین (۱ گرام)',
      labelPs: 'پلاتینیم (۱ ګرام)',
    },
    {
      commodityId: 'rhodium',
      unitKey: 'gram_24k' as const,
      labelEn: 'Rhodium (1g)',
      labelFa: 'رودیوم (۱ گرام)',
      labelPs: 'رودیم (۱ ګرام)',
    },
  ];

  return (
    <div className="bg-slate-900/60 border-y border-slate-800/80 overflow-x-auto no-scrollbar py-2 px-4">
      <div className="flex items-center gap-3 min-w-max">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] font-bold text-amber-400 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>{lang === 'fa' ? 'تابلو زنده لحظه‌ای' : lang === 'ps' ? 'ژوندۍ تخته' : 'LIVE 1s TICKER'}</span>
        </div>

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
          const label = lang === 'fa' ? item.labelFa : lang === 'ps' ? item.labelPs : item.labelEn;

          const tickClass =
            commodity.lastTickDirection === 'up'
              ? 'text-emerald-400'
              : commodity.lastTickDirection === 'down'
              ? 'text-rose-400'
              : 'text-slate-200';

          const flashBorder =
            commodity.lastTickDirection === 'up'
              ? 'border-emerald-500/40 bg-emerald-950/20'
              : commodity.lastTickDirection === 'down'
              ? 'border-rose-500/40 bg-rose-950/20'
              : 'border-slate-800 bg-slate-950/60';

          return (
            <button
              key={`${item.commodityId}-${item.unitKey}-${idx}`}
              onClick={() => onSelectCommodity(commodity.id)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all text-xs text-left cursor-pointer hover:border-slate-700 ${flashBorder} ${
                isSelected ? 'ring-1 ring-amber-500/60 shadow-sm' : ''
              }`}
            >
              <span className="font-semibold text-slate-300">{label}:</span>

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
                  <div className="flex items-center gap-1">
                    <span className={`font-bold ${tickClass}`}>
                      {formatPrice(priceAFN, 'AFN')}
                    </span>
                    <span className="text-[10px] text-slate-500">/</span>
                    <span className="text-slate-400">
                      {formatPrice(priceUSD, 'USD')}
                    </span>
                  </div>
                )}

                {commodity.lastTickDirection === 'up' && (
                  <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                )}
                {commodity.lastTickDirection === 'down' && (
                  <TrendingDown className="w-3 h-3 text-rose-400 shrink-0" />
                )}
                {commodity.lastTickDirection === 'same' && (
                  <Minus className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
