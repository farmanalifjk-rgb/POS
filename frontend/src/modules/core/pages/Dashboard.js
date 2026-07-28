import { Sidebar } from "../../../components/Sidebar.js";

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
        <select id="dash-period" onchange="window.loadDashboard()" class="h-10 px-3 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
        <button onclick="window.loadDashboard()" class="h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition">
          <i data-lucide="refresh-cw" class="w-4 h-4"></i> Refresh
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div id="dash-kpi" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${kpiSkeleton(4)}
    </div>

    <!-- Secondary Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

      <!-- Recent Orders -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="font-semibold text-slate-800 flex items-center gap-2">
            <i data-lucide="shopping-bag" class="w-4 h-4 text-indigo-500"></i> Recent Orders
          </h2>
          <a href="#/orders" class="text-xs text-indigo-600 font-medium hover:underline">View all →</a>
        </div>
        <div id="dash-recent-orders" class="divide-y divide-slate-50">
          ${rowSkeleton(5)}
        </div>
      </div>

      <!-- Summary Panel -->
      <div class="space-y-4">

        <!-- Low Stock Alert -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 class="font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-500"></i> Low Stock
          </h2>
          <div id="dash-low-stock" class="space-y-2 text-sm">${rowSkeleton(3)}</div>
          <a href="#/inventory/dashboard" class="mt-3 block text-xs text-indigo-600 font-medium hover:underline">View inventory →</a>
        </div>

        <!-- Cash Sessions -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 class="font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <i data-lucide="landmark" class="w-4 h-4 text-emerald-500"></i> Cash Sessions
          </h2>
          <div id="dash-sessions" class="text-sm text-slate-500">${rowSkeleton(2)}</div>
          <a href="#/cash-sessions" class="mt-3 block text-xs text-indigo-600 font-medium hover:underline">Manage sessions →</a>
        </div>

      </div>
    </div>

    <!-- Top Products -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-semibold text-slate-800 flex items-center gap-2">
          <i data-lucide="trending-up" class="w-4 h-4 text-violet-500"></i> Top Selling Products
        </h2>
        <a href="#/reports/products" class="text-xs text-indigo-600 font-medium hover:underline">Full report →</a>
      </div>
      <div id="dash-top-products" class="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        ${rowSkeleton(4)}
      </div>
    </div>

  </main>
</div>
`;
}

function kpiSkeleton(n) {
  return Array(n).fill(0).map(() => `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div class="h-3 bg-slate-100 rounded w-1/2 mb-3"></div>
      <div class="h-7 bg-slate-100 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-slate-100 rounded w-1/3"></div>
    </div>
  `).join("");
}

function rowSkeleton(n) {
  return Array(n).fill(0).map(() => `
    <div class="h-8 bg-slate-100 rounded animate-pulse mb-2"></div>
  `).join("");
}
