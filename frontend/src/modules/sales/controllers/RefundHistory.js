/**
 * RefundHistory.js — Controller for /api/refund-history/
 */
import { createIcons, icons } from "lucide";
import Auth from "../../core/controllers/Auth.js";

const BASE = "http://127.0.0.1:8000/api";
let _all = [];
let _page = 1;
let _total = 0;

async function api(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { ...Auth.authHeader() } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

window.initializeRefundHistory = async function () {
  await window.loadRefundHistory();
};

window.loadRefundHistory = async function (page = 1) {
  _page = page;
  try {
    const from = document.getElementById("refund-date-from")?.value ?? "";
    const to   = document.getElementById("refund-date-to")?.value ?? "";
    const params = new URLSearchParams({ page });
    if (from) params.append("start_date", from);
    if (to)   params.append("end_date", to);
    const data = await api(`/refund-history/?${params}`);
    const list = Array.isArray(data) ? data : (data?.results ?? []);
    _total = data?.count ?? list.length;
    _all = list;
    renderTable(list);
    renderPagination(data);
    const el = document.getElementById("refund-count");
    if (el) el.textContent = `${_total} refund${_total !== 1 ? "s" : ""}`;
  } catch (e) {
    const tbody = document.getElementById("refund-table-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load refund history</td></tr>`;
  }
};

function renderTable(list) {
  const tbody = document.getElementById("refund-table-body");
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 text-sm">No refunds found</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(r => {
    const isPartial = r.is_partial_refund || r.refund_type === "partial";
    return `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-3 font-medium text-rose-700">#${r.id}</td>
      <td class="px-6 py-3 text-indigo-600">${esc(r.order_number ?? `#${r.order}`)}</td>
      <td class="px-6 py-3 text-slate-700">${esc(r.customer_name ?? "Walk-in")}</td>
      <td class="px-6 py-3 text-slate-500">${fmtDate(r.created_at)}</td>
      <td class="px-6 py-3 font-semibold text-rose-600">${fmtMoney(r.total_refund_amount ?? r.total_amount ?? 0)}</td>
      <td class="px-6 py-3">
        <span class="${isPartial ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"} text-xs px-2.5 py-1 rounded-full font-medium">
          ${isPartial ? "Partial" : "Full"}
        </span>
      </td>
      <td class="px-6 py-3 text-right">
        <button onclick="window.viewRefundDetail(${r.id})" class="h-7 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 transition text-slate-700">View</button>
      </td>
    </tr>
    `;
  }).join("");
  createIcons({ icons });
}

function renderPagination(data) {
  const el = document.getElementById("refund-pagination");
  if (!el || !data?.count) { if (el) el.innerHTML = ""; return; }
  const pageSize = 20;
  const pages = Math.ceil(data.count / pageSize);
  if (pages <= 1) { el.innerHTML = ""; return; }
  el.innerHTML = `
    <span>Showing page ${_page} of ${pages}</span>
    <div class="flex gap-2">
      <button onclick="window.loadRefundHistory(${_page - 1})" ${_page <= 1 ? "disabled" : ""}
        class="h-8 px-3 border border-gray-200 rounded-lg text-sm ${_page <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"} transition">Prev</button>
      <button onclick="window.loadRefundHistory(${_page + 1})" ${_page >= pages ? "disabled" : ""}
        class="h-8 px-3 border border-gray-200 rounded-lg text-sm ${_page >= pages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"} transition">Next</button>
    </div>
  `;
}

window.filterRefunds = function () {
  const q = document.getElementById("refund-search")?.value.toLowerCase() ?? "";
  renderTable(q ? _all.filter(r =>
    (r.order_number ?? "").toLowerCase().includes(q) ||
    (r.customer_name ?? "").toLowerCase().includes(q)
  ) : _all);
};

window.viewRefundDetail = async function (id) {
  try {
    const r = await api(`/refund-history/detail/${id}/`);
    const modal = document.getElementById("refund-detail-modal");
    const title = document.getElementById("refund-detail-title");
    const body  = document.getElementById("refund-detail-body");
    if (!modal || !body) return;

    title.textContent = `Refund #${r.id}`;
    body.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div><p class="text-slate-400 text-xs">Order</p><p class="font-medium text-indigo-700">${esc(r.order_number ?? `#${r.order}`)}</p></div>
          <div><p class="text-slate-400 text-xs">Date</p><p class="font-medium">${fmtDate(r.created_at)}</p></div>
          <div><p class="text-slate-400 text-xs">Customer</p><p class="font-medium">${esc(r.customer_name ?? "Walk-in")}</p></div>
          <div><p class="text-slate-400 text-xs">Total Refunded</p><p class="font-bold text-rose-600">${fmtMoney(r.total_refund_amount ?? r.total_amount ?? 0)}</p></div>
        </div>
        ${r.reason ? `<div><p class="text-slate-400 text-xs mb-1">Reason</p><p class="text-sm">${esc(r.reason)}</p></div>` : ""}
        ${(r.items ?? []).length ? `
          <table class="w-full text-sm border border-slate-100 rounded-xl overflow-hidden">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Product</th>
                <th class="px-4 py-2 text-right text-xs font-semibold text-slate-500">Qty</th>
                <th class="px-4 py-2 text-right text-xs font-semibold text-slate-500">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              ${r.items.map(item => `
                <tr>
                  <td class="px-4 py-2">${esc(item.product_name ?? item.product ?? "")}</td>
                  <td class="px-4 py-2 text-right">${item.quantity ?? 1}</td>
                  <td class="px-4 py-2 text-right font-medium">${fmtMoney(item.refund_amount ?? item.amount ?? 0)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : ""}
      </div>
    `;
    modal.classList.remove("hidden");
    createIcons({ icons });
  } catch (e) {
    showToast("Failed to load refund detail", "error");
  }
};

window.closeRefundDetailModal = function () {
  document.getElementById("refund-detail-modal").classList.add("hidden");
};

window.toggleRefundExportMenu = function (e) {
  e.stopPropagation();
  const menu = document.getElementById("refund-export-menu");
  if (menu) menu.classList.toggle("hidden");
};

window.exportRefunds = function (format) {
  window.open(`${BASE}/refund-history/export/${format}/`, "_blank");
  document.getElementById("refund-export-menu")?.classList.add("hidden");
};

document.addEventListener("click", () => {
  document.getElementById("refund-export-menu")?.classList.add("hidden");
});

function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmtMoney(n) { return `Rs. ${Number(n).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`; }
function fmtDate(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" }); }
function showToast(msg, type = "success") {
  const t = document.createElement("div");
  t.className = `fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-xl text-white font-medium z-50 transition-opacity duration-300 ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3000);
}
