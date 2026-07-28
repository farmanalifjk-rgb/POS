/**
 * Customers.js — CRUD controller for /api/customers/ + /api/customer-list/
 */
import { createIcons, icons } from "lucide";
import Auth from "../../core/controllers/Auth.js";

const BASE = "http://127.0.0.1:8000/api";
let _all = [];

async function api(path, method = "GET", body = null) {
  const opts = { method, headers: { ...Auth.authHeader() } };
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

window.initializeCustomers = async function () {
  await window.loadCustomers();
};

window.loadCustomers = async function () {
  try {
    const data = await api("/customers/");
    _all = Array.isArray(data) ? data : (data?.results ?? []);
    renderTable(_all);
    const el = document.getElementById("customer-count");
    if (el) el.textContent = `${_all.length} customer${_all.length !== 1 ? "s" : ""}`;
  } catch (e) {
    console.error("Failed to load customers:", e);
    const tbody = document.getElementById("customer-table-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load customers</td></tr>`;
  }
};

function renderTable(list) {
  const tbody = document.getElementById("customer-table-body");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 text-sm">No customers found</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => `
    <tr class="hover:bg-slate-50 transition group">
      <td class="px-6 py-3 font-medium text-slate-900">${esc(c.name ?? "")}</td>
      <td class="px-6 py-3 text-slate-600">${esc(c.phone ?? "—")}</td>
      <td class="px-6 py-3 text-slate-600">${esc(c.email ?? "—")}</td>
      <td class="px-6 py-3 text-slate-600">${fmtMoney(c.credit_limit ?? 0)}</td>
      <td class="px-6 py-3 ${(c.balance ?? 0) < 0 ? "text-red-600 font-medium" : "text-slate-600"}">${fmtMoney(c.balance ?? 0)}</td>
      <td class="px-6 py-3">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
          <i data-lucide="star" class="w-3 h-3"></i> ${c.loyalty_points ?? 0}
        </span>
      </td>
      <td class="px-6 py-3 text-right">
        <button onclick="window.openCustomerStatement(${c.id})" class="text-teal-600 hover:text-teal-800 mr-2 text-xs font-medium opacity-0 group-hover:opacity-100 transition">Statement</button>
        <button onclick="window.openEditCustomer(${c.id})" class="text-indigo-600 hover:text-indigo-800 mr-2 text-xs font-medium">Edit</button>
        <button onclick="window.deleteCustomer(${c.id})" class="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
      </td>
    </tr>
  `).join("");
  createIcons({ icons });
}

window.filterCustomers = function () {
  const q = document.getElementById("customer-search")?.value.toLowerCase() ?? "";
  renderTable(q ? _all.filter(c =>
    (c.name ?? "").toLowerCase().includes(q) ||
    (c.phone ?? "").toLowerCase().includes(q) ||
    (c.email ?? "").toLowerCase().includes(q)
  ) : _all);
};

window.openAddCustomer = function () {
  clearModal();
  document.getElementById("customer-modal-title").textContent = "Add Customer";
  document.getElementById("customer-modal").classList.remove("hidden");
  createIcons({ icons });
};

window.openEditCustomer = function (id) {
  const c = _all.find(x => x.id === id);
  if (!c) return;
  clearModal();
  document.getElementById("customer-modal-title").textContent = "Edit Customer";
  document.getElementById("customer-modal-id").value = id;
  setVal("cm-name", c.name);
  setVal("cm-phone", c.phone);
  setVal("cm-email", c.email);
  setVal("cm-credit-limit", c.credit_limit);
  setVal("cm-address", c.address);
  document.getElementById("customer-modal").classList.remove("hidden");
  createIcons({ icons });
};

window.closeCustomerModal = function () {
  document.getElementById("customer-modal").classList.add("hidden");
};

window.saveCustomer = async function () {
  const id = document.getElementById("customer-modal-id").value;
  const body = {
    name: getVal("cm-name"),
    phone: getVal("cm-phone"),
    email: getVal("cm-email"),
    credit_limit: Number(getVal("cm-credit-limit")) || 0,
    address: getVal("cm-address"),
  };

  if (!body.name.trim()) { showToast("Name is required", "error"); return; }

  try {
    if (id) {
      await api(`/customers/${id}/`, "PUT", body);
    } else {
      await api("/customers/", "POST", body);
    }
    window.closeCustomerModal();
    await window.loadCustomers();
    showToast(id ? "Customer updated" : "Customer added", "success");
  } catch (e) {
    showToast("Failed to save customer", "error");
  }
};

window.deleteCustomer = async function (id) {
  if (!confirm("Delete this customer?")) return;
  try {
    await api(`/customers/${id}/`, "DELETE");
    await window.loadCustomers();
    showToast("Customer deleted", "success");
  } catch (e) {
    showToast("Failed to delete customer", "error");
  }
};

// ── Customer Statement ────────────────────────────────────────────────────────
let _statementCustomerId = null;

window.openCustomerStatement = async function(id) {
  _statementCustomerId = id;
  const c = _all.find(x => x.id === id);
  if (!c) return;

  document.getElementById("statement-customer-name").textContent = c.name;
  document.getElementById("statement-customer-phone").textContent = c.phone || "";
  document.getElementById("stmt-total-spent").textContent = "...";
  document.getElementById("stmt-balance").textContent = "...";
  document.getElementById("stmt-points").textContent = c.loyalty_points ?? 0;
  document.getElementById("statement-orders").innerHTML = `<div class="text-center py-8 text-slate-400 text-sm">Loading...</div>`;

  const panel = document.getElementById("customer-statement-panel");
  panel.classList.remove("hidden");
  panel.classList.add("flex");
  createIcons({ icons });

  try {
    const data = await api(`/customers/${id}/statement/`);
    document.getElementById("stmt-total-spent").textContent = fmtMoney(data.total_spent ?? 0);
    document.getElementById("stmt-balance").textContent = fmtMoney(data.balance ?? 0);
    document.getElementById("stmt-points").textContent = data.loyalty_points ?? c.loyalty_points ?? 0;

    const orders = data.orders ?? [];
    if (!orders.length) {
      document.getElementById("statement-orders").innerHTML = `<p class="text-center text-slate-400 py-6 text-sm">No purchase history found.</p>`;
    } else {
      document.getElementById("statement-orders").innerHTML = orders.map(o => `
        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <p class="text-sm font-semibold text-slate-800">#${o.order_number ?? o.id}</p>
            <p class="text-xs text-slate-500">${new Date(o.date ?? o.created_at).toLocaleDateString()}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-800">${fmtMoney(o.total ?? 0)}</p>
            <span class="text-xs px-2 py-0.5 rounded-full ${o.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${o.status ?? 'completed'}</span>
          </div>
        </div>
      `).join("");
    }
    createIcons({ icons });
  } catch (e) {
    document.getElementById("statement-orders").innerHTML = `<p class="text-center text-slate-400 py-6 text-sm">Could not load statement data.</p>`;
  }
};

window.closeCustomerStatement = function() {
  const panel = document.getElementById("customer-statement-panel");
  panel.classList.add("hidden");
  panel.classList.remove("flex");
  _statementCustomerId = null;
};

// ── Adjust Loyalty Points ─────────────────────────────────────────────────────
window.openAdjustPoints = function() {
  document.getElementById("adj-points-value").value = "";
  document.getElementById("adj-points-reason").value = "";
  document.getElementById("adjust-points-modal").classList.remove("hidden");
  document.getElementById("adjust-points-modal").classList.add("flex");
};

window.closeAdjustPoints = function() {
  document.getElementById("adjust-points-modal").classList.add("hidden");
  document.getElementById("adjust-points-modal").classList.remove("flex");
};

window.submitAdjustPoints = async function() {
  if (!_statementCustomerId) return;
  const points_change = Number(document.getElementById("adj-points-value").value);
  const reason = document.getElementById("adj-points-reason").value;
  if (!points_change) { showToast("Enter a points value", "error"); return; }
  try {
    await api(`/customers/${_statementCustomerId}/adjust-points/`, "POST", { points_change, reason });
    window.closeAdjustPoints();
    showToast("Points adjusted successfully", "success");
    await window.openCustomerStatement(_statementCustomerId);
    await window.loadCustomers();
  } catch (e) {
    showToast("Failed to adjust points", "error");
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function clearModal() {
  ["customer-modal-id","cm-name","cm-phone","cm-email","cm-credit-limit","cm-address"]
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
