import { Sidebar } from "../../../components/Sidebar.js";

export function PurchaseReturnsPage() {
  return `
<div class="flex h-screen bg-[#f1f2f0] overflow-hidden">
  ${Sidebar()}
  <main class="flex-1 h-screen min-h-0 overflow-hidden p-6">
    <div class="bg-white h-full rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">

      <!-- Toolbar -->
      <div class="shrink-0 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="rotate-ccw" class="w-5 h-5 text-orange-600"></i> Purchase Returns
          </h1>
          <p class="text-sm text-slate-400 mt-0.5" id="pr-count">Loading…</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            <input id="pr-search" type="text" placeholder="Search returns…"
              class="h-10 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 w-56"
              oninput="window.filterPurchaseReturns()" />
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div id="pr-dashboard" class="shrink-0 grid grid-cols-3 gap-4 px-6 py-4 border-b border-slate-100">
        <div class="bg-slate-50 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">Total Returns</p>
          <p class="text-2xl font-bold text-slate-900" id="pr-total-count">—</p>
        </div>
        <div class="bg-orange-50 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">Total Returned Value</p>
          <p class="text-2xl font-bold text-orange-700" id="pr-total-amount">—</p>
        </div>
        <div class="bg-indigo-50 rounded-xl p-4">
          <p class="text-xs text-slate-500 mb-1">Pending Resolution</p>
          <p class="text-2xl font-bold text-indigo-700" id="pr-pending-count">—</p>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Return #</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">PO #</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Supplier</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody id="pr-table-body" class="divide-y divide-slate-50">
            <tr><td colspan="6" class="px-6 py-12 text-center text-slate-400">
              <div class="inline-block w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
              <p>Loading purchase returns…</p>
            </td></tr>
          </tbody>
        </table>
      </div>

    </div>
  </main>
</div>

<!-- Return Detail Modal -->
<div id="pr-detail-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
      <h2 id="pr-detail-title" class="font-semibold text-slate-900">Return Detail</h2>
      <button onclick="window.closePRDetailModal()" class="text-slate-400 hover:text-slate-700">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div id="pr-detail-body" class="p-6 overflow-y-auto flex-1 text-sm"></div>
  </div>
</div>
`;
}
