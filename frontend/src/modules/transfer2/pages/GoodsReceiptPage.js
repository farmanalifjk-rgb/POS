import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/suppliers2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderGoodsReceiptPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold mb-1">Goods Receipt Notes</h1>
      <p class="text-sm text-muted-foreground mb-6">Receive stock against purchase orders.</p>
      <div class="rounded-xl border bg-card p-5 mb-6">
        <h3 class="font-semibold mb-3">New receipt</h3>
        <div class="grid md:grid-cols-2 gap-3">
          <input id="gr_po" placeholder="Purchase order ID" class="rounded-lg border px-3 py-2 text-sm" />
          <input id="gr_inv" placeholder="Supplier invoice #" class="rounded-lg border px-3 py-2 text-sm" />
        </div>
        <textarea id="gr_lines" placeholder='Lines JSON: [{"product_id":1,"quantity_received":10}]' class="w-full rounded-lg border px-3 py-2 text-sm mt-3" rows="3"></textarea>
        <button onclick="window.__createGR()" class="mt-3 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Create receipt</button>
      </div>
      <div id="list" class="space-y-2"></div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const data = await fetch(`${API}/receipts/`, { headers: h() }).then(r => r.json());
  document.getElementById("list").innerHTML = (data.length ? data : []).map(r => `
    <div class="flex items-center justify-between rounded-lg border p-3">
      <div><p class="font-medium text-sm">${r.receipt_number}</p><p class="text-xs text-muted-foreground">${r.lines?.length || 0} lines · ${r.status}</p></div>
      <span class="text-xs px-2 py-0.5 rounded ${r.status === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}">${r.status}</span>
    </div>`).join("") || `<p class="text-muted-foreground">No receipts.</p>`;
}

window.__createGR = async () => {
  const po = document.getElementById("gr_po").value; if (!po) return;
  const inv = document.getElementById("gr_inv").value;
  const lines = JSON.parse(document.getElementById("gr_lines").value.replace(/(\w+):/g, '"$1":'));
  await fetch(`${API}/purchase-orders/${po}/receipts/`, { method: "POST", headers: h(),
    body: JSON.stringify({ supplier_invoice_number: inv, lines }) });
  load();
};