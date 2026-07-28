import { Sidebar } from "../../../components/Sidebar.js";

export function InventoryReportsPage() {
  return `
<div class="flex h-screen bg-[#f1f2f0] overflow-hidden">
  ${Sidebar()}
  <main class="flex-1 h-screen min-h-0 overflow-y-auto p-6">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <i data-lucide="file-bar-chart" class="w-6 h-6 text-indigo-600"></i> Inventory Reports
        </h1>
        <p class="text-sm text-slate-400 mt-0.5">Comprehensive inventory reporting</p>
      </div>
      <button onclick="window.loadInventoryReports()"
        class="h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition">
        <i data-lucide="refresh-cw" class="w-4 h-4"></i> Refresh
      </button>
    </div>

    <!-- Summary -->
    <div id="inv-report-summary" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
        <div class="h-3 bg-slate-100 rounded w-1/2 mb-3"></div>
        <div class="h-7 bg-slate-100 rounded w-3/4"></div>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
        <div class="h-3 bg-slate-100 rounded w-1/2 mb-3"></div>
        <div class="h-7 bg-slate-100 rounded w-3/4"></div>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
        <div class="h-3 bg-slate-100 rounded w-1/2 mb-3"></div>
        <div class="h-7 bg-slate-100 rounded w-3/4"></div>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
        <div class="h-3 bg-slate-100 rounded w-1/2 mb-3"></div>
        <div class="h-7 bg-slate-100 rounded w-3/4"></div>
      </div>
    </div>

    <!-- Full Report Table -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-semibold text-slate-800">Product Inventory Report</h2>
        <div class="flex items-center gap-2">
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            <input id="inv-report-search" type="text" placeholder="Search…"
              class="h-9 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 w-48"
              oninput="window.filterInventoryReport()" />
          </div>
          <button onclick="window.exportInventoryCSV()"
            class="h-9 px-3 border border-gray-200 rounded-xl text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50 transition text-slate-600">
            <i data-lucide="download" class="w-4 h-4"></i> CSV
          </button>
          <button onclick="window.exportInventoryExcel()"
            class="h-9 px-3 border border-gray-200 rounded-xl text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50 transition text-slate-600">
            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Excel
          </button>
          <button onclick="window.exportInventoryPDF()"
            class="h-9 px-3 border border-gray-200 rounded-xl text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50 transition text-slate-600">
            <i data-lucide="file-type" class="w-4 h-4"></i> PDF
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">SKU</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">In Stock</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Sold</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Returned</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock Value</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody id="inv-report-table-body" class="divide-y divide-slate-50">
            <tr><td colspan="8" class="px-6 py-12 text-center text-slate-400">
              <div class="inline-block w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
              <p>Loading inventory report…</p>
            </td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </main>
</div>
`;
}
