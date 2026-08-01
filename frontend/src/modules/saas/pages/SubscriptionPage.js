import { createIcons } from "lucide";

const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/saas";
const token = () => localStorage.getItem("pos_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Token ${token()}` });

export function renderSubscriptionPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Subscription & Billing</h1>
          <p class="text-sm text-muted-foreground">Manage your plan, usage and invoices.</p>
        </div>
        <span data-lucide="credit-card" class="text-primary" width="24" height="24"></span>
      </div>

      <div id="currentCard" class="rounded-xl border bg-card p-6 mb-8 animate-in fade-in">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-muted-foreground">Current plan</p>
            <h2 id="planName" class="text-xl font-semibold mt-1">—</h2>
            <p id="planStatus" class="text-sm text-muted-foreground mt-1"></p>
          </div>
          <div class="text-right">
            <p class="text-xs uppercase tracking-wide text-muted-foreground">Renews</p>
            <p id="renewDate" class="text-sm font-medium mt-1">—</p>
          </div>
        </div>
      </div>

      <h3 class="text-lg font-semibold mb-3">Usage</h3>
      <div id="usageGrid" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10"></div>

      <h3 class="text-lg font-semibold mb-3">Available plans</h3>
      <div id="plansGrid" class="grid md:grid-cols-3 gap-4 mb-10"></div>

      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">Invoices</h3>
      </div>
      <div id="invoices" class="rounded-xl border divide-y"></div>
    </div>`;

  load();
  createIcons();
}

async function load() {
  try {
    const [me, plans, invoices] = await Promise.all([
      fetch(`${API}/tenant/`, { headers: headers() }).then(r => r.json()),
      fetch(`${API}/plans/`).then(r => r.json()),
      fetch(`${API}/invoices/`, { headers: headers() }).then(r => r.json()),
    ]);
    renderCurrent(me);
    renderUsage(me.usage || {});
    renderPlans(plans, me.subscription);
    renderInvoices(invoices);
    createIcons();
  } catch (e) { console.error(e); }
}

function renderCurrent(me) {
  const s = me.subscription;
  document.getElementById("planName").textContent = s?.plan?.name || "No active plan";
  document.getElementById("planStatus").textContent = s ? `Status: ${s.status}` : "Free trial";
  document.getElementById("renewDate").textContent = s?.current_period_end
    ? new Date(s.current_period_end).toLocaleDateString() : "—";
}

function renderUsage(usage) {
  const grid = document.getElementById("usageGrid");
  grid.innerHTML = Object.entries(usage).map(([k, v]) => `
    <div class="rounded-lg border bg-card p-4">
      <p class="text-xs uppercase text-muted-foreground">${k}</p>
      <p class="text-2xl font-bold mt-1">${v}</p>
    </div>`).join("");
}

function renderPlans(plans, sub) {
  const current = sub?.plan?.slug;
  document.getElementById("plansGrid").innerHTML = plans.map(p => `
    <div class="rounded-xl border bg-card p-6 flex flex-col transition hover:shadow-md ${current === p.slug ? "ring-2 ring-primary" : ""}">
      <h4 class="font-semibold text-lg">${p.name}</h4>
      <p class="text-2xl font-bold mt-2">$${p.price}<span class="text-sm text-muted-foreground">/${p.interval}</span></p>
      <ul class="text-sm text-muted-foreground mt-4 space-y-1 flex-1">
        <li>${p.max_users ?? "Unlimited"} users</li>
        <li>${p.max_stores ?? "Unlimited"} stores</li>
        <li>${p.max_products ?? "Unlimited"} products</li>
        <li>${p.trial_days}-day trial</li>
      </ul>
      <button onclick="window.__upgrade('${p.slug}')" class="mt-4 w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 ${current === p.slug ? "opacity-50 pointer-events-none" : ""}">
        ${current === p.slug ? "Current plan" : "Choose " + p.name}
      </button>
    </div>`).join("");
}

function renderInvoices(invoices) {
  const el = document.getElementById("invoices");
  if (!invoices.length) { el.innerHTML = `<p class="p-4 text-sm text-muted-foreground">No invoices yet.</p>`; return; }
  el.innerHTML = invoices.map(i => `
    <div class="flex items-center justify-between p-4">
      <div>
        <p class="font-medium">${i.number}</p>
        <p class="text-xs text-muted-foreground">${new Date(i.created_at).toLocaleDateString()} · ${i.status}</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="font-medium">${i.currency} ${i.amount_due}</span>
        ${i.pdf_url ? `<a href__="${i.pdf_url}" target="_blank" class="text-primary text-sm">Download</a>` : ""}
      </div>
    </div>`).join("");
}

window.__upgrade = async (planSlug) => {
  const r = await fetch(`${API}/subscription/checkout/`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ plan_slug: planSlug })
  }).then(r => r.json());
  if (r.checkout_url) window.location.href = r.checkout_url;
};