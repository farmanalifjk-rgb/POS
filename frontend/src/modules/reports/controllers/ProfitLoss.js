import Auth from "../../core/controllers/Auth.js";

const BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");

async function api(path) {
  const res = await fetch(`${BASE}${path}`, { headers: Auth.authHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function fmt(n) { return `Rs. ${Number(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`; }

function setDefaultDates() {
  const end = new Date();
  const start = new Date(); start.setDate(1);
  document.getElementById("pl-start").value = start.toISOString().slice(0,10);
  document.getElementById("pl-end").value = end.toISOString().slice(0,10);
}

window.initializeProfitLoss = function() {
  setDefaultDates();
};

window.loadProfitLoss = async function() {
  const start = document.getElementById("pl-start").value;
  const end = document.getElementById("pl-end").value;
  const breakdown = document.getElementById("pl-breakdown");
  breakdown.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm">Loading report...</div>`;

  try {
    const data = await api(`/reports/profit-loss/?start=${start}&end=${end}`);

    document.getElementById("pl-revenue").textContent = fmt(data.revenue);
    document.getElementById("pl-cogs").textContent = fmt(data.cogs);
    document.getElementById("pl-gross").textContent = fmt(data.gross_profit);
    document.getElementById("pl-expenses").textContent = fmt(data.expenses);
    document.getElementById("pl-net").textContent = fmt(data.net_profit);

    const income = data.income_breakdown ?? [];
    const expenses = data.expense_breakdown ?? [];

    breakdown.innerHTML = `
      <div class="grid grid-cols-2 gap-8">
        <div>
          <h3 class="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">Income</h3>
          ${income.length ? income.map(i => `
            <div class="flex justify-between py-2 border-b border-slate-50">
              <span class="text-sm text-slate-600">${i.label}</span>
              <span class="text-sm font-semibold text-emerald-600">${fmt(i.amount)}</span>
            </div>`).join("") : `<p class="text-sm text-slate-400 py-4">No income data</p>`}
          <div class="flex justify-between py-3 mt-2 bg-emerald-50 rounded-xl px-3">
            <span class="text-sm font-bold text-slate-800">Total Revenue</span>
            <span class="text-sm font-bold text-emerald-700">${fmt(data.revenue)}</span>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">Expenses</h3>
          ${expenses.length ? expenses.map(e => `
            <div class="flex justify-between py-2 border-b border-slate-50">
              <span class="text-sm text-slate-600">${e.label}</span>
              <span class="text-sm font-semibold text-red-600">${fmt(e.amount)}</span>
            </div>`).join("") : `<p class="text-sm text-slate-400 py-4">No expense data</p>`}
          <div class="flex justify-between py-3 mt-2 bg-red-50 rounded-xl px-3">
            <span class="text-sm font-bold text-slate-800">Total Expenses</span>
            <span class="text-sm font-bold text-red-700">${fmt(data.expenses)}</span>
          </div>
        </div>
      </div>
      <div class="mt-6 p-4 rounded-2xl ${data.net_profit >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'} flex justify-between items-center">
        <span class="text-base font-bold text-slate-800">Net Profit</span>
        <span class="text-xl font-extrabold ${data.net_profit >= 0 ? 'text-emerald-700' : 'text-red-700'}">${fmt(data.net_profit)}</span>
      </div>
    `;
  } catch (e) {
    breakdown.innerHTML = `<p class="text-center text-slate-400 py-8 text-sm">Could not load report. The endpoint may not be implemented yet.</p>`;
  }
};