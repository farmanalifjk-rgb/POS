import { createIcons } from "lucide";
const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/fiscal2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderInvoicesPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold">Fiscal Invoices</h1><p class="text-sm text-muted-foreground">Sequenced, XML + QR, device submission.</p></div>
        <button onclick="window.__issue()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Issue invoice</button>
      </div>
      <div id="seqs" class="flex flex-wrap gap-2 mb-4"></div>
      <div id="list" class="space-y-2"></div>
    </div>`;
  Promise.all([
    fetch(`${API}/sequences/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/invoices/`, { headers: h() }).then(r => r.json()),
  ]).then(([seqs, invoices]) => {
    document.getElementById("seqs").innerHTML = (seqs.length ? seqs : []).map(s =>
      `<span class="text-xs rounded-full border px-3 py-1">${s.prefix} · ${s.document_type} · next ${s.next_number}</span>`).join("");
    document.getElementById("list").innerHTML = (invoices.length ? invoices : []).map(inv => `
      <div class="flex items-center justify-between rounded-lg border p-3">
        <div><p class="font-medium text-sm">${inv.invoice_number}</p><p class="text-xs text-muted-foreground">${inv.issue_date} · $${inv.total}</p></div>
        <div class="flex items-center gap-2">
          <span class="text-xs px-2 py-0.5 rounded ${inv.status === 'issued' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}">${inv.status}</span>
          <a href="${API}/invoices/${inv.id}/xml/" target="_blank" class="text-xs rounded border px-2 py-1">XML</a>
          ${inv.status === 'issued' ? `<button onclick="window.__cancel(${inv.id})" class="text-xs text-destructive">Cancel</button>` : ''}
        </div>
      </div>`).join("") || `<p class="text-muted-foreground">No invoices issued.</p>`;
  });
  createIcons();
}

window.__issue = async () => {
  const seqId = prompt("Sequence ID"); if (!seqId) return;
  const orderId = prompt("Order ID (optional)", "");
  const body = { sequence_id: parseInt(seqId) };
  if (orderId) body.order_id = parseInt(orderId);
  await fetch(`${API}/invoices/issue/`, { method: "POST", headers: h(), body: JSON.stringify(body) });
  location.reload();
};
window.__cancel = async (id) => {
  await fetch(`${API}/invoices/${id}/cancel/`, { method: "POST", headers: h() });
  location.reload();
};