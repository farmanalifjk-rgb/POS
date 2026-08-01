const API = "import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"/i18n2";
const h = () => ({ "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` });

let _cache = {};
let _lang = localStorage.getItem("pos_lang") || "en";
let _currency = localStorage.getItem("pos_currency") || "USD";

export function setLanguage(code) { _lang = code; localStorage.setItem("pos_lang", code); }
export function setCurrency(code) { _currency = code; localStorage.setItem("pos_currency", code); }
export function getCurrency() { return _currency; }

export async function loadTranslations(namespace = "common", keys = []) {
  if (!keys.length) return;
  const res = await fetch(`${API}/translations/batch/`, {
    method: "POST", headers: h(),
    body: JSON.stringify({ language: _lang, namespace, keys }),
  }).then(r => r.json()).catch(() => ({}));
  _cache = { ..._cache, ...res };
}

export function t(key) { return _cache[key] || key; }

export async function convertCurrency(amount, fromCode, toCode) {
  const res = await fetch(`${API}/convert/?amount=${amount}&from=${fromCode}&to=${toCode}`, { headers: h() })
    .then(r => r.json()).catch(() => ({ amount: amount }));
  return res.amount;
}

export function formatMoney(amount, currency = _currency) {
  const symbols = { USD: "$", EUR: "€", GBP: "£", PKR: "Rs ", AED: "AED " };
  const sym = symbols[currency] || "";
  const num = parseFloat(amount || 0);
  return `${sym}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}