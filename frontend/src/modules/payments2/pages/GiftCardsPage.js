import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/payments2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderGiftCardsPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold">Gift Cards</h1><p class="text-sm text-muted-foreground">Issue, top-up and redeem.</p></div>
        <button onclick="window.__issue()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Issue card</button>
      </div>
      <div id="grid" class="grid md:grid-cols-3 gap-4"></div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const data = await fetch(`${API}/gift-cards/`, { headers: h() }).then(r => r.json());
  document.getElementById("grid").innerHTML = (data.length ? data : []).map(g => `
    <div class="rounded-xl border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5">
      <div class="flex items-center justify-between">
        <i data-lucide="credit-card" width="22" height="22"></i>
        <span class="text-xs opacity-80">${g.is_active ? "Active" : "Inactive"}</span>
      </div>
      <p class="font-mono text-lg mt-3 tracking-wider">${g.code}</p>
      <p class="text-2xl font-bold mt-1">$${g.balance}</p>
      <p class="text-xs opacity-80 mt-1">Issued $${g.initial_balance}${g.expires_at ? " · exp " + g.expires_at : ""}</p>
      <div class="flex gap-2 mt-4">
        <button onclick="window.__topup(${g.id})" class="text-xs rounded bg-white/20 px-3 py-1.5">Top-up</button>
        <button onclick="window.__redeem('${g.code}')" class="text-xs rounded bg-white/20 px-3 py-1.5">Redeem</button>
      </div>
    </div>`).join("") || `<p class="text-muted-foreground">No gift cards issued.</p>`;
}

window.__issue = async () => {
  const amt = prompt("Initial balance"); if (!amt) return;
  await fetch(`${API}/gift-cards/`, { method: "POST", headers: h(), body: JSON.stringify({ initial_balance: amt }) });
  load();
};
window.__topup = async (id) => {
  const amt = prompt("Top-up amount"); if (!amt) return;
  await fetch(`${API}/gift-cards/${id}/topup/`, { method: "POST", headers: h(), body: JSON.stringify({ amount: amt }) });
  load();
};
window.__redeem = async (code) => {
  const amt = prompt("Redeem amount"); if (!amt) return;
  await fetch(`${API}/gift-cards/redeem/`, { method: "POST", headers: h(), body: JSON.stringify({ code, amount: amt }) });
  load();
};