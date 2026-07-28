import { Sidebar } from "../../../components/Sidebar.js";

export function SupplierReportPage() {
  return `
<div class="flex h-screen bg-[#f4f7f6]">
  ${Sidebar()}
  <main class="flex-1 overflow-y-auto p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Supplier Report</h1>
        <p class="text-gray-500 mt-1">Purchase volume and balances per supplier</p>
      </div>
      <button onclick="window.loadSupplierReport()" class="h-10 px-5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition flex items-center gap-2">
        <i data-lucide="refresh-cw" class="w-4 h-4"></i> Refresh
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="text-lg font-bold text-slate-800">Supplier Performance</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Supplier</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">PO Count</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Volume</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Paid</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</th>
            </tr>
          </thead>
          <tbody id="sr-table" class="divide-y divide-slate-50">
            <tr><td colspan="6" class="px-6 py-12 text-center text-slate-400 text-sm">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</div>`;
}
