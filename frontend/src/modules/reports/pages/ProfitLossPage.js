import { Sidebar } from "../../../components/Sidebar.js";

export function ProfitLossPage() {
  return `
<div class="flex h-screen bg-[#f4f7f6]">
  ${Sidebar()}
  <main class="flex-1 overflow-y-auto p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Profit & Loss</h1>
        <p class="text-gray-500 mt-1">Financial performance over time</p>
      </div>
      <div class="flex items-center gap-3">
        <input type="date" id="pl-start" class="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
        <span class="text-slate-400">to</span>
        <input type="date" id="pl-end" class="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
        <button onclick="window.loadProfitLoss()" class="h-10 px-5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition">Generate</button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-5 gap-4 mb-8">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</p>
        <p id="pl-revenue" class="text-2xl font-bold text-slate-800 mt-2">-</p>
        <p class="text-xs text-emerald-600 mt-1">Total sales income</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">COGS</p>
        <p id="pl-cogs" class="text-2xl font-bold text-red-600 mt-2">-</p>
        <p class="text-xs text-slate-500 mt-1">Cost of goods sold</p>
      </div>
      <div class="bg-emerald-50 rounded-2xl p-5 shadow-sm border border-emerald-100">
        <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Gross Profit</p>
        <p id="pl-gross" class="text-2xl font-bold text-emerald-700 mt-2">-</p>
        <p class="text-xs text-emerald-600 mt-1">Revenue - COGS</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expenses</p>
        <p id="pl-expenses" class="text-2xl font-bold text-orange-600 mt-2">-</p>
        <p class="text-xs text-slate-500 mt-1">Operating expenses</p>
      </div>
      <div class="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl p-5 shadow-sm">
        <p class="text-xs font-semibold text-sky-100 uppercase tracking-wider">Net Profit</p>
        <p id="pl-net" class="text-2xl font-bold text-white mt-2">-</p>
        <p class="text-xs text-sky-200 mt-1">Gross Profit - Expenses</p>
      </div>
    </div>

    <!-- Breakdown Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="text-lg font-bold text-slate-800">Detailed Breakdown</h2>
      </div>
      <div id="pl-breakdown" class="p-6">
        <p class="text-center text-slate-400 py-8 text-sm">Select a date range and click Generate to view your P&L report.</p>
      </div>
    </div>
  </main>
</div>`;
}
