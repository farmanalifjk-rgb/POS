import { Sidebar } from "../../../components/Sidebar.js";

/*
  NewDashboardPremium.js
  - Dashboard() returns the redesigned premium dashboard HTML.
  - initializeDashboard() wires event listeners and starts loadDashboard().
  - API calls are marked with "API:" in comments — replace them with your endpoints.
  - Uses lightweight inline SVG renderers (no external chart libs).
*/

export function Dashboard() {
  return `
<div class="flex h-screen bg-[#f1f2f0] overflow-hidden">
  ${Sidebar()}

  <main class="flex-1 h-screen overflow-y-auto p-6">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p class="text-sm text-slate-500 mt-0.5">Welcome back — here's what's happening today</p>
      </div>
      <div class="flex items-center gap-3">
        <select id="dash-period" class="h-10 px-3 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
        <button id="dash-refresh" class="h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition shadow-sm">
          <i data-lucide="refresh-cw" class="w-4 h-4"></i> Refresh
        </button>
      </div>
    </div>

    <!-- KPI Cards (premium) -->
    <div id="dash-kpi" class="grid grid-cols-2 lg:grid-cols-6 gap-5 mb-6">
      <!-- Cards injected by default markup so layout is stable before JS -->
      <div class="col-span-2 lg:col-span-1">
        <div class="relative overflow-hidden rounded-3xl p-5 bg-white/95 border border-slate-100/60 shadow-2xl ring-1 ring-white/5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-xs text-slate-400">Total Sales</div>
              <div id="kpi-total-sales" class="text-xl lg:text-lg font-bold text-slate-900 mt-1">$0.00</div>
              <div id="kpi-total-sales-change" class="text-xs text-slate-400 mt-2 flex items-center gap-2"></div>
            </div>
            <div class="shrink-0">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-indigo-400 shadow-inner">
                <i data-lucide="shopping-cart" class="w-5 h-5 text-white"></i>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <div id="spark-total-sales" class="h-6"></div>
          </div>
        </div>
      </div>

      <div class="col-span-2 lg:col-span-1">
        <div class="relative overflow-hidden rounded-3xl p-5 bg-white/95 border border-slate-100/60 shadow-2xl ring-1 ring-white/5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-xs text-slate-400">Orders</div>
              <div id="kpi-orders" class="text-xl lg:text-lg font-bold text-slate-900 mt-1">0</div>
              <div id="kpi-orders-change" class="text-xs text-slate-400 mt-2 flex items-center gap-2"></div>
            </div>
            <div class="shrink-0">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-tr from-emerald-400 to-emerald-500 shadow-inner">
                <i data-lucide="package" class="w-5 h-5 text-white"></i>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <div id="spark-orders" class="h-6"></div>
          </div>
        </div>
      </div>

      <div class="col-span-2 lg:col-span-1">
        <div class="relative overflow-hidden rounded-3xl p-5 bg-white/95 border border-slate-100/60 shadow-2xl ring-1 ring-white/5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-xs text-slate-400">Average Order</div>
              <div id="kpi-aov" class="text-xl lg:text-lg font-bold text-slate-900 mt-1">$0.00</div>
              <div id="kpi-aov-change" class="text-xs text-slate-400 mt-2 flex items-center gap-2"></div>
            </div>
            <div class="shrink-0">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-tr from-amber-400 to-amber-500 shadow-inner">
                <i data-lucide="dollar-sign" class="w-5 h-5 text-white"></i>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <div id="spark-aov" class="h-6"></div>
          </div>
        </div>
      </div>

      <div class="col-span-2 lg:col-span-1">
        <div class="relative overflow-hidden rounded-3xl p-5 bg-white/95 border border-slate-100/60 shadow-2xl ring-1 ring-white/5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-xs text-slate-400">Total Customers</div>
              <div id="kpi-customers" class="text-xl lg:text-lg font-bold text-slate-900 mt-1">0</div>
              <div id="kpi-customers-change" class="text-xs text-slate-400 mt-2 flex items-center gap-2"></div>
            </div>
            <div class="shrink-0">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-tr from-sky-400 to-sky-500 shadow-inner">
                <i data-lucide="users" class="w-5 h-5 text-white"></i>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <div id="spark-customers" class="h-6"></div>
          </div>
        </div>
      </div>

      <div class="col-span-2 lg:col-span-1">
        <div class="relative overflow-hidden rounded-3xl p-5 bg-white/95 border border-slate-100/60 shadow-2xl ring-1 ring-white/5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-xs text-slate-400">Gross Profit</div>
              <div id="kpi-gross-profit" class="text-xl lg:text-lg font-bold text-slate-900 mt-1">$0.00</div>
              <div id="kpi-gross-profit-change" class="text-xs text-slate-400 mt-2 flex items-center gap-2"></div>
            </div>
            <div class="shrink-0">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-tr from-rose-400 to-rose-500 shadow-inner">
                <i data-lucide="bar-chart-2" class="w-5 h-5 text-white"></i>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <div id="spark-gross-profit" class="h-6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overview Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

      <!-- Sales Overview (line chart) -->
      <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-100/60 shadow-2xl p-5">
        <div class="flex items-start justify-between mb-4">
          <h2 class="font-semibold text-slate-800 flex items-center gap-2">
            <i data-lucide="trending-up" class="w-4 h-4 text-indigo-500"></i> Sales Overview
          </h2>
          <div class="text-xs text-slate-400">Showing: <span id="overview-period-label">Today</span></div>
        </div>

        <div class="flex gap-4">
          <div class="flex-1">
            <div id="sales-overview-chart" class="w-full h-[260px] rounded-xl overflow-hidden bg-gradient-to-tr from-white to-slate-50 p-3"></div>
            <div class="flex items-center justify-between mt-3 text-xs text-slate-500">
              <div>12 AM</div>
              <div>04 AM</div>
              <div>08 AM</div>
              <div>12 PM</div>
              <div>04 PM</div>
              <div>08 PM</div>
            </div>
          </div>

          <div class="w-72 bg-slate-50 rounded-2xl p-4">
            <div class="text-xs text-slate-400 mb-3">Sales by Payment Method</div>
            <div id="sales-payment-donut" class="flex items-center justify-center"></div>
            <div id="sales-payment-legend" class="mt-4 text-xs"></div>
          </div>
        </div>
      </div>

      <!-- Today's Summary -->
      <div class="bg-white rounded-3xl border border-slate-100/60 shadow-2xl p-5">
        <h2 class="font-semibold text-slate-800 mb-3">Today's Summary</h2>
        <div id="today-summary" class="text-sm text-slate-600 space-y-2">
          <div class="flex items-center justify-between"><span>Opening Balance</span><span id="sum-opening">$0.00</span></div>
          <div class="flex items-center justify-between"><span>Total Sales</span><span id="sum-sales" class="text-emerald-600 font-semibold">$0.00</span></div>
          <div class="flex items-center justify-between"><span>Total Refunds</span><span id="sum-refunds" class="text-rose-600">-$0.00</span></div>
          <div class="flex items-center justify-between"><span>Total Discounts</span><span id="sum-discounts">-$0.00</span></div>
          <div class="flex items-center justify-between border-t pt-3 mt-3 font-semibold"><span>Net Sales</span><span id="sum-net">$0.00</span></div>
          <div class="mt-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 font-medium">Closing Balance (Expected): <span id="sum-closing" class="ml-2">$0.00</span></div>
        </div>
      </div>
    </div>

    <!-- Middle Row: Lists -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <!-- Recent Orders -->
      <div class="bg-white rounded-3xl border border-slate-100/60 shadow-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100/60 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800 flex items-center gap-2"><i data-lucide="shopping-bag" class="w-4 h-4 text-indigo-500"></i> Recent Orders</h3>
          <a href="#/orders" class="text-xs text-indigo-600 font-medium hover:underline">View all →</a>
        </div>
        <div id="recent-orders" class="p-4 space-y-3 text-sm text-slate-700">
          <!-- injected -->
        </div>
      </div>

      <!-- Top Selling Products -->
      <div class="bg-white rounded-3xl border border-slate-100/60 shadow-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100/60 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800 flex items-center gap-2"><i data-lucide="star" class="w-4 h-4 text-amber-500"></i> Top Selling Products</h3>
          <a href="#/reports/products" class="text-xs text-indigo-600 font-medium hover:underline">Full report →</a>
        </div>
        <div id="top-products" class="p-4 space-y-3 text-sm text-slate-700">
          <!-- injected -->
        </div>
      </div>

      <!-- Low Stock Alerts -->
      <div class="bg-white rounded-3xl border border-slate-100/60 shadow-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100/60 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800 flex items-center gap-2"><i data-lucide="alert-triangle" class="w-4 h-4 text-amber-500"></i> Low Stock Alerts</h3>
          <a href="#/inventory/dashboard" class="text-xs text-indigo-600 font-medium hover:underline">View All →</a>
        </div>
        <div id="low-stock" class="p-4 space-y-3 text-sm text-slate-700">
          <!-- injected -->
        </div>
      </div>
    </div>

    <!-- Bottom Row: Sessions, Notifications, Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Active POS Sessions -->
      <div class="bg-white rounded-3xl border border-slate-100/60 shadow-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold text-slate-800">Active POS Sessions</h4>
          <a href="#/cash-sessions" class="text-xs text-indigo-600 hover:underline">View All</a>
        </div>
        <div id="pos-sessions" class="text-sm text-slate-700 space-y-3">
          <!-- injected -->
        </div>
      </div>

      <!-- Recent Notifications -->
      <div class="bg-white rounded-3xl border border-slate-100/60 shadow-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold text-slate-800">Recent Notifications</h4>
          <a href="#/notifications" class="text-xs text-indigo-600 hover:underline">View All</a>
        </div>
        <div id="recent-notifs" class="text-sm text-slate-700 space-y-2">
          <!-- injected -->
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-3xl border border-slate-100/60 shadow-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold text-slate-800">Quick Actions</h4>
          <div class="text-xs text-slate-400">Shortcuts</div>
        </div>
        <div class="grid grid-cols-3 gap-3 text-sm">
          <button title="New Sale" class="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-tr from-indigo-50 to-indigo-25 hover:from-indigo-100 transition shadow">
            <i data-lucide="plus-circle" class="w-5 h-5 text-indigo-600"></i>
            <span>New Sale</span>
          </button>
          <button title="New Order" class="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-tr from-emerald-50 to-emerald-25 hover:from-emerald-100 transition shadow">
            <i data-lucide="credit-card" class="w-5 h-5 text-emerald-600"></i>
            <span>New Order</span>
          </button>
          <button title="Add Product" class="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-tr from-amber-50 to-amber-25 hover:from-amber-100 transition shadow">
            <i data-lucide="package-plus" class="w-5 h-5 text-amber-600"></i>
            <span>Add Product</span>
          </button>

          <button title="Add Customer" class="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-tr from-sky-50 to-sky-25 hover:from-sky-100 transition shadow">
            <i data-lucide="user-plus" class="w-5 h-5 text-sky-600"></i>
            <span>Add Customer</span>
          </button>
          <button title="Expense" class="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-tr from-rose-50 to-rose-25 hover:from-rose-100 transition shadow">
            <i data-lucide="dollar-sign" class="w-5 h-5 text-rose-600"></i>
            <span>Expense</span>
          </button>
          <button title="Reports" class="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-tr from-indigo-50 to-indigo-25 hover:from-indigo-100 transition shadow">
            <i data-lucide="bar-chart-2" class="w-5 h-5 text-indigo-600"></i>
            <span>Reports</span>
          </button>
        </div>
      </div>
    </div>

  </main>
</div>
`;
}

