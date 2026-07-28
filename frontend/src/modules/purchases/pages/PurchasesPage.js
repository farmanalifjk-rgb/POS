import { Sidebar } from "../../../components/Sidebar.js";

export function PurchasesPage() {
  return `
<div class="flex h-screen bg-[#f1f2f0] overflow-hidden">
  ${Sidebar()}
  <main class="flex-1 h-screen min-h-0 overflow-hidden p-6">
    <div class="bg-white h-full rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">

      <!-- Toolbar -->
      <div class="shrink-0 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="clipboard-list" class="w-5 h-5 text-indigo-600"></i> Purchase Orders
          </h1>
          <p class="text-sm text-slate-400 mt-0.5" id="purchase-count">Loading…</p>
        </div>
        <div class="flex items-center gap-2">
          <select id="purchase-status-filter" onchange="window.loadPurchases()"
            class="h-10 px-3 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="partially_received">Partial</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            <input id="purchase-search" type="text" placeholder="Order number…"
              class="h-10 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 w-52"
              oninput="window.filterPurchases()" />
          </div>
          <button onclick="window.openCreatePurchase()"
            class="h-10 px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition">
            <i data-lucide="plus" class="w-4 h-4"></i> New Order
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order #</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Supplier</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Items</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody id="purchase-table-body" class="divide-y divide-slate-50">
            <tr><td colspan="7" class="px-6 py-12 text-center text-slate-400">
              <div class="inline-block w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
              <p>Loading purchase orders…</p>
            </td></tr>
          </tbody>
        </table>
      </div>

    </div>
  </main>
</div>

<!-- Create Purchase Order Modal -->
<div id="purchase-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
      <h2 class="font-semibold text-slate-900">New Purchase Order</h2>
      <button onclick="window.closePurchaseModal()" class="text-slate-400 hover:text-slate-700">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div class="p-6 overflow-y-auto space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
          <select id="po-supplier" class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">Select supplier…</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Supplier Invoice #</label>
          <input id="po-invoice-number" type="text" placeholder="INV-001"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">Note</label>
          <input id="po-note" type="text" placeholder="Optional note…"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
      </div>

      <!-- Line items -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold text-slate-700">Items</p>
          <button onclick="window.addPOItem()" class="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Item
          </button>
        </div>
        <div id="po-items" class="space-y-2">
          <!-- Items added dynamically -->
        </div>
        <div class="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm font-semibold">
          <span class="text-slate-600">Total</span>
          <span id="po-total" class="text-slate-900">Rs. 0.00</span>
        </div>
      </div>
    </div>
    <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
      <button onclick="window.closePurchaseModal()" class="h-10 px-5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Cancel</button>
      <button onclick="window.submitPurchaseOrder()" class="h-10 px-5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">Create Order</button>
    </div>
  </div>
</div>

<!-- Purchase Detail Modal -->
<div id="purchase-detail-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
      <h2 id="pd-title" class="font-semibold text-slate-900">Purchase Order Detail</h2>
      <button onclick="window.closePurchaseDetailModal()" class="text-slate-400 hover:text-slate-700">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div id="pd-body" class="p-6 overflow-y-auto flex-1 text-sm"></div>
    <div id="pd-footer" class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0"></div>
  </div>
</div>
`;
}
