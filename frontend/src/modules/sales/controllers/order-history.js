import { createIcons, icons } from "lucide";
import { loadDropdown,initializeDropdown } from "../../../shared/DropDown";
import { ViewOptions,renderViewOptions,initializeViewOptions,updateToolbarFilters } from "../../../shared/ViewOptions";
window.initializeOrderHistory = async function () {

    renderViewOptions();
    initializeViewOptions();
    updateToolbarFilters();

  const searchInput = document.getElementById("search-input");
  const paymentFilter = document.getElementById("payment-filter");
  const customerFilter = document.getElementById("customer-filter");
  const dateFilter = document.getElementById("date-filter");
  const sessionFilter = document.getElementById("session-filter");


  const nextPage = document.getElementById("next-page");
  const prevPage = document.getElementById("prev-page");

  searchInput?.addEventListener("input", () => {
    currentPage = 1;
    performSearch();
  });

  paymentFilter?.addEventListener("change", () => {
    currentPage = 1;
    performSearch();
  });

  customerFilter?.addEventListener("change", () => {
    currentPage = 1;
    performSearch();
  });

  dateFilter?.addEventListener("change", () => {
    currentPage = 1;
    performSearch();
  });

  sessionFilter?.addEventListener("change", () => {
    currentPage = 1;
    performSearch();
  });

  nextPage?.addEventListener("click", () => {
    if (!hasNext) return;

    currentPage++;
    performSearch();
  });

  prevPage?.addEventListener("click", () => {
    if (!hasPrevious) return;

    currentPage--;
    performSearch();
  });


  // Calling Customer DropDownList

initializeDropdown({
    buttonId: "customer-filter-button",
    menuId: "customer-filter-menu",
    optionsId: "customer-filter-options",
    labelId: "customer-filter-label",
    chevronId: "customer-chevron",

    dataKey: "customer-id",

    onChange: (value) => {

        currentCustomer = value;
        currentPage = 1;

        performSearch();
    },
});

await loadDropdown({
    api: "customers",
    containerId: "customer-filter-options",
    valueField: "id",
    labelField: "name",
    label: "",
    icon: "user",
    firstLabel: "All Customers",
    dataKey: "customer-id"
});

initializeDropdown({
    buttonId: "session-filter-button",
    menuId: "session-filter-menu",
    optionsId: "session-filter-options",
    labelId: "session-filter-label",
    chevronId: "session-chevron",

    dataKey: "session-id",

    onChange: (value) => {

        currentSession = value;
        currentPage = 1;

        performSearch();
    },
});

await loadDropdown({
    api: "cash-sessions",
    containerId: "session-filter-options",
    valueField: "id",
    labelField: "id",
    label: "Session# ",
    icon: "monitor",
    firstLabel: "All Sessions",
    dataKey: "session-id"
});
await loadOrderStats();

applySidebarOrderFilter();

};


let barcode = "";
let barcodeTimer = null;
let currentStatus = "";
let currentView = "orders";
let currentPage = 1;
let totalPages = 1;
let hasNext = false;
let hasPrevious = false;
let currentSession = "";
let currentCustomer = "";

function getStatusBadge(status) {
  const badges = {
    draft: {
      text: "Draft",
      class: "bg-gray-100 text-gray-700",
    },

    paid: {
      text: "Completed",
      class: "bg-green-100 text-green-700",
    },

    partially_refunded: {
      text: "Partial Refund",
      class: "bg-orange-100 text-orange-700",
    },

    refunded: {
      text: "Refunded",
      class: "bg-red-100 text-red-700",
    },

    cancelled: {
      text: "Cancelled",
      class: "bg-red-100 text-red-700",
    },
  };

  const badge = badges[status];

  return `
        <span class="${badge.class} px-3 py-1 rounded-lg font-medium">
            ${badge.text}
        </span>
    `;
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (barcode.length > 0) {
      document.getElementById("search-input").value = barcode;

      currentPage = 1;

      performSearch();

      barcode = "";
    }

    return;
  }

  if (event.key.length === 1) {
    barcode += event.key;

    clearTimeout(barcodeTimer);

    barcodeTimer = setTimeout(() => {
      barcode = "";
    }, 100);
  }
});

