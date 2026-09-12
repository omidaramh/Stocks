import React from 'react';
import { X, Fuel, Coins, BookOpen } from 'lucide-react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';

interface UnitGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const UnitGuideModal: React.FC<UnitGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = useTranslation(lang);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 md:p-6 shadow-2xl relative transition-colors">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              {t.unitGuideTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.unitGuideSubtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Section 1: Gold & Metals */}
          <div>
            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 uppercase tracking-wide mb-3">
              <Coins className="w-4 h-4" />
              <span>{lang === 'fa' ? 'محاسبه رسمی قیمت طلا، نقره و پلاتین به گرام و اونس' : 'Gold, Silver & Platinum Pricing by Gram & Ounce'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
                <span className="font-bold text-amber-700 dark:text-amber-300 text-sm block">اونس تروا (Troy Ounce - oz)</span>
                <p className="text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  معیار اصلی و بین‌المللی بورس لندن، نیویورک و سایت رسمی <strong>GoldPrice.org</strong>. هر اونس تروا دقیقاً برابر با <strong>۳۱.۱۰۳۴۷۶۸ گرام</strong> است.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
                <span className="font-bold text-amber-700 dark:text-amber-300 text-sm block">گرام خالص (Metric Gram - gr)</span>
                <p className="text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  قیمت هر گرام طلای ۲۴ عیار خالص از تقسیم مستقیم قیمت اونس جهانی بر <strong>۳۱.۱۰۳۵</strong> به دست می‌آید:
                  <br />
                  <code className="text-amber-600 dark:text-amber-400 font-mono text-[11px] block mt-1 bg-slate-200 dark:bg-slate-900 px-2 py-1 rounded">
                    Price/gr = Price/oz ÷ 31.1035
                  </code>
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 sm:col-span-2">
                <span className="font-bold text-amber-700 dark:text-amber-300 text-sm block">
                  {lang === 'fa' ? 'عیارهای طلا (۲۴، ۲۱ و ۱۸ عیار)' : 'Gold Karats (24K, 21K & 18K)'}
                </span>
                <p className="text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {lang === 'fa' ? (
                    <>
                      • <strong>۲۴ عیار (خالص ۹۹.۹٪):</strong> طلای شمش و پایه استاندارد بین‌المللی.<br />
                      • <strong>۲۱ عیار (۸۷.۵٪ خلوص):</strong> رایج‌ترین عیار زیورآلات در بازار سرای شهزاده و کشورهای منطقه معادل (۲۱ ÷ ۲۴) قیمت پایه.<br />
                      • <strong>۱۸ عیار (۷۵.۰٪ خلوص):</strong> استاندارد طلا و جواهرات فانتزی و ایتالیایی معادل (۱۸ ÷ ۲۴) قیمت پایه.
                    </>
                  ) : (
                    <>
                      • <strong>24K (99.9% Pure):</strong> International bullion spot base.<br />
                      • <strong>21K (87.5% Purity):</strong> Most popular jewelry standard in regional markets, calculated as (21 / 24) of base.<br />
                      • <strong>18K (75.0% Purity):</strong> Standard fine jewelry karat, calculated as (18 / 24) of base.
                    </>
                  )}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white text-sm block">منبع زنده GoldPrice.org</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  نرخ‌های فلزات طلا، نقره و پلاتین مستقیماً از وب‌سرویس رسمی <strong>GoldPrice.org</strong> با بالاترین دقت اعشاری و به صورت لحظه‌ای دریافت می‌شوند.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white text-sm block">تبدیل به پول افغانی (AFN ؋)</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  معادل افغانی هر گرام و اونس با ضرب قیمت دالری در نرخ زنده بازار سرای شهزاده کابل محاسبه می‌گردد.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Petroleum & Oil */}
          <div>
            <h4 className="text-sm font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2 uppercase tracking-wide mb-3">
              <Fuel className="w-4 h-4" />
              <span>{lang === 'fa' ? 'سوخت‌های دیزل، پترول و گاز به بشکه و لیتر' : 'Diesel, Petrol & Gas Measures (bbl / L)'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white text-sm block">بشکه نفت (Standard Barrel - bbl)</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  معیار استاندارد بورس جهانی انرژی برابر با <strong>۴۲ گالن آمریکایی</strong> یا دقیقاً <strong>۱۵۸.۹۸۷ لیتر</strong> است.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white text-sm block">لیتر (Liter)</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  معیار خردفروشی تانک‌های تیل و پمپ‌های سوخت در سراسر افغانستان که از تقسیم قیمت هر بشکه بر ۱۵۸.۹۸۷ محاسبه می‌گردد.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
