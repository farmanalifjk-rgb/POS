import apiService from "../../../js/services/api.service.js";
const beepSound = new Audio("./sounds/beep.mp3");
import { createIcons, icons } from "lucide";
import { receiptPrinter } from "../../../js/hardware/ReceiptPrinter.js";
import { ReceiptBuilder } from "../../../js/hardware/ReceiptBuilder.js";
import { customerDisplay } from "../../../js/hardware/CustomerDisplay.js";
import { barcodeScanner } from "../../../js/hardware/BarcodeScanner.js";

createIcons({ icons });


let selectedCustomer = null;
let barcodeBuffer = "";
let barcodeTimer = null;

let products = [];
let categories = [];

let activeCategory = null;

let carts = [];
let activeCartId = null;
let searchTerm = "";
let noteTimer;

function filterCategory(categoryId) {
    activeCategory = categoryId === null ? null : Number(categoryId);

  renderCategories();
  renderProducts();
}

function renderCategories() {
  const container = document.getElementById("category-bar");

  if (!container) return;

  container.innerHTML = `
    <button
      onclick="filterCategory(null)"
      class=" category-btn flex items-center gap-3 px-5 py-3 rounded-full border border-slate-300 whitespace-nowrap">
      <span>All Product</span>

      <span
        class=" px-2 py-1 rounded-full text-xs text-slate-600
          ${activeCategory === null ? "bg-lime-400" : "bg-slate-100"}">
        ${products.length}
      </span>
    </button>
  `;

  categories.forEach((category) => {
    const productCount = products.filter(
      (product) =>
        Number(product.category) === Number(category.id)
    ).length;

    const isActive =
      Number(activeCategory) === Number(category.id);

    container.innerHTML += `
      <button
        onclick="filterCategory(${category.id})"
        class="
          category-btn
          flex items-center gap-3
          px-5 py-3
          rounded-full
          border border-slate-300
          whitespace-nowrap
          ${isActive ? "bg-lime-400" : "bg-white"}
        "
      >
        <span>${category.name}</span>

        <span
          class="
            px-2 py-1
            rounded-full
            text-xs
            text-slate-600
            ${isActive ? "bg-white" : "bg-slate-100"}
          "
        >
          ${productCount}
        </span>
      </button>
    `;
  });

  createIcons({ icons });
}

async function loadCategories() {
  const res = await fetch("/categories/");

  categories = await res.json();

  renderCategories();
}

function getActiveCart() {
  return carts.find((cart) => cart.id === activeCartId) || null;

}

async function createOrder() {
  const response = await fetch(
    "/draft-orders/create/",
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("CREATE ORDER ERROR:", data);

    if (data.error === "No active session") {
      showNotification(
        "Open a cash session before creating an order",
        "error"
      );

      showOpenSessionModal();
    }

    return;
  }

  const order = {
    id: data.id,
    name: `Order ${data.order_number}`,
    customer: data.customer,
    items: [],
  };

  carts.push(order);

  activeCartId = order.id;

  renderTabs();
  renderCart();
}

function renderTabs() {
  const tabs = document.getElementById("order-tabs");

  if (!tabs) return;

  tabs.innerHTML = "";

  carts.forEach((order) => {
    const isActive = order.id === activeCartId;

    tabs.innerHTML += `
            <button
                onclick="switchOrder(${order.id})"
                class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-lime-400 border border-lime-400"
                    : "bg-white border border-slate-200 hover:bg-slate-50"
                }">
                ${order.name}
            </button>
        `;
  });
}

// 1. Load products from API
async function loadProducts() {
  const res = await fetch("/products/");
  products = await res.json();
  renderProducts();
}

