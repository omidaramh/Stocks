import { UNIT_DEFINITIONS } from '../data/units';
import { AnyUnitKey, Currency, Language } from '../types';

export function calculateConvertedPrice(
  basePriceUSD: number,
  unitKey: AnyUnitKey,
  currency: Currency,
  usdToAfnRate: number
): number {
  const unit = UNIT_DEFINITIONS[unitKey];
  const multiplier = unit ? unit.multiplierFromBase : 1.0;
  const priceUSD = basePriceUSD * multiplier;

  if (currency === 'AFN') {
    return priceUSD * usdToAfnRate;
  }
  return priceUSD;
}

export function formatPrice(
  amount: number,
  currency: Currency,
  decimals?: number
): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0.00';

  let resolvedDecimals = decimals;
  if (resolvedDecimals === undefined) {
    if (currency === 'AFN') {
      // Afghani prices for small units (like 1 liter of oil) need decimals, but for miscal gold (e.g. 25,000 AFN) integers or 1 decimal is best
      if (amount < 10) resolvedDecimals = 3;
      else if (amount < 200) resolvedDecimals = 2;
      else if (amount < 2000) resolvedDecimals = 1;
      else resolvedDecimals = 0;
    } else {
      // USD
      if (amount < 1) resolvedDecimals = 4;
      else if (amount < 20) resolvedDecimals = 3;
      else if (amount < 500) resolvedDecimals = 2;
      else resolvedDecimals = 2;
    }
  }

  const formattedNum = amount.toLocaleString('en-US', {
    minimumFractionDigits: resolvedDecimals,
    maximumFractionDigits: resolvedDecimals,
  });

  if (currency === 'AFN') {
    return `${formattedNum} ؋`;
  }
  return `$${formattedNum}`;
}

export function formatAfghanistanTime(date: Date = new Date()): {
  timeStr: string;
  dateStr: string;
  utcStr: string;
} {
  // Kabul is UTC+4:30
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const kabulOffsetHours = 4.5;
  const kabulTime = new Date(utc + 3600000 * kabulOffsetHours);

  const timeStr = kabulTime.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = kabulTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const utcStr = date.toISOString().substring(11, 19) + ' UTC';

  return { timeStr, dateStr, utcStr };
}

export function formatChange(
  changeUSD: number,
  changePercent: number,
  unitKey: AnyUnitKey,
  currency: Currency,
  usdToAfnRate: number
): { text: string; percentText: string; isPositive: boolean; isNeutral: boolean } {
  const isPositive = changeUSD > 0.0001;
  const isNeutral = Math.abs(changeUSD) < 0.0001;

  const unit = UNIT_DEFINITIONS[unitKey];
  const multiplier = unit ? unit.multiplierFromBase : 1.0;
  const convertedChange = changeUSD * multiplier * (currency === 'AFN' ? usdToAfnRate : 1.0);

  const sign = isPositive ? '+' : isNeutral ? '' : '-';
  const absAmount = Math.abs(convertedChange);

  let decimals = currency === 'AFN' ? (absAmount < 100 ? 2 : 0) : absAmount < 10 ? 3 : 2;
  const numStr = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const text = `${sign}${currency === 'AFN' ? `${numStr} ؋` : `$${numStr}`}`;
  const percentSign = isPositive ? '+' : isNeutral ? '' : '-';
  const percentText = `${percentSign}${Math.abs(changePercent).toFixed(2)}%`;

  return { text, percentText, isPositive, isNeutral };
}
