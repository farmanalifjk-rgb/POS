import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/transfers2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderTransfersPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold">Stock Transfers</h1><p class="text-sm text-muted-foreground">Move stock between warehouses.</p></div>
        <button onclick="window.__newTransfer()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">New transfer</button>
      </div>
      <div id="list" class="space-y-3"></div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const data = await fetch(`${API}/transfers/`, { headers: h() }).then(r => r.json());
  document.getElementById("list").innerHTML = (data.length ? data : []).map(t => `
    <div class="rounded-xl border bg-card p-4 flex items-center justify-between">
      <div>
        <p class="font-semibold">${t.transfer_number}</p>
        <p class="text-xs text-muted-foreground">${t.items?.length || 0} items · ${new Date(t.created_at).toLocaleDateString()}</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs px-2 py-1 rounded ${t.status === 'received' ? 'bg-emerald-100 text-emerald-700' : t.status === 'in_transit' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}">${t.status}</span>
        ${t.status === 'in_transit' ? `<button onclick="window.__receive(${t.id})" class="text-xs rounded bg-primary text-primary-foreground px-3 py-1.5">Receive</button>` : ''}
      </div>
    </div>`).join("") || `<p class="text-muted-foreground">No transfers yet.</p>`;
}

window.__newTransfer = async () => {
  const src = prompt("Source warehouse id"); if (!src) return;
  const dst = prompt("Destination warehouse id"); if (!dst) return;
  const items = prompt("Items JSON, e.g. [{product_id:1,quantity:5}]"); if (!items) return;
  await fetch(`${API}/transfers/`, { method: "POST", headers: h(),
    body: JSON.stringify({ source_warehouse: +src, destination_warehouse: +dst, items: JSON.parse(items.replace(/(\w+):/g, '"$1":')) }) });
  load();
};
window.__receive = async (id) => {
  await fetch(`${API}/transfers/${id}/receive/`, { method: "POST", headers: h(), body: JSON.stringify({}) });
  load();
};