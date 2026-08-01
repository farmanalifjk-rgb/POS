/**
 * InventoryValuation.js — Controller for /api/inventory/valuation/ + /api/inventory/valuation/products/
 */
import { createIcons, icons } from "lucide";
import Auth from "../../core/controllers/Auth.js";

const BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
let _all = [];

async function api(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { ...Auth.authHeader() } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

window.initializeValuation = async function () {
  await window.loadValuation();
};

window.loadValuation = async function () {
  try {
    const [summary, products] = await Promise.all([
      api("/inventory/valuation/"),
      api("/inventory/valuation/products/"),
    ]);

    // Summary cards
    setEl("val-total",    fmtMoney(summary.total_value ?? summary.total_stock_value ?? 0));
    setEl("val-products", summary.total_products ?? summary.product_count ?? "—");
    setEl("val-units",    summary.total_units ?? summary.total_quantity ?? "—");
    setEl("val-avg-cost", fmtMoney(summary.average_unit_cost ?? summary.avg_cost ?? 0));

    // Table
    const list = Array.isArray(products) ? products : (products?.results ?? products?.products ?? []);
    _all = list;
    renderTable(list);
  } catch (e) {
    console.error("Valuation load error:", e);
    const tbody = document.getElementById("val-table-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load valuation data</td></tr>`;
  }
  createIcons({ icons });
};

function renderTable(list) {
  const tbody = document.getElementById("val-table-body");
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-slate-400 text-sm">No products found</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(p => `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-3 font-medium text-slate-900">${esc(p.name ?? p.product_name ?? "")}</td>
      <td class="px-6 py-3 text-slate-500">${esc(p.category ?? p.category_name ?? "—")}</td>
      <td class="px-6 py-3 text-right text-slate-700">${p.stock ?? p.quantity ?? 0}</td>
      <td class="px-6 py-3 text-right text-slate-700">${fmtMoney(p.unit_cost ?? p.cost_price ?? 0)}</td>
      <td class="px-6 py-3 text-right font-semibold text-violet-700">${fmtMoney(p.total_value ?? p.stock_value ?? 0)}</td>
    </tr>
  `).join("");
}

window.filterValuation = function () {
  const q = document.getElementById("val-search")?.value.toLowerCase() ?? "";
  renderTable(q ? _all.filter(p =>
    (p.name ?? p.product_name ?? "").toLowerCase().includes(q) ||
    (p.category ?? p.category_name ?? "").toLowerCase().includes(q)
  ) : _all);
};

function setEl(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmtMoney(n) { return `Rs. ${Number(n).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`; }