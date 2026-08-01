import { createIcons } from "lucide";
import { getQueue, flushQueue, removeFromQueue } from "../syncQueue";

export function renderSyncQueuePage(root) {
  render(root);
  window.addEventListener("online", () => render(root));
  createIcons();
}

function render(root) {
  const queue = getQueue();
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;
  root.innerHTML = `
    <div class="p-8 max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold">Offline Sync Queue</h1><p class="text-sm text-muted-foreground">Pending mutations queued while offline.</p></div>
        <div class="flex items-center gap-3">
          <span class="text-xs px-2 py-1 rounded ${online ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${online ? '● Online' : '● Offline'}</span>
          <button onclick="window.__flush()" ${!online ? 'disabled' : ''} class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-40">Sync now</button>
        </div>
      </div>
      <div id="queue" class="space-y-2"></div>
    </div>`;
  document.getElementById("queue").innerHTML = (queue.length ? queue : []).map(op => `
    <div class="rounded-lg border p-3 flex items-center justify-between">
      <div><p class="font-medium text-sm">${op.label || op.method + ' ' + op.url}</p>
      <p class="text-xs text-muted-foreground">Queued ${new Date(op.queued_at).toLocaleString()}</p></div>
      <button onclick="window.__drop('${op.id}')" class="text-xs text-destructive">Discard</button>
    </div>`).join("") || `<p class="text-muted-foreground">Queue is empty. 🎉</p>`;
  createIcons();
}

window.__flush = async () => {
  const res = await flushQueue();
  alert(`Synced ${res.flushed} operations. ${res.remaining} remaining.`);
  document.querySelector("#root")._rerender?.();
  location.reload();
};
window.__drop = (id) => { removeFromQueue(id); location.reload(); };
