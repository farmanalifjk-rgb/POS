import { createIcons, icons } from "lucide";
import { getProducts, createProduct, updateProduct2, deleteProduct, getCategories, getBrands } from "../../../js/inventory/services/inventory-api.js";
import { Pagination } from "../../../shared/Pagination";

let filters = { search: "", category: "", brand: "", status: "", page: 1, page_size: 20, ordering: "-created_at" };

const pagination = new Pagination({
    prevButtonId: "prev-page",
    nextButtonId: "next-page",
    containerId: "pagination-numbers",
    pageSize: filters.page_size,
    onPageChange: async (page) => { filters.page = page; await loadProducts(); }
});

window.initializeAllProducts = async function() {
    pagination.initialize();
    await loadFilterOptions();
    await loadProducts();
    initializeProductsEvents();
}

async function loadFilterOptions() {
    try {
        const [catResp, brandResp] = await Promise.all([
            getCategories({ page_size: 100 }),
            getBrands({ page_size: 100 })
        ]);
        
        const catSelect = document.getElementById("product-category-filter");
        const brandSelect = document.getElementById("product-brand-filter");
        const formCatSelect = document.getElementById("product-category");
        const formBrandSelect = document.getElementById("product-brand");

        let catOptions = `<option value="">All Categories</option>`;
        let formCatOptions = `<option value="">Select Category</option>`;
        (catResp.results || []).forEach(c => {
            const opt = `<option value="${c.id}">${c.name}</option>`;
            catOptions += opt;
            formCatOptions += opt;
        });
        
        let brandOptions = `<option value="">All Brands</option>`;
        let formBrandOptions = `<option value="">Select Brand</option>`;
        (brandResp.results || []).forEach(b => {
            const opt = `<option value="${b.id}">${b.name}</option>`;
            brandOptions += opt;
            formBrandOptions += opt;
        });

        if (catSelect) catSelect.innerHTML = catOptions;
        if (formCatSelect) formCatSelect.innerHTML = formCatOptions;
        if (brandSelect) brandSelect.innerHTML = brandOptions;
        if (formBrandSelect) formBrandSelect.innerHTML = formBrandOptions;

    } catch (e) {
        console.error("Failed to load filter options", e);
    }
}

async function loadProducts() {
    try {
        const response = await getProducts(filters);
        
        // Update stats
        document.getElementById("total-products").innerText = response.count || 0;
        
        // Compute other stats from results (approximate if paginated, ideally comes from API)
        const active = (response.results || []).filter(p => p.is_active).length;
        const lowStock = (response.results || []).filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.min_stock || 0)).length;
        const outOfStock = (response.results || []).filter(p => p.stock_quantity <= 0).length;
        
        document.getElementById("active-products").innerText = active;
        document.getElementById("low-stock").innerText = lowStock;
        document.getElementById("out-of-stock").innerText = outOfStock;

        renderProductsTable(response.results || []);
        pagination.updateFromResponse(response);
    } catch (e) {
        console.error("Failed to load products", e);
        document.getElementById("products-table").innerHTML = `<div class="p-8 text-center text-rose-500 font-medium bg-rose-50 rounded-2xl">Error loading products.</div>`;
    }
}

function initializeProductsEvents() {
    const search = document.getElementById("product-search");
    if (search) {
        search.addEventListener("input", debounce(async (e) => {
            filters.search = e.target.value; filters.page = 1; pagination.reset(); await loadProducts();
        }, 400));
    }
    
    ['product-category-filter', 'product-brand-filter', 'product-status-filter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("change", async (e) => {
                if (id === 'product-category-filter') filters.category = e.target.value;
                if (id === 'product-brand-filter') filters.brand = e.target.value;
                if (id === 'product-status-filter') filters.status = e.target.value;
                filters.page = 1; pagination.reset(); await loadProducts();
            });
        }
    });

    const form = document.getElementById("product-form");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            await saveProduct();
        });
    }
}

window.refreshProducts = async function() {
    filters = { search: "", category: "", brand: "", status: "", page: 1, page_size: 20, ordering: "-created_at" };
    document.getElementById("product-search").value = "";
    document.getElementById("product-category-filter").value = "";
    document.getElementById("product-brand-filter").value = "";
    document.getElementById("product-status-filter").value = "";
    pagination.reset();
    await loadProducts();
};

function debounce(callback, delay = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => callback(...args), delay); };
}

