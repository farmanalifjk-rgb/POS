import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/integrations2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderIntegrationsPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold">Integration Hub</h1><p class="text-sm text-muted-foreground">Shopify, WooCommerce, QuickBooks sync.</p></div>
        <button onclick="window.__addInt()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Add integration</button>
      </div>
      <div id="list" class="space-y-3"></div>
      <h2 class="text-lg font-semibold mt-8 mb-3">Recent sync logs</h2>
      <div id="logs" class="space-y-1 max-h-72 overflow-auto"></div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const [ints, logs] = await Promise.all([
    fetch(`${API}/integrations/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/logs/`, { headers: h() }).then(r => r.json()),
  ]);
  document.getElementById("list").innerHTML = (ints.length ? ints : []).map(i => `
    <div class="rounded-xl border bg-card p-4">
      <div class="flex items-center justify-between">
        <div><p class="font-semibold capitalize">${i.kind} — ${i.name}</p>
        <p class="text-xs text-muted-foreground">${i.last_synced_at ? 'Last sync: ' + new Date(i.last_synced_at).toLocaleString() : 'Never synced'}</p></div>
        <span class="text-xs px-2 py-0.5 rounded ${i.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}">${i.is_active ? 'Active' : 'Inactive'}</span>
      </div>
      <div class="flex gap-2 mt-3">
        <button onclick="window.__sync(${i.id}, 'inbound', 'product')" class="text-xs rounded border px-2 py-1">Pull products</button>
        <button onclick="window.__sync(${i.id}, 'outbound', 'product')" class="text-xs rounded border px-2 py-1">Push products</button>
        ${i.kind === 'shopify' || i.kind === 'woocommerce' ? `<button onclick="window.__sync(${i.id}, 'inbound', 'order')" class="text-xs rounded border px-2 py-1">Pull orders</button>` : ''}
      </div>
    </div>`).join("") || `<p class="text-muted-foreground">No integrations configured.</p>`;
  document.getElementById("logs").innerHTML = (logs.length ? logs : []).map(l => `
    <div class="text-xs flex items-center justify-between border-b py-1">
      <span>${l.direction} ${l.entity_type} ${l.local_id || l.remote_id}</span>
      <span class="${l.status === 'success' ? 'text-emerald-600' : l.status === 'failed' ? 'text-destructive' : 'text-muted-foreground'}">${l.status}</span>
    </div>`).join("") || `<p class="text-muted-foreground text-xs">No sync activity.</p>`;
}

window.__addInt = async () => {
  const kind = prompt("Type: shopify / woocommerce / quickbooks", "shopify"); if (!kind) return;
  const name = prompt("Integration name"); if (!name) return;
  const config = {};
  if (kind === "shopify") { config.shop_url = prompt("Shop URL (my-store.myshopify.com)"); config.access_token = prompt("Access token"); }
  else if (kind === "woocommerce") { config.store_url = prompt("Store URL"); config.consumer_key = prompt("Consumer key"); config.consumer_secret = prompt("Consumer secret"); }
  else if (kind === "quickbooks") { config.realm_id = prompt("Realm ID"); config.refresh_token = prompt("Refresh token"); }
  await fetch(`${API}/integrations/`, { method: "POST", headers: h(), body: JSON.stringify({ kind, name, config, is_active: true }) });
  load();
};
window.__sync = async (id, dir, ent) => {
  const res = await fetch(`${API}/integrations/${id}/sync/`, { method: "POST", headers: h(),
    body: JSON.stringify({ direction: dir, entity_type: ent }) }).then(r => r.json());
  alert(JSON.stringify(res));
  load();
};