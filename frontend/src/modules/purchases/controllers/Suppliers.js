/**
 * Suppliers.js — CRUD controller for /api/inventory/suppliers/
 */
import { createIcons, icons } from "lucide";
import Auth from "../../core/controllers/Auth.js";

const BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
let _all = [];

async function api(path, method = "GET", body = null) {
  const opts = { method, headers: { ...Auth.authHeader() } };
  if (body) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
  const res = await fetch(`${BASE}${path}`, opts);
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

window.initializeSuppliers = async function () {
  await window.loadSuppliers();
};

window.loadSuppliers = async function () {
  try {
    const data = await api("/inventory/suppliers/");
    _all = Array.isArray(data) ? data : (data?.results ?? []);
    renderTable(_all);
    const el = document.getElementById("supplier-count");
    if (el) el.textContent = `${_all.length} supplier${_all.length !== 1 ? "s" : ""}`;
  } catch (e) {
    const tbody = document.getElementById("supplier-table-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load suppliers</td></tr>`;
  }
};

function renderTable(list) {
  const tbody = document.getElementById("supplier-table-body");
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 text-sm">No suppliers found</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(s => `
    <tr class="hover:bg-slate-50 transition group">
      <td class="px-6 py-3 font-medium text-slate-900">${esc(s.name ?? "")}</td>
      <td class="px-6 py-3 text-slate-600">${esc(s.contact_person ?? "—")}</td>
      <td class="px-6 py-3 text-slate-600">${esc(s.phone ?? "—")}</td>
      <td class="px-6 py-3 text-slate-600">${esc(s.email ?? "—")}</td>
      <td class="px-6 py-3 text-slate-600">${esc(s.city ?? "—")}</td>
      <td class="px-6 py-3">
        <span class="text-sm font-semibold ${(s.outstanding_balance ?? 0) > 0 ? 'text-red-600' : 'text-slate-600'}">
          ${fmtMoney(s.outstanding_balance ?? 0)}
        </span>
      </td>
      <td class="px-6 py-3 text-right">
        <button onclick="window.openSupplierStatement(${s.id})" class="text-teal-600 hover:text-teal-800 mr-2 text-xs font-medium opacity-0 group-hover:opacity-100 transition">Statement</button>
        <button onclick="window.openEditSupplier(${s.id})" class="text-indigo-600 hover:text-indigo-800 mr-2 text-xs font-medium">Edit</button>
        <button onclick="window.deleteSupplier(${s.id})" class="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
      </td>
    </tr>
  `).join("");
  createIcons({ icons });
}

window.filterSuppliers = function () {
  const q = document.getElementById("supplier-search")?.value.toLowerCase() ?? "";
  renderTable(q ? _all.filter(s =>
    (s.name ?? "").toLowerCase().includes(q) ||
    (s.contact_person ?? "").toLowerCase().includes(q) ||
    (s.phone ?? "").toLowerCase().includes(q) ||
    (s.city ?? "").toLowerCase().includes(q)
  ) : _all);
};

window.openAddSupplier = function () {
  clearModal();
  document.getElementById("supplier-modal-title").textContent = "Add Supplier";
  document.getElementById("supplier-modal").classList.remove("hidden");
  createIcons({ icons });
};

window.openEditSupplier = function (id) {
  const s = _all.find(x => x.id === id);
  if (!s) return;
  clearModal();
  document.getElementById("supplier-modal-title").textContent = "Edit Supplier";
  document.getElementById("supplier-modal-id").value = id;
  setVal("sm-name", s.name);
  setVal("sm-contact-person", s.contact_person);
  setVal("sm-phone", s.phone);
  setVal("sm-email", s.email);
  setVal("sm-city", s.city);
  setVal("sm-address", s.address);
  setVal("sm-tax-number", s.tax_number);
  setVal("sm-payment-terms", s.payment_terms);
  setVal("sm-notes", s.notes);
  document.getElementById("supplier-modal").classList.remove("hidden");
  createIcons({ icons });
};

window.closeSupplierModal = function () {
  document.getElementById("supplier-modal").classList.add("hidden");
};

window.saveSupplier = async function () {
  const id = document.getElementById("supplier-modal-id").value;
  const body = {
    name: getVal("sm-name"),
    contact_person: getVal("sm-contact-person"),
    phone: getVal("sm-phone"),
    email: getVal("sm-email"),
    city: getVal("sm-city"),
    address: getVal("sm-address"),
    tax_number: getVal("sm-tax-number"),
    payment_terms: Number(getVal("sm-payment-terms")) || null,
    notes: getVal("sm-notes"),
  };
  if (!body.name.trim()) { showToast("Company name is required", "error"); return; }
  try {
    if (id) {
      await api(`/inventory/suppliers/${id}/`, "PUT", body);
    } else {
      await api("/inventory/suppliers/", "POST", body);
    }
    window.closeSupplierModal();
    await window.loadSuppliers();
    showToast(id ? "Supplier updated" : "Supplier added", "success");
  } catch (e) {
    showToast("Failed to save supplier", "error");
  }
};

window.deleteSupplier = async function (id) {
  if (!confirm("Delete this supplier?")) return;
  try {
    await api(`/inventory/suppliers/${id}/`, "DELETE");
    await window.loadSuppliers();
    showToast("Supplier deleted", "success");
  } catch (e) {
    showToast("Failed to delete supplier", "error");
  }
};

function clearModal() {
  ["supplier-modal-id","sm-name","sm-contact-person","sm-phone","sm-email",
   "sm-city","sm-address","sm-tax-number","sm-payment-terms","sm-notes"]
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
}
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ""; }
function getVal(id) { return document.getElementById(id)?.value ?? ""; }
function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function fmtMoney(n) { return `Rs. ${Number(n).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`; }
function showToast(msg, type = "success") {
  const t = document.createElement("div");
  t.className = `fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-xl text-white font-medium z-50 transition-opacity duration-300 ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3000);
}

// ── Supplier Statement ────────────────────────────────────────────────────────
let _statementSupplierId = null;
let _supplierStatementData = null;
let _activeSupTab = "pos";

window.openSupplierStatement = async function(id) {
  _statementSupplierId = id;
  _activeSupTab = "pos";
  const s = _all.find(x => x.id === id);
  if (!s) return;

  document.getElementById("sup-statement-name").textContent = s.name;
  document.getElementById("sup-statement-phone").textContent = s.phone || "";
  document.getElementById("sup-stmt-total").textContent = "...";
  document.getElementById("sup-stmt-paid").textContent = "...";
  document.getElementById("sup-stmt-outstanding").textContent = "...";
  document.getElementById("sup-statement-content").innerHTML = `<div class="text-center py-8 text-slate-400 text-sm">Loading...</div>`;

  const panel = document.getElementById("supplier-statement-panel");
  panel.classList.remove("hidden");
  panel.classList.add("flex");
  createIcons({ icons });

  try {
    const data = await api(`/inventory/suppliers/${id}/statement/`);
    _supplierStatementData = data;
    document.getElementById("sup-stmt-total").textContent = fmtMoney(data.total_purchased ?? 0);
    document.getElementById("sup-stmt-paid").textContent = fmtMoney(data.total_paid ?? 0);
    document.getElementById("sup-stmt-outstanding").textContent = fmtMoney(data.outstanding_balance ?? 0);
    window.switchSupplierTab("pos");
  } catch (e) {
    document.getElementById("sup-statement-content").innerHTML = `<p class="text-center text-slate-400 py-6 text-sm">Could not load statement. The endpoint may not be implemented yet.</p>`;
  }
};

window.closeSupplierStatement = function() {
  const panel = document.getElementById("supplier-statement-panel");
  panel.classList.add("hidden");
  panel.classList.remove("flex");
  _statementSupplierId = null;
};

window.switchSupplierTab = function(tab) {
  _activeSupTab = tab;
  // Update tab styles
  ["pos","payments"].forEach(t => {
    const btn = document.getElementById(`sup-tab-${t}`);
    if (!btn) return;
    if (t === tab) {
      btn.className = "pb-3 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 transition";
    } else {
      btn.className = "pb-3 text-sm font-semibold text-slate-400 hover:text-slate-700 border-b-2 border-transparent transition";
    }
  });

  if (!_supplierStatementData) return;
  const container = document.getElementById("sup-statement-content");

  if (tab === "pos") {
    const orders = _supplierStatementData.purchase_orders ?? [];
    if (!orders.length) {
      container.innerHTML = `<p class="text-center text-slate-400 py-6 text-sm">No purchase orders found.</p>`;
    } else {
      container.innerHTML = orders.map(o => `
        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <p class="text-sm font-semibold text-slate-800">PO #${o.order_number ?? o.id}</p>
            <p class="text-xs text-slate-500">${new Date(o.date ?? o.created_at).toLocaleDateString()}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-800">${fmtMoney(o.total ?? 0)}</p>
            <span class="text-xs px-2 py-0.5 rounded-full ${o.status === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${o.status ?? 'pending'}</span>
          </div>
        </div>
      `).join("");
    }
  } else {
    const payments = _supplierStatementData.payments ?? [];
    if (!payments.length) {
      container.innerHTML = `<p class="text-center text-slate-400 py-6 text-sm">No payment history found.</p>`;
    } else {
      container.innerHTML = payments.map(p => `
        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <p class="text-sm font-semibold text-slate-800">${p.reference ?? "Payment"}</p>
            <p class="text-xs text-slate-500">${new Date(p.date ?? p.created_at).toLocaleDateString()}</p>
          </div>
          <p class="text-sm font-bold text-emerald-600">${fmtMoney(p.amount ?? 0)}</p>
        </div>
      `).join("");
    }
  }
};
