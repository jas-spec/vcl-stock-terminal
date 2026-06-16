// ── VCL Inventory Management — Data Generator & Simulation ──────────────
// Generates realistic inventory data and simulates daily consumption/restocking.

const PRODUCT_CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Beverages'];

const PRODUCTS = {
  Fruits: [
    { name: 'Apple', unit: 'kg', pricePerUnit: 180 },
    { name: 'Orange', unit: 'kg', pricePerUnit: 120 },
    { name: 'Mango', unit: 'kg', pricePerUnit: 250 },
    { name: 'Banana', unit: 'dozen', pricePerUnit: 60 },
    { name: 'Grapes', unit: 'kg', pricePerUnit: 140 },
    { name: 'Pomegranate', unit: 'kg', pricePerUnit: 200 },
  ],
  Vegetables: [
    { name: 'Tomato', unit: 'kg', pricePerUnit: 40 },
    { name: 'Onion', unit: 'kg', pricePerUnit: 35 },
    { name: 'Potato', unit: 'kg', pricePerUnit: 30 },
    { name: 'Capsicum', unit: 'kg', pricePerUnit: 80 },
    { name: 'Spinach', unit: 'bundle', pricePerUnit: 25 },
    { name: 'Carrot', unit: 'kg', pricePerUnit: 50 },
  ],
  Dairy: [
    { name: 'Milk', unit: 'litre', pricePerUnit: 60 },
    { name: 'Paneer', unit: 'kg', pricePerUnit: 350 },
    { name: 'Curd', unit: 'kg', pricePerUnit: 55 },
    { name: 'Butter', unit: 'pack', pricePerUnit: 55 },
    { name: 'Cheese', unit: 'pack', pricePerUnit: 120 },
  ],
  Grains: [
    { name: 'Rice', unit: 'kg', pricePerUnit: 65 },
    { name: 'Wheat Flour', unit: 'kg', pricePerUnit: 45 },
    { name: 'Dal (Toor)', unit: 'kg', pricePerUnit: 150 },
    { name: 'Sugar', unit: 'kg', pricePerUnit: 42 },
    { name: 'Salt', unit: 'kg', pricePerUnit: 20 },
  ],
  Beverages: [
    { name: 'Tea Leaves', unit: 'pack', pricePerUnit: 220 },
    { name: 'Coffee Powder', unit: 'pack', pricePerUnit: 350 },
    { name: 'Mineral Water', unit: 'case', pricePerUnit: 180 },
    { name: 'Juice (Mixed)', unit: 'litre', pricePerUnit: 90 },
  ],
};

// Sub-warehouses per region
const WAREHOUSES = {
  mumbai: ['Andheri Hub', 'Navi Mumbai DC', 'Thane Store', 'Bandra Outlet', 'Borivali Unit', 'Dadar Central'],
  gujarat: ['GIFT City DC', 'Ahmedabad Hub', 'Surat Store', 'Vadodara Unit', 'Rajkot Outlet', 'Gandhinagar Central'],
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
  return `INV-${rand(100000, 999999)}`;
}

