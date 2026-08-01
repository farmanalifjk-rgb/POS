import { createIcons } from "lucide";

const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/saas";
const headers = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderTenantsAdminPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">Tenants</h1>
          <p class="text-sm text-muted-foreground">Super-admin workspace provisioning.</p>
        </div>
        <button onclick="window.__newTenant()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">New tenant</button>
      </div>
      <div id="list" class="rounded-xl border divide-y"></div>
    </div>`;
  load();
  createIcons();
}

async function load() {
  const plans = await fetch(`${API}/plans/`).then(r => r.json());
  // Reuse tenant endpoint scoped to superuser: list all via members grouping
  const me = await fetch(`${API}/tenant/`, { headers: headers() }).then(r => r.json());
  document.getElementById("list").innerHTML = me.tenant
    ? `<div class="p-4"><p class="font-medium">${me.tenant.name}</p><p class="text-xs text-muted-foreground">${me.tenant.slug} · ${me.tenant.status}</p></div>`
    : `<p class="p-4 text-sm text-muted-foreground">No active tenant. Use New tenant to provision one.</p>`;
  window.__plans = plans;
}

window.__newTenant = async () => {
  const name = prompt("Tenant name");
  if (!name) return;
  const slug = (prompt("Plan slug", "starter") || "starter").toLowerCase();
  const res = await fetch(`${API}/tenants/`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ name, slug: name.toLowerCase().replace(/\s+/g, "-"), plan_slug: slug })
  }).then(r => r.json());
  alert(res.slug ? "Created: " + res.slug : JSON.stringify(res));
  load();
};