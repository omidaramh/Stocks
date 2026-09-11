export type AssetCategory = 'precious_metals' | 'energy';

export type Timeframe = '1H' | '24H' | '1M' | '1Y' | 'ALL';

export type Currency = 'AFN' | 'USD';

export type DisplayMode = 'AFN' | 'USD' | 'BOTH';

export type Language = 'en' | 'fa' | 'ps';

export type GoldPurity = '24K' | '22K' | '21K' | '18K' | '14K';

export type MetalUnitKey =
  | 'miscal_24k'
  | 'miscal_22k'
  | 'miscal_21k'
  | 'miscal_18k'
  | 'gram_24k'
  | 'gram_21k'
  | 'gram_18k'
  | 'tola'
  | 'troy_oz'
  | 'kg'
  | 'seer_kabul';

export type OilUnitKey =
  | 'barrel'
  | 'liter'
  | 'gallon'
  | 'ton_metric';

export type AnyUnitKey = MetalUnitKey | OilUnitKey;

export interface UnitDefinition {
  id: AnyUnitKey;
  nameEn: string;
  nameFa: string;
  namePs: string;
  symbol: string;
  symbolFa: string;
  descriptionEn: string;
  descriptionFa: string;
  multiplierFromBase: number; // Multiplied with base price (USD/oz for metals, USD/barrel for oil)
  category: AssetCategory;
  purity?: GoldPurity;
}

export interface Commodity {
  id: string;
  symbol: string;
  nameEn: string;
  nameFa: string;
  namePs: string;
  category: AssetCategory;
  baseUnitEn: string;
  baseUnitFa: string;
  basePriceUSD: number; // Current spot price in USD per base unit (oz for metals, bbl for oil)
  previousPriceUSD: number;
  openPriceUSD: number;
  high24hUSD: number;
  low24hUSD: number;
  change24hUSD: number;
  changePercent24h: number;
  lastTickDirection: 'up' | 'down' | 'same';
  lastUpdated: number;
  iconName: string;
  accentColor: string;
  supportedUnits: AnyUnitKey[];
  defaultUnit: AnyUnitKey;
  descriptionEn: string;
  descriptionFa: string;
}

export interface ChartDataPoint {
  timestamp: number;
  timeLabel: string;
  priceUSD: number;
  highUSD?: number;
  lowUSD?: number;
  openUSD?: number;
  closeUSD?: number;
  volume?: number;
}

export interface SaraiShahzadaQuote {
  id: string;
  commodityId: string;
  titleEn: string;
  titleFa: string;
  titlePs: string;
  unit: AnyUnitKey;
  priceAFN: number;
  priceUSD: number;
  changePercent: number;
  tickDir: 'up' | 'down' | 'same';
  badge?: string;
}