function getDateString(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function getFullDateString(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Determine stock status
function getStockStatus(qty, reorderLevel) {
  if (qty <= 0) return 'Out of Stock';
  if (qty <= reorderLevel) return 'Low Stock';
  if (qty > reorderLevel * 3) return 'Overstocked';
  return 'In Stock';
}

// ── 1. Generate inventory table data ──────────────────────────────────
export function generateInventoryTable(nodeRegion = 'mumbai') {
  const warehouses = WAREHOUSES[nodeRegion] || WAREHOUSES.mumbai;
  const items = [];

  for (const [category, products] of Object.entries(PRODUCTS)) {
    for (const product of products) {
      const qty = rand(0, 50);
      const reorderLevel = rand(5, 15);
      items.push({
        id: generateId(),
        name: product.name,
        category,
        warehouse: pickRandom(warehouses),
        unit: product.unit,
        quantity: qty,
        reorderLevel,
        pricePerUnit: product.pricePerUnit,
        totalValue: qty * product.pricePerUnit,
        status: getStockStatus(qty, reorderLevel),
        lastUpdated: getFullDateString(rand(0, 2)),
      });
    }
  }

  return items;
}

// ── 2. Generate time series data (inventory levels over 7 days) ────────
export function generateInventoryTimeSeries() {
  const trackedProducts = ['Apple', 'Orange', 'Mango', 'Milk', 'Tomato'];
  const days = [];

  // Build backwards: day 7 → day 1 (today)
  const productBaselines = {};
  trackedProducts.forEach(p => {
    productBaselines[p] = rand(20, 45);
  });

  for (let i = 6; i >= 0; i--) {
    const point = { day: getDateString(i) };
    trackedProducts.forEach(p => {
      // Simulate gradual consumption with occasional restocking
      const consumed = rand(1, 8);
      const restocked = Math.random() > 0.7 ? rand(5, 15) : 0;
      productBaselines[p] = Math.max(0, productBaselines[p] - consumed + restocked);
      point[p] = productBaselines[p];
    });
    days.push(point);
  }

  return { data: days, products: trackedProducts };
}

// ── 3. Generate category summary data (for bar chart) ──────────────────
export function generateCategoryData(nodeRegion = 'mumbai') {
  return PRODUCT_CATEGORIES.map(cat => {
    const products = PRODUCTS[cat] || [];
    const totalQty = products.reduce((sum) => sum + rand(10, 80), 0);
    return {
      name: cat,
      value: totalQty,
      products: products.length,
    };
  });
}

// ── 4. Generate stock status distribution (for donut chart) ────────────
export function generateStatusDistribution(tableData) {
  const counts = { 'In Stock': 0, 'Low Stock': 0, 'Out of Stock': 0, 'Overstocked': 0 };
  tableData.forEach(item => {
    if (counts[item.status] !== undefined) counts[item.status]++;
  });
  const total = tableData.length || 1;
  return Object.entries(counts).map(([name, count]) => ({
    name,
    value: parseFloat(((count / total) * 100).toFixed(1)),
    count,
  }));
}

// ── 5. Generate scatter data (quantity vs reorder level) ───────────────
export function generateScatterData(tableData) {
  return tableData.map(item => ({
    x: item.quantity,
    y: item.reorderLevel,
    z: rand(40, 140),
    name: item.name,
    category: item.status === 'Out of Stock' ? 'Needs Reorder'
            : item.status === 'Low Stock' ? 'Needs Reorder'
            : item.quantity > item.reorderLevel * 3 ? 'Overstocked'
            : 'Adequate',
  }));
}

// ── 6. KPI summary ────────────────────────────────────────────────────
export function generateKPI(tableData, fileName = 'VCL_Inventory.xlsx') {
  const totalItems = tableData.length;
  const outOfStock = tableData.filter(i => i.quantity <= 0).length;
  const lowStock = tableData.filter(i => i.status === 'Low Stock').length;
  const totalValue = tableData.reduce((sum, i) => sum + i.totalValue, 0);
  const totalQuantity = tableData.reduce((sum, i) => sum + i.quantity, 0);

  return {
    totalItems,
    outOfStock,
    lowStock,
    totalValue,
    totalQuantity,
    fileName,
    outOfStockChange: outOfStock > 2 ? outOfStock - 2 : -1,
    lowStockChange: lowStock > 3 ? lowStock - 3 : -2,
    valueChange: randFloat(-3.5, 4.5),
    quantityChange: randFloat(-5, 3),
  };
}

// ── 7. Generate alerts for out-of-stock and low-stock items ────────────
export function generateAlerts(tableData) {
  const critical = tableData.filter(i => i.quantity <= 0).map(i => ({
    id: i.id,
    name: i.name,
    category: i.category,
    warehouse: i.warehouse,
    severity: 'critical',
    message: `${i.name} is OUT OF STOCK! Refill needed immediately.`,
  }));

  const warning = tableData.filter(i => i.status === 'Low Stock').map(i => ({
    id: i.id,
    name: i.name,
    category: i.category,
    warehouse: i.warehouse,
    quantity: i.quantity,
    reorderLevel: i.reorderLevel,
    severity: 'warning',
    message: `${i.name} is running low (${i.quantity} ${i.unit} left, reorder at ${i.reorderLevel}).`,
  }));

  return [...critical, ...warning];
}

// ── 8. Master generator ───────────────────────────────────────────────
export function generateAllMockData(fileName = 'VCL_Inventory.xlsx', nodeRegion = 'mumbai') {
  const table = generateInventoryTable(nodeRegion);
  const timeSeries = generateInventoryTimeSeries();
  const categories = generateCategoryData(nodeRegion);
  const donut = generateStatusDistribution(table);
  const scatter = generateScatterData(table);
  const kpi = generateKPI(table, fileName);
  const alerts = generateAlerts(table);

  return {
    kpi,
    timeSeries,
    categories,
    donut,
    scatter,
    table,
    alerts,
  };
}

// ── 9. Consumption tick simulator ──────────────────────────────────────
// Simulates items being consumed/sold over time; some items deplete to 0.
export function tickInventoryData(prevData, config = {}) {
  if (!prevData) return generateAllMockData();

  const {
    consumptionRate = 'medium', // slow | medium | fast
    restockMode = 'manual',    // manual | auto
    nodeRegion = 'mumbai'
  } = config;

  // Consumption amounts per tick
  let maxConsume = 3;
  if (consumptionRate === 'slow') maxConsume = 1;
  if (consumptionRate === 'fast') maxConsume = 6;

  // Update table: consume random amounts from each item
  const newTable = prevData.table.map(item => {
    const consumed = rand(0, maxConsume);
    let newQty = Math.max(0, item.quantity - consumed);

    // Auto-restock if enabled and item hits 0
    if (restockMode === 'auto' && newQty <= 0) {
      newQty = rand(15, 40);
    }

    const newTotalValue = newQty * item.pricePerUnit;
    const newStatus = getStockStatus(newQty, item.reorderLevel);

    return {
      ...item,
      quantity: newQty,
      totalValue: newTotalValue,
      status: newStatus,
      lastUpdated: getFullDateString(0),
    };
  });

  // Recompute everything from updated table
  const newKpi = generateKPI(newTable, prevData.kpi.fileName);
  const newDonut = generateStatusDistribution(newTable);
  const newScatter = generateScatterData(newTable);
  const newAlerts = generateAlerts(newTable);

  // Update time series: add new point for "now"
  const ts = prevData.timeSeries;
  const trackedProducts = ts.products;
  const newTimeData = [...ts.data];
  const now = new Date();
  const timeLabel = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const newPoint = { day: timeLabel };

  trackedProducts.forEach(productName => {
    const item = newTable.find(i => i.name === productName);
    newPoint[productName] = item ? item.quantity : 0;
  });

  newTimeData.push(newPoint);
  if (newTimeData.length > 15) newTimeData.shift();

  // Slightly fluctuate category totals
  const newCategories = prevData.categories.map(cat => {
    const delta = rand(-5, 3);
    return {
      ...cat,
      value: Math.max(10, cat.value + delta),
    };
  });

  return {
    kpi: newKpi,
    timeSeries: { data: newTimeData, products: trackedProducts },
    categories: newCategories,
    donut: newDonut,
    scatter: newScatter,
    table: newTable,
    alerts: newAlerts,
  };
}
