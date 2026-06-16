// ── VCL Stock Simulation & Data Generator ──────────────────────
// Generates baseline data and simulates real-time ticks for VCL Stock.

const ORDER_TYPES = ['Institutional', 'Retail Limit', 'HFT Algorithmic', 'Mutual Fund', 'Insider Trade'];
const COMPANIES = ['VCL Group Inc.', 'VCL Capital', 'VCL Liquidity Partners'];
const TRADERS = ['Apex Alpha', 'Genesis Asset', 'Quantum LP', 'Sentinel Trust', 'Vanguard Prime', 'Retail Trader'];

// Sub-regions specific to chosen node gateway
const SUB_REGIONS = {
  mumbai: ['South Mumbai', 'Bandra-West', 'Andheri', 'Thane', 'Navi Mumbai', 'Borivali'],
  gujarat: ['GIFT City', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar']
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId() {
  return `TXN-${rand(100000, 999999)}`;
}

// Format current time as HH:MM:SS
function getCurrentTimeString() {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
}

// 1. Initial baseline generation
export function generateStockHistory(points = 15) {
  let basePrice = 145.50;
  const data = [];
  const now = new Date();

  for (let i = points - 1; i >= 0; i--) {
    const timeOffset = new Date(now.getTime() - i * 5000); // 5s intervals
    basePrice += randFloat(-0.8, 1.0);
    data.push({
      time: timeOffset.toTimeString().split(' ')[0],
      price: parseFloat(basePrice.toFixed(2)),
      volume: rand(5000, 25000),
      avgPrice: parseFloat((basePrice + randFloat(-0.2, 0.2)).toFixed(2))
    });
  }
  return data;
}

export function generateDonutData() {
  const values = ORDER_TYPES.map(() => rand(15, 35));
  const total = values.reduce((a, b) => a + b, 0);
  return ORDER_TYPES.map((name, i) => ({
    name,
    value: parseFloat(((values[i] / total) * 100).toFixed(1)),
  }));
}

export function generateCategoryData(nodeRegion = 'mumbai') {
  const regions = SUB_REGIONS[nodeRegion] || SUB_REGIONS.mumbai;
  return regions.map(name => ({
    name,
    value: rand(150000, 850000),
    growth: randFloat(-3.5, 6.2),
  }));
}

export function generateScatterData() {
  return Array.from({ length: 40 }, () => {
    const offset = randFloat(-2.5, 2.5);
    return {
      x: parseFloat(offset.toFixed(2)), // price offset from current price
      y: rand(10, 500), // quantity of orders
      z: rand(50, 150),
      category: pickRandom(['Bids', 'Asks', 'Stop Orders']),
    };
  });
}

export function generateTableData(rows = 30, nodeRegion = 'mumbai') {
  const now = new Date();
  const regions = SUB_REGIONS[nodeRegion] || SUB_REGIONS.mumbai;
  return Array.from({ length: rows }, (_, i) => {
    const timeOffset = new Date(now.getTime() - i * 3000);
    const amount = randFloat(100, 50000);
    const qty = rand(10, 500);
    return {
      id: generateId(),
      time: timeOffset.toTimeString().split(' ')[0],
      trader: pickRandom(TRADERS),
      type: pickRandom(ORDER_TYPES),
      region: pickRandom(regions),
      amount: parseFloat(amount.toFixed(2)),
      quantity: qty,
      status: pickRandom(['Completed', 'Pending', 'Processing']),
    };
  });
}

export function generateAllMockData(fileName = 'VCL_Live_Feed.xlsx', nodeRegion = 'mumbai') {
  const initialHistory = generateStockHistory(15);
  const currentPrice = initialHistory[initialHistory.length - 1].price;
  
  return {
    kpi: {
      price: currentPrice,
      volume: 1245900,
      volatility: 1.25,
      change: 1.85,
      prevPrice: currentPrice - 2.50,
      fileName,
    },
    timeSeries: initialHistory,
    categories: generateCategoryData(nodeRegion),
    donut: generateDonutData(),
    scatter: generateScatterData(),
    table: generateTableData(30, nodeRegion),
  };
}

// 2. Real-time tick simulator
export function tickStockData(prevData, config = {}) {
  if (!prevData) return generateAllMockData();

  const {
    volatility = 'medium', // low | medium | high
    marketBias = 'neutral', // bullish | bearish | neutral
    nodeRegion = 'mumbai'
  } = config;

  const regions = SUB_REGIONS[nodeRegion] || SUB_REGIONS.mumbai;

  // Compute variance range based on volatility settings
  let maxChange = 0.5; // medium
  if (volatility === 'low') maxChange = 0.15;
  if (volatility === 'high') maxChange = 1.35;

  // Add bias to random walk
  let bias = 0;
  if (marketBias === 'bullish') bias = maxChange * 0.25;
  if (marketBias === 'bearish') bias = -maxChange * 0.25;

  const rawChange = randFloat(-maxChange, maxChange) + bias;
  
  // Update Live Price
  const lastPrice = prevData.kpi.price;
  const newPrice = Math.max(10.0, parseFloat((lastPrice + rawChange).toFixed(2)));
  const priceDirection = newPrice >= lastPrice ? 'up' : 'down';
  
  // Calculate new percentage change compared to a fixed daily open of $142.50
  const dailyOpen = 142.50;
  const newChangePercent = parseFloat((((newPrice - dailyOpen) / dailyOpen) * 100).toFixed(2));

  // Add trade volume
  const addedVolume = rand(500, 8000);
  const newVolume = prevData.kpi.volume + addedVolume;

  // Volatility fluctuation
  const vFluc = randFloat(-0.08, 0.08);
  const newVolatility = Math.max(0.1, parseFloat((prevData.kpi.volatility + vFluc).toFixed(2)));

  // 1. Line Chart Tick (push new price point, shift old point)
  const currentTime = getCurrentTimeString();
  const newTimeSeries = [...prevData.timeSeries];
  newTimeSeries.push({
    time: currentTime,
    price: newPrice,
    volume: addedVolume,
    avgPrice: parseFloat(((newTimeSeries.slice(-5).reduce((acc, curr) => acc + curr.price, 0) + newPrice) / 6).toFixed(2))
  });
  if (newTimeSeries.length > 18) {
    newTimeSeries.shift();
  }

  // 2. Fluctuate Donut Data slightly
  const newDonut = prevData.donut.map(item => {
    const delta = randFloat(-1.5, 1.5);
    return {
      ...item,
      value: Math.max(1.0, parseFloat((item.value + delta).toFixed(1)))
    };
  });
  // Normalize donut values to 100%
  const donutSum = newDonut.reduce((sum, d) => sum + d.value, 0);
  const normalizedDonut = newDonut.map(d => ({
    ...d,
    value: parseFloat(((d.value / donutSum) * 100).toFixed(1))
  }));

  // 3. Fluctuate Category Sales Volumes slightly
  const newCategories = prevData.categories.map(item => {
    const flucPercent = randFloat(-0.02, 0.03);
    const newValue = Math.max(50000, Math.round(item.value * (1 + flucPercent)));
    return {
      ...item,
      value: newValue,
      growth: parseFloat((item.growth + randFloat(-0.2, 0.2)).toFixed(2))
    };
  });

  // 4. Update order book scatter bids/asks
  const newScatter = prevData.scatter.map(pt => {
    // shift offset slightly
    const offsetChange = randFloat(-0.1, 0.1);
    const newQty = Math.max(5, pt.y + rand(-15, 15));
    return {
      ...pt,
      x: parseFloat((pt.x + offsetChange).toFixed(2)),
      y: newQty
    };
  });

  // 5. Append new transaction to DataGrid Table
  const newTxn = {
    id: generateId(),
    time: currentTime,
    trader: pickRandom(TRADERS),
    type: pickRandom(ORDER_TYPES),
    region: pickRandom(regions),
    amount: parseFloat((newPrice * rand(10, 150)).toFixed(2)),
    quantity: rand(10, 200),
    status: pickRandom(['Completed', 'Pending', 'Processing']),
  };
  const newTable = [newTxn, ...prevData.table].slice(0, 45); // cap at 45 rows to keep DOM fast

  return {
    kpi: {
      price: newPrice,
      volume: newVolume,
      volatility: newVolatility,
      change: newChangePercent,
      prevPrice: lastPrice,
      priceDirection, // 'up' | 'down'
      fileName: prevData.kpi.fileName,
    },
    timeSeries: newTimeSeries,
    categories: newCategories,
    donut: normalizedDonut,
    scatter: newScatter,
    table: newTable,
  };
}
