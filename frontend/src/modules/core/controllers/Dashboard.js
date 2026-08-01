/**
 * Dashboard.js — Real data dashboard controller
 * Calls: /api/inventory/dashboard/, /api/order-history/, /api/inventory/low-stock/,
 *        /api/cash-sessions/, /api/inventory/analytics/top-selling/
 */
import { createIcons, icons } from "lucide";
import Auth from "./Auth.js";

const BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { ...Auth.authHeader() } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

window.loadDashboard = async function () {
  try {
    const [dash, orders, lowStock, topSelling] = await Promise.allSettled([
      apiFetch("/inventory/dashboard/"),
      apiFetch("/order-history/?page_size=6"),
      apiFetch("/inventory/low-stock/"),
      apiFetch("/inventory/analytics/top-selling/"),
    ]);

    renderKPI(dash.status === "fulfilled" ? dash.value : null);
    renderRecentOrders(orders.status === "fulfilled" ? orders.value : null);
    renderLowStock(lowStock.status === "fulfilled" ? lowStock.value : null);
    renderTopProducts(topSelling.status === "fulfilled" ? topSelling.value : null);

    createIcons({ icons });
  } catch (e) {
    console.error("Dashboard load error:", e);
  }
};

function renderKPI(data) {
  const el = document.getElementById("dash-kpi");
  if (!el) return;

  const kpis = [
    {
      label: "Total Sales",
      value: data ? fmt(data.total_revenue ?? data.total_sales ?? 0) : "—",
      icon: "dollar-sign",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      sub: data ? `${data.total_orders ?? 0} orders` : "",
    },
    {
      label: "Today's Orders",
      value: data ? (data.today_orders ?? data.total_orders ?? 0) : "—",
      icon: "shopping-bag",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      sub: data ? `${data.today_revenue != null ? fmt(data.today_revenue) : ""} revenue` : "",
    },
    {
      label: "Products",
      value: data ? (data.total_products ?? "—") : "—",
      icon: "package",
      color: "text-violet-500",
      bg: "bg-violet-50",
      sub: data ? `${data.low_stock_count ?? 0} low stock` : "",
    },
    {
      label: "Avg Order Value",
      value: data ? fmt(data.average_order_value ?? data.avg_order_value ?? 0) : "—",
      icon: "bar-chart-3",
      color: "text-amber-500",
      bg: "bg-amber-50",
      sub: "per transaction",
    },
  ];

  el.innerHTML = kpis.map(k => `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-medium text-slate-500">${k.label}</p>
        <div class="w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center">
          <i data-lucide="${k.icon}" class="w-4 h-4 ${k.color}"></i>
        </div>
      </div>
      <p class="text-2xl font-bold text-slate-900">${k.value}</p>
      <p class="text-xs text-slate-400 mt-1">${k.sub}</p>
    </div>
  `).join("");
}

function renderRecentOrders(data) {
  const el = document.getElementById("dash-recent-orders");
  if (!el) return;

  const orders = Array.isArray(data) ? data : (data?.results ?? data?.orders ?? []);
  if (!orders.length) {
    el.innerHTML = `<div class="px-5 py-8 text-center text-sm text-slate-400">No orders yet</div>`;
    return;
  }

  el.innerHTML = orders.slice(0, 6).map(o => {
    const status = o.status ?? "completed";
    const badge = statusBadge(status);
    return `
      <div class="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <i data-lucide="receipt" class="w-4 h-4 text-indigo-500"></i>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-800">${o.order_number ?? `#${o.id}`}</p>
            <p class="text-xs text-slate-400">${o.customer_name ?? o.customer ?? "Walk-in"}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-semibold text-slate-800">${fmt(o.total ?? o.total_amount ?? 0)}</p>
          <span class="${badge.cls} text-xs px-2 py-0.5 rounded-full font-medium">${badge.label}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderLowStock(data) {
  const el = document.getElementById("dash-low-stock");
  if (!el) return;

  const items = Array.isArray(data) ? data : (data?.results ?? data?.products ?? []);
  if (!items.length) {
    el.innerHTML = `<p class="text-emerald-600 font-medium text-xs">✓ All products well stocked</p>`;
    return;
  }

  el.innerHTML = items.slice(0, 5).map(p => `
    <div class="flex items-center justify-between py-1">
      <span class="text-slate-700 truncate max-w-[140px]">${p.name ?? p.product_name ?? "Product"}</span>
      <span class="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
        (p.stock ?? p.quantity ?? 0) === 0
          ? "bg-red-50 text-red-600"
          : "bg-amber-50 text-amber-600"
      }">${p.stock ?? p.quantity ?? 0} left</span>
    </div>
  `).join("");
}

function renderTopProducts(data) {
  const el = document.getElementById("dash-top-products");
  if (!el) return;

  const items = Array.isArray(data) ? data : (data?.results ?? data?.products ?? []);
  if (!items.length) {
    el.innerHTML = `<p class="text-sm text-slate-400 col-span-4 text-center py-4">No sales data yet</p>`;
    return;
  }

  el.innerHTML = items.slice(0, 8).map((p, i) => `
    <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
      <span class="w-6 h-6 rounded-full ${i < 3 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"} flex items-center justify-center text-xs font-bold shrink-0">
        ${i + 1}
      </span>
      <div class="min-w-0">
        <p class="text-sm font-medium text-slate-800 truncate">${p.name ?? p.product_name ?? "Product"}</p>
        <p class="text-xs text-slate-400">${p.total_sold ?? p.quantity_sold ?? 0} sold</p>
      </div>
    </div>
  `).join("");
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount) {
  return `Rs. ${Number(amount).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function statusBadge(status) {
  const map = {
    completed:  { cls: "bg-emerald-50 text-emerald-700", label: "Completed" },
    draft:      { cls: "bg-slate-100 text-slate-600",    label: "Draft" },
    refunded:   { cls: "bg-red-50 text-red-600",         label: "Refunded" },
    partial_refund: { cls: "bg-amber-50 text-amber-700", label: "Partial" },
    cancelled:  { cls: "bg-slate-100 text-slate-500",    label: "Cancelled" },
  };
  return map[status] ?? { cls: "bg-slate-100 text-slate-600", label: status };
}