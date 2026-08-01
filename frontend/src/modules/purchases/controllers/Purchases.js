/**
 * Purchases.js — Purchase Orders controller
 * Endpoints: /api/inventory/purchase-orders/, /api/inventory/suppliers/,
 *            /api/products-manage/, /api/inventory/purchase-orders/<no>/receive/
 *            /api/inventory/purchase-orders/<no>/cancel/
 */
import { createIcons, icons } from "lucide";
import Auth from "../../core/controllers/Auth.js";

const BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
let _all = [];
let _suppliers = [];
let _products  = [];
let _poItems   = [];  // line items in the create modal

async function api(path, method = "GET", body = null) {
  const opts = { method, headers: { ...Auth.authHeader() } };
  if (body) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
  const res = await fetch(`${BASE}${path}`, opts);
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

window.initializePurchases = async function () {
  [_suppliers, _products] = await Promise.all([
    api("/inventory/suppliers/").catch(() => []),
    api("/products-manage/").catch(() => []),
  ]);
  if (!Array.isArray(_suppliers)) _suppliers = _suppliers?.results ?? [];
  if (!Array.isArray(_products))  _products  = _products?.results ?? [];
  await window.loadPurchases();
};

window.loadPurchases = async function () {
  try {
    const status = document.getElementById("purchase-status-filter")?.value ?? "";
    const path = status ? `/inventory/purchase-orders/?status=${status}` : "/inventory/purchase-orders/";
    const data = await api(path);
    _all = Array.isArray(data) ? data : (data?.results ?? []);
    renderTable(_all);
    const el = document.getElementById("purchase-count");
    if (el) el.textContent = `${_all.length} order${_all.length !== 1 ? "s" : ""}`;
  } catch (e) {
    const tbody = document.getElementById("purchase-table-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load purchase orders</td></tr>`;
  }
};

function renderTable(list) {
  const tbody = document.getElementById("purchase-table-body");
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 text-sm">No purchase orders found</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(po => {
    const badge = statusBadge(po.status);
    return `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-3 font-medium text-indigo-700">${esc(po.order_number ?? `#${po.id}`)}</td>
      <td class="px-6 py-3 text-slate-700">${esc(po.supplier_name ?? po.supplier ?? "—")}</td>
      <td class="px-6 py-3 text-slate-500">${fmtDate(po.created_at ?? po.date)}</td>
      <td class="px-6 py-3 text-slate-600">${po.items?.length ?? po.item_count ?? "—"}</td>
      <td class="px-6 py-3 font-semibold text-slate-800">${fmtMoney(po.total_amount ?? po.subtotal ?? 0)}</td>
      <td class="px-6 py-3"><span class="${badge.cls} text-xs px-2.5 py-1 rounded-full font-medium">${badge.label}</span></td>
      <td class="px-6 py-3 text-right flex items-center justify-end gap-2">
        <button onclick="window.viewPurchaseDetail('${po.order_number}')" class="h-7 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 transition text-slate-700">View</button>
        ${po.status === "pending" || po.status === "partially_received" ? `<button onclick="window.receivePurchase('${po.order_number}')" class="h-7 px-3 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition">Receive</button>` : ""}
        ${po.status === "pending" ? `<button onclick="window.cancelPurchaseOrder('${po.order_number}')" class="h-7 px-3 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition">Cancel</button>` : ""}
      </td>
    </tr>
    `;
  }).join("");
  createIcons({ icons });
}

window.filterPurchases = function () {
  const q = document.getElementById("purchase-search")?.value.toLowerCase() ?? "";
  renderTable(q ? _all.filter(po =>
    (po.order_number ?? "").toLowerCase().includes(q) ||
    (po.supplier_name ?? "").toLowerCase().includes(q)
  ) : _all);
};

// ── Create Modal ─────────────────────────────────────────────────────────────

window.openCreatePurchase = function () {
  _poItems = [];
  const select = document.getElementById("po-supplier");
  if (select) {
    select.innerHTML = `<option value="">Select supplier…</option>` +
      _suppliers.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join("");
  }
  setVal("po-invoice-number", "");
  setVal("po-note", "");
  document.getElementById("po-items").innerHTML = "";
  document.getElementById("po-total").textContent = "Rs. 0.00";
  document.getElementById("purchase-modal").classList.remove("hidden");
  addPOItem();
  createIcons({ icons });
};

window.closePurchaseModal = function () {
  document.getElementById("purchase-modal").classList.add("hidden");
};

window.addPOItem = function () {
  const idx = _poItems.length;
  _poItems.push({ product: "", qty: 1, cost: 0 });
  const container = document.getElementById("po-items");
  const row = document.createElement("div");
  row.id = `po-item-row-${idx}`;
  row.className = "grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center";
  row.innerHTML = `
    <select id="po-item-product-${idx}" onchange="window.updatePOItem(${idx},'product',this.value)"
      class="h-9 px-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400">
      <option value="">Select product…</option>
      ${_products.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}
    </select>
    <input type="number" min="1" value="1" id="po-item-qty-${idx}"
      onchange="window.updatePOItem(${idx},'qty',this.value)"
      class="h-9 px-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400 text-center" />
    <input type="number" min="0" step="0.01" placeholder="Cost" id="po-item-cost-${idx}"
      onchange="window.updatePOItem(${idx},'cost',this.value)"
      class="h-9 px-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
    <button onclick="window.removePOItem(${idx})" class="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
      <i data-lucide="trash-2" class="w-4 h-4"></i>
    </button>
  `;
  container.appendChild(row);
  createIcons({ icons });
};

window.updatePOItem = function (idx, field, val) {
  if (!_poItems[idx]) return;
  _poItems[idx][field] = field === "product" ? val : Number(val) || 0;
  recalcTotal();
};

window.removePOItem = function (idx) {
  document.getElementById(`po-item-row-${idx}`)?.remove();
  _poItems[idx] = null;
  recalcTotal();
};

function recalcTotal() {
  const total = _poItems.filter(Boolean).reduce((s, i) => s + (i.qty * i.cost), 0);
  const el = document.getElementById("po-total");
  if (el) el.textContent = fmtMoney(total);
}

window.submitPurchaseOrder = async function () {
  const supplier = getVal("po-supplier");
  if (!supplier) { showToast("Select a supplier", "error"); return; }
  const items = _poItems.filter(Boolean).filter(i => i.product && i.qty > 0 && i.cost > 0);
  if (!items.length) { showToast("Add at least one item", "error"); return; }
  const body = {
    supplier: Number(supplier),
    note: getVal("po-note"),
    supplier_invoice_number: getVal("po-invoice-number"),
    items: items.map(i => ({ product: Number(i.product), quantity: i.qty, unit_cost: i.cost })),
  };
  try {
    await api("/inventory/purchase-order/0/", "POST", body);
    window.closePurchaseModal();
    await window.loadPurchases();
    showToast("Purchase order created", "success");
  } catch (e) {
    showToast("Failed to create order", "error");
  }
};

// ── Detail / Receive / Cancel ─────────────────────────────────────────────────

window.viewPurchaseDetail = async function (orderNo) {
  try {
    const po = await api(`/inventory/purchase-orders/${orderNo}/`);
    const modal = document.getElementById("purchase-detail-modal");
    const title = document.getElementById("pd-title");
    const body  = document.getElementById("pd-body");
    const footer= document.getElementById("pd-footer");
    if (!modal || !body) return;

    title.textContent = `Purchase Order — ${po.order_number}`;
    const badge = statusBadge(po.status);
    body.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><p class="text-slate-400 text-xs">Supplier</p><p class="font-medium text-slate-800">${esc(po.supplier_name ?? po.supplier ?? "—")}</p></div>
          <div><p class="text-slate-400 text-xs">Status</p><span class="${badge.cls} text-xs px-2 py-0.5 rounded-full font-medium">${badge.label}</span></div>
          <div><p class="text-slate-400 text-xs">Order Date</p><p class="font-medium text-slate-800">${fmtDate(po.created_at)}</p></div>
          <div><p class="text-slate-400 text-xs">Invoice #</p><p class="font-medium text-slate-800">${esc(po.supplier_invoice_number ?? "—")}</p></div>
        </div>
        <table class="w-full text-sm border border-slate-100 rounded-xl overflow-hidden">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Product</th>
              <th class="px-4 py-2 text-right text-xs font-semibold text-slate-500">Qty</th>
              <th class="px-4 py-2 text-right text-xs font-semibold text-slate-500">Unit Cost</th>
              <th class="px-4 py-2 text-right text-xs font-semibold text-slate-500">Received</th>
              <th class="px-4 py-2 text-right text-xs font-semibold text-slate-500">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${(po.items ?? []).map(item => `
              <tr>
                <td class="px-4 py-2">${esc(item.product_name ?? item.product ?? "")}</td>
                <td class="px-4 py-2 text-right">${item.quantity}</td>
                <td class="px-4 py-2 text-right">${fmtMoney(item.unit_cost)}</td>
                <td class="px-4 py-2 text-right">${item.received_quantity ?? 0}</td>
                <td class="px-4 py-2 text-right font-medium">${fmtMoney(item.subtotal)}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot class="bg-slate-50 border-t border-slate-100">
            <tr>
              <td colspan="4" class="px-4 py-2 text-right font-semibold text-slate-700">Total</td>
              <td class="px-4 py-2 text-right font-bold text-slate-900">${fmtMoney(po.total_amount ?? 0)}</td>
            </tr>
          </tfoot>
        </table>
        ${po.note ? `<p class="text-xs text-slate-500 mt-2">Note: ${esc(po.note)}</p>` : ""}
      </div>
    `;
    footer.innerHTML = `
      <button onclick="window.closePurchaseDetailModal()" class="h-10 px-5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Close</button>
      ${po.status === "pending" || po.status === "partially_received" ? `<button onclick="window.receivePurchase('${po.order_number}')" class="h-10 px-5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition">Mark Received</button>` : ""}
    `;
    modal.classList.remove("hidden");
    createIcons({ icons });
  } catch (e) {
    showToast("Failed to load order detail", "error");
  }
};

window.closePurchaseDetailModal = function () {
  document.getElementById("purchase-detail-modal").classList.add("hidden");
};

window.receivePurchase = async function (orderNo) {
  if (!confirm(`Mark order ${orderNo} as received?`)) return;
  try {
    const po = await api(`/inventory/purchase-orders/${orderNo}/`);
    const receiveItems = (po.items ?? []).map(item => ({
      item_id: item.id,
      received_quantity: item.quantity - (item.received_quantity ?? 0),
    }));
    await api(`/inventory/purchase-orders/${orderNo}/receive/`, "POST", { items: receiveItems });
    window.closePurchaseDetailModal();
    await window.loadPurchases();
    showToast("Order marked as received — stock updated", "success");
  } catch (e) {
    showToast("Failed to receive order", "error");
  }
};

window.cancelPurchaseOrder = async function (orderNo) {
  if (!confirm(`Cancel purchase order ${orderNo}?`)) return;
  try {
    await api(`/inventory/purchase-orders/${orderNo}/cancel/`, "POST");
    await window.loadPurchases();
    showToast("Order cancelled", "success");
  } catch (e) {
    showToast("Failed to cancel order", "error");
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ""; }
function getVal(id) { return document.getElementById(id)?.value ?? ""; }
function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmtMoney(n) { return `Rs. ${Number(n).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`; }
function fmtDate(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" }); }
function statusBadge(s) {
  const map = {
    pending:            { cls:"bg-amber-50 text-amber-700",    label:"Pending" },
    partially_received: { cls:"bg-blue-50 text-blue-700",      label:"Partial" },
    received:           { cls:"bg-emerald-50 text-emerald-700",label:"Received" },
    cancelled:          { cls:"bg-slate-100 text-slate-500",   label:"Cancelled" },
  };
  return map[s] ?? { cls:"bg-slate-100 text-slate-600", label: s };
}
function showToast(msg, type = "success") {
  const t = document.createElement("div");
  t.className = `fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-xl text-white font-medium z-50 transition-opacity duration-300 ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3000);
}