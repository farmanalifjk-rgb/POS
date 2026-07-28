import { Sidebar } from "../../../components/Sidebar.js";

export function RefundHistoryPage() {
  return `
<div class="flex h-screen bg-[#f1f2f0] overflow-hidden">
  ${Sidebar()}
  <main class="flex-1 h-screen min-h-0 overflow-hidden p-6">
    <div class="bg-white h-full rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">

      <!-- Toolbar -->
      <div class="shrink-0 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="undo-2" class="w-5 h-5 text-rose-600"></i> Refund History
          </h1>
          <p class="text-sm text-slate-400 mt-0.5" id="refund-count">Loading…</p>
        </div>
        <div class="flex items-center gap-2">
          <input id="refund-date-from" type="date"
            class="h-10 px-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            onchange="window.loadRefundHistory()" />
          <span class="text-slate-400 text-sm">to</span>
          <input id="refund-date-to" type="date"
            class="h-10 px-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            onchange="window.loadRefundHistory()" />
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            <input id="refund-search" type="text" placeholder="Search…"
              class="h-10 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 w-44"
              oninput="window.filterRefunds()" />
          </div>
          <!-- Export dropdown -->
          <div class="relative">
            <button onclick="window.toggleRefundExportMenu(event)"
              class="h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition">
              <i data-lucide="download" class="w-4 h-4"></i> Export
              <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-gray-400"></i>
            </button>
            <div id="refund-export-menu" class="hidden absolute right-0 top-12 w-44 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50">
              <button onclick="window.exportRefunds('csv')" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-left">
                <i data-lucide="file-text" class="w-4 h-4 text-emerald-600"></i> CSV
              </button>
              <button onclick="window.exportRefunds('excel')" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-left">
                <i data-lucide="file-spreadsheet" class="w-4 h-4 text-green-600"></i> Excel
              </button>
              <button onclick="window.exportRefunds('pdf')" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-left">
                <i data-lucide="file-type" class="w-4 h-4 text-red-600"></i> PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Refund #</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order #</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody id="refund-table-body" class="divide-y divide-slate-50">
            <tr><td colspan="7" class="px-6 py-12 text-center text-slate-400">
              <div class="inline-block w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
              <p>Loading refund history…</p>
            </td></tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div id="refund-pagination" class="shrink-0 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500"></div>

    </div>
  </main>
</div>

<!-- Refund Detail Modal -->
<div id="refund-detail-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
      <h2 id="refund-detail-title" class="font-semibold text-slate-900">Refund Detail</h2>
      <button onclick="window.closeRefundDetailModal()" class="text-slate-400 hover:text-slate-700">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div id="refund-detail-body" class="p-6 overflow-y-auto flex-1 text-sm"></div>
  </div>
</div>
`;
}