function renderProductsTable(rows) {
    if (rows.length === 0) {
        document.getElementById("products-table").innerHTML = `
            <div class="flex flex-col items-center justify-center p-12 text-slate-500">
                <i data-lucide="package-x" class="w-16 h-16 text-slate-300 mb-4"></i>
                <h3 class="text-lg font-semibold text-slate-700">No products found</h3>
                <p class="text-sm">Try adjusting your filters or add a new product.</p>
            </div>
        `;
        createIcons({ icons });
        return;
    }

    const tableHTML = `
        <div class="overflow-x-auto w-full">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50/50 border-b border-slate-200">
                        <th class="p-4 w-12 text-center rounded-tl-xl">
                            <input type="checkbox" id="select-all" class="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer">
                        </th>
                        <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                        <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                        <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                        <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
                        <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Price</th>
                        <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Stock</th>
                        <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                        <th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right rounded-tr-xl">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${rows.map(row => {
                        const imageHtml = (row.image_url || row.image)
                            ? `<img src="${row.image_url || row.image}" class="w-10 h-10 rounded-lg object-cover border border-slate-200" alt="${row.name}">` 
                            : `<div class="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center"><i data-lucide="package" class="w-5 h-5 text-slate-400"></i></div>`;
                        
                        const statusBadge = row.is_active
                            ? `<span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">Active</span>`
                            : `<span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Inactive</span>`;
                        
                        let stockColor = "text-slate-700";
                        if (row.stock_quantity <= 0) stockColor = "text-rose-600 font-bold";
                        else if (row.stock_quantity <= (row.min_stock || 0)) stockColor = "text-amber-600 font-bold";

                        return `
                            <tr class="group hover:bg-sky-50/40 transition-colors cursor-pointer">
                                <td class="p-4 text-center">
                                    <input type="checkbox" class="product-select w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer" value="${row.id}">
                                </td>
                                <td class="p-4">
                                    <div class="flex items-center gap-3">
                                        ${imageHtml}
                                        <div>
                                            <p class="text-sm font-semibold text-slate-800 group-hover:text-sky-700">${row.name}</p>
                                            <p class="text-xs text-slate-500">${row.barcode || 'No barcode'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-4 text-sm font-medium text-slate-600">${row.sku}</td>
                                <td class="p-4 text-sm text-slate-600">${row.category_name || '-'}</td>
                                <td class="p-4 text-sm text-slate-600">${row.brand_name || '-'}</td>
                                <td class="p-4 text-sm font-semibold text-slate-700 text-right">$${parseFloat(row.sales_price).toFixed(2)}</td>
                                <td class="p-4 text-sm ${stockColor} text-right">${row.stock_quantity} ${row.unit || ''}</td>
                                <td class="p-4 text-center">${statusBadge}</td>
                                <td class="p-4 text-right">
                                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onclick="window.duplicateProduct(${row.id})" class="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition" title="Duplicate">
                                            <i data-lucide="copy" class="w-4 h-4"></i>
                                        </button>
                                        <button onclick="window.showProductHistory(${row.id})" class="w-8 h-8 rounded-lg flex items-center justify-center text-teal-600 hover:bg-teal-100 transition" title="History">
                                            <i data-lucide="clock" class="w-4 h-4"></i>
                                        </button>
                                        <button onclick="openEditProductModal(${row.id})" class="w-8 h-8 rounded-lg flex items-center justify-center text-sky-600 hover:bg-sky-100 transition" title="Edit">
                                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                                        </button>
                                        <button onclick="deleteProductHandler(${row.id})" class="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-100 transition" title="Delete">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById("products-table").innerHTML = tableHTML;
    createIcons({ icons });

    const selectAll = document.getElementById("select-all");
    const checkboxes = document.querySelectorAll(".product-select");
    if(selectAll) {
        selectAll.addEventListener("change", (e) => {
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateBulkToolbar();
        });
    }
    checkboxes.forEach(cb => {
        cb.addEventListener("change", updateBulkToolbar);
    });
}

function updateBulkToolbar() {
    const selected = Array.from(document.querySelectorAll(".product-select:checked")).map(cb => cb.value);
    const toolbar = document.getElementById("bulk-action-toolbar");
    const countEl = document.getElementById("selected-count");
    if(toolbar && countEl) {
        countEl.innerText = selected.length;
        if(selected.length > 0) {
            toolbar.classList.remove("hidden");
            toolbar.classList.add("flex");
        } else {
            toolbar.classList.add("hidden");
            toolbar.classList.remove("flex");
        }
    }
}

window.openCreateProductModal = function() {
    document.getElementById("product-form").reset();
    document.getElementById("product-id").value = "";
    document.getElementById("form-modal-title").innerText = "Add Product";
    document.getElementById("name-count").innerText = "0/100";
    document.getElementById("desc-count").innerText = "0/1000";
    document.getElementById("variants-container").innerHTML = "";
    document.getElementById("variants-empty").classList.remove("hidden");
    document.getElementById("product-form-modal").classList.remove("hidden");
    document.getElementById("product-form-modal").classList.add("flex");
};

window.openEditProductModal = async function(id) {
    try {
        const response = await getProducts({ id });
        const product = response.results ? response.results.find(p => p.id === id) : response.find(p=>p.id===id);
        if (!product) return;

        document.getElementById("product-id").value = product.id;
        document.getElementById("product-name").value = product.name || "";
        document.getElementById("product-sku").value = product.sku || "";
        document.getElementById("product-barcode").value = product.barcode || "";
        document.getElementById("product-category").value = product.category || "";
        document.getElementById("product-brand").value = product.brand || "";
        document.getElementById("product-cost-price").value = product.cost_price || "";
        document.getElementById("product-sales-price").value = product.sales_price || "";
        document.getElementById("product-stock").value = product.stock_quantity || "";
        document.getElementById("product-min-stock").value = product.min_stock || "";
        document.getElementById("product-max-stock").value = product.max_stock || "";
        document.getElementById("product-unit").value = product.unit || "";
        document.getElementById("product-description").value = product.description || "";
        document.getElementById("product-is-active").checked = product.is_active;
        
        // Populate new fields if they exist
        if(document.getElementById("product-hsn")) document.getElementById("product-hsn").value = product.hsn_code || "";
        if(document.getElementById("product-tax")) document.getElementById("product-tax").value = product.tax_class || "";
        if(document.getElementById("product-supplier")) document.getElementById("product-supplier").value = product.supplier || "";
        if(document.getElementById("product-tags")) document.getElementById("product-tags").value = product.tags || "";

        document.getElementById("name-count").innerText = (product.name || "").length + "/100";
        document.getElementById("desc-count").innerText = (product.description || "").length + "/1000";
        document.getElementById("variants-container").innerHTML = "";
        document.getElementById("variants-empty").classList.remove("hidden");

        document.getElementById("form-modal-title").innerText = "Edit Product";
        document.getElementById("product-form-modal").classList.remove("hidden");
        document.getElementById("product-form-modal").classList.add("flex");
    } catch (e) {
        console.error("Error fetching product details", e);
        alert("Failed to load product details.");
    }
};

window.closeProductModal = function() {
    document.getElementById("product-form-modal").classList.add("hidden");
    document.getElementById("product-form-modal").classList.remove("flex");
};

window.submitProductForm = async function(event) {
    if(event) event.preventDefault();
    const id = document.getElementById("product-id").value;
    
    const formData = new FormData();
    formData.append("name", document.getElementById("product-name").value);
    formData.append("sku", document.getElementById("product-sku").value);
    formData.append("barcode", document.getElementById("product-barcode").value);
    
    const category = document.getElementById("product-category").value;
    if (category) formData.append("category", category);
    
    const brand = document.getElementById("product-brand").value;
    if (brand) formData.append("brand", brand);
    
    formData.append("cost_price", document.getElementById("product-cost-price").value);
    formData.append("sales_price", document.getElementById("product-sales-price").value);
    
    const stock = document.getElementById("product-stock").value;
    if (stock) formData.append("stock_quantity", stock);
    
    const minStock = document.getElementById("product-min-stock").value;
    if (minStock) formData.append("min_stock", minStock);
    
    const maxStock = document.getElementById("product-max-stock").value;
    if (maxStock) formData.append("max_stock", maxStock);
    
    formData.append("unit", document.getElementById("product-unit").value);
    formData.append("description", document.getElementById("product-description").value);
    formData.append("is_active", document.getElementById("product-is-active").checked);
    
    // Append new fields
    if(document.getElementById("product-hsn")) formData.append("hsn_code", document.getElementById("product-hsn").value);
    if(document.getElementById("product-tax")) formData.append("tax_class", document.getElementById("product-tax").value);
    if(document.getElementById("product-supplier")) formData.append("supplier", document.getElementById("product-supplier").value);
    if(document.getElementById("product-tags")) formData.append("tags", document.getElementById("product-tags").value);

    // Collect variants
    const variantRows = document.querySelectorAll(".variant-row");
    const variants = [];
    variantRows.forEach(row => {
        const type = row.querySelector(".variant-type").value;
        const val = row.querySelector(".variant-value").value;
        if(type && val) variants.push({ type, value: val });
    });
    if(variants.length > 0) {
        formData.append("variants_json", JSON.stringify(variants));
    }

    const imageInput = document.getElementById("product-image");
    if (imageInput && imageInput.files.length > 0) {
        formData.append("image", imageInput.files[0]);
    }

    try {
        const btn = document.querySelector("#product-form button[type='submit']") || document.querySelector("#product-form button[onclick*='submitProductForm']");
        let originalText = "Save Product";
        if(btn) {
            originalText = btn.innerHTML;
            btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Saving...`;
            btn.disabled = true;
            createIcons({ icons });
        }

        if (id) {
            await updateProduct2(id, formData);
        } else {
            await createProduct(formData);
        }
        
        window.closeProductModal();
        await loadProducts();
        
    } catch (e) {
        console.error("Error saving product", e);
        alert("Failed to save product.");
    } finally {
        const btn = document.querySelector("#product-form button[type='submit']") || document.querySelector("#product-form button[onclick*='submitProductForm']");
        if(btn) {
            btn.innerHTML = `<i data-lucide="save" class="w-4 h-4"></i> Save Product`;
            btn.disabled = false;
            createIcons({ icons });
        }
    }
};

