import { Sidebar } from "../../../components/Sidebar.js";

export function InventoryValuationPage() {
  return `
<div class="flex h-screen bg-[#f1f2f0] overflow-hidden">
  ${Sidebar()}
  <main class="flex-1 h-screen min-h-0 overflow-hidden p-6">
    <div class="bg-white h-full rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">

      <!-- Header -->
      <div class="shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="wallet" class="w-5 h-5 text-violet-600"></i> Inventory Valuation
          </h1>
          <p class="text-sm text-slate-400 mt-0.5">Current stock value at cost price</p>
        </div>
        <button onclick="window.loadValuation()"
          class="h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition">
          <i data-lucide="refresh-cw" class="w-4 h-4"></i> Refresh
        </button>
      </div>

      <!-- Summary Cards -->
      <div id="val-summary" class="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4 border-b border-slate-100">
        <div class="bg-violet-50 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">Total Stock Value</p>
          <p class="text-2xl font-bold text-violet-700" id="val-total">—</p>
        </div>
        <div class="bg-indigo-50 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">Total Products</p>
          <p class="text-2xl font-bold text-indigo-700" id="val-products">—</p>
        </div>
        <div class="bg-emerald-50 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">Total Units</p>
          <p class="text-2xl font-bold text-emerald-700" id="val-units">—</p>
        </div>
        <div class="bg-amber-50 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">Avg Unit Cost</p>
          <p class="text-2xl font-bold text-amber-700" id="val-avg-cost">—</p>
        </div>
      </div>

      <!-- Product Valuation Table -->
      <div class="shrink-0 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
        <p class="text-sm font-semibold text-slate-700">Product Breakdown</p>
        <div class="relative">
          <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
          <input id="val-search" type="text" placeholder="Search products…"
            class="h-9 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-400 w-52"
            oninput="window.filterValuation()" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit Cost</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Value</th>
            </tr>
          </thead>
          <tbody id="val-table-body" class="divide-y divide-slate-50">
            <tr><td colspan="5" class="px-6 py-12 text-center text-slate-400">
              <div class="inline-block w-6 h-6 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin mb-2"></div>
              <p>Loading valuation data…</p>
            </td></tr>
          </tbody>
        </table>
      </div>

    </div>
  </main>
</div>
`;
}
