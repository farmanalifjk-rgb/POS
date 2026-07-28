import Auth from "../../core/controllers/Auth.js";

const BASE = "http://127.0.0.1:8000/api";
async function api(path) {
  const res = await fetch(`${BASE}${path}`, { headers: Auth.authHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
function fmt(n) { return `Rs. ${Number(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 0 })}`; }
function setDefaultDates(startId, endId) {
  const end = new Date();
  const start = new Date(); start.setDate(1);
  document.getElementById(startId).value = start.toISOString().slice(0,10);
  document.getElementById(endId).value = end.toISOString().slice(0,10);
}

// ── Customer Report ───────────────────────────────────────────────────────────
window.initializeCustomerReport = function() {
  setDefaultDates("cr-start", "cr-end");
  window.loadCustomerReport();
};

window.loadCustomerReport = async function() {
  const start = document.getElementById("cr-start").value;
  const end = document.getElementById("cr-end").value;
  const tbody = document.getElementById("cr-table");
  tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400 text-sm">Loading...</td></tr>`;

  try {
    const data = await api(`/reports/customers/?start=${start}&end=${end}`);
    const rows = Array.isArray(data) ? data : (data.results ?? []);
    document.getElementById("cr-count").textContent = `${rows.length} customers`;

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400 text-sm">No data for selected period.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map((c, i) => `
      <tr class="hover:bg-slate-50 transition">
        <td class="px-6 py-3 text-slate-500 text-xs">${i + 1}</td>
        <td class="px-6 py-3">
          <p class="font-semibold text-slate-800">${c.name ?? "-"}</p>
          <p class="text-xs text-slate-400">${c.email ?? ""}</p>
        </td>
        <td class="px-6 py-3 text-slate-600">${c.phone ?? "-"}</td>
        <td class="px-6 py-3 text-right font-semibold text-slate-800">${c.order_count ?? 0}</td>
        <td class="px-6 py-3 text-right font-bold text-emerald-600">${fmt(c.total_spent)}</td>
        <td class="px-6 py-3 text-right text-slate-600">${fmt(c.avg_order_value)}</td>
        <td class="px-6 py-3 text-right text-slate-500 text-xs">${c.last_purchase ? new Date(c.last_purchase).toLocaleDateString() : "-"}</td>
      </tr>
    `).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400 text-sm">Could not load report. The endpoint may not be implemented yet.</td></tr>`;
  }
};

// ── Supplier Report ───────────────────────────────────────────────────────────
window.initializeSupplierReport = async function() {
  await window.loadSupplierReport();
};

window.loadSupplierReport = async function() {
  const tbody = document.getElementById("sr-table");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400 text-sm">Loading...</td></tr>`;

  try {
    const data = await api(`/reports/suppliers/`);
    const rows = Array.isArray(data) ? data : (data.results ?? []);

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400 text-sm">No data available.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map((s, i) => `
      <tr class="hover:bg-slate-50 transition">
        <td class="px-6 py-3 text-slate-500 text-xs">${i + 1}</td>
        <td class="px-6 py-3">
          <p class="font-semibold text-slate-800">${s.name ?? "-"}</p>
          <p class="text-xs text-slate-400">${s.contact_person ?? ""}</p>
        </td>
        <td class="px-6 py-3 text-right text-slate-700">${s.po_count ?? 0}</td>
        <td class="px-6 py-3 text-right font-semibold text-slate-800">${fmt(s.total_volume)}</td>
        <td class="px-6 py-3 text-right text-emerald-600">${fmt(s.total_paid)}</td>
        <td class="px-6 py-3 text-right font-bold ${(s.outstanding_balance ?? 0) > 0 ? "text-red-600" : "text-slate-500"}">${fmt(s.outstanding_balance)}</td>
      </tr>
    `).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400 text-sm">Could not load report. The endpoint may not be implemented yet.</td></tr>`;
  }
};

// ── Employee Report ───────────────────────────────────────────────────────────
window.initializeEmployeeReport = function() {
  setDefaultDates("er-start", "er-end");
};

window.loadEmployeeReport = async function() {
  const start = document.getElementById("er-start").value;
  const end = document.getElementById("er-end").value;
  const tbody = document.getElementById("er-table");
  tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400 text-sm">Loading...</td></tr>`;

  try {
    const data = await api(`/reports/employees/?start=${start}&end=${end}`);
    const rows = Array.isArray(data) ? data : (data.results ?? []);

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400 text-sm">No employee data for selected period.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map((e, i) => `
      <tr class="hover:bg-slate-50 transition">
        <td class="px-6 py-3 text-slate-500 text-xs">${i + 1}</td>
        <td class="px-6 py-3">
          <p class="font-semibold text-slate-800">${e.name ?? e.username ?? "-"}</p>
          <p class="text-xs text-slate-400">${e.role ?? e.email ?? ""}</p>
        </td>
        <td class="px-6 py-3 text-right text-slate-700">${e.orders_count ?? e.order_count ?? 0}</td>
        <td class="px-6 py-3 text-right font-bold text-emerald-600">${fmt(e.total_sales ?? e.total_value)}</td>
        <td class="px-6 py-3 text-right text-slate-600">${fmt(e.avg_sale ?? e.avg_order_value)}</td>
        <td class="px-6 py-3 text-right text-orange-600">${fmt(e.discounts_given ?? e.total_discounts)}</td>
      </tr>
    `).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400 text-sm">Could not load report. The endpoint may not be implemented yet.</td></tr>`;
  }
};
