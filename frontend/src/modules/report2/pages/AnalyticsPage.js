import { createIcons } from "lucide";
const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/reports2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderAnalyticsPage(root) {
    const days = 30;
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
    const qs = `?start=${start}&end=${end}`;
    root.innerHTML = `
    <div class="p-8 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Sales Analytics</h1>
      <div id="kpis" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"></div>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="rounded-xl border bg-card p-5"><h3 class="font-semibold mb-3">Top products</h3><div id="top"></div></div>
        <div class="rounded-xl border bg-card p-5"><h3 class="font-semibold mb-3">Sales by category</h3><div id="cat"></div></div>
        <div class="rounded-xl border bg-card p-5"><h3 class="font-semibold mb-3">Sales by payment method</h3><div id="pay"></div></div>
        <div class="rounded-xl border bg-card p-5"><h3 class="font-semibold mb-3">Daily sales</h3><div id="day" class="space-y-1 max-h-72 overflow-auto"></div></div>
      </div>
    </div>`;
    Promise.all([
        fetch(`${API}/sales-summary/${qs}`, { headers: h() }).then(r => r.json()),
        fetch(`${API}/profit-margin/${qs}`, { headers: h() }).then(r => r.json()),
        fetch(`${API}/top-products/${qs}&limit=5`, { headers: h() }).then(r => r.json()),
        fetch(`${API}/sales-by-category/${qs}`, { headers: h() }).then(r => r.json()),
        fetch(`${API}/sales-by-payment/${qs}`, { headers: h() }).then(r => r.json()),
        fetch(`${API}/sales-by-day/${qs}`, { headers: h() }).then(r => r.json()),
    ]).then(([s, p, top, cat, pay, day]) => {
        document.getElementById("kpis").innerHTML = `
      ${kpi("Net sales", "$" + s.net_sales, "dollar-sign")}
      ${kpi("Gross profit", "$" + p.gross_profit, "trending-up")}
      ${kpi("Margin", p.margin_percent + "%", "percent")}
      ${kpi("Orders", s.order_count, "shopping-bag")}`;
        document.getElementById("top").innerHTML = (top.length ? top : []).map((t, i) => `
      <div class="flex items-center justify-between py-1 text-sm"><span>${i + 1}. ${t.name}</span><span class="font-medium">$${t.revenue}</span></div>`).join("") || `<p class="text-xs text-muted-foreground">No data.</p>`;
        document.getElementById("cat").innerHTML = (cat.length ? cat : []).map(c => `
      <div class="flex items-center justify-between py-1 text-sm"><span>${c.category}</span><span class="font-medium">$${c.revenue}</span></div>`).join("") || `<p class="text-xs text-muted-foreground">No data.</p>`;
        document.getElementById("pay").innerHTML = (pay.length ? pay : []).map(p => `
      <div class="flex items-center justify-between py-1 text-sm"><span class="capitalize">${p.method}</span><span class="font-medium">$${p.total}</span></div>`).join("") || `<p class="text-xs text-muted-foreground">No data.</p>`;
        document.getElementById("day").innerHTML = (day.length ? day : []).map(d => `
      <div class="flex items-center justify-between text-xs"><span>${d.date}</span><span class="font-medium">$${d.total} (${d.count})</span></div>`).join("") || `<p class="text-xs text-muted-foreground">No data.</p>`;
    });
    createIcons();
}

function kpi(label, value, icon) {
    return `<div class="rounded-xl border bg-card p-4">
    <div class="flex items-center justify-between"><span class="text-xs text-muted-foreground">${label}</span><i data-lucide="${icon}" width="16" height="16"></i></div>
    <p class="text-xl font-bold mt-1">${value}</p></div>`;
}