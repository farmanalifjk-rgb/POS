import { createIcons } from "lucide";
const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/customers2";
const base = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderCustomerDetailPage(root, customerId) {
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Customer 360°</h1>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="rounded-xl border bg-card p-5">
          <h3 class="font-semibold mb-3">Credit limit</h3>
          <div id="credit" class="space-y-1 text-sm"></div>
          <button onclick="window.__setCredit(${customerId})" class="mt-3 text-xs rounded bg-primary text-primary-foreground px-3 py-1.5">Set limit</button>
        </div>
        <div class="rounded-xl border bg-card p-5">
          <h3 class="font-semibold mb-3">Loyalty timeline</h3>
          <div id="loyalty" class="space-y-2 max-h-64 overflow-auto"></div>
        </div>
        <div class="rounded-xl border bg-card p-5">
          <h3 class="font-semibold mb-3">Addresses</h3>
          <div id="addresses" class="space-y-2 text-sm"></div>
        </div>
      </div>
      <div class="rounded-xl border bg-card p-5 mt-6">
        <h3 class="font-semibold mb-3">Notes</h3>
        <div id="notes" class="space-y-2"></div>
        <textarea id="note_body" class="w-full rounded-lg border px-3 py-2 text-sm mt-2" rows="2" placeholder="Add a note..."></textarea>
        <button onclick="window.__addNote(${customerId})" class="mt-2 text-xs rounded bg-primary text-primary-foreground px-3 py-1.5">Add note</button>
      </div>
    </div>`;
  loadAll(customerId); createIcons();
}

async function loadAll(id) {
  const [credit, loyalty, addresses, notes] = await Promise.all([
    fetch(`${API}/customers/${id}/credit-limit/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/customers/${id}/loyalty/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/customers/${id}/addresses/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/customers/${id}/notes/`, { headers: h() }).then(r => r.json()),
  ]);
  document.getElementById("credit").innerHTML = `
    <p>Limit: <span class="font-medium">$${credit.limit}</span></p>
    <p>Used: <span class="font-medium">$${credit.used}</span></p>
    <p class="text-emerald-600">Available: $${credit.available}</p>`;
  document.getElementById("loyalty").innerHTML = (loyalty.length ? loyalty : []).map(e => `
    <div class="flex items-center justify-between text-xs">
      <span>${e.kind}</span>
      <span class="${e.kind === 'earn' ? 'text-emerald-600' : 'text-destructive'}">${e.points > 0 ? '+' : ''}${e.points}</span>
    </div>`).join("") || `<p class="text-xs text-muted-foreground">No events.</p>`;
  document.getElementById("addresses").innerHTML = (addresses.length ? addresses : []).map(a => `
    <div class="rounded-lg border p-2">
      <p class="font-medium">${a.label || a.kind} ${a.is_default ? "· default" : ""}</p>
      <p class="text-xs text-muted-foreground">${a.line1}, ${a.city}</p>
    </div>`).join("") || `<p class="text-xs text-muted-foreground">No addresses.</p>`;
  document.getElementById("notes").innerHTML = (notes.length ? notes : []).map(n => `
    <div class="text-sm rounded-lg bg-muted/40 p-2">${n.body}${n.pinned ? " 📌" : ""}</div>`).join("") || `<p class="text-xs text-muted-foreground">No notes.</p>`;
}

window.__setCredit = async (id) => {
  const limit = prompt("Credit limit amount"); if (!limit) return;
  const terms = prompt("Terms (net days)", "30");
  await fetch(`${API}/customers/${id}/credit-limit/`, { method: "POST", headers: h(),
    body: JSON.stringify({ limit: +limit, terms_days: +terms }) });
  loadAll(id);
};
window.__addNote = async (id) => {
  const body = document.getElementById("note_body").value; if (!body) return;
  await fetch(`${API}/customers/${id}/notes/`, { method: "POST", headers: h(), body: JSON.stringify({ body }) });
  loadAll(id);
};