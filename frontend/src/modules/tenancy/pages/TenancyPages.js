import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/tenancy2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderTenancyPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Organization & Branches</h1>
      <div id="me" class="rounded-xl border bg-card p-4 mb-6"></div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold">Branches</h2>
        <button onclick="window.__addBranch()" class="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-sm">Add branch</button>
      </div>
      <div id="branches" class="grid md:grid-cols-2 gap-3 mb-8"></div>
      <h2 class="text-lg font-semibold mb-3">Settings</h2>
      <div class="rounded-xl border bg-card p-4 mb-3">
        <div class="flex gap-2 items-end">
          <div class="flex-1"><label class="text-xs text-muted-foreground">Key</label><input id="s_key" class="block w-full rounded-lg border px-3 py-2 text-sm" /></div>
          <div class="flex-1"><label class="text-xs text-muted-foreground">Value</label><input id="s_val" class="block w-full rounded-lg border px-3 py-2 text-sm" /></div>
          <button onclick="window.__setSetting()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm">Save</button>
        </div>
      </div>
      <div id="settings" class="space-y-1"></div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const [me, branches, settings] = await Promise.all([
    fetch(`${API}/me/`, { headers: h() }).then(r => r.ok ? r.json() : null),
    fetch(`${API}/branches/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/tenant-settings/`, { headers: h() }).then(r => r.json()),
  ]);
  document.getElementById("me").innerHTML = me
    ? `<p class="font-semibold">${me.name}</p><p class="text-xs text-muted-foreground">code ${me.code}${me.active_branch ? ' · active branch: ' + me.active_branch.name : ' · all branches'}</p>`
    : `<p class="text-sm text-muted-foreground">No tenant membership assigned.</p>`;
  document.getElementById("branches").innerHTML = (branches.length ? branches : []).map(b => `
    <div class="rounded-lg border p-3 text-sm"><p class="font-medium">${b.name}</p><p class="text-xs text-muted-foreground">${b.code} · ${b.phone || ''}</p></div>`).join("") || `<p class="text-muted-foreground">No branches.</p>`;
  document.getElementById("settings").innerHTML = (settings.length ? settings : []).map(s => `
    <div class="flex items-center justify-between text-xs border-b py-1"><span class="font-mono">${s.key}</span><span class="text-muted-foreground">${s.value.slice(0, 60)}</span></div>`).join("") || `<p class="text-xs text-muted-foreground">No settings.</p>`;
}

window.__addBranch = async () => {
  const name = prompt("Branch name"); if (!name) return;
  const code = prompt("Branch code"); if (!code) return;
  const me = await fetch(`${API}/me/`, { headers: h() }).then(r => r.json());
  await fetch(`${API}/branches/`, { method: "POST", headers: h(),
    body: JSON.stringify({ tenant: me.id, name, code }) });
  load();
};
window.__setSetting = async () => {
  const key = document.getElementById("s_key").value;
  const val = document.getElementById("s_val").value;
  if (!key) return;
  await fetch(`${API}/setting/`, { method: "POST", headers: h(),
    body: JSON.stringify({ key, value: val }) });
  document.getElementById("s_key").value = ''; document.getElementById("s_val").value = '';
  load();
};