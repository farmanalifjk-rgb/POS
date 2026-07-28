/**
 * InventoryReports.js — Controller for /api/inventory/reports/ + exports
 */
import { createIcons, icons } from "lucide";
import Auth from "../../core/controllers/Auth.js";

const BASE = "http://127.0.0.1:8000/api";
let _all = [];

async function api(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { ...Auth.authHeader() } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

window.initializeInventoryReports = async function () {
  await window.loadInventoryReports();
};

window.loadInventoryReports = async function () {
  try {
    const data = await api("/inventory/reports/");
    const list = Array.isArray(data) ? data : (data?.results ?? data?.products ?? []);
    _all = list;

    // Summary
    const totalValue = list.reduce((s, p) => s + (parseFloat(p.stock_value ?? p.total_value ?? 0)), 0);
    const totalQty   = list.reduce((s, p) => s + (parseInt(p.stock ?? p.quantity ?? 0)), 0);
    const lowStock   = list.filter(p => (p.stock ?? p.quantity ?? 0) <= (p.minimum_stock ?? p.reorder_point ?? 5)).length;
    const outOfStock = list.filter(p => (p.stock ?? p.quantity ?? 0) === 0).length;

    renderSummary(list.length, totalValue, totalQty, lowStock, outOfStock);
    renderTable(list);
  } catch (e) {
    const tbody = document.getElementById("inv-report-table-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load inventory report</td></tr>`;
  }
  createIcons({ icons });
};

function renderSummary(products, totalValue, totalQty, lowStock, outOfStock) {
  const el = document.getElementById("inv-report-summary");
  if (!el) return;
  el.innerHTML = `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p class="text-xs text-slate-500 mb-1">Total Products</p>
      <p class="text-2xl font-bold text-slate-900">${products}</p>
    </div>
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p class="text-xs text-slate-500 mb-1">Total Stock Value</p>
      <p class="text-2xl font-bold text-violet-700">${fmtMoney(totalValue)}</p>
    </div>
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p class="text-xs text-slate-500 mb-1">Low Stock Items</p>
      <p class="text-2xl font-bold text-amber-600">${lowStock}</p>
    </div>
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p class="text-xs text-slate-500 mb-1">Out of Stock</p>
      <p class="text-2xl font-bold text-red-600">${outOfStock}</p>
    </div>
  `;
}

function renderTable(list) {
  const tbody = document.getElementById("inv-report-table-body");
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="px-6 py-10 text-center text-slate-400 text-sm">No data available</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(p => {
    const qty = p.stock ?? p.quantity ?? 0;
    const minStock = p.minimum_stock ?? p.reorder_point ?? 5;
    let statusCls = "bg-emerald-50 text-emerald-700";
    let statusLabel = "In Stock";
    if (qty === 0) { statusCls = "bg-red-50 text-red-700"; statusLabel = "Out of Stock"; }
    else if (qty <= minStock) { statusCls = "bg-amber-50 text-amber-700"; statusLabel = "Low Stock"; }
    return `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-5 py-3 font-medium text-slate-900">${esc(p.name ?? p.product_name ?? "")}</td>
      <td class="px-5 py-3 text-slate-500 text-xs font-mono">${esc(p.sku ?? "—")}</td>
      <td class="px-5 py-3 text-slate-600">${esc(p.category ?? p.category_name ?? "—")}</td>
      <td class="px-5 py-3 text-right font-semibold ${qty === 0 ? "text-red-600" : qty <= minStock ? "text-amber-600" : "text-slate-800"}">${qty}</td>
      <td class="px-5 py-3 text-right text-slate-600">${p.total_sold ?? p.quantity_sold ?? "—"}</td>
      <td class="px-5 py-3 text-right text-slate-600">${p.total_returned ?? "—"}</td>
      <td class="px-5 py-3 text-right font-semibold text-violet-700">${fmtMoney(p.stock_value ?? p.total_value ?? 0)}</td>
      <td class="px-5 py-3"><span class="${statusCls} text-xs px-2.5 py-1 rounded-full font-medium">${statusLabel}</span></td>
    </tr>
    `;
  }).join("");
}

window.filterInventoryReport = function () {
  const q = document.getElementById("inv-report-search")?.value.toLowerCase() ?? "";
  renderTable(q ? _all.filter(p =>
    (p.name ?? p.product_name ?? "").toLowerCase().includes(q) ||
    (p.sku ?? "").toLowerCase().includes(q) ||
    (p.category ?? p.category_name ?? "").toLowerCase().includes(q)
  ) : _all);
};

window.exportInventoryCSV   = () => window.open(`${BASE}/inventory-product/export/csv/`, "_blank");
window.exportInventoryExcel = () => window.open(`${BASE}/inventory-product/export/excel/`, "_blank");
window.exportInventoryPDF   = () => window.open(`${BASE}/inventory-product/export/pdf/`, "_blank");

function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmtMoney(n) { return `Rs. ${Number(n).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`; }
