import { Sidebar } from "../../../components/Sidebar.js";

export function InventoryAnalyticsPage() {
  return `
<div class="flex h-screen bg-[#f1f2f0] overflow-hidden">
  ${Sidebar()}
  <main class="flex-1 h-screen min-h-0 overflow-y-auto p-6">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <i data-lucide="chart-column" class="w-6 h-6 text-indigo-600"></i> Inventory Analytics
        </h1>
        <p class="text-sm text-slate-400 mt-0.5">Performance insights for your stock</p>
      </div>
      <button onclick="window.loadInventoryAnalytics()"
        class="h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition">
        <i data-lucide="refresh-cw" class="w-4 h-4"></i> Refresh
      </button>
    </div>

    <!-- Summary Cards -->
    <div id="analytics-kpi" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p class="text-xs text-slate-500 mb-1">Total Products</p>
        <p class="text-2xl font-bold text-slate-900" id="an-total-products">—</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p class="text-xs text-slate-500 mb-1">Low Stock Items</p>
        <p class="text-2xl font-bold text-amber-600" id="an-low-stock">—</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p class="text-xs text-slate-500 mb-1">Out of Stock</p>
        <p class="text-2xl font-bold text-red-600" id="an-out-stock">—</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p class="text-xs text-slate-500 mb-1">Avg Stock Level</p>
        <p class="text-2xl font-bold text-indigo-600" id="an-avg-stock">—</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Top Selling -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-800 flex items-center gap-2">
            <i data-lucide="trending-up" class="w-4 h-4 text-emerald-500"></i> Top Selling Products
          </h2>
        </div>
        <div id="an-top-selling" class="divide-y divide-slate-50"></div>
      </div>

      <!-- Slow Moving -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-800 flex items-center gap-2">
            <i data-lucide="trending-down" class="w-4 h-4 text-amber-500"></i> Slow Moving Products
          </h2>
        </div>
        <div id="an-slow-moving" class="divide-y divide-slate-50"></div>
      </div>

      <!-- Most Returned -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-800 flex items-center gap-2">
            <i data-lucide="rotate-ccw" class="w-4 h-4 text-rose-500"></i> Most Returned Products
          </h2>
        </div>
        <div id="an-most-returned" class="divide-y divide-slate-50"></div>
      </div>

      <!-- Low Stock Alert List -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-800 flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-500"></i> Low Stock Alert
          </h2>
        </div>
        <div id="an-low-stock-list" class="divide-y divide-slate-50"></div>
      </div>

    </div>

  </main>
</div>
`;
}
