import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/hr2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderPayrollPage(root) {
  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Payroll</h1>
      <div class="rounded-xl border bg-card p-5 mb-6">
        <h3 class="font-semibold mb-3">New payroll run</h3>
        <div class="flex gap-3 items-end">
          <div><label class="text-xs text-muted-foreground">From</label><input id="pr_start" value="${start}" class="block rounded-lg border px-3 py-2 text-sm" type="date" /></div>
          <div><label class="text-xs text-muted-foreground">To</label><input id="pr_end" value="${today}" class="block rounded-lg border px-3 py-2 text-sm" type="date" /></div>
          <button onclick="window.__runPayroll()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Run payroll</button>
        </div>
      </div>
      <div id="runs" class="space-y-3"></div>
    </div>`;
  loadRuns(); createIcons();
}

async function loadRuns() {
  const runs = await fetch(`${API}/payroll/`, { headers: h() }).then(r => r.json());
  document.getElementById("runs").innerHTML = (runs.length ? runs : []).map(r => `
    <div class="rounded-xl border p-4">
      <div class="flex items-center justify-between">
        <div><p class="font-semibold">Payroll #${r.id}</p><p class="text-xs text-muted-foreground">${r.period_start} → ${r.period_end}</p></div>
        <div class="flex items-center gap-3">
          <span class="text-xs px-2 py-0.5 rounded ${r.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : r.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}">${r.status}</span>
          <a href="${API}/payroll/${r.id}/csv/" class="text-xs rounded border px-2 py-1">CSV</a>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-2 mt-3 text-sm">
        <div><p class="text-xs text-muted-foreground">Base</p><p>$${r.total_base}</p></div>
        <div><p class="text-xs text-muted-foreground">Hours</p><p>${r.total_hours}</p></div>
        <div><p class="text-xs text-muted-foreground">Commissions</p><p>$${r.total_commissions}</p></div>
        <div><p class="text-xs text-muted-foreground">Gross</p><p class="font-semibold">$${r.total_gross}</p></div>
      </div>
    </div>`).join("") || `<p class="text-muted-foreground">No payroll runs yet.</p>`;
}

window.__runPayroll = async () => {
  const start = document.getElementById("pr_start").value;
  const end = document.getElementById("pr_end").value;
  await fetch(`${API}/payroll/run/`, { method: "POST", headers: h(), body: JSON.stringify({ period_start: start, period_end: end }) });
  loadRuns();
};