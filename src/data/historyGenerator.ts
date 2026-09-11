import { ChartDataPoint, Timeframe } from '../types';

export function generateHistoricalData(
  commodityId: string,
  currentPriceUSD: number,
  timeframe: Timeframe
): ChartDataPoint[] {
  const now = Date.now();
  const points: ChartDataPoint[] = [];

  switch (timeframe) {
    case '1H': {
      // 60 data points, one per minute
      const intervalMs = 60 * 1000;
      let runningPrice = currentPriceUSD * (1 - (Math.random() * 0.003 - 0.0015));
      const tempPoints: ChartDataPoint[] = [];

      for (let i = 59; i >= 0; i--) {
        const time = new Date(now - i * intervalMs);
        const timeLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Random drift
        const noise = (Math.sin(i * 0.3) * 0.0008 + (Math.random() - 0.49) * 0.0012) * currentPriceUSD;
        if (i === 0) {
          runningPrice = currentPriceUSD;
        } else {
          runningPrice = runningPrice - noise;
        }

        tempPoints.push({
          timestamp: time.getTime(),
          timeLabel,
          priceUSD: Number(runningPrice.toFixed(2)),
          highUSD: Number((runningPrice * 1.0006).toFixed(2)),
          lowUSD: Number((runningPrice * 0.9994).toFixed(2)),
          openUSD: Number(runningPrice.toFixed(2)),
          closeUSD: Number(runningPrice.toFixed(2)),
          volume: Math.floor(150 + Math.random() * 850),
        });
      }
      return tempPoints;
    }

    case '24H': {
      // 48 data points (every 30 mins)
      const intervalMs = 30 * 60 * 1000;
      const count = 48;
      const dayVariance = commodityId.includes('oil') ? 0.025 : 0.015;
      const startPrice = currentPriceUSD * (1 - (Math.random() * dayVariance - dayVariance / 2));

      for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now - i * intervalMs);
        const timeLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const progress = (count - i) / count;
        
        // Diurnal wave + random walk
        const wave = Math.sin(progress * Math.PI * 3) * (currentPriceUSD * dayVariance * 0.4);
        const linear = startPrice + (currentPriceUSD - startPrice) * progress;
        const noise = (Math.random() - 0.5) * (currentPriceUSD * 0.003);
        const price = i === 0 ? currentPriceUSD : linear + wave + noise;

        points.push({
          timestamp: time.getTime(),
          timeLabel,
          priceUSD: Number(price.toFixed(2)),
          highUSD: Number((price * 1.002).toFixed(2)),
          lowUSD: Number((price * 0.998).toFixed(2)),
          volume: Math.floor(1200 + Math.random() * 4000),
        });
      }
      return points;
    }

    case '1M': {
      // 30 daily data points
      const count = 30;
      const dayMs = 24 * 60 * 60 * 1000;
      const monthDrift = commodityId.includes('gold') ? -0.045 : commodityId.includes('silver') ? -0.06 : 0.03;
      const startPrice = currentPriceUSD * (1 + monthDrift);

      for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now - i * dayMs);
        const timeLabel = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const progress = (count - i) / count;
        const base = startPrice + (currentPriceUSD - startPrice) * Math.pow(progress, 1.2);
        const cycle = Math.sin(progress * 8) * (currentPriceUSD * 0.018);
        const noise = (Math.random() - 0.5) * (currentPriceUSD * 0.01);
        const price = i === 0 ? currentPriceUSD : Math.max(1, base + cycle + noise);

        points.push({
          timestamp: time.getTime(),
          timeLabel,
          priceUSD: Number(price.toFixed(2)),
          highUSD: Number((price * 1.01).toFixed(2)),
          lowUSD: Number((price * 0.99).toFixed(2)),
          volume: Math.floor(15000 + Math.random() * 35000),
        });
      }
      return points;
    }

    case '1Y': {
      // 52 weekly data points
      const count = 52;
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      const yearMultiplier = commodityId === 'gold' ? 0.76 : commodityId === 'silver' ? 0.72 : commodityId.includes('oil') ? 0.92 : 0.88;
      const startPrice = currentPriceUSD * yearMultiplier;

      for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now - i * weekMs);
        const timeLabel = time.toLocaleDateString([], { month: 'short', year: '2-digit' });
        const progress = (count - i) / count;
        const trend = startPrice + (currentPriceUSD - startPrice) * progress;
        const seasonal = Math.sin(progress * Math.PI * 4) * (currentPriceUSD * 0.04);
        const noise = (Math.random() - 0.5) * (currentPriceUSD * 0.02);
        const price = i === 0 ? currentPriceUSD : Math.max(1, trend + seasonal + noise);

        points.push({
          timestamp: time.getTime(),
          timeLabel,
          priceUSD: Number(price.toFixed(2)),
          highUSD: Number((price * 1.025).toFixed(2)),
          lowUSD: Number((price * 0.975).toFixed(2)),
          volume: Math.floor(80000 + Math.random() * 120000),
        });
      }
      return points;
    }

    case 'ALL': {
      // 12 historical epoch points covering the last 12 years (2014 to 2026)
      const currentYear = new Date(now).getFullYear();
      const yearsBack = 12;
      
      // Real historical anchors
      const historicalTrajectories: Record<string, number[]> = {
        gold: [1260, 1160, 1250, 1257, 1268, 1392, 1770, 1798, 1800, 1940, 2380, 2750, 2914],
        silver: [19.0, 15.6, 17.1, 16.9, 15.7, 16.2, 20.5, 25.1, 21.7, 23.3, 28.5, 31.2, 32.8],
        brent_oil: [98.9, 52.3, 43.7, 54.2, 71.3, 64.2, 41.8, 70.8, 99.0, 82.2, 80.5, 78.0, 74.8],
        wti_oil: [93.1, 48.8, 43.3, 50.8, 65.1, 57.0, 39.3, 68.1, 94.4, 77.6, 75.8, 73.5, 71.3],
        platinum: [1420, 1050, 990, 950, 880, 860, 880, 1090, 960, 965, 980, 970, 986],
        palladium: [800, 690, 615, 870, 1030, 1540, 2190, 2400, 2100, 1340, 1020, 980, 965],
        rhodium: [1150, 750, 690, 1100, 2250, 3900, 11200, 20100, 15400, 6800, 4600, 4700, 4790],
      };

      const curve = historicalTrajectories[commodityId] || [
        currentPriceUSD * 0.4,
        currentPriceUSD * 0.48,
        currentPriceUSD * 0.55,
        currentPriceUSD * 0.65,
        currentPriceUSD * 0.72,
        currentPriceUSD * 0.85,
        currentPriceUSD * 0.95,
        currentPriceUSD,
      ];

      for (let idx = 0; idx < curve.length; idx++) {
        const year = currentYear - (curve.length - 1 - idx);
        const time = new Date(year, 5, 15);
        const isCurrent = idx === curve.length - 1;
        const val = isCurrent ? currentPriceUSD : curve[idx];

        points.push({
          timestamp: time.getTime(),
          timeLabel: `${year}`,
          priceUSD: Number(val.toFixed(2)),
          highUSD: Number((val * 1.05).toFixed(2)),
          lowUSD: Number((val * 0.95).toFixed(2)),
          volume: Math.floor(500000 + Math.random() * 800000),
        });
      }
      return points;
    }
  }
}