async function loadOrders() {
  currentView = "orders";

  setTableHeader([
    "Order No",
    "Customer",
    "Total",
    "Payment",
    "Date",
    "Actions",
  ]);

  const search = document.getElementById("search-input").value;
  const payment = document.getElementById("payment-filter").value;
  const date = document.getElementById("date-filter").value;
  const customer = currentCustomer;
  const session = currentSession;

  const params = new URLSearchParams();

  params.append("page", currentPage);

  if (search) params.append("search", search);

  if (payment) params.append("payment", payment);

  if (customer) params.append("customer", customer);

  if (date) params.append("date", date);

  if (session) params.append("session", session);

  if (currentStatus) params.append("status", currentStatus);

  const url = `http://127.0.0.1:8000/api/order-history/?${params.toString()}`;

  const response = await fetch(url);

  const data = await response.json();

  const orders = data.results;

  totalPages = Math.ceil(data.count / 20);

  hasNext = data.next !== null;

  hasPrevious = data.previous !== null;

  const searchText = document.getElementById("search-input").value.trim();

  if (
    searchText &&
    orders.length === 1 &&
    orders[0].order_number === searchText
  ) {
    viewOrder(orders[0].id, orders[0].record_type);
  }

  const table = document.getElementById("orders-table");

  table.innerHTML = "";

  table.innerHTML = orders
  .map((order) => {

    const customerName =
      order.customer_name || "Walk-in Customer";

    const customerInitial =
      customerName.charAt(0).toUpperCase();

    const paymentClasses = {
      cash: "bg-emerald-50 text-emerald-700 border-emerald-200",
      card: "bg-blue-50 text-blue-700 border-blue-200",
      bank: "bg-violet-50 text-violet-700 border-violet-200",
    };

    const paymentClass =
      paymentClasses[order.payment_method] ||
      "bg-gray-50 text-gray-700 border-gray-200";

    const date = new Date(order.created_at);

    return `
      <tr class="group hover:bg-[#f8fffc] transition-colors duration-200">

        <!-- ORDER -->

        <td class="px-5 py-4">

          <div class="flex items-center gap-3">

            <div
              class="w-10 h-10 rounded-xl
              bg-[#0b1511]
              flex items-center justify-center
              shadow-sm"
            >
              <i
                data-lucide="shopping-bag"
                class="w-4 h-4 text-emerald-300"
              ></i>
            </div>

            <div>

              <p class="font-semibold text-gray-900">
                ${order.order_number}
              </p>

              <p class="text-xs text-gray-400 mt-0.5">
                POS Order
              </p>

            </div>

          </div>

        </td>


        <!-- CUSTOMER -->

        <td class="px-5 py-4">

          <div class="flex items-center gap-3">

            <div
              class="w-10 h-10 rounded-full
              bg-emerald-50
              border border-emerald-100
              text-emerald-700
              flex items-center justify-center
              font-semibold"
            >
              ${customerInitial}
            </div>

            <span class="font-medium text-gray-700">
              ${customerName}
            </span>

          </div>

        </td>


        <!-- TOTAL -->

        <td class="px-5 py-4">

          <p class="font-bold text-gray-900">
            Rs ${Number(order.total).toFixed(2)}
          </p>

          <p class="text-xs text-gray-400 mt-1">
            Order total
          </p>

        </td>


        <!-- PAYMENT -->

        <td class="px-5 py-4">

          <span
            class="
              inline-flex items-center gap-2
              px-3 py-1.5
              rounded-full
              border
              text-xs font-semibold
              capitalize
              ${paymentClass}
            "
          >

            <span class="w-1.5 h-1.5 rounded-full bg-current"></span>

            ${order.payment_method}

          </span>

        </td>


        <!-- DATE -->

        <td class="px-5 py-4">

          <p class="font-medium text-gray-700">
            ${date.toLocaleDateString()}
          </p>

          <p class="text-xs text-gray-400 mt-1">
            ${date.toLocaleTimeString()}
          </p>

        </td>


        <!-- ACTIONS -->

        <td class="px-5 py-4">

          <div class="flex items-center gap-2">

            <button
              onclick="viewOrder(${order.id}, '${order.record_type}')"
              title="View order"
              class="
                w-10 h-10
                rounded-xl
                border border-gray-200
                flex items-center justify-center
                text-gray-500
                hover:bg-[#0b1511]
                hover:text-emerald-300
                hover:border-[#0b1511]
                transition-all duration-200
              "
            >
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>


            ${
              order.record_type !== "draft"
                ? `
                  <button
                    onclick="reprintReceipt(${order.id})"
                    title="Print receipt"
                    class="
                      w-10 h-10
                      rounded-xl
                      border border-gray-200
                      flex items-center justify-center
                      text-gray-500
                      hover:bg-emerald-50
                      hover:text-emerald-700
                      hover:border-emerald-200
                      transition-all duration-200
                    "
                  >
                    <i data-lucide="printer" class="w-4 h-4"></i>
                  </button>
                `
                : ""
            }

          </div>

        </td>

      </tr>
    `;
  })
  .join("");

createIcons({ icons });
updatePagination();
}

