import { createIcons } from "lucide";
const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/catalog";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderBundlesPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold">Product Bundles</h1><p class="text-sm text-muted-foreground">Combos, kits and gift packs.</p></div>
        <button onclick="window.__newBundle()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">New bundle</button>
      </div>
      <div id="grid" class="grid md:grid-cols-2 gap-4"></div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const data = await fetch(`${API}/bundles/`, { headers: h() }).then(r => r.json());
  document.getElementById("grid").innerHTML = (data.length ? data : []).map(b => `
    <div class="rounded-xl border bg-card p-5 transition hover:shadow-md">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">${b.name}</h3>
        <span class="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">${b.price_strategy}</span>
      </div>
      <p class="text-sm text-muted-foreground mt-1">${b.description || ""}</p>
      <p class="text-lg font-bold mt-3">$${b.computed_price}</p>
      <p class="text-xs text-muted-foreground mt-1">${b.components?.length || 0} components</p>
    </div>`).join("") || `<p class="text-muted-foreground">No bundles yet.</p>`;
}

window.__newBundle = async () => {
  const name = prompt("Bundle name"); if (!name) return;
  await fetch(`${API}/bundles/`, { method: "POST", headers: h(), body: JSON.stringify({ name, price_strategy: "sum" }) });
  load();
};