// 2. Show products in grid
function renderProducts() {
  const grid = document.getElementById("product-grid");

  if (!grid) return;

  grid.innerHTML = "";

  let filteredProducts = products;

  if (activeCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => Number(p.category) === Number(activeCategory),
    );
  }

  if (searchTerm) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm),
    );
  }

  filteredProducts.forEach((p) => {
    const imageSrc = p.image
      ? p.image.startsWith("http")
        ? p.image
        : `http://127.0.0.1:8000${p.image}`
      : null;

    grid.innerHTML += `
      <div class="bg-white border border-slate-200 rounded-2xl h-fit flex flex-col transition duration-200 hover:shadow-lg hover:-translate-y-1">

        <div class="relative h-40 rounded-t-2xl bg-slate-100 overflow-hidden flex items-center justify-center">

          <span
            class="absolute top-0 left-0 bg-slate-900 text-white text-xs px-3 py-2 rounded-br-xl">
            ${p.stock_quantity ?? 0} Stock
          </span>

          ${
            imageSrc
              ? `
                <img
                  src="${imageSrc}"
                  alt="${p.name}"
                  class="w-full h-full object-contain p-4"
                >
              `
              : `
                <div class="text-slate-400 text-sm">
                  No Image
                </div>
              `
          }

        </div>

        <div class="flex flex-col flex-1 p-4">

          <h2 class="font-semibold text-slate-900 text-base">
            ${p.name}
          </h2>

          <p class="text-sm text-slate-500 mt-2 line-clamp-2 min-h-[40px]">
            ${p.description || "Product available in store"}
          </p>

          <p class="font-bold text-lg text-slate-900 mt-4">
            Rs ${parseFloat(p.sales_price).toFixed(2)}
          </p>

          <button
            onclick="addToCart(${p.id})"
            class=" mt-4 w-full border border-slate-300 rounded-full py-3 flex items-center justify-center gap-2 font-medium hover:bg-lime-400 hover:border-lime-400 transition">
            <i data-lucide="plus" class="w-5 h-5"></i>
            Add to Cart
          </button>

        </div>

      </div>
    `;
  });

  createIcons({ icons });
}

// 3. Add to cart