async function viewOrder(orderId, type) {
  let url = "";

  if (type === "draft") {
    url = `http://127.0.0.1:8000/api/draft-orders/${orderId}/`;
  } else {
    url = `http://127.0.0.1:8000/api/order-history/${orderId}/`;
  }

  const response = await fetch(url);
  const order = await response.json();

  const body = document.getElementById("modal-body");

  const refundedTotal =
    type === "draft" ? 0 : Number(order.refunded_total || 0);

  const remainingTotal =
    type === "draft"
      ? Number(order.total || 0)
      : Number(order.remaining_total || 0);

  body.innerHTML = `
    <div class="space-y-6">

      <!-- ORDER INFORMATION -->

      <div class="grid grid-cols-2 gap-4">

        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Order Number
          </p>

          <p class="mt-2 text-lg font-semibold text-slate-900">
            ${order.order_number}
          </p>
        </div>


        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Customer
          </p>

          <p class="mt-2 text-lg font-semibold text-slate-900">
            ${order.customer || "Walk-in Customer"}
          </p>
        </div>


        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Order Date
          </p>

          <p class="mt-2 font-semibold text-slate-900">
            ${new Date(order.created_at).toLocaleString()}
          </p>
        </div>


        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">

          <div class="flex items-start justify-between">

            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Payment
              </p>

              <p class="mt-2 font-semibold capitalize text-slate-900">
                ${order.payment_method || "-"}
              </p>
            </div>

            <div>
              ${statusBadge(order.status)}
            </div>

          </div>

        </div>

      </div>


      <!-- PRODUCTS TABLE -->

      <div class="overflow-hidden rounded-2xl border border-slate-200">

        <table class="w-full">

          <thead class="bg-slate-50">

            <tr class="text-xs uppercase tracking-wide text-slate-400">

              <th class="px-5 py-4 text-left">
                Product
              </th>

              <th class="px-4 py-4 text-center">
                Purchased
              </th>

              <th class="px-4 py-4 text-center">
                Refunded
              </th>

              <th class="px-4 py-4 text-center">
                Remaining
              </th>

              <th class="px-4 py-4 text-right">
                Price
              </th>

              <th class="px-5 py-4 text-right">
                Subtotal
              </th>

            </tr>

          </thead>


          <tbody class="divide-y divide-slate-100">

            ${(order.items || [])
              .map(
                (item) => `
                <tr class="transition hover:bg-slate-50/70">

                  <td class="px-5 py-4">

                    <div class="flex items-center gap-3">

                      <div
                        class="flex h-10 w-10 items-center justify-center
                               rounded-xl bg-emerald-50 text-emerald-600"
                      >
                        <i data-lucide="package" class="h-5 w-5"></i>
                      </div>

                      <span class="font-medium text-slate-700">
                        ${item.product}
                      </span>

                    </div>

                  </td>


                  <td class="px-4 py-4 text-center font-medium text-slate-600">
                    ${type === "draft" ? item.quantity : item.purchased_qty}
                  </td>


                  <td class="px-4 py-4 text-center">

                    <span class="${
                      Number(type === "draft" ? 0 : item.refunded_qty) > 0
                        ? "text-rose-600 font-semibold"
                        : "text-slate-400"
                    }">

                      ${type === "draft" ? 0 : item.refunded_qty}

                    </span>

                  </td>


                  <td class="px-4 py-4 text-center">

                    <span
                      class="inline-flex min-w-8 items-center justify-center
                             rounded-lg bg-emerald-50
                             px-2 py-1 text-sm font-semibold text-emerald-700"
                    >
                      ${type === "draft" ? item.quantity : item.remaining_qty}
                    </span>

                  </td>


                  <td class="px-4 py-4 text-right text-slate-600">
                    Rs ${Number(item.price || 0).toFixed(2)}
                  </td>


                  <td class="px-5 py-4 text-right font-semibold text-slate-900">
                    Rs ${Number(item.subtotal || 0).toFixed(2)}
                  </td>

                </tr>
              `,
              )
              .join("")}

          </tbody>

        </table>

      </div>


      <!-- ORDER SUMMARY -->

      <div class="grid grid-cols-2 gap-5">

        <!-- PAYMENT SUMMARY -->

        <div class="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">

          <p class="mb-4 text-sm font-semibold text-slate-900">
            Payment Summary
          </p>


          <div class="space-y-3 text-sm">

            <div class="flex justify-between text-slate-500">
              <span>Subtotal</span>

              <span class="font-medium text-slate-700">
                Rs ${Number(order.subtotal || 0).toFixed(2)}
              </span>
            </div>


            <div class="flex justify-between text-slate-500">
              <span>Discount</span>

              <span class="font-medium text-slate-700">
                Rs ${Number(order.discount || 0).toFixed(2)}
              </span>
            </div>


            <div class="flex justify-between text-slate-500">
              <span>Tax</span>

              <span class="font-medium text-slate-700">
                Rs ${Number(order.tax || 0).toFixed(2)}
              </span>
            </div>


            <div class="border-t border-slate-200 pt-3">

              <div class="flex justify-between text-slate-500">
                <span>Original Total</span>

                <span class="font-semibold text-slate-900">
                  Rs ${Number(order.total || 0).toFixed(2)}
                </span>
              </div>

            </div>

          </div>

        </div>


        <!-- REFUND SUMMARY -->

        <div
          class="rounded-2xl border
          ${
            refundedTotal > 0
              ? "border-rose-100 bg-rose-50/50"
              : "border-emerald-100 bg-emerald-50/50"
          }
          p-5"
        >

          <p class="mb-4 text-sm font-semibold text-slate-900">
            Order Balance
          </p>


          <div class="space-y-3">

            <div class="flex items-center justify-between">

              <span class="text-sm text-slate-500">
                Refunded
              </span>

              <span class="font-semibold text-rose-600">
                Rs ${refundedTotal.toFixed(2)}
              </span>

            </div>


            <div class="flex items-end justify-between border-t border-slate-200/70 pt-4">

              <div>
                <p class="text-sm text-slate-500">
                  Remaining Total
                </p>

                <p class="mt-1 text-xs text-slate-400">
                  Current order value
                </p>
              </div>


              <p class="text-2xl font-bold text-emerald-600">
                Rs ${remainingTotal.toFixed(2)}
              </p>

            </div>

          </div>

        </div>

      </div>


      <!-- CASH INFORMATION -->

      <div class="flex items-center justify-between rounded-2xl border border-slate-100 px-5 py-4">

        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">
            Amount Received
          </p>

          <p class="mt-1 font-semibold text-slate-900">
            Rs ${Number(order.amount_received || 0).toFixed(2)}
          </p>
        </div>


        <div class="h-10 w-px bg-slate-200"></div>


        <div class="text-right">
          <p class="text-xs uppercase tracking-wide text-slate-400">
            Change
          </p>

          <p class="mt-1 font-semibold text-emerald-600">
            Rs ${Number(order.change_amount || 0).toFixed(2)}
          </p>
        </div>

      </div>


      <!-- ACTIONS -->

      <div class="flex justify-end gap-3 border-t border-slate-100 pt-5">

        ${
          type !== "draft"
            ? `
              <button
                onclick="reprintReceipt(${order.id})"
                class="inline-flex items-center gap-2 rounded-xl
                       border border-slate-200 bg-white
                       px-5 py-3 font-medium text-slate-700
                       transition hover:bg-slate-50"
              >
                <i data-lucide="printer" class="h-4 w-4"></i>

                Reprint Receipt
              </button>
            `
            : ""
        }


        ${
          order.status !== "refunded"
            ? `
              <button
                onclick="openRefund(${order.id})"
                class="inline-flex items-center gap-2 rounded-xl
                       bg-slate-950 px-5 py-3
                       font-semibold text-white
                       transition hover:bg-slate-800"
              >
                <i data-lucide="rotate-ccw" class="h-4 w-4"></i>

                Refund
              </button>
            `
            : `
              <span
                class="inline-flex items-center gap-2 rounded-xl
                       bg-rose-50 px-5 py-3
                       font-semibold text-rose-600"
              >
                <i data-lucide="circle-check" class="h-4 w-4"></i>

                Fully Refunded
              </span>
            `
        }


        <button
          onclick="closeModal()"
          class="rounded-xl border border-slate-200
                 bg-white px-5 py-3
                 font-medium text-slate-600
                 transition hover:bg-slate-50"
        >
          Close
        </button>

      </div>

    </div>
  `;

  openModal();

  createIcons({ icons });
}
window.viewOrder = viewOrder;

