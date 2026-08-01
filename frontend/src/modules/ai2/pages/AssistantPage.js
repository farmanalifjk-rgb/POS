import { createIcons } from "lucide";
const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/ai2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderAssistantPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-1">AI Assistant</h1>
      <p class="text-sm text-muted-foreground mb-6">Ask about sales, revenue, stock, or generate reorder suggestions.</p>
      <div class="rounded-xl border bg-card p-4 mb-6">
        <div class="flex gap-2">
          <input id="q" placeholder="e.g. What were our top products this week?" class="flex-1 rounded-lg border px-3 py-2 text-sm" />
          <button onclick="window.__ask()" id="askBtn" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Ask</button>
        </div>
        <div class="flex gap-2 mt-3 flex-wrap">
          ${["What's my net sales this month?", "Which products are low on stock?", "What's my profit margin?", "Generate a daily summary"].map(q =>
            `<button onclick="window.__quick('${q.replace(/'/g, "\\'")}')" class="text-xs rounded-full border px-3 py-1 hover:bg-muted">${q}</button>`).join("")}
        </div>
      </div>
      <div id="answer" class="hidden rounded-xl border bg-card p-4 mb-6">
        <div class="flex items-start gap-2"><i data-lucide="sparkles" width="16" height="16" class="mt-0.5 text-primary"></i><p id="answerText" class="text-sm whitespace-pre-wrap"></p></div>
      </div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold">Smart reorder suggestions</h2>
        <button onclick="window.__genReorder()" class="rounded-lg border px-3 py-1.5 text-sm">Generate</button>
      </div>
      <div id="reorder" class="space-y-2"></div>
    </div>`;
  loadReorder(); createIcons();
}

async function loadReorder() {
  const data = await fetch(`${API}/reorder/?status=pending`, { headers: h() }).then(r => r.json());
  document.getElementById("reorder").innerHTML = (data.length ? data : []).map(s => `
    <div class="rounded-lg border p-3 flex items-center justify-between">
      <div><p class="font-medium text-sm">${s.product_name}</p>
      <p class="text-xs text-muted-foreground">Stock: ${s.current_stock} · Suggest: ${s.suggested_qty} · ${s.avg_daily_sales}/day · ${Math.round(s.confidence * 100)}% confidence</p>
      <p class="text-xs text-muted-foreground mt-1">${s.rationale}</p></div>
      <div class="flex gap-1">
        <button onclick="window.__reorderAction(${s.id}, 'approved')" class="text-xs rounded border px-2 py-1 text-emerald-600">Approve</button>
        <button onclick="window.__reorderAction(${s.id}, 'rejected')" class="text-xs rounded border px-2 py-1 text-destructive">Reject</button>
      </div>
    </div>`).join("") || `<p class="text-muted-foreground">No pending suggestions. Click "Generate".</p>`;
}

window.__ask = async () => {
  const q = document.getElementById("q").value.trim();
  if (!q) return;
  const btn = document.getElementById("askBtn"); btn.disabled = true; btn.innerText = "…";
  const res = await fetch(`${API}/ask/`, { method: "POST", headers: h(),
    body: JSON.stringify({ question: q }) }).then(r => r.json());
  document.getElementById("answer").classList.remove("hidden");
  document.getElementById("answerText").innerText = res.answer;
  btn.disabled = false; btn.innerText = "Ask";
  createIcons();
};
window.__quick = (q) => { document.getElementById("q").value = q; window.__ask(); };
window.__genReorder = async () => {
  const res = await fetch(`${API}/reorder/generate/`, { method: "POST", headers: h() }).then(r => r.json());
  alert(`Generated ${res.generated} suggestions.`);
  loadReorder();
};
window.__reorderAction = async (id, status) => {
  await fetch(`${API}/reorder/${id}/`, { method: "PATCH", headers: h(), body: JSON.stringify({ status }) });
  loadReorder();
};