import React from 'react';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Commodity, DisplayMode, Language, AnyUnitKey } from '../types';
import { calculateConvertedPrice, formatPrice } from '../utils/formatters';
import { useTranslation } from '../utils/translations';

interface SaraiShahzadaBoardProps {
  commodities: Commodity[];
  usdToAfnRate: number;
  currencyMode: DisplayMode;
  lang: Language;
  onSelectCommodityWithUnit: (commodityId: string, unit: AnyUnitKey) => void;
}

export const SaraiShahzadaBoard: React.FC<SaraiShahzadaBoardProps> = ({
  commodities,
  usdToAfnRate,
  currencyMode,
  lang,
  onSelectCommodityWithUnit,
}) => {
  const t = useTranslation(lang);
  const gold = commodities.find((c) => c.id === 'gold');
  const silver = commodities.find((c) => c.id === 'silver');
  const brent = commodities.find((c) => c.id === 'brent_oil');

  const boardItems = [
    {
      id: 'gold_miscal_24k',
      commodityId: 'gold',
      unitKey: 'miscal_24k' as const,
      nameEn: 'Gold 24K (Pure 999)',
      nameFa: 'طلای ۲۴ عیار (شمش خالص)',
      namePs: '۲۴ عیار خالص سره زر',
      unitNameEn: 'Per Miscal (4.608g)',
      unitNameFa: 'فی مثقال (۴.۶۰۸ گرام)',
      unitNamePs: 'فی مثقال',
      badge: 'Bullion / شمش',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      commodity: gold,
    },
    {
      id: 'gold_miscal_21k',
      commodityId: 'gold',
      unitKey: 'miscal_21k' as const,
      nameEn: 'Gold 21K (Jewelry Standard)',
      nameFa: 'طلای ۲۱ عیار (معیار زیورات کابل)',
      namePs: '۲۱ عیار د زیوراتو طلا',
      unitNameEn: 'Per Miscal (4.608g)',
      unitNameFa: 'فی مثقال (۴.۶۰۸ گرام)',
      unitNamePs: 'فی مثقال',
      badge: 'Most Popular / پرمعامله‌ترین',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      commodity: gold,
    },
    {
      id: 'gold_miscal_22k',
      commodityId: 'gold',
      unitKey: 'miscal_22k' as const,
      nameEn: 'Gold 22K (Gulf / Arab Gold)',
      nameFa: 'طلای ۲۲ عیار (خلیجی / عربی)',
      namePs: '۲۲ عیار خلیجي طلا',
      unitNameEn: 'Per Miscal (4.608g)',
      unitNameFa: 'فی مثقال (۴.۶۰۸ گرام)',
      unitNamePs: 'فی مثقال',
      badge: 'Gulf Jewelry',
      badgeColor: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
      commodity: gold,
    },
    {
      id: 'gold_miscal_18k',
      commodityId: 'gold',
      unitKey: 'miscal_18k' as const,
      nameEn: 'Gold 18K (Italian / Modern)',
      nameFa: 'طلای ۱۸ عیار (ایتالوی و تراش)',
      namePs: '۱۸ عیار ایټالوي طلا',
      unitNameEn: 'Per Miscal (4.608g)',
      unitNameFa: 'فی مثقال (۴.۶۰۸ گرام)',
      unitNamePs: 'فی مثقال',
      badge: 'Designer / تراش',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      commodity: gold,
    },
    {
      id: 'gold_gram_24k',
      commodityId: 'gold',
      unitKey: 'gram_24k' as const,
      nameEn: 'Gold 24K (Metric Gram)',
      nameFa: 'طلای ۲۴ عیار (یک گرام خالص)',
      namePs: '۲۴ عیار طلا (یو ګرام)',
      unitNameEn: 'Per 1 Gram',
      unitNameFa: 'فی ۱ گرام',
      unitNamePs: 'فی ۱ ګرام',
      badge: 'Metric / متری',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      commodity: gold,
    },
    {
      id: 'gold_tola',
      commodityId: 'gold',
      unitKey: 'tola' as const,
      nameEn: 'Gold (1 Tola)',
      nameFa: 'طلای ناب (یک توله)',
      namePs: 'سره زر (یو توله)',
      unitNameEn: 'Per Tola (11.66g)',
      unitNameFa: 'فی ۱ توله (۱۱.۶۶ گرام)',
      unitNamePs: 'فی توله',
      badge: 'Bullion Bar / توله',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      commodity: gold,
    },
    {
      id: 'silver_miscal',
      commodityId: 'silver',
      unitKey: 'miscal_24k' as const,
      nameEn: 'Pure Silver (Miscal)',
      nameFa: 'نقره خالص (فی مثقال)',
      namePs: 'سپین زر (فی مثقال)',
      unitNameEn: 'Per Miscal (4.608g)',
      unitNameFa: 'فی مثقال (۴.۶۰۸ گرام)',
      unitNamePs: 'فی مثقال',
      badge: 'Silver / نقره',
      badgeColor: 'bg-slate-700 text-slate-200 border-slate-600',
      commodity: silver,
    },
    {
      id: 'brent_liter',
      commodityId: 'brent_oil',
      unitKey: 'liter' as const,
      nameEn: 'Crude Equivalent (1 Liter)',
      nameFa: 'معادل نفت خام (فی لیتر)',
      namePs: 'خام نفت (یو لیتر)',
      unitNameEn: 'Per 1 Liter',
      unitNameFa: 'فی ۱ لیتر خام',
      unitNamePs: 'فی ۱ لیتر',
      badge: 'Fuel Retail / سوخت',
      badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      commodity: brent,
    },
    {
      id: 'brent_barrel',
      commodityId: 'brent_oil',
      unitKey: 'barrel' as const,
      nameEn: 'Brent Crude (Barrel)',
      nameFa: 'نفت برنت (فی بشکه)',
      namePs: 'برینټ خام نفت (بیرل)',
      unitNameEn: 'Per Barrel (159L)',
      unitNameFa: 'فی بشکه (۱۵۹ لیتر)',
      unitNamePs: 'فی بیرل',
      badge: 'Global Oil / جهانی',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      commodity: brent,
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      {/* Title bar with authentic Kabul Sarai Shahzada banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                {t.saraiShahzadaTitle}
              </h3>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>معتبر</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t.saraiShahzadaSubtitle}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 self-start sm:self-center">
          <span className="text-amber-400 font-bold">1 USD = {usdToAfnRate.toFixed(2)} AFN</span>
          <span className="text-slate-600">|</span>
          <span>سرای شهزاده کابل</span>
        </div>
      </div>

      {/* Grid of official board quotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {boardItems.map((item) => {
          if (!item.commodity) return null;

          const priceAFN = calculateConvertedPrice(
            item.commodity.basePriceUSD,
            item.unitKey,
            'AFN',
            usdToAfnRate
          );
          const priceUSD = calculateConvertedPrice(
            item.commodity.basePriceUSD,
            item.unitKey,
            'USD',
            usdToAfnRate
          );

          const isUp = item.commodity.lastTickDirection === 'up';
          const isDown = item.commodity.lastTickDirection === 'down';
          const tickColor = isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-slate-200';

          const itemName = lang === 'fa' ? item.nameFa : lang === 'ps' ? item.namePs : item.nameEn;
          const unitName = lang === 'fa' ? item.unitNameFa : lang === 'ps' ? item.unitNamePs : item.unitNameEn;

          return (
            <div
              key={item.id}
              onClick={() => onSelectCommodityWithUnit(item.commodityId, item.unitKey)}
              className="group bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3.5 transition-all cursor-pointer shadow-sm relative overflow-hidden"
            >
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                    {itemName}
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">
                    {unitName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </div>

              {/* Price Row */}
              <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-baseline justify-between gap-2">
                <div>
                  {/* Primary AFN Price */}
                  <div className={`text-lg font-mono font-extrabold tracking-tight ${tickColor}`}>
                    {formatPrice(priceAFN, 'AFN')}
                  </div>
                  {/* Secondary USD equivalent */}
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <span>{formatPrice(priceUSD, 'USD')}</span>
                    <span className="text-[10px] text-slate-500">معادل</span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-0.5 text-xs font-semibold font-mono ${
                      item.commodity.change24hUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.commodity.change24hUSD >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {item.commodity.changePercent24h >= 0 ? '+' : ''}
                      {item.commodity.changePercent24h.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1 group-hover:text-amber-400 transition-colors mt-0.5">
                    <span>{t.viewChart}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Subtle top edge glow on tick */}
              {isUp && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 animate-pulse" />
              )}
              {isDown && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-400 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
