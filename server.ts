import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Cache data to prevent rate-limiting and guarantee instant responses
interface CachedData {
  timestamp: number;
  data: any;
}

let priceCache: CachedData | null = null;
const CACHE_TTL_MS = 8000; // 8 seconds cache

const GRAMS_PER_TROY_OUNCE = 31.1034768;
const LITERS_PER_BARREL = 158.9873;

async function fetchYahooSymbol(symbol: string) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      if (meta && typeof meta.regularMarketPrice === 'number') {
        return {
          price: meta.regularMarketPrice,
          changePercent: meta.regularMarketChangePercent ?? 0,
          change: meta.regularMarketPrice - (meta.chartPreviousClose ?? meta.regularMarketPrice),
          high: meta.regularMarketDayHigh ?? meta.regularMarketPrice,
          low: meta.regularMarketDayLow ?? meta.regularMarketPrice,
          prevClose: meta.chartPreviousClose ?? meta.regularMarketPrice,
        };
      }
    }
  } catch {
    // Ignored, fallback used
  }
  return null;
}

async function fetchLiveCommoditiesAndStocks() {
  const now = Date.now();
  if (priceCache && now - priceCache.timestamp < CACHE_TTL_MS) {
    return priceCache.data;
  }

  // 1. Metals baseline (Gold, Silver, Platinum ONLY)
  let goldPriceOz = 4368.30;
  let goldChangeOz = 2.53;
  let goldChangePercent = 0.058;
  let goldClose = 4365.77;

  let silverPriceOz = 64.62;
  let silverChangeOz = 0.27;
  let silverChangePercent = 0.415;
  let silverClose = 64.35;

  let platinumPriceOz = 1799.10;
  let platinumChangePercent = 0.45;

  // 2. Oil & Fuel baseline (Diesel, Petrol, Gas ONLY)
  let dieselPriceBbl = 112.50; // ~$0.707/L
  let dieselChangePercent = 0.99;

  let petrolPriceBbl = 108.20; // ~$0.680/L
  let petrolChangePercent = 0.74;

  let gasPriceBbl = 62.40; // ~$0.392/L
  let gasChangePercent = 1.46;

  let usdToAfn = 64.82;
  let goldPriceOrgSource = 'GoldPrice.org (Live Spot Feed)';
  let goldPriceOrgDate = new Date().toUTCString();

  // Stock base quotes
  const stockQuotes: Record<string, { price: number; change: number; changePercent: number; high: number; low: number; prevClose: number }> = {
    AAPL: { price: 238.45, change: 1.65, changePercent: 0.70, high: 239.50, low: 236.20, prevClose: 236.80 },
    MSFT: { price: 448.20, change: 3.10, changePercent: 0.70, high: 450.00, low: 444.00, prevClose: 445.10 },
    NVDA: { price: 138.90, change: 2.70, changePercent: 1.98, high: 140.20, low: 135.80, prevClose: 136.20 },
    GOOGL: { price: 182.50, change: 1.40, changePercent: 0.77, high: 183.60, low: 180.50, prevClose: 181.10 },
    AMZN: { price: 194.30, change: 1.80, changePercent: 0.94, high: 195.80, low: 191.90, prevClose: 192.50 },
    META: { price: 592.10, change: 6.80, changePercent: 1.16, high: 595.00, low: 583.00, prevClose: 585.30 },
    TSLA: { price: 246.80, change: 4.70, changePercent: 1.94, high: 249.20, low: 240.50, prevClose: 242.10 },
    ARAMCO: { price: 28.50, change: 0.15, changePercent: 0.53, high: 28.75, low: 28.20, prevClose: 28.35 },
  };

  // 1. Fetch official real-time spot prices from GoldPrice.org (Gold & Silver)
  try {
    const gpRes = await fetch('https://data-asg.goldprice.org/dbXRates/USD', {
      headers: {
        'Referer': 'https://goldprice.org/',
        'Origin': 'https://goldprice.org',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (gpRes.ok) {
      const gpData = await gpRes.json();
      if (gpData?.items && gpData.items.length > 0) {
        const item = gpData.items[0];
        if (typeof item.xauPrice === 'number' && item.xauPrice > 0) {
          goldPriceOz = Number(item.xauPrice.toFixed(2));
          goldChangeOz = Number((item.chgXau ?? 0).toFixed(2));
          goldChangePercent = Number((item.pcXau ?? 0).toFixed(3));
          goldClose = Number((item.xauClose ?? goldPriceOz - goldChangeOz).toFixed(2));
        }
        if (typeof item.xagPrice === 'number' && item.xagPrice > 0) {
          silverPriceOz = Number(item.xagPrice.toFixed(3));
          silverChangeOz = Number((item.chgXag ?? 0).toFixed(3));
          silverChangePercent = Number((item.pcXag ?? 0).toFixed(3));
          silverClose = Number((item.xagClose ?? silverPriceOz - silverChangeOz).toFixed(3));
        }
        if (gpData.date) {
          goldPriceOrgDate = gpData.date;
        }
      }
    }
  } catch (err) {
    console.warn('[Server] GoldPrice.org query warning:', (err as Error).message);
  }

  // 2. Fetch Platinum, Fuels, and Big Companies Stocks concurrently
  try {
    const results = await Promise.allSettled([
      fetchYahooSymbol('PL=F'), // Platinum
      fetchYahooSymbol('HO=F'), // Heating Oil / Diesel futures per gallon
      fetchYahooSymbol('RB=F'), // RBOB Gasoline / Petrol futures per gallon
      fetchYahooSymbol('NG=F'), // Natural Gas futures
      fetchYahooSymbol('AAPL'),
      fetchYahooSymbol('MSFT'),
      fetchYahooSymbol('NVDA'),
      fetchYahooSymbol('GOOGL'),
      fetchYahooSymbol('AMZN'),
      fetchYahooSymbol('META'),
      fetchYahooSymbol('TSLA'),
      fetchYahooSymbol('2222.SR'), // Saudi Aramco
    ]);

    // Platinum
    if (results[0].status === 'fulfilled' && results[0].value) {
      platinumPriceOz = Number(results[0].value.price.toFixed(2));
      platinumChangePercent = Number(results[0].value.changePercent.toFixed(2));
    }
    // Diesel (HO=F $/gal * 42 gal = $/barrel)
    if (results[1].status === 'fulfilled' && results[1].value) {
      dieselPriceBbl = Number((results[1].value.price * 42).toFixed(2));
      dieselChangePercent = Number(results[1].value.changePercent.toFixed(2));
    }
    // Petrol (RB=F $/gal * 42 gal = $/barrel)
    if (results[2].status === 'fulfilled' && results[2].value) {
      petrolPriceBbl = Number((results[2].value.price * 42).toFixed(2));
      petrolChangePercent = Number(results[2].value.changePercent.toFixed(2));
    }
    // Gas (NG=F $/MMBtu * 21.5 = boe $/bbl)
    if (results[3].status === 'fulfilled' && results[3].value) {
      gasPriceBbl = Number((results[3].value.price * 21.5).toFixed(2));
      gasChangePercent = Number(results[3].value.changePercent.toFixed(2));
    }

    // Stocks mapping
    const stockKeys = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'ARAMCO'];
    for (let i = 0; i < stockKeys.length; i++) {
      const res = results[4 + i];
      if (res && res.status === 'fulfilled' && res.value) {
        const key = stockKeys[i];
        stockQuotes[key] = {
          price: Number(res.value.price.toFixed(2)),
          change: Number((res.value.change ?? 0).toFixed(2)),
          changePercent: Number((res.value.changePercent ?? 0).toFixed(2)),
          high: Number((res.value.high ?? res.value.price).toFixed(2)),
          low: Number((res.value.low ?? res.value.price).toFixed(2)),
          prevClose: Number((res.value.prevClose ?? res.value.price).toFixed(2)),
        };
      }
    }
  } catch (err) {
    console.warn('[Server] Supplementary quotes fetch warning:', (err as Error).message);
  }

  // 3. Fetch USD to AFN exchange rate
  try {
    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(4000),
    });
    if (fxRes.ok) {
      const fxData = await fxRes.json();
      if (fxData?.rates?.AFN) {
        usdToAfn = Number(fxData.rates.AFN.toFixed(2));
      }
    }
  } catch (err) {
    console.warn('[Server] Exchange rate warning:', (err as Error).message);
  }

  // Output: Metals (Gold, Silver, Platinum), Fuels (Diesel, Petrol, Gas), and Big Companies Stocks
  const result = {
    source: goldPriceOrgSource,
    sourceDate: goldPriceOrgDate,
    timestamp: Date.now(),
    usdToAfnRate: usdToAfn,
    rates: {
      // --- PRECIOUS METALS ONLY ---
      gold: {
        id: 'gold',
        symbol: 'XAU/USD',
        nameEn: 'Gold Spot',
        nameFa: 'طلای جهانی (۲۴ عیار)',
        priceOzUSD: goldPriceOz,
        priceOzAFN: Number((goldPriceOz * usdToAfn).toFixed(2)),
        priceGrUSD: Number((goldPriceOz / GRAMS_PER_TROY_OUNCE).toFixed(3)),
        priceGrAFN: Number(((goldPriceOz / GRAMS_PER_TROY_OUNCE) * usdToAfn).toFixed(2)),
        // 21K and 18K karat rates
        priceGr21kUSD: Number(((goldPriceOz / GRAMS_PER_TROY_OUNCE) * (21 / 24)).toFixed(3)),
        priceGr21kAFN: Number((((goldPriceOz / GRAMS_PER_TROY_OUNCE) * (21 / 24)) * usdToAfn).toFixed(2)),
        priceGr18kUSD: Number(((goldPriceOz / GRAMS_PER_TROY_OUNCE) * (18 / 24)).toFixed(3)),
        priceGr18kAFN: Number((((goldPriceOz / GRAMS_PER_TROY_OUNCE) * (18 / 24)) * usdToAfn).toFixed(2)),
        priceOz21kUSD: Number((goldPriceOz * (21 / 24)).toFixed(2)),
        priceOz21kAFN: Number((goldPriceOz * (21 / 24) * usdToAfn).toFixed(2)),
        priceOz18kUSD: Number((goldPriceOz * (18 / 24)).toFixed(2)),
        priceOz18kAFN: Number((goldPriceOz * (18 / 24) * usdToAfn).toFixed(2)),
        change24hUSD: goldChangeOz,
        changePercent24h: goldChangePercent,
        high24hUSD: Math.max(goldPriceOz, goldClose + Math.abs(goldChangeOz)),
        low24hUSD: Math.min(goldPriceOz, goldClose - Math.abs(goldChangeOz)),
        closePriceUSD: goldClose,
      },
      silver: {
        id: 'silver',
        symbol: 'XAG/USD',
        nameEn: 'Silver Spot',
        nameFa: 'نقره جهانی (خالص)',
        priceOzUSD: silverPriceOz,
        priceOzAFN: Number((silverPriceOz * usdToAfn).toFixed(2)),
        priceGrUSD: Number((silverPriceOz / GRAMS_PER_TROY_OUNCE).toFixed(3)),
        priceGrAFN: Number(((silverPriceOz / GRAMS_PER_TROY_OUNCE) * usdToAfn).toFixed(2)),
        change24hUSD: silverChangeOz,
        changePercent24h: silverChangePercent,
        high24hUSD: Math.max(silverPriceOz, silverClose + Math.abs(silverChangeOz)),
        low24hUSD: Math.min(silverPriceOz, silverClose - Math.abs(silverChangeOz)),
        closePriceUSD: silverClose,
      },
      platinum: {
        id: 'platinum',
        symbol: 'XPT/USD',
        nameEn: 'Platinum Spot',
        nameFa: 'پلاتین جهانی',
        priceOzUSD: platinumPriceOz,
        priceOzAFN: Number((platinumPriceOz * usdToAfn).toFixed(2)),
        priceGrUSD: Number((platinumPriceOz / GRAMS_PER_TROY_OUNCE).toFixed(3)),
        priceGrAFN: Number(((platinumPriceOz / GRAMS_PER_TROY_OUNCE) * usdToAfn).toFixed(2)),
        changePercent24h: platinumChangePercent,
        change24hUSD: Number(((platinumPriceOz * platinumChangePercent) / 100).toFixed(2)),
      },

      // --- FUELS & OIL ONLY (DIESEL, PETROL, GAS) ---
      diesel: {
        id: 'diesel',
        symbol: 'DIESEL',
        nameEn: 'Diesel Fuel (ULSD)',
        nameFa: 'دیزل / گازوئیل',
        priceBblUSD: dieselPriceBbl,
        priceBblAFN: Number((dieselPriceBbl * usdToAfn).toFixed(2)),
        priceLiterUSD: Number((dieselPriceBbl / LITERS_PER_BARREL).toFixed(3)),
        priceLiterAFN: Number(((dieselPriceBbl / LITERS_PER_BARREL) * usdToAfn).toFixed(2)),
        changePercent24h: dieselChangePercent,
        change24hUSD: Number(((dieselPriceBbl * dieselChangePercent) / 100).toFixed(2)),
      },
      petrol: {
        id: 'petrol',
        symbol: 'PETROL',
        nameEn: 'Petrol / Gasoline',
        nameFa: 'پترول / بنزین سوپر',
        priceBblUSD: petrolPriceBbl,
        priceBblAFN: Number((petrolPriceBbl * usdToAfn).toFixed(2)),
        priceLiterUSD: Number((petrolPriceBbl / LITERS_PER_BARREL).toFixed(3)),
        priceLiterAFN: Number(((petrolPriceBbl / LITERS_PER_BARREL) * usdToAfn).toFixed(2)),
        changePercent24h: petrolChangePercent,
        change24hUSD: Number(((petrolPriceBbl * petrolChangePercent) / 100).toFixed(2)),
      },
      gas: {
        id: 'gas',
        symbol: 'NATGAS',
        nameEn: 'Natural Gas / LPG',
        nameFa: 'گاز طبیعی / گاز مایع',
        priceBblUSD: gasPriceBbl,
        priceBblAFN: Number((gasPriceBbl * usdToAfn).toFixed(2)),
        priceLiterUSD: Number((gasPriceBbl / LITERS_PER_BARREL).toFixed(3)),
        priceLiterAFN: Number(((gasPriceBbl / LITERS_PER_BARREL) * usdToAfn).toFixed(2)),
        changePercent24h: gasChangePercent,
        change24hUSD: Number(((gasPriceBbl * gasChangePercent) / 100).toFixed(2)),
      },
    },

    // --- BIG COMPANIES STOCKS ---
    stocks: stockQuotes,
  };

  priceCache = {
    timestamp: now,
    data: result,
  };

  return result;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/prices', async (req, res) => {
  try {
    const data = await fetchLiveCommoditiesAndStocks();
    res.setHeader('Cache-Control', 'public, max-age=5');
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Studio] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