function openModal() {
  const modal = document.getElementById("order-modal");

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}
window.openModal = openModal;

function closeModal() {
  const modal = document.getElementById("order-modal");

  modal.classList.remove("flex");
  modal.classList.add("hidden");
}
window.closeModal = closeModal

function reprintReceipt(orderId) {
  window.open(`receipt.html?type=sale&id=${orderId}`, "_blank");
}
window.reprintReceipt = reprintReceipt

function printRefundReceipt(refundId) {
  window.open(`receipt.html?type=refund&id=${refundId}`, "_blank");
}
window.printRefundReceipt = printRefundReceipt


function paymentBadge(payment) {
  const badges = {
    cash: {
      text: "Cash",
      class: "bg-green-50 text-green-700 border-green-200",
    },

    card: {
      text: "Card",
      class: "bg-blue-50 text-blue-700 border-blue-200",
    },

    bank: {
      text: "Bank",
      class: "bg-orange-50 text-orange-700 border-orange-200",
    },
  };

  const badge = badges[payment] || {
    text: payment || "-",
    class: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return `
    <span
      class="inline-flex items-center gap-1.5
             px-2.5 py-1 rounded-lg
             border text-xs font-medium
             ${badge.class}"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-current"></span>

      ${badge.text}
    </span>
  `;
}

function updateOrderStats(data, orders) {
  const totalOrders =
    document.getElementById("total-orders-stat");

  const totalItems =
    document.getElementById("total-items-stat");

  const refundOrders =
    document.getElementById("refund-orders-stat");

  const completedOrders =
    document.getElementById("completed-orders-stat");

  if (totalOrders) {
    totalOrders.textContent = data.count || 0;
  }

  if (totalItems) {
    totalItems.textContent = orders.reduce(
      (total, order) =>
        total + Number(order.items_count || 0),
      0
    );
  }

  if (refundOrders) {
    refundOrders.textContent = orders.filter(
      (order) =>
        order.status === "refunded" ||
        order.status === "partially_refunded"
    ).length;
  }

  if (completedOrders) {
    completedOrders.textContent = orders.filter(
      (order) => order.status === "paid"
    ).length;
  }
}


async function openRefund(orderId) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/refund/${orderId}/`
  );

  const refund = await response.json();

  const body = document.getElementById("refund-body");

  body.innerHTML = `
    <div class="space-y-6">

      <!-- ORDER HEADER -->
      <div
        class="flex items-center justify-between
               rounded-2xl border border-emerald-100
               bg-gradient-to-br from-white to-emerald-50/70
               p-5"
      >
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Refund order
          </p>

          <h3 class="mt-1 text-xl font-bold text-gray-900">
            ${refund.order_number}
          </h3>

          <p class="mt-1 text-sm text-gray-500">
            Customer:
            <span class="font-medium text-gray-700">
              ${refund.customer}
            </span>
          </p>
        </div>

        <div
          class="flex h-12 w-12 items-center justify-center
                 rounded-xl bg-emerald-100 text-emerald-700"
        >
          <i data-lucide="rotate-ccw" class="h-5 w-5"></i>
        </div>
      </div>


      <!-- REFUND TABLE -->
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">

        <table class="w-full">

          <thead class="bg-gray-50/80">
            <tr
              class="text-xs font-semibold uppercase
                     tracking-wider text-gray-400"
            >
              <th class="px-5 py-4 text-left">Product</th>
              <th class="px-5 py-4 text-center">Sold</th>
              <th class="px-5 py-4 text-center">Refunded</th>
              <th class="px-5 py-4 text-center">Remaining</th>
              <th class="px-5 py-4 text-center">Refund Qty</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">

            ${refund.items
              .map(
                (item) => `
                  <tr class="transition hover:bg-emerald-50/30">

                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3">

                        <div
                          class="flex h-10 w-10 items-center justify-center
                                 rounded-xl bg-[#0c1511] text-emerald-400"
                        >
                          <i
                            data-lucide="package"
                            class="h-4 w-4"
                          ></i>
                        </div>

                        <div>
                          <p class="font-semibold text-gray-900">
                            ${item.product}
                          </p>

                          <p class="text-xs text-gray-400">
                            Order item
                          </p>
                        </div>

                      </div>
                    </td>

                    <td class="px-5 py-4 text-center">
                      <span
                        class="inline-flex min-w-9 justify-center
                               rounded-lg bg-gray-100
                               px-3 py-1.5 text-sm font-semibold text-gray-700"
                      >
                        ${item.sold_qty}
                      </span>
                    </td>

                    <td class="px-5 py-4 text-center">
                      <span
                        class="inline-flex min-w-9 justify-center
                               rounded-lg bg-rose-50
                               px-3 py-1.5 text-sm font-semibold text-rose-600"
                      >
                        ${item.refunded_qty}
                      </span>
                    </td>

                    <td class="px-5 py-4 text-center">
                      <span
                        class="inline-flex min-w-9 justify-center
                               rounded-lg bg-emerald-50
                               px-3 py-1.5 text-sm font-semibold text-emerald-700"
                      >
                        ${item.remaining_qty}
                      </span>
                    </td>

                    <td class="px-5 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="${item.remaining_qty}"
                        value="0"
                        id="refund-${item.order_item_id}"
                        class="refund-qty
                               w-20 rounded-xl
                               border border-gray-200
                               bg-gray-50
                               px-3 py-2
                               text-center font-semibold text-gray-900
                               outline-none
                               transition
                               focus:border-emerald-400
                               focus:bg-white
                               focus:ring-4
                               focus:ring-emerald-100"
                      />
                    </td>

                  </tr>
                `
              )
              .join("")}

          </tbody>

        </table>

      </div>


      <!-- REFUND REASON -->
      <div>
        <label
          class="mb-2 block text-sm font-semibold text-gray-700"
        >
          Refund Reason
        </label>

        <textarea
          id="refund-reason"
          rows="3"
          class="w-full resize-none
                 rounded-xl border border-gray-200
                 bg-gray-50
                 px-4 py-3
                 text-sm text-gray-900
                 outline-none
                 transition
                 placeholder:text-gray-400
                 focus:border-emerald-400
                 focus:bg-white
                 focus:ring-4
                 focus:ring-emerald-100"
          placeholder="Enter reason for this refund..."
        ></textarea>
      </div>


      <!-- ACTIONS -->
      <div
        class="flex items-center justify-end gap-3
               border-t border-gray-100 pt-5"
      >

        <button
          onclick="closeRefundModal()"
          class="rounded-xl border border-gray-200
                 bg-white px-5 py-2.5
                 text-sm font-semibold text-gray-700
                 transition
                 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          onclick="processRefund(${refund.order_id})"
          class="inline-flex items-center gap-2
                 rounded-xl
                 bg-[#0c1511]
                 px-5 py-2.5
                 text-sm font-semibold text-white
                 shadow-lg shadow-emerald-900/10
                 transition
                 hover:-translate-y-0.5
                 hover:bg-[#14231c]"
        >
          <i data-lucide="rotate-ccw" class="h-4 w-4"></i>
          Process Refund
        </button>

      </div>

    </div>
  `;

  createIcons({ icons });

  openRefundModal();
}

function openRefundModal() {
  document.getElementById("refund-modal").classList.remove("hidden");

  document.getElementById("refund-modal").classList.add("flex");
}

function closeRefundModal() {
  document.getElementById("refund-modal").classList.remove("flex");

  document.getElementById("refund-modal").classList.add("hidden");
}

async function processRefund(orderId) {
  const rows = [];

  document.querySelectorAll(".refund-qty").forEach((input) => {
    rows.push({
      order_item_id: input.id.replace("refund-", ""),
      quantity: Number(input.value),
    });
  });

  const reason = document.getElementById("refund-reason").value;

  const response = await fetch(
    "http://127.0.0.1:8000/api/refund/process/",

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        order_id: orderId,

        reason: reason,

        items: rows,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(text);
    alert("Refund failed.");
    return;
  }

  const result = await response.json();

  if (result.success) {
    printRefundReceipt(result.refund_id);
  }

  if (result.success) {
    alert("Refund Completed");

    closeRefundModal();

    performSearch();
  } else {
    alert("Refund Failed");
  }
}

function filterStatus(status) {
  resetFilters();

  currentView = "orders";
  currentStatus = status;

  loadOrders();
}

function applySidebarOrderFilter() {
  const params = new URLSearchParams(window.location.hash.split("?")[1]);

  const filter = params.get("filter") || "all";

  switch (filter) {
    case "completed":
      filterStatus("paid");
      break;

    case "refunds":
      resetFilters();

      currentView = "refunds";
      loadRefundHistory();
      break;

    case "partial-refunds":
    resetFilters();
    filterStatus("partially_refunded");
    break;

    case "draft":
    resetFilters();
    filterStatus("draft");
    break;

    default:
      filterStatus("");
      break;
  }
}

function statusBadge(status) {
  switch (status) {
    case "paid":
      return `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                Completed
            </span>`;

    case "refunded":
      return `<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                Refunded
            </span>`;

    case "partially_refunded":
      return `<span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                Partial Refund
            </span>`;

    default:
      return `<span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                Draft
            </span>`;
  }
}

async function loadRefundHistory(resetPage = true) {

    currentView = "refunds";

    if (resetPage) {
        currentPage = 1;
    }

  currentStatus = "";

  setTableHeader([
    "Refund",
    "Order",
    "Customer",
    "Payment",
    "Refund Total",
    "Date",
    "Actions",
  ]);

  const search = document.getElementById("search-input").value;
  const payment = document.getElementById("payment-filter").value;
  const customer = currentCustomer;
  const date = document.getElementById("date-filter").value;
  const session = currentSession;

  const params = new URLSearchParams();

  if (search) params.append("search", search);

  if (payment) params.append("payment", payment);

  if (customer) params.append("customer", customer);

  if (date) params.append("date", date);

  if (session) params.append("session", session);

  params.append("page", currentPage);

  const response = await fetch(
    `http://127.0.0.1:8000/api/refund-history/?${params.toString()}`,
  );

  const data = await response.json();

  const refunds = data.results;

  totalPages = Math.ceil(data.count / refunds.length);

  hasNext = data.next !== null;

  hasPrevious = data.previous !== null;

  // Fill table
  const table = document.getElementById("orders-table");

table.innerHTML = refunds
  .map(
    (refund) => `
      <tr class="group border-b border-gray-100 hover:bg-[#f8fffc] transition-colors">

        <!-- REFUND -->

        <td class="px-5 py-4">
          <div class="flex items-center gap-3">

            <div class="w-10 h-10 rounded-xl bg-[#fff0f1]
                        flex items-center justify-center shrink-0">

              <i
                data-lucide="rotate-ccw"
                class="w-4 h-4 text-[#be3b4b]"
              ></i>

            </div>

            <div>
              <p class="font-semibold text-gray-900">
                ${refund.refund_number}
              </p>

              <p class="text-xs text-gray-400 mt-1">
                Refund
              </p>
            </div>

          </div>
        </td>


        <!-- ORDER -->

        <td class="px-5 py-4">
          <p class="font-medium text-gray-700">
            ${refund.order_number}
          </p>

          <p class="text-xs text-gray-400 mt-1">
            Original order
          </p>
        </td>


        <!-- CUSTOMER -->

        <td class="px-5 py-4">
          <div class="flex items-center gap-3">

            <div class="w-9 h-9 rounded-full bg-[#e8fff7]
                        border border-emerald-100
                        flex items-center justify-center
                        text-sm font-semibold text-emerald-700">

              ${(refund.customer || "W").charAt(0).toUpperCase()}

            </div>

            <span class="font-medium text-gray-700">
              ${refund.customer || "Walk-in Customer"}
            </span>

          </div>
        </td>


        <!-- PAYMENT -->

        <td class="px-5 py-4">

          <span class="inline-flex items-center gap-2
                       px-3 py-1 rounded-full
                       bg-emerald-50 border border-emerald-100
                       text-emerald-700 text-xs font-semibold">

            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>

            ${refund.payment_method}

          </span>

        </td>


        <!-- REFUND TOTAL -->

        <td class="px-5 py-4">

          <p class="font-semibold text-[#be3b4b]">
            Rs ${refund.amount}
          </p>

          <p class="text-xs text-gray-400 mt-1">
            Refunded amount
          </p>

        </td>


        <!-- DATE -->

        <td class="px-5 py-4">

          <p class="font-medium text-gray-700">
            ${new Date(refund.date).toLocaleDateString()}
          </p>

          <p class="text-xs text-gray-400 mt-1">
            ${new Date(refund.date).toLocaleTimeString()}
          </p>

        </td>


        <!-- ACTIONS -->

        <td class="px-5 py-4">

          <div class="flex items-center gap-2">

            <button
              onclick="viewRefund(${refund.id})"
              class="w-10 h-10 border border-gray-200 rounded-xl
                     flex items-center justify-center
                     hover:bg-emerald-50 hover:border-emerald-200
                     transition"
              title="View refund"
            >
              <i
                data-lucide="eye"
                class="w-4 h-4 text-gray-500"
              ></i>
            </button>


            <button
              onclick="reprintRefundReceipt(${refund.id})"
              class="w-10 h-10 border border-gray-200 rounded-xl
                     flex items-center justify-center
                     hover:bg-rose-50 hover:border-rose-200
                     transition"
              title="Print refund"
            >
              <i
                data-lucide="printer"
                class="w-4 h-4 text-gray-500"
              ></i>
            </button>

          </div>

        </td>

      </tr>
    `,
  )
  .join("");

createIcons({ icons });

updatePagination();
}


function animateCounter(element, target, duration = 900) {
  if (!element) return;

  target = Number(target) || 0;

  const startTime = performance.now();

  function update(currentTime) {
    const progress = Math.min(
      (currentTime - startTime) / duration,
      1
    );

    const eased = 1 - Math.pow(1 - progress, 3);

    element.textContent = Math.floor(target * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(update);
}


async function loadOrderStats() {
  const response = await fetch(
    "http://127.0.0.1:8000/api/order-stats/"
  );

  if (!response.ok) return;

  const data = await response.json();

  animateCounter(
    document.getElementById("total-orders-stat"),
    data.total_orders
  );

  animateCounter(
    document.getElementById("total-items-stat"),
    data.total_items
  );

  animateCounter(
    document.getElementById("refund-orders-stat"),
    data.refund_orders
  );

  animateCounter(
    document.getElementById("completed-orders-stat"),
    data.completed_orders
  );
}


async function viewRefund(refundId) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/refund-history/detail/${refundId}/`,
  );

  const refund = await response.json();

  const body = document.getElementById("modal-body");

  body.innerHTML = `
    <div class="space-y-6 text-slate-900">

      <!-- HEADER -->
      <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">

        <div>
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <i data-lucide="rotate-ccw" class="h-5 w-5"></i>
            </div>

            <div>
              <h2 class="text-xl font-semibold tracking-tight">
                ${refund.refund_number}
              </h2>

              <p class="mt-1 text-sm text-slate-400">
                Refund transaction details
              </p>
            </div>
          </div>
        </div>

        <span class="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
          Refunded
        </span>

      </div>


      <!-- REFUND INFO -->
      <div class="grid grid-cols-2 gap-4">

        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
            Original Order
          </p>

          <p class="mt-2 font-semibold text-slate-800">
            ${refund.order_number}
          </p>
        </div>


        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
            Customer
          </p>

          <p class="mt-2 font-semibold text-slate-800">
            ${refund.customer || "Walk-in Customer"}
          </p>
        </div>


        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
            Refund Date
          </p>

          <p class="mt-2 font-semibold text-slate-800">
            ${new Date(refund.date).toLocaleString()}
          </p>
        </div>


        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
            Reason
          </p>

          <p class="mt-2 font-semibold text-slate-800">
            ${refund.reason || "No reason provided"}
          </p>
        </div>

      </div>


      <!-- ITEMS TABLE -->
      <div class="overflow-hidden rounded-2xl border border-slate-200">

        <table class="w-full text-sm">

          <thead class="bg-slate-50">
            <tr class="text-xs uppercase tracking-wide text-slate-400">

              <th class="px-5 py-4 text-left font-semibold">
                Product
              </th>

              <th class="px-5 py-4 text-center font-semibold">
                Qty
              </th>

              <th class="px-5 py-4 text-right font-semibold">
                Price
              </th>

              <th class="px-5 py-4 text-right font-semibold">
                Amount
              </th>

            </tr>
          </thead>


          <tbody class="divide-y divide-slate-100">

            ${refund.items
              .map(
                (item) => `
                  <tr class="transition hover:bg-slate-50/80">

                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3">

                        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <i data-lucide="package" class="h-4 w-4"></i>
                        </div>

                        <span class="font-medium text-slate-700">
                          ${item.product}
                        </span>

                      </div>
                    </td>

                    <td class="px-5 py-4 text-center text-slate-600">
                      ${item.qty}
                    </td>

                    <td class="px-5 py-4 text-right text-slate-600">
                      Rs ${Number(item.price).toFixed(2)}
                    </td>

                    <td class="px-5 py-4 text-right font-semibold text-slate-800">
                      Rs ${Number(item.amount).toFixed(2)}
                    </td>

                  </tr>
                `,
              )
              .join("")}

          </tbody>

        </table>

      </div>


      <!-- TOTAL -->
      <div class="flex items-center justify-between rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white p-5">

        <div>
          <p class="text-sm text-slate-500">
            Total refunded amount
          </p>

          <p class="mt-1 text-xs text-slate-400">
            Amount returned to customer
          </p>
        </div>

        <p class="text-2xl font-bold tracking-tight text-rose-600">
          Rs ${Number(refund.total).toFixed(2)}
        </p>

      </div>


      <!-- ACTIONS -->
      <div class="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">

        <button
          onclick="viewOriginalOrder(${refund.order_id})"
          class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <i data-lucide="eye" class="h-4 w-4"></i>
          View Order
        </button>


        <button
          onclick="reprintRefundReceipt(${refund.id})"
          class="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <i data-lucide="printer" class="h-4 w-4"></i>
          Reprint Refund
        </button>


        <button
          onclick="closeModal()"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Close
        </button>

      </div>

    </div>
  `;

  openModal();

  createIcons({ icons });
}
window.viewRefund = viewRefund

function reprintRefundReceipt(refundId) {
  window.open(`receipt.html?type=refund&id=${refundId}`, "_blank");
}
window.reprintRefundReceipt = reprintRefundReceipt

function setTableHeader(headers) {
  const row = headers
    .map(
      (header) => `
        <th
          class="
            px-5 py-4
            text-left
            text-[11px]
            font-semibold
            text-gray-400
            tracking-wider
          "
        >
          ${header}
        </th>
      `
    )
    .join("");

  document.getElementById("history-header").innerHTML = `
    <tr>${row}</tr>
  `;
}


function viewOriginalOrder(orderId) {
  viewOrder(orderId, "order");
}
window.viewOriginalOrder = viewOriginalOrder

function performSearch() {
  if (currentView === "refunds") {
    loadRefundHistory(false);
  } else {
    loadOrders();
  }
}

function updatePagination() {
  document.getElementById("page-info").textContent =
    `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prev-page").disabled = !hasPrevious;

  document.getElementById("next-page").disabled = !hasNext;
}


async function exportCSV() {

    const params = buildExportParams();

    let url;
    let filename;

    if (currentView === "refunds") {

        url = `http://127.0.0.1:8000/api/refund-history/export/csv/?${params}`;

        filename = "refund-history.csv";

    } else {

        if (currentStatus)
            params.append("status", currentStatus);

        url = `http://127.0.0.1:8000/api/order-history/export/csv/?${params}`;

        filename = "orders.csv";
    }

    await downloadFile(url, filename);
}

async function exportExcel() {

    const params = buildExportParams();

    let url;
    let filename;

    if (currentView === "refunds") {

        url = `http://127.0.0.1:8000/api/refund-history/export/excel/?${params}`;
        filename = "refund-history.xlsx";

    } else if (currentStatus === "draft") {

        url = `http://127.0.0.1:8000/api/draft-orders/export/excel/?${params}`;
        filename = "draft-orders.xlsx";

    } else {

        if (currentStatus)
            params.append("status", currentStatus);

        url = `http://127.0.0.1:8000/api/order-history/export/excel/?${params}`;
        filename = "orders.xlsx";
    }

    await downloadFile(url, filename);
}


async function exportPdf() {

    const params = buildExportParams();

    let url;
    let filename;

    if (currentView === "refunds") {

        url = `http://127.0.0.1:8000/api/refund-history/export/pdf/?${params}`;
        filename = "refund-history.pdf";

    } else if (currentStatus === "draft") {

        url = `http://127.0.0.1:8000/api/draft-orders/export/pdf/?${params}`;
        filename = "draft-orders.pdf";

    } else {

        if (currentStatus)
            params.append("status", currentStatus);

        url = `http://127.0.0.1:8000/api/order-history/export/pdf/?${params}`;
        filename = "orders.pdf";
    }

    await downloadFile(url, filename);
}

async function downloadFile(url, filename) {

    const token = localStorage.getItem("pos_token");

    const response = await fetch(url, {
        headers: {
            Authorization: `Token ${token}`
        }
    });

    if (!response.ok) {
        alert("Export failed.");
        return;
    }

    const blob = await response.blob();

    const downloadUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(downloadUrl);
}


function buildExportParams() {

    const params = new URLSearchParams();

    const search = document.getElementById("search-input").value;
    const payment = document.getElementById("payment-filter").value;
    const customer = document.getElementById("customer-filter").value;
    const date = document.getElementById("date-filter").value;

    if (search) params.append("search", search);
    if (payment) params.append("payment", payment);
    if (customer) params.append("customer", customer);
    if (date) params.append("date", date);
    if (currentSession) params.append("session", currentSession);

    return params;
}


function toggleExportMenu(event) {
  event.stopPropagation();

  const menu = document.getElementById("export-menu");

  menu?.classList.toggle("hidden");
}

function closeExportMenu() {
  document
    .getElementById("export-menu")
    ?.classList.add("hidden");
}

document.addEventListener("click", (event) => {
  const container = document.getElementById(
    "export-menu-container"
  );

  if (
    container &&
    !container.contains(event.target)
  ) {
    closeExportMenu();
  }
});


window.toggleExportMenu = toggleExportMenu;
window.closeExportMenu = closeExportMenu;

window.exportCSV = exportCSV;
window.exportExcel = exportExcel;
window.exportPdf = exportPdf;


window.filterStatus = filterStatus;
window.performSearch = performSearch;

window.exportCSV = exportCSV;
window.exportExcel = exportExcel;
window.exportPdf = exportPdf;

window.openRefund = openRefund;
window.processRefund = processRefund;

window.openRefundModal = openRefundModal;
window.closeRefundModal = closeRefundModal;
window.loadOrderStats = loadOrderStats;


function resetFilters() {
  // Search
  document.getElementById("search-input").value = "";

  // Standard selects
  document.getElementById("payment-filter").value = "";
  document.getElementById("date-filter").value = "";

  // Session
  currentSession = "";

  const sessionlabel = document.getElementById("session-filter-label");
  if (sessionlabel) {
    sessionlabel.textContent = "All Sessions";
  }

  currentCustomer = "";

  const customerlabel = document.getElementById("customer-filter-label");
  if (customerlabel) {
    customerlabel.textContent = "All Customers";
  }

  currentPage = 1;
}