// Variant Slot Logic
window.addVariantRow = function() {
    const container = document.getElementById("variants-container");
    const emptyState = document.getElementById("variants-empty");
    if(emptyState) emptyState.classList.add("hidden");
    
    const row = document.createElement("div");
    row.className = "variant-row flex items-end gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl";
    row.innerHTML = `
        <div class="flex-1">
            <label class="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Option Name</label>
            <input type="text" class="variant-type w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700 bg-white" placeholder="e.g. Size, Color">
        </div>
        <div class="flex-[2]">
            <label class="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Option Values</label>
            <input type="text" class="variant-value w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700 bg-white" placeholder="e.g. Small, Medium, Large (comma separated)">
        </div>
        <button type="button" onclick="window.removeVariantRow(this)" class="w-10 h-10 rounded-lg border border-rose-200 bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition shrink-0" title="Remove">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
        </button>
    `;
    container.appendChild(row);
};

window.removeVariantRow = function(btn) {
    const row = btn.closest(".variant-row");
    if(row) row.remove();
    
    const container = document.getElementById("variants-container");
    if(container.children.length === 0) {
        document.getElementById("variants-empty").classList.remove("hidden");
    }
};

// Image Drag and Drop for Product Form
document.addEventListener("DOMContentLoaded", () => {
    const dropzone = document.getElementById("prod-img-dropzone");
    const fileInput = document.getElementById("product-image");
    
    if(dropzone && fileInput) {
        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("border-blue-400", "bg-blue-50");
        });
        dropzone.addEventListener("dragleave", (e) => {
            e.preventDefault();
            dropzone.classList.remove("border-blue-400", "bg-blue-50");
        });
        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("border-blue-400", "bg-blue-50");
            if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                const p = dropzone.querySelector("p");
                if(p) p.innerText = e.dataTransfer.files[0].name;
            }
        });
        fileInput.addEventListener("change", (e) => {
            if(e.target.files && e.target.files.length > 0) {
                const p = dropzone.querySelector("p");
                if(p) p.innerText = e.target.files[0].name;
            }
        });
    }
});