// 4. Render cart
function renderCart() {
  const cartDiv = document.getElementById("cart");

  if (!cartDiv) return;

  const activeCart = getActiveCart();

  if (!activeCart) {
    cartDiv.innerHTML = `
    <div class="h-full flex flex-col items-center justify-center text-gray-400">
      <i data-lucide="shopping-cart" class="w-10 h-10 mb-3"></i>

      <p class="font-medium">
        No active draft order
      </p>
    </div>
  `;

    setCartTotals(0);

    createIcons({ icons });

    return;
  }

  const cart = activeCart.items;

  let subtotal = 0;

  cartDiv.innerHTML = "";

  if (!cart.length) {
    cartDiv.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-gray-400 py-12">
        <i data-lucide="shopping-bag" class="w-10 h-10 mb-3"></i>
        <p class="font-medium">Cart is empty</p>
        <p class="text-sm mt-1">Add products to get started</p>
      </div>
    `;
    setCartTotals(0);
    createIcons({ icons });
    
    customerDisplay.showWelcome();
    return;
  }

  cart.forEach((item) => {
    const lineTotal = item.price * item.qty;


    subtotal += lineTotal;

    cartDiv.innerHTML += `
      <div
        class="border border-slate-300 rounded-2xl flex gap-4 bg-white mb-2 h-28 p-1">

        <!-- PRODUCT IMAGE -->

        <div
          class=" w-28 h-24 shrink-0 rounded-xl overflow-hidden flex items-center justify-center">
          ${
            item.image
              ? `
                <img
                  src="http://127.0.0.1:8000${item.image}"
                  alt="${item.name}"
                  class="w-full h-full object-contain"
                >
              `
              : `
                <i
                  data-lucide="package"
                  class="w-8 h-8 text-slate-400"
                ></i>
              `
          }
        </div>


        <!-- PRODUCT DETAIL -->

        <div class="flex-1 min-w-0 p-2">

          <div class="flex items-start justify-between gap-3">

            <h3
              class="
                font-semibold
                text-lg
                text-slate-900
                truncate
              "
            >
              ${item.name}
            </h3>


            <!-- DELETE -->

            <button
              onclick="removeItem(${item.id})"
              class=" w-7 h-7 shrink-0 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition">
              <i
                data-lucide="trash-2"
                class="w-3 h-3"
              ></i>
            </button>

          </div>


          <!-- QUANTITY + TOTAL -->

          <div
            class=" flex items-center justify-between mt-10 gap-3">

            <div class="flex items-center gap-3">

              <button
                onclick="decreaseQty(${item.id})"
                class=" w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition">
                <i
                  data-lucide="minus"
                  class="w-4 h-4"
                ></i>
              </button>


              <span class="font-semibold text-base">
                ${String(item.qty).padStart(2, "0")}
              </span>


              <button
                onclick="increaseQty(${item.id})"
                class=" w-5 h-5 rounded-full bg-lime-400 flex items-center justify-center hover:bg-lime-500 transition">
                <i
                  data-lucide="plus"
                  class="w-4 h-4"
                ></i>
              </button>

            </div>


            <div class="flex items-center gap-2 whitespace-nowrap">

              <span class="text-slate-500">
                Total
              </span>

              <span class="font-semibold text-slate-900">
                Rs${lineTotal.toFixed(2)}
              </span>

            </div>

          </div>

        </div>

      </div>
    `;
  });

  createIcons({ icons });

  setCartTotals(subtotal);
  
  // Hardware: Update customer display with last added item
  const lastItem = cart[cart.length - 1];
  customerDisplay.showCartUpdate(lastItem.name, subtotal.toFixed(2));
}

function setCartTotals(subtotal) {
  const discountEl = document.getElementById("discount");
  const discount = discountEl ? parseFloat(discountEl.value) || 0 : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * 0.18;
  const total = taxable + tax;

  const subtotalEl = document.getElementById("subtotal");
  const taxEl = document.getElementById("tax");
  const totalEl = document.getElementById("total");

  if (subtotalEl) subtotalEl.innerText = subtotal.toFixed(2);
  if (taxEl) taxEl.innerText = tax.toFixed(2);
  if (totalEl) totalEl.innerText = total.toFixed(2);
}

// 5. Checkout API call

async function checkout(paymentmethod, amountReceived) {
  const activeCart = getActiveCart();

  if (!activeCart) {
    alert("Create an order first");
    return;
  }

  const cart = activeCart.items;

  if (!cart.length) {
    showNotification("Add items to the cart first", "error");
    return;
  }

  const discountEl = document.getElementById("discount");
  const discount = discountEl ? parseFloat(discountEl.value) || 0 : 0;
  const paymentMethod =
    paymentmethod ||
    document.getElementById("payment-method-modal")?.value ||
    document.getElementById("payment_method")?.value ||
    "cash";

  const payload = {
    payment_method: paymentMethod,

    amount_received: amountReceived,

    draft_order_id: activeCartId,

    customer_id: activeCart.customer || activeCart.customer_id || null,

    discount: discount,

    items: cart.map((item) => ({
      product_id: item.id,
      quantity: item.qty,
    })),
  };

  const res = await fetch("/checkout/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  // Check if the request failed immediately
  if (!res.ok) {
    alert("Error placing order: " + JSON.stringify(data));
    return;
  }

  // Hardware Integration: Print Receipt!
  const company = {
    name: "ENTERPRISE POS",
    address: "123 Smart St, Metropolis",
    phone: "+92 300 1234567"
  };
  
  const receiptData = {
    ...activeCart,
    paymentMethod: paymentMethod,
    paymentAmount: amountReceived,
    total: data.total || 0,
    items: cart
  };
  
  const builder = new ReceiptBuilder(company, receiptData);
  const receiptBytes = builder.buildStandardReceipt();
  receiptPrinter.print(receiptBytes);

  // Only proceed if res.ok is true
  alert("Order placed: " + data.order_id);
  window.open(
    `receipt.html?type=sale&id=${data.order_id}`,
    "_blank"
);
  const index = carts.findIndex((c) => c.id === activeCartId);
  carts.splice(index, 1);

  if (carts.length === 0) {
    createOrder();
  } else {
    activeCartId = carts[0].id;
  }
  renderTabs();
  renderCart();
  customerDisplay.showWelcome();
}

async function openSession() {
  const employeeInput = document.getElementById("session-employee-name");
  const openingBalanceInput =
    document.getElementById("session-opening-cash") ||
    document.getElementById("opening_balance");

  const employee_name = employeeInput?.value?.trim() || "";
  const opening_balance = openingBalanceInput?.value ?? 0;

  if (!employee_name) {
    showNotification("Employee name is required", "error");
    return;
  }

  const res = await fetch(
    "/session/open/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ opening_balance, employee_name }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("OPEN SESSION ERROR:", data);
    alert(data.error || "Failed to open session");
    return;
  }

  hideOpenSessionModal();

  carts = [];
  activeCartId = null;

  await loadDraftOrders();
  await loadSession();
}


async function loadSession() {
  const res = await fetch(
    "/session/active/"
  );

  const data = await res.json();

  const box = document.getElementById("session-box");

  if (!data.session_id) {
    if (box) {
      box.innerHTML = "No active session";
    }

    return false;
  }

  if (box) {
    const employee = data.employee_name ? ` · ${data.employee_name}` : "";

    box.innerHTML = `
      Session #${data.session_id}${employee}
      · Opening Rs ${parseFloat(data.opening_balance || 0).toFixed(2)}
    `;
  }

  return true;
}


async function closeSession() {
  const res = await fetch(
    "/session/close/",
    {
      method: "POST",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("CLOSE SESSION ERROR:", data);
    alert(data.error || "Failed to close session");
    return;
  }

  alert(`Closed. Total Sales: ${data.total_sales}`);

  carts = [];
  activeCartId = null;

  renderTabs();
  renderCart();

  await loadSession();

  showOpenSessionModal();
}

async function openReceipt(orderId) {
  const res = await fetch(`/receipt/${orderId}/`);
  const data = await res.json();

  let receiptHTML = `
    <div style="padding:20px; font-family:monospace;">
      <h2>MY POS STORE</h2>
      <p>Order ID: ${data.order_id}</p>
      <hr>
  `;

  receiptHTML += `
    <hr>

    <p><strong>Note:</strong></p>
    <p>${data.note || "-"}</p>

    <hr>
`;

  data.items.forEach((item) => {
    receiptHTML += `
      <p>${item.product} x ${item.qty} = ${item.subtotal}</p>
    `;
  });

  receiptHTML += `
      <hr>
      <h3>Total: ${data.total}</h3>
      <p>Payment: ${data.payment_method}</p>
    </div>
  `;

  const win = window.open("", "_blank");
  win.document.write(receiptHTML);
  win.print();
}

async function loadDraftOrders() {
  const res = await fetch(
    "/draft-orders/"
  );

  const data = await res.json();

  carts = data.map((order) => ({
    id: order.id,
    name: `Order ${order.order_number}`,
    customer: order.customer_id,
    customer_id: order.customer_id,
    items: [],
  }));

  if (carts.length > 0) {
    activeCartId = carts[0].id;

    await loadDraftOrderItems(activeCartId);
  } else {
    activeCartId = null;

    renderCart();
  }

  renderTabs();
}

async function addToCart(productId) {
  const activeCart = getActiveCart();

  if (!activeCart || !activeCart.id) {
    console.error("NO ACTIVE DRAFT:", {
      activeCart,
      activeCartId,
      carts,
    });

    alert("Open a cash session first.");

    return;
  }

  const res = await fetch(
    "/draft-item/add/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draft_id: activeCart.id,
        product_id: productId,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("ADD ITEM ERROR:", data);
    return;
  }

  await loadDraftOrderItems(activeCart.id);
}

async function loadDraftOrderItems(id) {
  const res = await fetch(
    `/draft-orders/${id}/`
  );

  const data = await res.json();

  const cart = getActiveCart();

  if (!cart) return;

  cart.items = data.items.map((item) => ({
    id: item.product,
    name: item.product_name,
    price: parseFloat(item.sales_price),
    qty: item.quantity,
    image: item.image,
  }));

  if (data.customer_id) {
    cart.customer = data.customer_id;
    cart.customer_id = data.customer_id;
  }

  const noteEl = document.getElementById("order-note");

  if (noteEl) {
    noteEl.value = data.note || "";
  }

  updateCustomerDropdown();
  renderCart();
}

function switchOrder(id) {
  activeCartId = id;

  renderTabs();

  loadDraftOrderItems(id);

  updateCustomerDropdown();
}

function searchProducts() {
  const searchInput = document.getElementById("product-search");

  searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

  renderProducts();
}

function showNotification(message, type) {
  const box = document.getElementById("notification");

  if (!box) return;

  box.textContent = message;
  box.classList.remove("hidden");

  if (type === "error") {
    box.className =
      "fixed top-4 right-4 bg-red-500 text-white p-3 rounded shadow z-50";
  } else {
    box.className =
      "fixed top-4 right-4 bg-green-500 text-white p-3 rounded shadow z-50";
  }

  setTimeout(() => {
    box.classList.add("hidden");
  }, 2000);
}

async function increaseQty(productId) {
  await fetch("/draft-item/add/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      draft_id: activeCartId,
      product_id: productId,
    }),
  });

  loadDraftOrderItems(activeCartId);
}

async function decreaseQty(productId) {
  await fetch("/draft-item/decrease/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      draft_id: activeCartId,
      product_id: productId,
    }),
  });

  loadDraftOrderItems(activeCartId);
}

async function removeItem(productId) {
  await fetch("/draft-item/remove/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      draft_id: activeCartId,
      product_id: productId,
    }),
  });

  loadDraftOrderItems(activeCartId);
}

// (Removed primitive barcode listener in favor of HardwareIntegration BarcodeScanner)

async function processBarcode(code) {
  try {
    const res = await fetch(
      `/product/barcode/${code}/`,
    );

    if (!res.ok) {
      showNotification("Product not found", "error");

      return;
    }

    const product = await res.json();

    beepSound.play().catch(() => {});

    await addToCart(product.id);

    showNotification(`${product.name} added`, "success");
  } catch (error) {

    showNotification("Server error", "error");
  }
}

async function loadCustomers() {
  const res = await fetch("/customers/");
  const customers = await res.json();

  const select = document.getElementById("customer-select");

  if (!select) return;

  select.innerHTML = `<option value="">Walk-in Customer</option>`;

  customers.forEach((customer) => {
    select.innerHTML += `
            <option value="${customer.id}">
                ${customer.name}
            </option>
        `;
  });
}

async function assignCustomer() {
  const customerId = document.getElementById("customer-select").value;

  await fetch("/draft-order/customer/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      draft_id: activeCartId,
      customer_id: customerId,
    }),
  });

  const cart = getActiveCart();

  if (cart) {
    cart.customer = customerId || null;
    cart.customer_id = customerId || null;
  }

  showNotification("Customer assigned", "success");
}

function updateCustomerDropdown() {
  const cart = getActiveCart();
  const select = document.getElementById("customer-select");

  if (!cart || !select) return;

  select.value = cart.customer_id || cart.customer || "";
}

function showCustomerModal() {
  const modal = document.getElementById("customer-modal");

  if (!modal) return;

  modal.classList.add("flex");
  modal.classList.remove("hidden");
}

function closeCustomerModal() {
  const modal = document.getElementById("customer-modal");

  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function createCustomer() {
  const name = document.getElementById("customer-name").value;

  const phone = document.getElementById("customer-phone").value;

  const res = await fetch("/customers/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      phone,
    }),
  });

  const customer = await res.json();

  // Reload dropdown
  await loadCustomers();

  // Select the new customer
  document.getElementById("customer-select").value = customer.id;

  // Assign to current draft
  await assignCustomer();

  closeCustomerModal();

  showNotification("Customer created", "success");
}

function saveNote() {
  clearTimeout(noteTimer);

  noteTimer = setTimeout(async () => {
    const note = document.getElementById("order-note").value;

    await fetch("/draft-order/note/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draft_id: activeCartId,
        note: note,
      }),
    });
  }, 500); // Save 500 ms after typing stops
}

function openPaymentModal() {
  const totalEl = document.getElementById("total");
  const modal = document.getElementById("payment-modal");

  if (!totalEl || !modal) return;

  const total = parseFloat(totalEl.innerText) || 0;

  const paymentTotalEl = document.getElementById("payment-total");
  const amountReceivedEl = document.getElementById("amount-received");

  if (paymentTotalEl) {
    paymentTotalEl.innerText = `Rs ${total.toFixed(2)}`;
  }

  if (amountReceivedEl) {
    amountReceivedEl.value = total.toFixed(2);
  }

  calculateChange();

  modal.classList.add("flex");
  modal.classList.remove("hidden");
}

function closePaymentModal() {
  const modal = document.getElementById("payment-modal");

  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function calculateChange() {
  const totalEl = document.getElementById("total");
  const receivedEl = document.getElementById("amount-received");
  const changeEl = document.getElementById("change-amount");

  if (!totalEl || !receivedEl || !changeEl) return;

  const total = parseFloat(totalEl.innerText) || 0;
  const received = parseFloat(receivedEl.value) || 0;
  const change = received - total;

  changeEl.innerText = `Rs ${change.toFixed(2)}`;
}

async function confirmPayment() {
  const paymentMethodEl = document.getElementById("payment-method-modal");
  const amountReceivedEl = document.getElementById("amount-received");
  const fallbackMethodEl = document.getElementById("payment_method");

  const paymentMethod = paymentMethodEl?.value || "cash";
  const amountReceived = parseFloat(amountReceivedEl?.value) || 0;

  if (fallbackMethodEl) {
    fallbackMethodEl.value = paymentMethod;
  }

  await checkout(paymentMethod, amountReceived);

  closePaymentModal();
}

function showOpenSessionModal() {
  const modal = document.getElementById("session-modal");

  if (!modal) return;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  createIcons({ icons });
}

function hideOpenSessionModal() {
  const modal = document.getElementById("session-modal");

  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function startPOSSession() {
  await openSession();
}

// ==========================================
// VITE / UI GLOBAL FUNCTION BRIDGE
// ==========================================

window.openSession = openSession;
window.startPOSSession = startPOSSession;
window.closeSession = closeSession;
window.showOpenSessionModal = showOpenSessionModal;
window.hideOpenSessionModal = hideOpenSessionModal;
window.searchProducts = searchProducts;
window.assignCustomer = assignCustomer;
window.saveNote = saveNote;
window.renderCart = renderCart;
window.createOrder = createOrder;
window.switchOrder = switchOrder;
window.addToCart = addToCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.removeItem = removeItem;
window.filterCategory = filterCategory;
window.checkout = checkout;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.calculateChange = calculateChange;
window.confirmPayment = confirmPayment;
window.showCustomerModal = showCustomerModal;
window.closeCustomerModal = closeCustomerModal;
window.createCustomer = createCustomer;

async function initializePOS() {
  const hasSession = await loadSession();
  await loadProducts();
  await loadCategories();
  await loadCustomers();

  if (hasSession) {
    await loadDraftOrders();
  } else {
    carts = [];
    activeCartId = null;
    renderTabs();
    renderCart();
    showOpenSessionModal();
  }

  // Hook up hardware barcode scanner
  barcodeScanner.onScan = async (code) => {
    // Optional: prefill search box for visibility
    const searchInput = document.getElementById("product-search");
    if (searchInput) searchInput.value = code;
    
    await processBarcode(code);
    
    if (searchInput) {
      setTimeout(() => { searchInput.value = ''; }, 1500);
    }
  };

  createIcons({ icons });
}

window.initializePOS = initializePOS;

