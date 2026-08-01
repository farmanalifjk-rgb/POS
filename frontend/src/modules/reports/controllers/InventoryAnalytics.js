/**
 * InventoryAnalytics.js — Controller for /api/inventory/analytics/*
 */
import { createIcons, icons } from "lucide";
import Auth from "../../core/controllers/Auth.js";

const BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");

async function api(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { ...Auth.authHeader() } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

window.initializeInventoryAnalytics = async function () {
  await window.loadInventoryAnalytics();
};

window.loadInventoryAnalytics = async function () {
  const [analytics, topSelling, slowMoving, mostReturned, lowStock] = await Promise.allSettled([
    api("/inventory/analytics/"),
    api("/inventory/analytics/top-selling/"),
    api("/inventory/analytics/slow-moving/"),
    api("/inventory/analytics/most-returned/"),
    api("/inventory/low-stock/"),
  ]);

  // KPI cards
  if (analytics.status === "fulfilled") {
    const d = analytics.value;
    setEl("an-total-products", d.total_products ?? d.total ?? "—");
    setEl("an-low-stock",      d.low_stock_count ?? "—");
    setEl("an-out-stock",      d.out_of_stock_count ?? "—");
    setEl("an-avg-stock",      d.average_stock ?? "—");
  }

  renderProductList("an-top-selling",   topSelling,   "total_sold",    "sold");
  renderProductList("an-slow-moving",   slowMoving,   "days_no_sale",  "days without sale");
  renderProductList("an-most-returned", mostReturned, "return_count",  "returns");
  renderLowStockList(lowStock);

  createIcons({ icons });
};

function renderProductList(elId, result, metricKey, metricLabel) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (result.status !== "fulfilled") {
    el.innerHTML = `<div class="px-5 py-4 text-sm text-red-500">Failed to load</div>`;
    return;
  }
  const list = Array.isArray(result.value) ? result.value : (result.value?.results ?? []);
  if (!list.length) {
    el.innerHTML = `<div class="px-5 py-6 text-center text-sm text-slate-400">No data available</div>`;
    return;
  }
  el.innerHTML = list.slice(0, 8).map((p, i) => `
    <div class="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition">
      <div class="flex items-center gap-3">
        <span class="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0
          ${i === 0 ? "bg-indigo-600 text-white" : i === 1 ? "bg-indigo-400 text-white" : i === 2 ? "bg-indigo-200 text-indigo-800" : "bg-slate-100 text-slate-500"}">
          ${i + 1}
        </span>
        <div>
          <p class="text-sm font-medium text-slate-800">${esc(p.name ?? p.product_name ?? "")}</p>
          <p class="text-xs text-slate-400">${esc(p.category ?? p.category_name ?? "")}</p>
        </div>
      </div>
      <div class="text-right shrink-0">
        <p class="text-sm font-semibold text-slate-700">${p[metricKey] ?? "—"}</p>
        <p class="text-xs text-slate-400">${metricLabel}</p>
      </div>
    </div>
  `).join("");
}

function renderLowStockList(result) {
  const el = document.getElementById("an-low-stock-list");
  if (!el) return;
  if (result.status !== "fulfilled") {
    el.innerHTML = `<div class="px-5 py-4 text-sm text-red-500">Failed to load</div>`;
    return;
  }
  const list = Array.isArray(result.value) ? result.value : (result.value?.results ?? []);
  if (!list.length) {
    el.innerHTML = `<div class="px-5 py-6 text-center text-sm text-emerald-600 font-medium">✓ All products well stocked</div>`;
    return;
  }
  el.innerHTML = list.slice(0, 8).map(p => `
    <div class="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition">
      <div>
        <p class="text-sm font-medium text-slate-800">${esc(p.name ?? p.product_name ?? "")}</p>
        <p class="text-xs text-slate-400">${esc(p.category ?? "")}</p>
      </div>
      <div class="text-right">
        <span class="${(p.stock ?? p.quantity ?? 0) === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"} text-xs px-2.5 py-1 rounded-full font-semibold">
          ${p.stock ?? p.quantity ?? 0} left
        </span>
        <p class="text-xs text-slate-400 mt-0.5">Min: ${p.minimum_stock ?? p.reorder_point ?? 0}</p>
      </div>
    </div>
  `).join("");
}

function setEl(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }