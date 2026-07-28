import { Sidebar } from "../../../components/Sidebar.js";
import { CartPanel } from "../../../components/CartPanel.js";

export function POSPage() {
  return `
    <div class="flex h-screen bg-gray-50 overflow-hidden">

      ${Sidebar()}

      <main class="flex-1 flex flex-col min-w-0 p-6 overflow-hidden">



        <!-- Search -->
        <div class="flex items-center gap-3 mb-4 shrink-0">

          <div class="flex gap-2  relative">
            <i
              data-lucide="search"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>

            <input
              id="product-search"
              type="text"
              placeholder="Search products or scan barcode..."
              oninput="searchProducts()"
              class="w-72 h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-lime-400"
            >
            <button
              onclick="createOrder()"
              class="w-10 h-10 shrink-0 self-center bg-lime-400 rounded-2xl flex items-center justify-center hover:bg-lime-500 transition"
              title="New Draft Order"
            >
              <i data-lucide="plus"></i>
            </button>
          </div>


                  <!-- Order tabs -->
        <div
          id="order-tabs"
          class="flex items-center gap-2 overflow-x-auto px-2 rounded-full"
        ></div>

        </div>



        <!-- Categories -->
        <div
          id="category-bar"
          class="flex items-center gap-3 mb-4 overflow-x-auto shrink-0 px-2 rounded-full"
        ></div>

        <!-- Products -->
        <div
          id="product-grid"
          class="grid grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6 flex-1 min-h-0 p-2"
        ></div>

      </main>

      ${CartPanel()}

      <div id="notification" class="hidden"></div>

      <!-- Session Modal -->
      <div
        id="session-modal"
        class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div class="w-[460px] bg-white rounded-3xl p-7 shadow-2xl">

          <div class="w-14 h-14 bg-lime-400 rounded-2xl flex items-center justify-center mb-5">
            <i data-lucide="banknote" class="w-7 h-7"></i>
          </div>

          <h2 class="text-2xl font-bold text-gray-900">
            Start POS Session
          </h2>

          <p class="text-gray-500 mt-2">
            Enter the employee and opening cash to start selling.
          </p>

          <div class="mt-7">
            <label class="text-sm font-semibold text-gray-700">
              Employee Name
            </label>

            <div class="relative mt-2">
              <i
                data-lucide="user"
                class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              ></i>

              <input
                id="session-employee-name"
                type="text"
                placeholder="Enter employee name"
                class="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-lime-400"
              >
            </div>
          </div>

          <div class="mt-5">
            <label class="text-sm font-semibold text-gray-700">
              Opening Cash
            </label>

            <div class="relative mt-2">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                Rs
              </span>

              <input
                id="session-opening-cash"
                type="number"
                min="0"
                value="0"
                class="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-lime-400"
              >
            </div>
          </div>

          <button
            onclick="startPOSSession()"
            class="mt-7 w-full bg-lime-400 hover:bg-lime-500 rounded-2xl py-4 font-semibold flex items-center justify-center gap-3 transition"
          >
            Start Session
            <i data-lucide="arrow-right" class="w-5 h-5"></i>
          </button>

        </div>
      </div>

      <!-- Payment Modal -->
      <div
        id="payment-modal"
        class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div class="w-[420px] bg-white rounded-3xl p-7 shadow-2xl">

          <h2 class="text-2xl font-bold text-gray-900">
            Payment
          </h2>

          <p class="text-gray-500 mt-1">
            Complete the sale
          </p>

          <div class="mt-6 p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
            <span class="text-slate-600">Total Due</span>
            <span id="payment-total" class="text-xl font-bold text-slate-900">Rs 0.00</span>
          </div>

          <div class="mt-5">
            <label class="text-sm font-semibold text-gray-700">Payment Method</label>
            <select
              id="payment-method-modal"
              class="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div class="mt-5">
            <label class="text-sm font-semibold text-gray-700">Amount Received</label>
            <input
              id="amount-received"
              type="number"
              min="0"
              step="0.01"
              oninput="calculateChange()"
              class="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
            >
          </div>

          <div class="mt-4 flex justify-between text-sm">
            <span class="text-slate-600">Change</span>
            <span id="change-amount" class="font-semibold text-slate-900">Rs 0.00</span>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              onclick="closePaymentModal()"
              class="flex-1 border border-slate-200 rounded-2xl py-3 font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              onclick="confirmPayment()"
              class="flex-1 bg-lime-400 hover:bg-lime-500 rounded-2xl py-3 font-semibold transition"
            >
              Confirm Payment
            </button>
          </div>

        </div>
      </div>

      <!-- Customer Modal -->
      <div
        id="customer-modal"
        class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div class="w-[400px] bg-white rounded-3xl p-7 shadow-2xl">

          <h2 class="text-xl font-bold text-gray-900">
            New Customer
          </h2>

          <div class="mt-5">
            <label class="text-sm font-semibold text-gray-700">Name</label>
            <input
              id="customer-name"
              type="text"
              placeholder="Customer name"
              class="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
            >
          </div>

          <div class="mt-4">
            <label class="text-sm font-semibold text-gray-700">Phone</label>
            <input
              id="customer-phone"
              type="text"
              placeholder="Phone number"
              class="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400"
            >
          </div>

          <div class="mt-6 flex gap-3">
            <button
              onclick="closeCustomerModal()"
              class="flex-1 border border-slate-200 rounded-2xl py-3 font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              onclick="createCustomer()"
              class="flex-1 bg-lime-400 hover:bg-lime-500 rounded-2xl py-3 font-semibold transition"
            >
              Save Customer
            </button>
          </div>

        </div>
      </div>

    </div>
  `;
}
