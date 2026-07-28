import { Sidebar } from "../../../components/Sidebar.js";

export function EmployeeReportPage() {
  return `
<div class="flex h-screen bg-[#f4f7f6]">
  ${Sidebar()}
  <main class="flex-1 overflow-y-auto p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Employee Report</h1>
        <p class="text-gray-500 mt-1">Sales performance by staff member</p>
      </div>
      <div class="flex items-center gap-3">
        <input type="date" id="er-start" class="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
        <span class="text-slate-400">to</span>
        <input type="date" id="er-end" class="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
        <button onclick="window.loadEmployeeReport()" class="h-10 px-5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition">Load</button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="text-lg font-bold text-slate-800">Sales by Employee</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders Handled</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sales</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg. Sale</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Discounts Given</th>
            </tr>
          </thead>
          <tbody id="er-table" class="divide-y divide-slate-50">
            <tr><td colspan="6" class="px-6 py-12 text-center text-slate-400 text-sm">Select a date range and click Load.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</div>`;
}
