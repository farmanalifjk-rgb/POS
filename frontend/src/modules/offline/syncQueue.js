const QUEUE_KEY = "pos_offline_queue";

export function getQueue() {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
}

export function enqueue(operation) {
  // operation = { id, url, method, body, label }
  const queue = getQueue();
  queue.push({ ...operation, queued_at: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return operation.id;
}

export function removeFromQueue(id) {
  const queue = getQueue().filter((op) => op.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function flushQueue() {
  const queue = getQueue();
  const failed = [];
  for (const op of queue) {
    try {
      const res = await fetch(op.url, {
        method: op.method,
        headers: { "Content-Type": "application/json", Authorization: `Token ${localStorage.getItem("pos_token")}` },
        body: JSON.stringify(op.body),
      });
      if (res.ok) {
        removeFromQueue(op.id);
      } else {
        failed.push(op);
      }
    } catch (e) {
      failed.push(op);
    }
  }
  return { flushed: queue.length - failed.length, remaining: failed.length };
}

// Auto-flush when connectivity returns
window.addEventListener("online", () => { flushQueue(); });