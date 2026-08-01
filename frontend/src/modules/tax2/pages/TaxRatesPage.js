import { createIcons } from "lucide";
const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/tax2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderTaxRatesPage(root) {
    root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold">Tax Rates</h1><p class="text-sm text-muted-foreground">Multi-tax, inclusive/exclusive, compounding.</p></div>
        <button onclick="window.__addRate()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Add rate</button>
      </div>
      <div id="grid" class="grid md:grid-cols-2 gap-4"></div>
      <h2 class="text-lg font-semibold mt-8 mb-3">Exemptions</h2>
      <button onclick="window.__addExempt()" class="rounded-lg border px-3 py-1.5 text-sm mb-3">Add exemption</button>
      <div id="exemptions" class="space-y-2"></div>
    </div>`;
    load(); createIcons();
}

async function load() {
    const [rates, exempts] = await Promise.all([
        fetch(`${API}/rates/`, { headers: h() }).then(r => r.json()),
        fetch(`${API}/exemptions/`, { headers: h() }).then(r => r.json()),
    ]);
    document.getElementById("grid").innerHTML = (rates.length ? rates : []).map(r => `
    <div class="rounded-xl border bg-card p-4">
      <div class="flex items-center justify-between">
        <p class="font-semibold">${r.name} <span class="text-xs text-muted-foreground font-mono">${r.code}</span></p>
        <span class="text-xs px-2 py-0.5 rounded ${r.mode === 'inclusive' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}">${r.mode}</span>
      </div>
      <p class="text-sm mt-2">${(parseFloat(r.rate) * 100).toFixed(2)}% · ${r.compound_style}</p>
      <button onclick="window.__toggleRate(${r.id}, ${!r.is_active})" class="mt-3 text-xs rounded border px-3 py-1">${r.is_active ? "Deactivate" : "Activate"}</button>
    </div>`).join("") || `<p class="text-muted-foreground">No tax rates.</p>`;
    document.getElementById("exemptions").innerHTML = (exempts.length ? exempts : []).map(e => `
    <div class="rounded-lg border p-3 text-sm flex items-center justify-between">
      <span>${e.scope} exemption${e.reason ? " · " + e.reason : ""}</span>
      <button onclick="window.__delExempt(${e.id})" class="text-xs text-destructive">Remove</button>
    </div>`).join("") || `<p class="text-xs text-muted-foreground">No exemptions.</p>`;
}

window.__addRate = async () => {
    const name = prompt("Rate name (e.g. VAT Standard)"); if (!name) return;
    const code = prompt("Code (e.g. VAT-13)"); if (!code) return;
    const rate = prompt("Rate as decimal (0.13 = 13%)"); if (!rate) return;
    const mode = prompt("Mode: exclusive or inclusive", "exclusive");
    await fetch(`${API}/rates/`, {
        method: "POST", headers: h(),
        body: JSON.stringify({ name, code, rate: parseFloat(rate), mode, compound_style: "flat", applies_to_all: true })
    });
    load();
};
window.__toggleRate = async (id, active) => {
    await fetch(`${API}/rates/${id}/`, { method: "PATCH", headers: h(), body: JSON.stringify({ is_active: active }) });
    load();
};
window.__addExempt = async () => {
    const scope = prompt("Scope: customer / product / category", "customer");
    const refId = prompt(`${scope} ID`); if (!refId) return;
    const body = { scope, is_active: true };
    body[scope] = parseInt(refId);
    await fetch(`${API}/exemptions/`, { method: "POST", headers: h(), body: JSON.stringify(body) });
    load();
};
window.__delExempt = async (id) => {
    await fetch(`${API}/exemptions/${id}/`, { method: "DELETE", headers: h() });
    load();
};