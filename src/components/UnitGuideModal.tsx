import React from 'react';
import { X, Scale, Fuel, Coins, BookOpen, CheckCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 md:p-6 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white">
              {t.unitGuideTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {t.unitGuideSubtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: Gold & Metals */}
          <div>
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wide mb-3">
              <Coins className="w-4 h-4" />
              <span>{lang === 'fa' ? 'واحدهای سنتی و بازاری طلا در افغانستان' : 'Traditional Afghan Gold Measures'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-white text-sm block">مثقال (Miscal)</span>
                <p className="text-slate-400 mt-1">
                  معیار اصلی خرید و فروش در کابل و هرات معادل <strong>۴.۶۰۸ گرام</strong> است. هر اونس تروا جهانی (۳۱.۱۰۳۵ گرام) معادل <strong>۶.۷۵ مثقال</strong> کابل است.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-white text-sm block">توله (Tola)</span>
                <p className="text-slate-400 mt-1">
                  معیار قدیمی شمش‌های هندی و افغانی معادل <strong>۱۱.۶۶۳۸ گرام</strong> (۱۸۰ دانه جو یا دقیقاً ۰.۳۷۵ اونس تروا). هر توله حدود <strong>۲.۵۳ مثقال</strong> است.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-white text-sm block">عیار ۲۱ و ۲۴ (Karats)</span>
                <p className="text-slate-400 mt-1">
                  طلای ۲۴ عیار شمش ۹۹۹.۹ خالص است. طلای ۲۱ عیار (۸۷.۵٪ خلوص) رایج‌ترین زیورات عروسی در افغانستان است که ارزش آن با ضریب ۲۱/۲۴ محاسبه می‌شود.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-white text-sm block">سیر کابل (Kabul Seer)</span>
                <p className="text-slate-400 mt-1">
                  واحد تجارتی سنتی نقره و اقلام سنگین معادل <strong>۷ کیلوگرام</strong> (۷۰۰۰ گرام).
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Petroleum & Oil */}
          <div>
            <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2 uppercase tracking-wide mb-3">
              <Fuel className="w-4 h-4" />
              <span>{lang === 'fa' ? 'واحدهای اندازه‌گیری نفت و سوخت در افغانستان' : 'Petroleum & Crude Fuel Measures'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-white text-sm block">بشکه نفت (Standard Barrel - bbl)</span>
                <p className="text-slate-400 mt-1">
                  معیار جهانی برابر با <strong>۴۲ گالن آمریکایی</strong> یا دقیقاً <strong>۱۵۸.۹۸۷ لیتر</strong> نفت خام شیرین است.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-white text-sm block">لیتر (Liter)</span>
                <p className="text-slate-400 mt-1">
                  معیار خردفروشی تانک‌های تیل و پمپ‌های سوخت در تمام شهرهای افغانستان که قیمت آن بر اساس ۱ بشکه تقسیم بر ۱۵۹ لیتر تعیین می‌گردد.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-white text-sm block">تن متری نفت (Metric Ton)</span>
                <p className="text-slate-400 mt-1">
                  معیار واردات محموله‌های ترانزیتی و ریلی (نفت آسیای میانه و خلیج فارس) معادل تقریبی <strong>۷.۳۳ بشکه</strong> نفت خام برنت.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-white text-sm block">نرخ دالر سرای شهزاده</span>
                <p className="text-slate-400 mt-1">
                  تبدیل نرخ جهانی از دالر به افغانی بر مبنای نرخ نقدی صرافی سرای شهزاده کابل در این سیستم به صورت زنده اعمال می‌شود.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
