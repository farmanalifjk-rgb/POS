import { createIcons } from "lucide";
import { setLanguage, setCurrency } from "../i18n2.js";
const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/i18n2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

export function renderLocalePage(root) {
  root.innerHTML = `
    <div class="p-8 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Language & Currency</h1>
      <div class="rounded-xl border bg-card p-5 mb-6">
        <h3 class="font-semibold mb-3">My preferences</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div><label class="text-xs text-muted-foreground">Language</label><select id="loc_lang" class="block w-full rounded-lg border px-3 py-2 text-sm"></select></div>
          <div><label class="text-xs text-muted-foreground">Display currency</label><select id="loc_cur" class="block w-full rounded-lg border px-3 py-2 text-sm"></select></div>
          <div><label class="text-xs text-muted-foreground">Date format</label><input id="loc_date" class="block w-full rounded-lg border px-3 py-2 text-sm" /></div>
          <div><label class="text-xs text-muted-foreground">Timezone</label><input id="loc_tz" class="block w-full rounded-lg border px-3 py-2 text-sm" /></div>
        </div>
        <button onclick="window.__saveLocale()" class="mt-4 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm">Save preferences</button>
      </div>
      <div class="rounded-xl border bg-card p-5">
        <h3 class="font-semibold mb-3">Currency converter</h3>
        <div class="flex gap-2 items-end">
          <div><input id="cv_amount" value="100" class="block w-28 rounded-lg border px-3 py-2 text-sm" /></div>
          <div><select id="cv_from" class="block rounded-lg border px-3 py-2 text-sm"></select></div>
          <span class="pb-2">→</span>
          <div><select id="cv_to" class="block rounded-lg border px-3 py-2 text-sm"></select></div>
          <button onclick="window.__convert()" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm">Convert</button>
        </div>
        <p id="cv_result" class="mt-3 text-sm font-medium"></p>
      </div>
    </div>`;
  load(); createIcons();
}

async function load() {
  const [currencies, languages, locale] = await Promise.all([
    fetch(`${API}/currencies/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/languages/`, { headers: h() }).then(r => r.json()),
    fetch(`${API}/me/locale/`, { headers: h() }).then(r => r.json()),
  ]);
  const curOpts = (currencies || []).map(c => `<option value="${c.code}">${c.code} — ${c.name} (${c.symbol})</option>`).join("");
  const langOpts = (languages || []).map(l => `<option value="${l.code}">${l.name} (${l.direction})</option>`).join("");
  document.getElementById("loc_lang").innerHTML = langOpts;
  document.getElementById("loc_cur").innerHTML = curOpts;
  document.getElementById("cv_from").innerHTML = curOpts;
  document.getElementById("cv_to").innerHTML = curOpts;
  if (locale && Object.keys(locale).length) {
    if (locale.language) document.getElementById("loc_lang").value = locale.language;
    if (locale.currency) document.getElementById("loc_cur").value = locale.currency;
    document.getElementById("loc_date").value = locale.date_format || "YYYY-MM-DD";
    document.getElementById("loc_tz").value = locale.timezone || "UTC";
  }
}

window.__saveLocale = async () => {
  const langId = await fetch(`${API}/languages/`, { headers: h() }).then(r => r.json())
    .then(list => list.find(l => l.code === document.getElementById("loc_lang").value)?.id);
  const curId = await fetch(`${API}/currencies/`, { headers: h() }).then(r => r.json())
    .then(list => list.find(c => c.code === document.getElementById("loc_cur").value)?.id);
  await fetch(`${API}/me/locale/`, { method: "PUT", headers: h(),
    body: JSON.stringify({ language: langId, currency: curId,
                           date_format: document.getElementById("loc_date").value,
                           timezone: document.getElementById("loc_tz").value }) });
  setLanguage(document.getElementById("loc_lang").value);
  setCurrency(document.getElementById("loc_cur").value);
  alert("Saved");
};

window.__convert = async () => {
  const amt = document.getElementById("cv_amount").value;
  const from = document.getElementById("cv_from").value;
  const to = document.getElementById("cv_to").value;
  const res = await fetch(`${API}/convert/?amount=${amt}&from=${from}&to=${to}`, { headers: h() }).then(r => r.json());
  document.getElementById("cv_result").innerText = `${amt} ${from} = ${res.formatted}`;
};