/**
 * PurchaseReturns.js — Controller for /api/inventory/purchase-returns/
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

window.initializePurchaseReturns = async function () {
  await Promise.all([
    window.loadPurchaseReturns(),
    window.loadPRDashboard(),
  ]);
};

window.loadPRDashboard = async function () {
  try {
    const data = await api("/inventory/purchase-returns/dashboard/");
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl("pr-total-count",  data.total_returns ?? data.count ?? "—");
    setEl("pr-total-amount", fmtMoney(data.total_amount ?? 0));
    setEl("pr-pending-count",data.pending_count ?? "—");
  } catch (_) {}
};

window.loadPurchaseReturns = async function () {
  try {
    const data = await api("/inventory/purchase-returns/");
    _all = Array.isArray(data) ? data : (data?.results ?? []);
    renderTable(_all);
    const el = document.getElementById("pr-count");
    if (el) el.textContent = `${_all.length} return${_all.length !== 1 ? "s" : ""}`;
  } catch (e) {
    const tbody = document.getElementById("pr-table-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load returns</td></tr>`;
  }
};

function renderTable(list) {
  const tbody = document.getElementById("pr-table-body");
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-slate-400 text-sm">No purchase returns found</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(r => `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-3 font-medium text-orange-700">${esc(r.return_number ?? `#${r.id}`)}</td>
      <td class="px-6 py-3 text-indigo-600">${esc(r.purchase_order_number ?? r.purchase_order ?? "—")}</td>
      <td class="px-6 py-3 text-slate-700">${esc(r.supplier_name ?? r.supplier ?? "—")}</td>
      <td class="px-6 py-3 text-slate-500">${fmtDate(r.created_at)}</td>
      <td class="px-6 py-3 font-semibold text-slate-800">${fmtMoney(r.total_amount ?? 0)}</td>
      <td class="px-6 py-3 text-right">
        <button onclick="window.viewPRDetail(${r.id})" class="h-7 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 transition text-slate-700">View</button>
      </td>
    </tr>
  `).join("");
  createIcons({ icons });
}

window.filterPurchaseReturns = function () {
  const q = document.getElementById("pr-search")?.value.toLowerCase() ?? "";
  renderTable(q ? _all.filter(r =>
    (r.return_number ?? "").toLowerCase().includes(q) ||
    (r.purchase_order_number ?? "").toLowerCase().includes(q) ||
    (r.supplier_name ?? "").toLowerCase().includes(q)
  ) : _all);
};

window.viewPRDetail = async function (id) {
  try {
    const r = await api(`/inventory/purchase-returns/${id}/`);
    const modal = document.getElementById("pr-detail-modal");
    const title = document.getElementById("pr-detail-title");
    const body  = document.getElementById("pr-detail-body");
    if (!modal || !body) return;

    title.textContent = `Return — ${r.return_number ?? `#${r.id}`}`;
    body.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div><p class="text-slate-400 text-xs">Purchase Order</p><p class="font-medium">${esc(r.purchase_order_number ?? "—")}</p></div>
          <div><p class="text-slate-400 text-xs">Supplier</p><p class="font-medium">${esc(r.supplier_name ?? "—")}</p></div>
          <div><p class="text-slate-400 text-xs">Date</p><p class="font-medium">${fmtDate(r.created_at)}</p></div>
          <div><p class="text-slate-400 text-xs">Total</p><p class="font-bold text-orange-700">${fmtMoney(r.total_amount ?? 0)}</p></div>
        </div>
        ${r.reason ? `<div><p class="text-slate-400 text-xs mb-1">Reason</p><p class="text-sm text-slate-700">${esc(r.reason)}</p></div>` : ""}
        <table class="w-full text-sm border border-slate-100 rounded-xl overflow-hidden">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Product</th>
              <th class="px-4 py-2 text-right text-xs font-semibold text-slate-500">Qty</th>
              <th class="px-4 py-2 text-right text-xs font-semibold text-slate-500">Unit Cost</th>
              <th class="px-4 py-2 text-right text-xs font-semibold text-slate-500">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${(r.items ?? []).map(item => `
              <tr>
                <td class="px-4 py-2">${esc(item.product_name ?? item.product ?? "")}</td>
                <td class="px-4 py-2 text-right">${item.returned_quantity ?? item.quantity ?? 0}</td>
                <td class="px-4 py-2 text-right">${fmtMoney(item.unit_cost ?? 0)}</td>
                <td class="px-4 py-2 text-right font-medium">${fmtMoney(item.subtotal ?? 0)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    modal.classList.remove("hidden");
    createIcons({ icons });
  } catch (e) {
    showToast("Failed to load return detail", "error");
  }
};

window.closePRDetailModal = function () {
  document.getElementById("pr-detail-modal").classList.add("hidden");
};

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
