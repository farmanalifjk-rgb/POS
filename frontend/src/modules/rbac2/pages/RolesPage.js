import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/rbac2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderRolesPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold">Roles & Permissions</h1><p class="text-sm text-muted-foreground">Granular RBAC with templates and per-user overrides.</p></div>
        <div class="flex gap-2">
          <button onclick="window.__seed()" class="rounded-lg border px-3 py-2 text-sm">Seed defaults</button>
          <button onclick="window.__addRole()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Add role</button>
        </div>
      </div>
      <div id="roles" class="grid md:grid-cols-2 gap-4"></div>
      <h2 class="text-lg font-semibold mt-8 mb-3">User assignments</h2>
      <button onclick="window.__assign()" class="rounded-lg border px-3 py-1.5 text-sm mb-3">Assign role</button>
      <div id="assignments" class="space-y-2"></div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const [roles, assignments, templates] = await Promise.all([
    fetch(`${API}/roles/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/user-roles/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/templates/`, { headers: h() }).then(r => r.json()),
  ]);
  document.getElementById("roles").innerHTML = (roles.length ? roles : []).map(r => `
    <div class="rounded-xl border bg-card p-4">
      <div class="flex items-center justify-between">
        <p class="font-semibold">${r.label} ${r.is_system ? '<span class="text-xs text-muted-foreground">(system)</span>' : ''}</p>
        <span class="text-xs text-muted-foreground">${r.permissions.length} perms</span>
      </div>
      <p class="text-xs text-muted-foreground mt-1">${r.description || ''}</p>
      <div class="flex flex-wrap gap-1 mt-2">
        ${(r.permissions || []).slice(0, 5).map(p => `<span class="text-[10px] rounded bg-muted px-2 py-0.5">${p.module_key}.${p.action}</span>`).join('')}
        ${r.permissions.length > 5 ? `<span class="text-[10px] text-muted-foreground">+${r.permissions.length - 5}</span>` : ''}
      </div>
      <div class="flex gap-2 mt-3">
        <select id="tpl_${r.id}" class="text-xs rounded border px-2 py-1">
          <option value="">Apply template…</option>
          ${(templates || []).map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
        </select>
        <button onclick="window.__applyTpl(${r.id})" class="text-xs rounded border px-2 py-1">Apply</button>
      </div>
    </div>`).join("") || `<p class="text-muted-foreground">No roles. Click "Seed defaults".</p>`;
  document.getElementById("assignments").innerHTML = (assignments.length ? assignments : []).map(a => `
    <div class="rounded-lg border p-3 text-sm flex items-center justify-between">
      <span><span class="font-medium">${a.user_name || '—'}</span> → ${a.role_label}${a.branch ? ' @ branch #' + a.branch : ''}</span>
      <button onclick="window.__unassign(${a.id})" class="text-xs text-destructive">Remove</button>
    </div>`).join("") || `<p class="text-muted-foreground">No assignments.</p>`;
}

window.__seed = async () => {
  await fetch(`${API}/seed/`, { method: "POST", headers: h() });
  load();
};
window.__addRole = async () => {
  const key = prompt("Role key (e.g. senior_cashier)"); if (!key) return;
  const label = prompt("Display label"); if (!label) return;
  await fetch(`${API}/roles/`, { method: "POST", headers: h(), body: JSON.stringify({ key, label }) });
  load();
};
window.__assign = async () => {
  const userId = prompt("User ID"); if (!userId) return;
  const roleId = prompt("Role ID"); if (!roleId) return;
  await fetch(`${API}/user-roles/`, { method: "POST", headers: h(),
    body: JSON.stringify({ user: parseInt(userId), role: parseInt(roleId), is_active: true }) });
  load();
};
window.__unassign = async (id) => { await fetch(`${API}/user-roles/${id}/`, { method: "DELETE", headers: h() }); load(); };
window.__applyTpl = async (roleId) => {
  const sel = document.getElementById(`tpl_${roleId}`);
  const tplId = parseInt(sel.value);
  if (!tplId) return;
  await fetch(`${API}/roles/${roleId}/apply-template/`, { method: "POST", headers: h(),
    body: JSON.stringify({ template_id: tplId }) });
  load();
};