window.deleteProductHandler = async function(id) {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        try {
            await deleteProduct(id);
            await loadProducts();
        } catch (e) {
            console.error("Error deleting product", e);
            alert("Failed to delete product.");
        }
    }
};

window.exportProducts = async function(format) {
    try {
        const res = await fetch('/api/inventory/products/export/');
        if (!res.ok) throw new Error("Export request failed");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_export.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch(e) { 
        console.error("Export failed", e); 
        alert("Failed to export products."); 
    }
};

window.bulkDeleteProducts = async function() {
    const selected = Array.from(document.querySelectorAll(".product-select:checked")).map(cb => parseInt(cb.value));
    if(selected.length === 0) return;
    if(confirm(`Are you sure you want to delete ${selected.length} products?`)) {
        try {
            await fetch('/api/inventory/products/bulk_delete/', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selected })
            });
            await loadProducts();
            updateBulkToolbar();
        } catch(e) { console.error(e); alert("Bulk delete failed."); }
    }
};

window.openBulkEditModal = function() {
    const bulkCatSelect = document.getElementById("bulk-category");
    if (bulkCatSelect) {
        bulkCatSelect.innerHTML = document.getElementById("product-category-filter").innerHTML;
    }
    document.getElementById("bulk-edit-modal").classList.remove("hidden");
    document.getElementById("bulk-edit-modal").classList.add("flex");
};

