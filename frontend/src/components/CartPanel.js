export function CartPanel() {
    return `
        <aside class="w-[420px] shrink-0 h-screen bg-white border-l border-slate-200 p-4 flex flex-col rounded-l-3xl">

            <div class="flex items-center justify-between pb-3 border-b border-slate-200">

                <h2 class="text-xl font-bold text-slate-900">
                    Cart
                </h2>

                <button
                    onclick="createOrder()"
                    class="flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1.5 text-sm hover:bg-slate-50"
                    title="New draft order"
                >
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    New
                </button>

            </div>

            <!-- Cart items -->
            <div
                id="cart"
                class="flex-1 overflow-y-auto py-4 space-y-3 min-h-0"
            ></div>



            <!-- Hidden payment method fallback for checkout -->
            <select id="payment_method" class="hidden">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
            </select>

            <!-- Summary -->
            <div class="mt-3 pt-3 border-t border-slate-200 space-y-2 text-sm">
                <div class="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>Rs <span id="subtotal">0.00</span></span>
                </div>
                <div class="flex justify-between text-slate-600">
                    <span>Tax (18%)</span>
                    <span>Rs <span id="tax">0.00</span></span>
                </div>
                <div class="flex justify-between text-lg font-bold text-slate-900">
                    <span>Total</span>
                    <span>Rs <span id="total">0.00</span></span>
                </div>
            </div>

            <button
                onclick="openPaymentModal()"
                class="mt-4 w-full bg-lime-400 hover:bg-lime-500 rounded-2xl py-2 font-semibold flex items-center justify-center gap-3 transition"
            >
                Continue
                <i data-lucide="arrow-right" class="w-5 h-5"></i>
            </button>

        </aside>
    `;
}
