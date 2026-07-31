import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/audit2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderAuditPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-1">Audit Log</h1>
      <p class="text-sm text-muted-foreground mb-4">Every create / update / delete with who, when, and what changed.</p>
      <div class="flex gap-2 mb-4">
        <input id="f_entity" placeholder="Entity type" class="rounded-lg border px-3 py-2 text-sm" />
        <input id="f_action" placeholder="Action" class="rounded-lg border px-3 py-2 text-sm" />
        <button onclick="window.__filter()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm">Filter</button>
      </div>
      <div id="list" class="space-y-2"></div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const ent = document.getElementById("f_entity")?.value || "";
  const act = document.getElementById("f_action")?.value || "";
  const qs = new URLSearchParams(); if (ent) qs.set("entity_type", ent); if (act) qs.set("action", act);
  const data = await fetch(`${API}/events/?${qs}`, { headers: h() }).then(r => r.json());
  document.getElementById("list").innerHTML = (data.length ? data : []).map(e => `
    <details class="rounded-lg border p-3">
      <summary class="cursor-pointer flex items-center justify-between">
        <span><i data-lucide="${iconFor(e.action)}" width="14" height="14" class="inline mr-2"></i><span class="font-medium text-sm">${e.actor_name || "system"}</span> <span class="text-muted-foreground">${e.action}</span> ${e.entity_type} ${e.entity_label}</span>
        <span class="text-xs text-muted-foreground">${new Date(e.created_at).toLocaleString()}</span>
      </summary>
      <div class="mt-2 grid md:grid-cols-2 gap-2 text-xs">
        <div><p class="font-medium mb-1">Before</p><pre class="bg-muted/40 rounded p-2 overflow-auto">${JSON.stringify(e.before, null, 2)}</pre></div>
        <div><p class="font-medium mb-1">After</p><pre class="bg-muted/40 rounded p-2 overflow-auto">${JSON.stringify(e.after, null, 2)}</pre></div>
      </div>
    </details>`).join("") || `<p class="text-muted-foreground">No events.</p>`;
  createIcons();
}

function iconFor(action) {
  return ({ create: "plus-circle", update: "pencil", delete: "trash-2", login: "log-in",
            logout: "log-out", refund: "rotate-ccw", void: "ban", print: "printer", export: "download" })[action] || "activity";
}

window.__filter = () => load();