/* ---------------------------
   Formatting & Tiny helpers
   --------------------------- */

function formatCurrency(n) {
  return (n ?? 0).toLocaleString(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

/* Sparkline renderer (tiny premium line) */
function renderSparkline(container, values = [], color = '#6366F1', height = 24) {
  const el = typeof container === "string" ? document.getElementById(container) : container;
  if (!el) return;
  const w = el.clientWidth || 120;
  const h = height;
  const padding = 2;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = padding + (i / Math.max(values.length - 1, 1)) * (w - padding * 2);
    const y = padding + (1 - (v - min) / range) * (h - padding * 2);
    return [x, y];
  });
  const d = pts.map(p => p.join(' ')).join(' L ');
  let svg = `<svg viewBox="0 0 ${w} ${h}" class="w-full h-${h}">`;
  svg += `<path d="M ${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>`;
  // gradient area under line
  const lastX = pts.length ? pts[pts.length-1][0] : w - padding;
  const firstX = pts.length ? pts[0][0] : padding;
  svg += `<path d="M ${d} L ${lastX} ${h-padding} L ${firstX} ${h-padding} Z" fill="${color}" fill-opacity="0.08" stroke="none"/>`;
  svg += `</svg>`;
  el.innerHTML = svg;
}

/* Line chart renderer (wider premium look) */
function renderLineChartSVG(container, series, width = 900, height = 260) {
  const el = typeof container === "string" ? document.getElementById(container) : container;
  if (!el) return;
  const padding = 16;
  const w = el.clientWidth || width;
  const h = height;
  const all = series.flatMap(s => s.data);
  const min = Math.min(...all, 0);
  const max = Math.max(...all, 1);
  const range = max - min || 1;

  const points = (arr) => arr.map((v, i) => {
    const x = padding + (i / Math.max(arr.length - 1, 1)) * (w - padding * 2);
    const y = padding + (1 - (v - min) / range) * (h - padding * 2);
    return [x, y];
  });

  let svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="w-full h-full">`;
  // subtle background gradient
  svg += `<defs>
    <linearGradient id="bgGrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#f8fafc" stop-opacity="1"/>
    </linearGradient>
  </defs>`;
  svg += `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#bgGrad)"/>`;

  // horizontal grid lines
  for (let i = 0; i <= 4; i++) {
    const yy = padding + (i / 4) * (h - padding * 2);
    svg += `<line x1="${padding}" y1="${yy}" x2="${w - padding}" y2="${yy}" stroke="#eef2f7" stroke-width="1"/>`;
  }

  series.forEach((s, idx) => {
    const pts = points(s.data);
    const d = "M " + pts.map(p => p.join(" ")).join(" L ");
    const color = s.color || (idx === 0 ? "#6366F1" : "#34D399");
    // area
    svg += `<path d="${d} L ${w - padding} ${h - padding} L ${padding} ${h - padding} Z" fill="${color}" fill-opacity="0.06" stroke="none"/>`;
    // line
    svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    // points
    pts.forEach(p => {
      svg += `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="${color}" />`;
    });
  });

  svg += `</svg>`;
  el.innerHTML = svg;
}

