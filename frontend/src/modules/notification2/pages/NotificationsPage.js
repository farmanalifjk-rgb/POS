import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/notifications2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderNotificationsPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold">Notifications</h1><p class="text-sm text-muted-foreground">Stock, expiry, shifts, credit.</p></div>
        <button onclick="window.__readAll()" class="text-sm rounded-lg border px-3 py-1.5">Mark all read</button>
      </div>
      <div id="list" class="space-y-2"></div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const data = await fetch(`${API}/notifications/?unread=1`, { headers: h() }).then(r => r.json());
  document.getElementById("list").innerHTML = (data.length ? data : []).map(n => `
    <div class="rounded-lg border p-3 flex items-start gap-3 ${n.is_read ? 'opacity-60' : 'bg-card'}">
      <i data-lucide="${iconFor(n.kind)}" width="18" height="18" class="mt-0.5 ${n.severity === 'critical' ? 'text-destructive' : 'text-amber-500'}"></i>
      <div class="flex-1">
        <p class="font-medium text-sm">${n.title}</p>
        <p class="text-xs text-muted-foreground">${n.body}</p>
        <p class="text-[10px] text-muted-foreground mt-1">${new Date(n.created_at).toLocaleString()}</p>
      </div>
      <button onclick="window.__read(${n.id})" class="text-xs rounded border px-2 py-1">Read</button>
    </div>`).join("") || `<p class="text-muted-foreground">You're all caught up 🎉</p>`;
  createIcons();
}

function iconFor(kind) {
  return ({ low_stock: "package-x", expiry: "calendar-clock", shift_handover: "clock",
            reorder: "shopping-cart", credit_limit: "badge-dollar-sign" })[kind] || "bell";
}

window.__read = async (id) => { await fetch(`${API}/notifications/${id}/read/`, { method: "POST", headers: h() }); load(); };
window.__readAll = async () => { await fetch(`${API}/notifications/read-all/`, { method: "POST", headers: h() }); load(); };