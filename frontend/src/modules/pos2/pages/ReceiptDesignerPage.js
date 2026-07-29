import { createIcons } from "lucide";
const API = "http://127.0.0.1:8000/api/pos2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

let templates = [];

export function renderReceiptDesignerPage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
      <div>
        <h1 class="text-2xl font-bold mb-1">Receipt Designer</h1>
        <p class="text-sm text-muted-foreground mb-6">Customize header, footer and columns.</p>
        <div class="space-y-3">
          <input id="r_name" placeholder="Template name" class="w-full rounded-lg border px-3 py-2 text-sm" />
          <textarea id="r_header" placeholder="Header text" class="w-full rounded-lg border px-3 py-2 text-sm" rows="3"></textarea>
          <textarea id="r_footer" placeholder="Footer text" class="w-full rounded-lg border px-3 py-2 text-sm" rows="3"></textarea>
          <div class="flex flex-wrap gap-4 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" id="r_logo"/> Logo</label>
            <label class="flex items-center gap-2"><input type="checkbox" id="r_qr"/> QR</label>
            <label class="flex items-center gap-2"><input type="checkbox" id="r_tax"/> Tax breakdown</label>
            <label class="flex items-center gap-2"><input type="checkbox" id="r_cashier"/> Cashier</label>
          </div>
          <input id="r_accent" type="color" class="h-10 w-20 rounded border" />
          <button onclick="window.__saveTpl()" class="w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium">Save template</button>
        </div>
        <div id="list" class="mt-6 space-y-2"></div>
      </div>
      <div>
        <h3 class="font-semibold mb-3">Preview</h3>
        <div class="rounded-lg border bg-white p-6 font-mono text-xs leading-relaxed" style="width:80mm;max-width:100%">
          <div id="preview"></div>
        </div>
      </div>
    </div>`;
  load(); createIcons();
  ["r_header","r_footer"].forEach(id => document.getElementById(id).addEventListener("input", renderPreview));
  document.getElementById("r_logo").addEventListener("change", renderPreview);
  renderPreview();
}

function renderPreview() {
  const h = document.getElementById("r_header").value || "My Store\\n123 Main St";
  const f = document.getElementById("r_footer").value || "Thank you!";
  document.getElementById("preview").innerHTML =
    `${h.replace(/\\n/g,"<br>")}<hr class="my-2"/>Item 1  x1  $10.00<br/>Item 2  x2  $20.00<hr class="my-2"/>Total: $30.00<br/><br/>${f.replace(/\\n/g,"<br>")}`;
}

async function load() {
  templates = await fetch(`${API}/receipt-templates/`, { headers: h() }).then(r => r.json());
  document.getElementById("list").innerHTML = templates.map(t => `
    <div class="flex items-center justify-between rounded-lg border px-3 py-2">
      <span class="text-sm font-medium">${t.name}${t.is_default ? " · default" : ""}</span>
      <button onclick="window.__delTpl(${t.id})" class="text-xs text-destructive">Delete</button>
    </div>`).join("");
}

window.__saveTpl = async () => {
  const body = {
    name: document.getElementById("r_name").value || "Template",
    header: document.getElementById("r_header").value,
    footer: document.getElementById("r_footer").value,
    show_logo: document.getElementById("r_logo").checked,
    show_qr: document.getElementById("r_qr").checked,
    show_tax_breakdown: document.getElementById("r_tax").checked,
    show_cashier: document.getElementById("r_cashier").checked,
    accent_color: document.getElementById("r_accent").value || "#111827",
  };
  await fetch(`${API}/receipt-templates/`, { method: "POST", headers: h(), body: JSON.stringify(body) });
  load();
};

window.__delTpl = async (id) => {
  await fetch(`${API}/receipt-templates/${id}/`, { method: "DELETE", headers: h() });
  load();
};