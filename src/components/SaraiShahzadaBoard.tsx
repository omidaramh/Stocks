import React, { useState } from 'react';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Coins,
  Fuel,
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
  const [boardCategory, setBoardCategory] = useState<'metals' | 'fuels'>('metals');
  const [goldKarat, setGoldKarat] = useState<'24K' | '21K' | '18K'>('24K');

  const gold = commodities.find((c) => c.id === 'gold');
  const silver = commodities.find((c) => c.id === 'silver');
  const platinum = commodities.find((c) => c.id === 'platinum');

  const diesel = commodities.find((c) => c.id === 'diesel');
  const petrol = commodities.find((c) => c.id === 'petrol');
  const gas = commodities.find((c) => c.id === 'gas');

  const goldGramUnitKey: AnyUnitKey =
    goldKarat === '24K' ? 'gram_24k' : goldKarat === '21K' ? 'gram_21k' : 'gram_18k';
  const goldOunceUnitKey: AnyUnitKey =
    goldKarat === '24K' ? 'troy_oz' : goldKarat === '21K' ? 'troy_oz_21k' : 'troy_oz_18k';

  // Strictly Gold, Silver, Platinum by Gram and Ounce with Karat (24K, 21K, 18K)
  const metalItems = [
    {
      id: 'gold_gram',
      commodityId: 'gold',
      unitKey: goldGramUnitKey,
      nameEn: `Gold ${goldKarat} (1 Metric Gram)`,
      nameFa: `طلای جهانی ${goldKarat === '24K' ? '۲۴ عیار' : goldKarat === '21K' ? '۲۱ عیار' : '۱۸ عیار'} (۱ گرام)`,
      unitNameEn: `Per 1 Gram (${goldKarat})`,
      unitNameFa: `فی ۱ گرام طلای ${goldKarat === '24K' ? '۲۴ عیار خالص' : goldKarat === '21K' ? '۲۱ عیار' : '۱۸ عیار'}`,
      badge: `Gram (${goldKarat})`,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30',
      commodity: gold,
      isGold: true,
    },
    {
      id: 'gold_ounce',
      commodityId: 'gold',
      unitKey: goldOunceUnitKey,
      nameEn: `Gold ${goldKarat} (1 Troy Ounce)`,
      nameFa: `طلای جهانی ${goldKarat === '24K' ? '۲۴ عیار' : goldKarat === '21K' ? '۲۱ عیار' : '۱۸ عیار'} (۱ اونس)`,
      unitNameEn: `Per 1 Troy Ounce (${goldKarat})`,
      unitNameFa: `فی ۱ اونس طلای ${goldKarat === '24K' ? '۲۴ عیار خالص' : goldKarat === '21K' ? '۲۱ عیار' : '۱۸ عیار'}`,
      badge: `Ounce (${goldKarat})`,
      badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 border-yellow-500/30',
      commodity: gold,
      isGold: true,
    },
    {
      id: 'silver_gram',
      commodityId: 'silver',
      unitKey: 'gram_24k' as const,
      nameEn: 'Silver (1 Metric Gram)',
      nameFa: 'نقره جهانی (۱ گرام)',
      unitNameEn: 'Per 1 Gram (gr)',
      unitNameFa: 'فی ۱ گرام نقره',
      badge: 'Gram (gr)',
      badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-200 border-slate-400 dark:border-slate-600',
      commodity: silver,
      isGold: false,
    },
    {
      id: 'silver_ounce',
      commodityId: 'silver',
      unitKey: 'troy_oz' as const,
      nameEn: 'Silver (1 Troy Ounce)',
      nameFa: 'نقره جهانی (۱ اونس تروا)',
      unitNameEn: 'Per 1 Troy Ounce (31.1035g)',
      unitNameFa: 'فی ۱ اونس تروا',
      badge: 'Ounce (oz)',
      badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-200 border-slate-400 dark:border-slate-500',
      commodity: silver,
      isGold: false,
    },
    {
      id: 'platinum_gram',
      commodityId: 'platinum',
      unitKey: 'gram_24k' as const,
      nameEn: 'Platinum (1 Metric Gram)',
      nameFa: 'پلاتین جهانی (۱ گرام)',
      unitNameEn: 'Per 1 Gram (gr)',
      unitNameFa: 'فی ۱ گرام پلاتین',
      badge: 'Gram (gr)',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
      commodity: platinum,
      isGold: false,
    },
    {
      id: 'platinum_ounce',
      commodityId: 'platinum',
      unitKey: 'troy_oz' as const,
      nameEn: 'Platinum (1 Troy Ounce)',
      nameFa: 'پلاتین جهانی (۱ اونس تروا)',
      unitNameEn: 'Per 1 Troy Ounce (31.1035g)',
      unitNameFa: 'فی ۱ اونس تروا',
      badge: 'Ounce (oz)',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
      commodity: platinum,
      isGold: false,
    },
  ];

  // Strictly Diesel, Petrol, Gas by Barrel and Liter
  const fuelItems = [
    {
      id: 'diesel_liter',
      commodityId: 'diesel',
      unitKey: 'liter' as const,
      nameEn: 'Diesel Fuel (1 Liter)',
      nameFa: 'دیزل / گازوئیل (۱ لیتر)',
      unitNameEn: 'Per 1 Liter (Retail)',
      unitNameFa: 'فی ۱ لیتر تانک تیل',
      badge: 'Liter (L)',
      badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
      commodity: diesel,
    },
    {
      id: 'diesel_barrel',
      commodityId: 'diesel',
      unitKey: 'barrel' as const,
      nameEn: 'Diesel Fuel (1 Barrel)',
      nameFa: 'دیزل / گازوئیل (۱ بشکه ۱۵۹ ل)',
      unitNameEn: 'Per 1 Barrel (158.987 L)',
      unitNameFa: 'فی ۱ بشکه استاندارد',
      badge: 'Barrel (bbl)',
      badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
      commodity: diesel,
    },
    {
      id: 'petrol_liter',
      commodityId: 'petrol',
      unitKey: 'liter' as const,
      nameEn: 'Petrol / Gasoline (1 Liter)',
      nameFa: 'پترول / بنزین سوپر (۱ لیتر)',
      unitNameEn: 'Per 1 Liter (Retail)',
      unitNameFa: 'فی ۱ لیتر پترول',
      badge: 'Liter (L)',
      badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
      commodity: petrol,
    },
    {
      id: 'petrol_barrel',
      commodityId: 'petrol',
      unitKey: 'barrel' as const,
      nameEn: 'Petrol / Gasoline (1 Barrel)',
      nameFa: 'پترول / بنزین (۱ بشکه ۱۵۹ ل)',
      unitNameEn: 'Per 1 Barrel (158.987 L)',
      unitNameFa: 'فی ۱ بشکه استاندارد',
      badge: 'Barrel (bbl)',
      badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
      commodity: petrol,
    },
    {
      id: 'gas_liter',
      commodityId: 'gas',
      unitKey: 'liter' as const,
      nameEn: 'Natural Gas / LPG (1 Liter)',
      nameFa: 'گاز طبیعی / گاز مایع (۱ لیتر)',
      unitNameEn: 'Per 1 Liter Equiv',
      unitNameFa: 'فی ۱ لیتر گاز مایع',
      badge: 'Liter (L)',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      commodity: gas,
    },
    {
      id: 'gas_barrel',
      commodityId: 'gas',
      unitKey: 'barrel' as const,
      nameEn: 'Natural Gas / LPG (1 BOE Barrel)',
      nameFa: 'گاز طبیعی (معادل ۱ بشکه نفت)',
      unitNameEn: 'Per Barrel Equiv (boe)',
      unitNameFa: 'فی معادل ۱ بشکه',
      badge: 'Barrel (boe)',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      commodity: gas,
    },
  ];

  const activeItems = boardCategory === 'metals' ? metalItems : fuelItems;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm transition-colors">
      {/* Title bar with authentic Kabul Sarai Shahzada banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t.saraiShahzadaTitle}
              </h3>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>{lang === 'fa' ? 'معتبر' : 'Verified'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.saraiShahzadaSubtitle}
            </p>
          </div>
        </div>

        {/* Sub-toggle between Metals (Gr/Oz) and Fuels (Bbl/L) + Gold Karat Dropdown */}
        <div className="flex items-center flex-wrap gap-2 self-start sm:self-center">
          {boardCategory === 'metals' && (
            <div className="flex items-center gap-1.5 p-1 px-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 text-xs">
              <label htmlFor="gold-karat-select-board" className="font-bold text-amber-800 dark:text-amber-300 whitespace-nowrap">
                {lang === 'fa' ? 'انتخاب عیار طلا:' : 'Gold Karat:'}
              </label>
              <select
                id="gold-karat-select-board"
                value={goldKarat}
                onChange={(e) => setGoldKarat(e.target.value as '24K' | '21K' | '18K')}
                className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold text-xs rounded-md px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="24K">{lang === 'fa' ? 'طلای ۲۴ عیار (خالص ۹۹.۹٪)' : '24 Karat (99.9% Pure)'}</option>
                <option value="21K">{lang === 'fa' ? 'طلای ۲۱ عیار (۸۷.۵٪ خلوص)' : '21 Karat (87.5% Purity)'}</option>
                <option value="18K">{lang === 'fa' ? 'طلای ۱۸ عیار (۷۵.۰٪ خلوص)' : '18 Karat (75.0% Purity)'}</option>
              </select>
            </div>
          )}

          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              id="board-metals-tab-btn"
              onClick={() => setBoardCategory('metals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                boardCategory === 'metals'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'طلا و فلزات' : 'Metals'}</span>
            </button>
            <button
              id="board-fuels-tab-btn"
              onClick={() => setBoardCategory('fuels')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                boardCategory === 'fuels'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'سوخت و نفت' : 'Oil & Fuels'}</span>
            </button>
          </div>

          <div className="hidden lg:flex text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-bold">1 USD = {usdToAfnRate.toFixed(2)} AFN</span>
          </div>
        </div>
      </div>

      {/* Grid of official board quotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {activeItems.map((item) => {
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
          const tickColor = isUp
            ? 'text-emerald-600 dark:text-emerald-400'
            : isDown
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-slate-900 dark:text-slate-100';

          const itemName = lang === 'fa' ? item.nameFa : item.nameEn;
          const unitName = lang === 'fa' ? item.unitNameFa : item.unitNameEn;

          return (
            <div
              key={item.id}
              id={`board-item-${item.id}`}
              onClick={() => onSelectCommodityWithUnit(item.commodityId, item.unitKey)}
              className="group bg-slate-50/70 hover:bg-white dark:bg-slate-950/70 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl p-3.5 transition-all cursor-pointer shadow-xs relative overflow-hidden"
            >
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                    {itemName}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {unitName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.isGold && (
                    <div
                      className="flex items-center gap-0.5 bg-amber-500/10 dark:bg-amber-500/20 p-0.5 rounded-md border border-amber-500/30 text-[10px] font-bold text-amber-700 dark:text-amber-300"
                      onClick={(e) => e.stopPropagation()}
                      title={lang === 'fa' ? 'تغییر عیار طلا' : 'Switch Gold Karat'}
                    >
                      {(['24K', '21K', '18K'] as const).map((k) => (
                        <button
                          key={k}
                          onClick={() => setGoldKarat(k)}
                          className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                            goldKarat === k
                              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                              : 'hover:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>

              {/* Price Row */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between gap-2">
                <div>
                  {/* Primary Price (respects currencyMode) */}
                  <div className={`text-lg font-mono font-extrabold tracking-tight ${tickColor}`}>
                    {currencyMode === 'USD'
                      ? formatPrice(priceUSD, 'USD')
                      : formatPrice(priceAFN, 'AFN')}
                  </div>
                  {/* Secondary currency equivalent */}
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span>
                      {currencyMode === 'USD'
                        ? formatPrice(priceAFN, 'AFN')
                        : formatPrice(priceUSD, 'USD')}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {lang === 'fa' ? 'معادل' : 'equiv'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-0.5 text-xs font-semibold font-mono ${
                      item.commodity.change24hUSD >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
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
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1 group-hover:text-amber-500 transition-colors mt-0.5">
                    <span>{t.viewChart}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Subtle top edge glow on tick */}
              {isUp && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              )}
              {isDown && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500 dark:bg-rose-400 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
