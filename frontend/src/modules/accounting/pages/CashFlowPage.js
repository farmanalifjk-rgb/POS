import { Sidebar } from "../../../components/Sidebar.js";

export function CashFlowPage() {
  return `
<div class="flex h-screen bg-[#f4f7f6]">
  ${Sidebar()}
  <main class="flex-1 overflow-y-auto p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Cash Flow</h1>
        <p class="text-gray-500 mt-1">Money in vs money out</p>
      </div>
      <div class="flex items-center gap-3">
        <input type="date" id="cf-start" class="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
        <span class="text-slate-400">to</span>
        <input type="date" id="cf-end" class="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
        <button onclick="window.loadCashFlow()" class="h-10 px-5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition">Generate</button>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-3 gap-6 mb-8">
      <div class="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
        <p class="text-sm font-semibold text-emerald-600 mb-1">Total Inflows</p>
        <p id="cf-inflow" class="text-3xl font-bold text-emerald-700">-</p>
        <div class="mt-4 space-y-2" id="cf-inflows-breakdown"></div>
      </div>
      <div class="bg-red-50 rounded-2xl p-6 border border-red-100">
        <p class="text-sm font-semibold text-red-500 mb-1">Total Outflows</p>
        <p id="cf-outflow" class="text-3xl font-bold text-red-600">-</p>
        <div class="mt-4 space-y-2" id="cf-outflows-breakdown"></div>
      </div>
      <div class="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl p-6 flex flex-col justify-center">
        <p class="text-sm font-semibold text-sky-100 mb-1">Net Cash Flow</p>
        <p id="cf-net" class="text-3xl font-bold text-white">-</p>
        <p class="text-xs text-sky-200 mt-2">Inflows minus Outflows</p>
      </div>
    </div>

    <!-- Chart placeholder -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="text-lg font-bold text-slate-800">Cash Flow Timeline</h2>
      </div>
      <div id="cf-chart-area" class="p-8 text-center text-slate-400">
        <i data-lucide="line-chart" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
        <p class="text-sm">Select a date range and click Generate to view the cash flow chart.</p>
      </div>
    </div>
  </main>
</div>`;
}