window.closeBulkEditModal = function() {
    document.getElementById("bulk-edit-modal").classList.add("hidden");
    document.getElementById("bulk-edit-modal").classList.remove("flex");
};

window.submitBulkEdit = async function() {
    const selected = Array.from(document.querySelectorAll(".product-select:checked")).map(cb => parseInt(cb.value));
    const category_id = document.getElementById("bulk-category").value;
    const price_adjustment = document.getElementById("bulk-price-adjustment").value;
    
    try {
        const payload = { ids: selected };
        if (category_id) payload.category_id = parseInt(category_id);
        if (price_adjustment) payload.price_adjustment = parseFloat(price_adjustment);
        
        await fetch('/api/inventory/products/bulk_edit/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        window.closeBulkEditModal();
        await loadProducts();
        updateBulkToolbar();
    } catch(e) { console.error(e); alert("Bulk edit failed"); }
};

window.openImportModal = function() {
    document.getElementById("import-csv-modal").classList.remove("hidden");
    document.getElementById("import-csv-modal").classList.add("flex");
};

window.closeImportModal = function() {
    document.getElementById("import-csv-modal").classList.add("hidden");
    document.getElementById("import-csv-modal").classList.remove("flex");
};

window.submitImportCSV = async function() {
    const fileInput = document.getElementById("import-csv-file");
    if(!fileInput.files.length) return alert("Please select a file.");
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    try {
        await fetch('/api/inventory/products/import/', {
            method: 'POST',
            body: formData
        });
        window.closeImportModal();
        await loadProducts();
    } catch(e) { console.error(e); alert("Import failed."); }
};

window.duplicateProduct = async function(id) {
    try {
        await fetch(`/api/inventory/products/${id}/duplicate/`, { method: 'POST' });
        await loadProducts();
    } catch(e) { console.error(e); alert("Duplicate failed"); }
};

window.showProductHistory = async function(id) {
    try {
        const res = await fetch(`/api/inventory/products/${id}/history/`);
        if (!res.ok) throw new Error("History request failed");
        const history = await res.json();
        
        const content = document.getElementById("history-content");
        if(!history || history.length === 0) {
            content.innerHTML = `<div class="text-sm text-slate-500">No history available.</div>`;
        } else {
            content.innerHTML = history.map(h => `
                <div class="flex gap-3 relative pb-4 border-b border-slate-100 last:border-0 mt-4">
                    <div class="mt-1 w-2 h-2 rounded-full bg-sky-500 shrink-0"></div>
                    <div>
                        <p class="text-sm font-medium text-slate-800">${h.action || 'Updated'}</p>
                        <p class="text-xs text-slate-500 mt-1">${new Date(h.date || Date.now()).toLocaleString()}</p>
                        ${h.details ? `<p class="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg">${h.details}</p>` : ''}
                    </div>
                </div>
            `).join("");
        }
        
        document.getElementById("history-slideover").classList.remove("hidden");
        document.getElementById("history-slideover").classList.add("flex");
    } catch(e) { console.error(e); alert("History fetch failed"); }
};

window.closeHistorySlideover = function() {
    document.getElementById("history-slideover").classList.add("hidden");
    document.getElementById("history-slideover").classList.remove("flex");
};

// EXPORT LOGIC
function buildProductExportUrl(type) {
    let qs = new URLSearchParams();
    if (filters.search) qs.append('search', filters.search);
    if (filters.category) qs.append('category', filters.category);
    if (filters.brand) qs.append('brand', filters.brand);
    if (filters.status) qs.append('status', filters.status);
    const qsStr = qs.toString() ? `?${qs.toString()}` : '';
    return `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"}/products-manage/export/${type}/${qsStr}`;
}

window.exportProductsCSV = () => window.open(buildProductExportUrl('csv'), '_blank');
window.exportProductsExcel = () => window.open(buildProductExportUrl('excel'), '_blank');
window.exportProductsPDF = () => window.open(buildProductExportUrl('pdf'), '_blank');

window.toggleExportMenu = (e) => {
    e.stopPropagation();
    const menu = document.getElementById("export-menu");
    if(menu) menu.classList.toggle("hidden");
};
window.closeExportMenu = () => document.getElementById("export-menu")?.classList.add("hidden");
document.addEventListener("click", (e) => {
    if(!e.target.closest("#export-menu-container")) window.closeExportMenu();
});

// IMPORT MODAL LOGIC
window.openImportModal = function() {
    document.getElementById("import-modal").classList.remove("hidden");
    document.getElementById("import-modal").classList.add("flex");
};

window.closeImportModal = function() {
    document.getElementById("import-modal").classList.add("hidden");
    document.getElementById("import-modal").classList.remove("flex");
    document.getElementById("import-dropzone").classList.remove("border-sky-500", "bg-sky-50", "border-solid");
    document.getElementById("import-dropzone").classList.add("border-dashed");
    document.getElementById("import-file-info").classList.add("hidden");
    document.getElementById("import-file-name").innerText = "";
    document.getElementById("import-progress-bar").style.width = '0%';
};

window.handleImportDragOver = function(e) {
    e.preventDefault();
    document.getElementById("import-dropzone").classList.add("border-sky-500", "bg-sky-50", "border-solid");
    document.getElementById("import-dropzone").classList.remove("border-dashed");
};

window.handleImportDragLeave = function(e) {
    e.preventDefault();
    document.getElementById("import-dropzone").classList.remove("border-sky-500", "bg-sky-50", "border-solid");
    document.getElementById("import-dropzone").classList.add("border-dashed");
};

window.handleImportDrop = function(e) {
    e.preventDefault();
    document.getElementById("import-dropzone").classList.remove("border-sky-500", "bg-sky-50", "border-solid");
    document.getElementById("import-dropzone").classList.add("border-dashed");
    if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        window._importFile = e.dataTransfer.files[0];
        processImportFile(e.dataTransfer.files[0]);
    }
};

