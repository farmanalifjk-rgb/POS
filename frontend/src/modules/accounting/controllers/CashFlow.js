import Auth from "../../core/controllers/Auth.js";
import { createIcons, icons } from "lucide";

const BASE = "http://127.0.0.1:8000/api";
async function api(path) {
  const res = await fetch(`${BASE}${path}`, { headers: Auth.authHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
function fmt(n) { return `Rs. ${Number(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 0 })}`; }

function setDefaultDates() {
  const end = new Date();
  const start = new Date(); start.setDate(1);
  document.getElementById("cf-start").value = start.toISOString().slice(0,10);
  document.getElementById("cf-end").value = end.toISOString().slice(0,10);
}

window.initializeCashFlow = function() {
  setDefaultDates();
  createIcons({ icons });
};

window.loadCashFlow = async function() {
  const start = document.getElementById("cf-start").value;
  const end = document.getElementById("cf-end").value;
  const chartArea = document.getElementById("cf-chart-area");
  chartArea.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm">Loading...</div>`;

  try {
    const data = await api(`/reports/cash-flow/?start=${start}&end=${end}`);

    document.getElementById("cf-inflow").textContent = fmt(data.total_inflows);
    document.getElementById("cf-outflow").textContent = fmt(data.total_outflows);
    document.getElementById("cf-net").textContent = fmt(data.net_cash_flow);

    // Inflows breakdown
    const inflowsEl = document.getElementById("cf-inflows-breakdown");
    const inflows = data.inflows ?? [];
    inflowsEl.innerHTML = inflows.map(i => `
      <div class="flex justify-between text-xs">
        <span class="text-emerald-700">${i.label}</span>
        <span class="font-semibold text-emerald-800">${fmt(i.amount)}</span>
      </div>`).join("");

    // Outflows breakdown
    const outflowsEl = document.getElementById("cf-outflows-breakdown");
    const outflows = data.outflows ?? [];
    outflowsEl.innerHTML = outflows.map(o => `
      <div class="flex justify-between text-xs">
        <span class="text-red-600">${o.label}</span>
        <span class="font-semibold text-red-700">${fmt(o.amount)}</span>
      </div>`).join("");

    // Simple bar chart from timeline data
    const timeline = data.timeline ?? [];
    if (timeline.length) {
      const maxVal = Math.max(...timeline.map(t => Math.max(t.inflows || 0, t.outflows || 0)), 1);
      chartArea.innerHTML = `
        <div class="flex items-end gap-2 h-40 px-4">
          ${timeline.map(t => `
            <div class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full flex gap-0.5 items-end justify-center" style="height:120px">
                <div class="flex-1 bg-emerald-400 rounded-t" style="height:${Math.max(4, (t.inflows/maxVal)*120)}px" title="Inflows: ${fmt(t.inflows)}"></div>
                <div class="flex-1 bg-red-400 rounded-t" style="height:${Math.max(4, (t.outflows/maxVal)*120)}px" title="Outflows: ${fmt(t.outflows)}"></div>
              </div>
              <span class="text-xs text-slate-500 truncate w-full text-center">${t.label ?? t.date}</span>
            </div>
          `).join("")}
        </div>
        <div class="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-emerald-400 inline-block"></span> Inflows</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-red-400 inline-block"></span> Outflows</span>
        </div>
      `;
    } else {
      chartArea.innerHTML = `<p class="text-center text-slate-400 py-8 text-sm">No timeline data available for the selected period.</p>`;
    }
  } catch (e) {
    chartArea.innerHTML = `<p class="text-center text-slate-400 py-8 text-sm">Could not load cash flow data. The endpoint may not be implemented yet.</p>`;
    document.getElementById("cf-inflow").textContent = "-";
    document.getElementById("cf-outflow").textContent = "-";
    document.getElementById("cf-net").textContent = "-";
  }
};
