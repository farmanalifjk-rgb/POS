const params = new URLSearchParams(window.location.search);

const type = params.get("type");
const id = params.get("id");


loadReceipt();

async function loadReceipt() {

    let url = "";

    if (type === "sale") {
        url = `http://127.0.0.1:8000/api/receipt/${id}/`;
    }
    else if (type === "refund") {
        url = `http://127.0.0.1:8000/api/refund-receipt/${id}/`;
    }
    else {
        alert("Unknown receipt type");
        return;
    }



    const res = await fetch(url);


    const data = await res.json();


    renderReceipt(data);
}

function renderReceipt(data) {
  const company = data.company;

  const order = data.order;

  const totals = data.totals;

  const items = data.items;

  const receiptType = data.receipt_type;

  const receiptTitle =
    receiptType === "refund"
        ? "REFUND RECEIPT"
        : "SALES RECEIPT";

  const receipt = document.getElementById("receipt");

  receipt.classList.remove("paper-58mm", "paper-80mm", "paper-A5", "paper-A4");

  receipt.classList.add(`paper-${company.receipt_paper}`);

  let html = "";

  if (company.logo) {
    html += `
        <div class="flex justify-center mb-3">
            <img
                src="http://127.0.0.1:8000${company.logo}"
                class="h-24 object-contain">
        </div>
    `;
  }

  html += `
<div class="text-center">

<h1 class="text-3xl font-bold">
${company.name}
</h1>

<p class="text-gray-600">
${company.tagline}
</p>

<p class="text-sm">
${company.address}
</p>

<p class="text-sm">
☎ ${company.phone}
</p>

<p class="text-sm">
${company.email}
</p>

<p class="text-sm">
${company.website}
</p>

<p class="text-sm">
GST: ${company.gst || "-"}
</p>

</div>

<hr class="my-4">
`;



  html += `
<table class="w-full text-sm mb-4">


<tr>
<td><b>${receiptTitle}</b></td>
<td>${order.number}</td>
</tr>

<tr>
<td><b>Date</b></td>
<td>${new Date(order.date).toLocaleString()}</td>
</tr>

${
  receiptType === "refund"
    ? `
<tr>
    <td><b>Original Order</b></td>
    <td>${order.original_order}</td>
</tr>
`
    : ""
}

<tr>
<td><b>Customer</b></td>
<td>${order.customer}</td>
</tr>

<tr>
<td><b>Payment</b></td>
<td>${order.payment_method}</td>
</tr>

</table>
`;

  html += `

<table class="w-full text-sm border-collapse">

<thead class="border-y">

<tr>

<th class="text-left py-2">
Item
</th>

<th class="text-center">
${receiptType === "refund" ? "Refund Qty" : "Qty"}
</th>

<th class="text-right">
Price
</th>

<th class="text-right">
Total
</th>

</tr>

</thead>

<tbody>

`;

  items.forEach((item) => {
    html += `

<tr>

<td>

${item.name}

</td>

<td class="text-center">

${item.qty}

</td>

<td class="text-right">

${company.currency} ${item.price}

</td>

<td class="text-right">

${company.currency} ${item.subtotal}

</td>

</tr>

`;
  });

  html += `

</tbody>

</table>

`;

  html += `

<hr class="my-4">

<div class="space-y-1">

<div class="flex justify-between">

<span>

Subtotal

</span>

<span>

${company.currency} ${totals.subtotal}

</span>

</div>

<div class="flex justify-between">

<span>

Discount

</span>

<span>

${company.currency} ${totals.discount}

</span>

</div>

<div class="flex justify-between">

<span>

Tax

</span>

<span>

${company.currency} ${totals.tax}

</span>

</div>

<div class="flex justify-between bg-black text-white p-2 rounded mt-3">

<span class="font-bold">
${receiptType === "refund" ? "REFUND TOTAL" : "TOTAL"}
</span>

<span class="font-bold">
${company.currency} ${totals.total}
</span>

</div>

${
receiptType === "refund"
? `
<div class="flex justify-between">

    <span>Refund Amount</span>

    <span>${company.currency} ${totals.total}</span>

</div>
`
: `
<div class="flex justify-between">

    <span>Paid</span>

    <span>${company.currency} ${totals.paid}</span>

</div>

<div class="flex justify-between">

    <span>Change</span>

    <span>${company.currency} ${totals.change}</span>

</div>
`
}

</div>

`;

if (order.note) {

    html += `

<hr class="my-4">

<h3 class="font-bold">
    ${receiptType === "refund" ? "Refund Reason" : "Order Note"}
</h3>

<p>
    ${order.note}
</p>

`;

}

  html += `

<div class="text-center mt-8">

<p class="font-bold">
${company.footer_message}
</p>

<p class="text-gray-500">
${receiptType === "refund"
    ? "Refund Processed Successfully"
    : "Visit Again"}
</p>

<p>

${company.website}

</p>

</div>

`;

if (receiptType === "refund") {

    html += `

<hr class="my-4">

<p class="text-center text-red-600 font-bold text-lg">

REFUND RECEIPT

</p>

`;

}

html += `
<div class="mt-8 text-center">

    <svg id="barcode"></svg>

    <p class="text-sm mt-2">
        ${order.number}
    </p>

</div>
`;

  document.getElementById("receipt").innerHTML = html;

  JsBarcode("#barcode", order.number, {

    format: "CODE128",

    width: 2,

    height: 60,

    displayValue: false,

    margin: 10

});

  setTimeout(() => {
    window.print();
  }, 500);
}