window.handleImportFileSelect = function(e) {
    if(e.target.files && e.target.files.length > 0) {
        window._importFile = e.target.files[0];
        processImportFile(e.target.files[0]);
    }
};

function processImportFile(file) {
    document.getElementById("import-file-info").classList.remove("hidden");
    document.getElementById("import-file-name").innerText = `Importing_[${file.name}]`;
    document.getElementById("import-file-size").innerText = `0 KB of ${(file.size/1024).toFixed(0)} KB · Uploading...`;
    
    const bar = document.getElementById("import-progress-bar");
    let prog = 0;
    bar.style.width = '0%';
    const intv = setInterval(() => {
        prog += Math.random() * 20;
        if(prog >= 100) {
            prog = 100;
            clearInterval(intv);
            document.getElementById("import-file-size").innerText = `${(file.size/1024).toFixed(0)} KB · Upload complete!`;
        }
        bar.style.width = prog + '%';
    }, 200);
}

window.submitImport = async function() {
    if(!window._importFile) {
        return alert("Please select a file to import.");
    }
    
    const formData = new FormData();
    formData.append("file", window._importFile);

    try {
        const btn = document.querySelector("#import-modal button[onclick*='submitImport']");
        const origText = btn ? btn.innerHTML : "Import product";
        if (btn) {
            btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Importing...`;
            btn.disabled = true;
            createIcons({ icons });
        }

        const token = localStorage.getItem("pos_token");
        const headers = token ? { Authorization: `Token ${token}` } : {};

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"}/products-manage/import/`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!res.ok) {
            const text = await res.text();
            let err = {};
            try { err = JSON.parse(text); } catch (e) { err = { error: text }; }
            throw new Error(err.error || err.detail || "Import failed");
        }
        
        const data = await res.json();
        alert(data.message || "Products imported successfully.");
        
        window.closeImportModal();
        window._importFile = null;
        await loadProducts();
    } catch(e) {
        console.error("Import failed:", e);
        alert(e.message || "Failed to import products.");
    } finally {
        const btn = document.querySelector("#import-modal button[onclick*='submitImport']");
        if (btn) {
            btn.innerHTML = `Import product`;
            btn.disabled = false;
        }
    }
};