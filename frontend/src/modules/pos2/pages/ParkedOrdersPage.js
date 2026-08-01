import { createIcons } from "lucide";
const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/pos2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderParkedOrdersPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold mb-1">Parked / Held Orders</h1>
      <p class="text-sm text-muted-foreground mb-6">Resume held carts and layaways.</p>
      <div id="list" class="grid md:grid-cols-3 gap-4"></div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const data = await fetch(`${API}/park/`, { headers: h() }).then(r => r.json());
  document.getElementById("list").innerHTML = (data.length ? data : []).map(p => `
    <div class="rounded-xl border bg-card p-4 transition hover:shadow-md">
      <div class="flex items-center justify-between">
        <span class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">Parked</span>
        <i data-lucide="pause-circle" class="text-muted-foreground" width="18" height="18"></i>
      </div>
      <h3 class="font-semibold mt-2">${p.label || "Held cart #" + p.id}</h3>
      <p class="text-xs text-muted-foreground mt-1">${new Date(p.parked_at).toLocaleString()}</p>
      <button onclick="window.__resume(${p.id})" class="mt-3 w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90">Resume</button>
    </div>`).join("") || `<p class="text-muted-foreground col-span-full">No parked orders.</p>`;
}

window.__resume = async (id) => {
  await fetch(`${API}/park/${id}/resume/`, { method: "POST", headers: h() });
  load();
};