/* Donut renderer (same but slightly larger) */
function renderDonut(container, data, size = 140, stroke = 24) {
  const el = typeof container === "string" ? document.getElementById(container) : container;
  if (!el) return;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="mx-auto">`;
  data.forEach((d) => {
    const portion = d.value / total;
    const dash = portion * circumference;
    const gap = circumference - dash;
    const rotation = (offset / circumference) * 360;
    const color = d.color;
    svg += `<circle r="${radius}" cx="${center}" cy="${center}" fill="transparent" stroke="${color}" stroke-width="${stroke}" stroke-dasharray="${dash} ${gap}" transform="rotate(${rotation} ${center} ${center})" stroke-linecap="butt"/>`;
    offset += dash;
  });
  svg += `<circle r="${radius - stroke/2}" cx="${center}" cy="${center}" fill="white" opacity="0.96"/>`;
  svg += `</svg>`;
  el.innerHTML = svg;
}

/* ---------------------------
   Data loading & population
   --------------------------- */

/*
  loadDashboard(period)
  - Fetches dashboard data (swap the commented fetches with real endpoints).
*/
export async function loadDashboard(period = 'today') {
  try {
    // UI placeholders before network
    document.getElementById('overview-period-label').textContent = (period === 'today' ? 'Today' : period.charAt(0).toUpperCase() + period.slice(1));
    ['kpi-total-sales','kpi-orders','kpi-aov','kpi-customers','kpi-gross-profit'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = 'Loading...';
    });

    // --- SAMPLE DATA (fallback) ---
    // Replace all below with your API calls (API: ...). Data shape provided to help integration.
    const sample = {
      kpis: {
        total_sales: 12456.90, total_sales_change: 18.9,
        orders: 128, orders_change: 12.5,
        aov: 97.32, aov_change: 8.3,
        customers: 1245, customers_change: 15.7,
        gross_profit: 4235.50, gross_profit_change: 21.3,
        // each sparkline set (array of small numbers)
        sparks: {
          total_sales: [120,180,140,200,300,400,500,450,480,520],
          orders: [8,12,9,14,18,20,24,22,21,23],
          aov: [80,90,85,92,95,100,98,97,99,102],
          customers: [20,35,30,45,55,60,62,61,63,65],
          gross_profit: [40,60,55,70,85,90,95,92,98,110]
        }
      },
      sales_over_time: {
        labels: Array.from({length:24}, (_,i)=>i),
        sales: [120, 180, 140, 200, 300, 400, 500, 450, 480, 520, 600, 700, 680, 720, 760, 800, 770, 740, 700, 650, 600, 520, 400, 220],
        orders: [8,12,9,14,18,20,24,22,21,23,26,30,28,31,34,36,33,30,28,26,24,20,16,10]
      },
      payment_methods: [
        {label:'Cash', value:45.2, amount:5642.80, color:'#10B981'},
        {label:'Card', value:35.6, amount:4443.20, color:'#6366F1'},
        {label:'Mobile', value:12.8, amount:1598.50, color:'#60A5FA'},
        {label:'Other', value:6.4, amount:772.40, color:'#F97316'}
      ],
      today_summary: {
        opening:1200, total_sales:12456.90, refunds:235.00, discounts:892.50, net_sales:11329.40, closing:12529.40
      },
      recent_orders: [
        {id:'#ORD-1065', customer:'Walk-in Customer', amount:125.50, status:'Completed', time:'10:34 AM'},
        {id:'#ORD-1064', customer:'John Smith', amount:88.20, status:'Completed', time:'10:21 AM'},
        {id:'#ORD-1063', customer:'Sarah Johnson', amount:156.75, status:'Completed', time:'10:15 AM'},
        {id:'#ORD-1062', customer:'Walk-in Customer', amount:47.30, status:'Completed', time:'10:02 AM'},
        {id:'#ORD-1061', customer:'Michael Brown', amount:215.90, status:'Completed', time:'09:58 AM'}
      ],
      top_products: [
        {name:'Wireless Headphones', sold:43, revenue:2579.00},
        {name:'Smart Watch', sold:35, revenue:2275.00},
        {name:'Bluetooth Speaker', sold:28, revenue:1390.00},
        {name:'Phone Charger', sold:52, revenue:624.00},
        {name:'USB Cable', sold:78, revenue:312.00}
      ],
      low_stock: [
        {name:'iPhone 14 Case', stock:5, status:'Low Stock'},
        {name:'Charging Adapter', stock:3, status:'Low Stock'},
        {name:'USB C Cable', stock:2, status:'Low Stock'},
        {name:'AirPods Pro', stock:1, status:'Low Stock'},
        {name:'Wireless Mouse', stock:0, status:'Out of Stock'}
      ],
      pos_sessions: [
        {session:'POS-001', cashier:'John Doe', opening:'08:00 AM', sales:2456.30, status:'Open'},
        {session:'POS-002', cashier:'Jane Smith', opening:'09:15 AM', sales:1823.40, status:'Open'},
        {session:'POS-003', cashier:'Mike Johnson', opening:'10:05 AM', sales:1275.60, status:'Open'}
      ],
      notifications: [
        {text:'Low stock alert for iPhone 14 Case', time:'2 mins ago', type:'alert'},
        {text:'New order #ORD-1065 received', time:'5 mins ago', type:'order'},
        {text:'Payment of $125.50 received', time:'10 mins ago', type:'payment'},
        {text:'New customer John Smith added', time:'15 mins ago', type:'customer'}
      ]
    };

    // --------- Uncomment & replace the example API calls below with your real endpoints ----------
    // Example: Fetch KPIs
    // const kpiRes = await fetch('/api/dashboard/kpis?period=' + period);
    // const kpiData = await kpiRes.json();

    // Example: Fetch sales over time
    // const salesRes = await fetch('/api/dashboard/sales_over_time?period=' + period);
    // const salesTime = await salesRes.json();

    // Example: Fetch payment method breakdown
    // const paymentRes = await fetch('/api/dashboard/payment_methods?period=' + period);
    // const paymentData = await paymentRes.json();

    // For now use sample.kpis etc. Replace with your API responses as needed.
    const kpiData = sample.kpis;
    const salesTime = sample.sales_over_time;
    const paymentData = sample.payment_methods;
    const summary = sample.today_summary;
    const recentOrders = sample.recent_orders;
    const topProducts = sample.top_products;
    const lowStock = sample.low_stock;
    const sessions = sample.pos_sessions;
    const notifs = sample.notifications;

    // KPIs
    document.getElementById('kpi-total-sales').textContent = formatCurrency(kpiData.total_sales);
    document.getElementById('kpi-total-sales-change').innerHTML = `${kpiData.total_sales_change >= 0 ? '<span class="text-emerald-600 font-medium">▲ ' : '<span class="text-rose-600 font-medium">▼ '} ${Math.abs(kpiData.total_sales_change).toFixed(1)}% vs yesterday</span>`;
    document.getElementById('kpi-orders').textContent = kpiData.orders;
    document.getElementById('kpi-orders-change').innerHTML = `${kpiData.orders_change >= 0 ? '<span class="text-emerald-600 font-medium">▲ ' : '<span class="text-rose-600 font-medium">▼ '} ${Math.abs(kpiData.orders_change).toFixed(1)}% vs yesterday</span>`;
    document.getElementById('kpi-aov').textContent = formatCurrency(kpiData.aov);
    document.getElementById('kpi-aov-change').innerHTML = `${kpiData.aov_change >= 0 ? '<span class="text-emerald-600 font-medium">▲ ' : '<span class="text-rose-600 font-medium">▼ '} ${Math.abs(kpiData.aov_change).toFixed(1)}% vs yesterday</span>`;
    document.getElementById('kpi-customers').textContent = kpiData.customers;
    document.getElementById('kpi-customers-change').innerHTML = `${kpiData.customers_change >= 0 ? '<span class="text-emerald-600 font-medium">▲ ' : '<span class="text-rose-600 font-medium">▼ '} ${Math.abs(kpiData.customers_change).toFixed(1)}% vs yesterday</span>`;
    document.getElementById('kpi-gross-profit').textContent = formatCurrency(kpiData.gross_profit);
    document.getElementById('kpi-gross-profit-change').innerHTML = `${kpiData.gross_profit_change >= 0 ? '<span class="text-emerald-600 font-medium">▲ ' : '<span class="text-rose-600 font-medium">▼ '} ${Math.abs(kpiData.gross_profit_change).toFixed(1)}% vs yesterday</span>`;

    // Sparklines (use spark arrays or fallback to slice of sales_over_time)
    try {
      renderSparkline('spark-total-sales', kpiData.sparks?.total_sales || salesTime.sales.slice(0,10), '#6366F1');
      renderSparkline('spark-orders', kpiData.sparks?.orders || salesTime.orders.slice(0,10), '#10B981');
      renderSparkline('spark-aov', kpiData.sparks?.aov || salesTime.sales.slice(2,12), '#F59E0B');
      renderSparkline('spark-customers', kpiData.sparks?.customers || salesTime.orders.slice(3,13), '#0EA5E9');
      renderSparkline('spark-gross-profit', kpiData.sparks?.gross_profit || salesTime.sales.slice(4,14), '#F43F5E');
    } catch(e){}

    // Sales overview chart (line)
    renderLineChartSVG('sales-overview-chart', [
      {name:'Sales', color:'#6366F1', data: salesTime.sales},
      {name:'Orders', color:'#10B981', data: salesTime.orders}
    ]);

    // Payment donut + legend
    renderDonut('sales-payment-donut', paymentData.map(p => ({label:p.label, value:p.value, color:p.color})));
    document.getElementById('sales-payment-legend').innerHTML = paymentData.map(p => `
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background:${p.color}"></span><span>${p.label}</span></div>
        <div class="text-sm text-slate-600">${p.value}% <span class="text-slate-400">(${formatCurrency(p.amount)})</span></div>
      </div>
    `).join('');

    // Today's summary
    document.getElementById('sum-opening').textContent = formatCurrency(summary.opening);
    document.getElementById('sum-sales').textContent = formatCurrency(summary.total_sales);
    document.getElementById('sum-refunds').textContent = `-${formatCurrency(summary.refunds)}`;
    document.getElementById('sum-discounts').textContent = `-${formatCurrency(summary.discounts)}`;
    document.getElementById('sum-net').textContent = formatCurrency(summary.net_sales);
    document.getElementById('sum-closing').textContent = formatCurrency(summary.closing);

    // Recent Orders (table-like rows)
    document.getElementById('recent-orders').innerHTML = recentOrders.map(o => `
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-indigo-600 font-semibold">${o.id}</div>
          <div class="text-sm text-slate-700">${o.customer}</div>
        </div>
        <div class="text-right">
          <div class="text-sm font-medium">${formatCurrency(o.amount)}</div>
          <div class="text-xs text-slate-400 mt-1">${o.time} • <span class="px-2 py-0.5 rounded-full text-xs ${o.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}">${o.status}</span></div>
        </div>
      </div>
    `).join('');

    // Top products (with subtle premium separators)
    document.getElementById('top-products').innerHTML = topProducts.map((p, idx) => `
      <div class="flex items-center justify-between ${idx < topProducts.length-1 ? 'border-b border-slate-100/60 pb-3 mb-3' : ''}">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">#${idx+1}</div>
          <div>
            <div class="text-sm font-medium text-slate-800">${p.name}</div>
            <div class="text-xs text-slate-400">${p.sold} sold</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm font-semibold">${formatCurrency(p.revenue)}</div>
        </div>
      </div>
    `).join('');

    // Low stock
    document.getElementById('low-stock').innerHTML = lowStock.map(i => `
      <div class="flex items-center justify-between">
        <div class="text-sm">${i.name}</div>
        <div class="flex items-center gap-3">
          <div class="text-sm text-slate-600">${i.stock}</div>
          <div class="text-xs px-2 py-0.5 rounded-full ${i.status === 'Out of Stock' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}">${i.status}</div>
        </div>
      </div>
    `).join('');

    // POS sessions
    document.getElementById('pos-sessions').innerHTML = sessions.map(s => `
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium">${s.session} — ${s.cashier}</div>
          <div class="text-xs text-slate-400">${s.opening}</div>
        </div>
        <div class="text-right">
          <div class="text-sm font-semibold">${formatCurrency(s.sales)}</div>
          <div class="text-xs text-slate-400">${s.status}</div>
        </div>
      </div>
    `).join('');

    // Notifications
    document.getElementById('recent-notifs').innerHTML = notifs.map(n => `
      <div class="flex items-start gap-3">
        <div class="w-2 h-2 mt-2 rounded-full ${n.type === 'alert' ? 'bg-amber-400' : n.type === 'order' ? 'bg-indigo-500' : n.type === 'payment' ? 'bg-emerald-500' : 'bg-sky-400'}"></div>
        <div>
          <div class="text-sm text-slate-700">${n.text}</div>
          <div class="text-xs text-slate-400 mt-1">${n.time}</div>
        </div>
      </div>
    `).join('');

    // Re-init lucide icons (if not already initialized)
    if (window.createIcons) {
      try { window.createIcons({ icons: window.lucideIcons }); } catch(e) {}
    }

  } catch (err) {
    console.error('Failed to load dashboard', err);
    // Optionally display an error card or toast
  }
}

/* ---------------------------
   Initialization (exported)
   --------------------------- */

export function initializeDashboard() {
  const periodSelect = document.getElementById('dash-period');
  const refreshBtn = document.getElementById('dash-refresh');

  periodSelect?.addEventListener('change', (e) => {
    loadDashboard(e.target.value);
  });

  refreshBtn?.addEventListener('click', () => {
    loadDashboard(periodSelect?.value || 'today');
  });

  // initial
  loadDashboard(periodSelect?.value || 'today');
}