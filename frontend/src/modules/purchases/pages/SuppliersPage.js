import { Sidebar } from "../../../components/Sidebar.js";

export function SuppliersPage() {
  return `
<div class="flex h-screen bg-[#f1f2f0] overflow-hidden">
  ${Sidebar()}
  <main class="flex-1 h-screen min-h-0 overflow-hidden p-6">
    <div class="bg-white h-full rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">

      <!-- Toolbar -->
      <div class="shrink-0 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="truck" class="w-5 h-5 text-indigo-600"></i> Suppliers
          </h1>
          <p class="text-sm text-slate-400 mt-0.5" id="supplier-count">Loading...</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            <input id="supplier-search" type="text" placeholder="Search suppliers..."
              class="h-10 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 w-60"
              oninput="window.filterSuppliers()" />
          </div>
          <button onclick="window.openAddSupplier()"
            class="h-10 px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Supplier
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">City</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody id="supplier-table-body" class="divide-y divide-slate-50">
            <tr><td colspan="7" class="px-6 py-12 text-center text-slate-400">
              <div class="inline-block w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
              <p>Loading suppliers...</p>
            </td></tr>
          </tbody>
        </table>
      </div>

    </div>
  </main>
</div>

<!-- Add/Edit Supplier Modal -->
<div id="supplier-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <h2 id="supplier-modal-title" class="font-semibold text-slate-900">Add Supplier</h2>
      <button onclick="window.closeSupplierModal()" class="text-slate-400 hover:text-slate-700">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div class="p-6 space-y-4">
      <input type="hidden" id="supplier-modal-id" />
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
          <input id="sm-name" type="text" placeholder="Supplier Company Ltd."
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
          <input id="sm-contact-person" type="text" placeholder="John Smith"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input id="sm-phone" type="text" placeholder="03xxxxxxxxx"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input id="sm-email" type="email" placeholder="supplier@example.com"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">City</label>
          <input id="sm-city" type="text" placeholder="Karachi"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">Address</label>
          <input id="sm-address" type="text" placeholder="Street address"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Tax / NTN Number</label>
          <input id="sm-tax-number" type="text" placeholder="NTN-XXXXXXX"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Payment Terms (days)</label>
          <input id="sm-payment-terms" type="number" min="0" placeholder="30"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea id="sm-notes" rows="2" placeholder="Additional notes..."
            class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none"></textarea>
        </div>
      </div>
    </div>
    <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
      <button onclick="window.closeSupplierModal()" class="h-10 px-5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Cancel</button>
      <button onclick="window.saveSupplier()" class="h-10 px-5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">Save</button>
    </div>
  </div>
</div>

<!-- Supplier Statement Slide-over -->
<div id="supplier-statement-panel" class="hidden fixed inset-0 bg-black/50 z-50 justify-end">
  <div class="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl">
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
      <div>
        <h2 id="sup-statement-name" class="text-lg font-bold text-slate-900">Supplier Statement</h2>
        <p id="sup-statement-phone" class="text-sm text-slate-500"></p>
      </div>
      <button onclick="window.closeSupplierStatement()" class="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <!-- Summary -->
    <div class="grid grid-cols-3 gap-3 p-5 border-b border-slate-100 bg-slate-50">
      <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-center">
        <p class="text-xs text-slate-500 font-medium">Total Purchased</p>
        <p id="sup-stmt-total" class="text-lg font-bold text-slate-800 mt-1">-</p>
      </div>
      <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-center">
        <p class="text-xs text-slate-500 font-medium">Total Paid</p>
        <p id="sup-stmt-paid" class="text-lg font-bold text-emerald-600 mt-1">-</p>
      </div>
      <div class="bg-red-50 rounded-xl p-3 shadow-sm border border-red-100 text-center">
        <p class="text-xs text-red-500 font-medium">Outstanding</p>
        <p id="sup-stmt-outstanding" class="text-lg font-bold text-red-600 mt-1">-</p>
      </div>
    </div>
    <!-- Tabs -->
    <div class="flex border-b border-slate-100 px-5 pt-4 gap-4">
      <button id="sup-tab-pos" onclick="window.switchSupplierTab('pos')"
        class="pb-3 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 transition">Purchase Orders</button>
      <button id="sup-tab-payments" onclick="window.switchSupplierTab('payments')"
        class="pb-3 text-sm font-semibold text-slate-400 hover:text-slate-700 border-b-2 border-transparent transition">Payment History</button>
    </div>
    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-5">
      <div id="sup-statement-content" class="space-y-2">
        <div class="text-center py-8 text-slate-400 text-sm">Loading...</div>
      </div>
    </div>
  </div>
</div>
`;
}
