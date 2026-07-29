import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/catalog";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderSerialsBatchesPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-1">Serial / IMEI & Batch Tracking</h1>
      <p class="text-sm text-muted-foreground mb-6">Track individual units and lots with FEFO expiry.</p>
      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h3 class="font-semibold mb-2">Serial numbers</h3>
          <div id="serials" class="rounded-xl border divide-y max-h-[420px] overflow-auto"></div>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Batches (FEFO)</h3>
          <div id="batches" class="rounded-xl border divide-y max-h-[420px] overflow-auto"></div>
        </div>
      </div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const [serials, batches] = await Promise.all([
    fetch(`${API}/serials/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/batches/`, { headers: h() }).then(r => r.json()),
  ]);
  document.getElementById("serials").innerHTML = (serials.length ? serials : []).map(s => `
    <div class="flex items-center justify-between p-3">
      <div><p class="font-medium text-sm">${s.serial_number}</p><p class="text-xs text-muted-foreground">${s.status}${s.warranty_expires ? " · warranty " + s.warranty_expires : ""}</p></div>
      <span class="text-xs px-2 py-0.5 rounded ${s.status === 'in_stock' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}">${s.status}</span>
    </div>`).join("") || `<p class="p-3 text-sm text-muted-foreground">No serials.</p>`;

  document.getElementById("batches").innerHTML = (batches.length ? batches : []).map(b => `
    <div class="flex items-center justify-between p-3 ${b.is_recalled ? 'bg-red-50' : ''}">
      <div><p class="font-medium text-sm">${b.batch_number}</p><p class="text-xs text-muted-foreground">${b.remaining_quantity}/${b.quantity} left · exp ${b.expiry_date || "—"}</p></div>
      ${b.is_recalled ? '<span class="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">Recalled</span>' : (b.is_expired ? '<span class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">Expired</span>' : '')}
    </div>`).join("") || `<p class="p-3 text-sm text-muted-foreground">No batches.</p>`;
}