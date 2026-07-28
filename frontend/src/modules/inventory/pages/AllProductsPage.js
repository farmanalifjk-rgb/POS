import { Sidebar } from "../../../components/Sidebar";
import { ProductCards } from "../../../js/Products/components/ProductCards";
import { ProductToolbar } from "../../../js/Products/components/ProductToolbar";

export function AllProductsPage() {
    return `
<div class="flex h-screen bg-[#f4f7f6]">
    ${Sidebar()}
    <main class="flex-1 p-8 overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold">All Products</h1>
                <p class="text-gray-500 mt-1">Manage your inventory and catalog</p>
            </div>
            <div class="flex items-center gap-3">
                <button onclick="window.openImportModal()" class="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition flex items-center gap-2 shadow-sm">
                    <i data-lucide="package-plus" class="w-4 h-4"></i> Import products
                </button>
                <div class="relative" id="export-menu-container">
                    <button onclick="window.toggleExportMenu(event)" class="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition flex items-center gap-2 shadow-sm">
                        <i data-lucide="download" class="w-4 h-4"></i> Export <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
                    </button>
                    <div id="export-menu" class="hidden absolute right-0 top-12 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50">
                        <button onclick="window.exportProductsCSV(); window.closeExportMenu();" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition">
                            <div class="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i></div>
                            <div class="text-left"><p class="text-sm font-medium text-slate-800">Export CSV</p><p class="text-xs text-slate-400">Comma separated</p></div>
                        </button>
                        <button onclick="window.exportProductsExcel(); window.closeExportMenu();" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition">
                            <div class="w-9 h-9 rounded-xl bg-lime-50 flex items-center justify-center"><i data-lucide="sheet" class="w-4 h-4 text-lime-600"></i></div>
                            <div class="text-left"><p class="text-sm font-medium text-slate-800">Export Excel</p><p class="text-xs text-slate-400">Microsoft Excel</p></div>
                        </button>
                        <button onclick="window.exportProductsPDF(); window.closeExportMenu();" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition">
                            <div class="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center"><i data-lucide="file-text" class="w-4 h-4 text-rose-600"></i></div>
                            <div class="text-left"><p class="text-sm font-medium text-slate-800">Export PDF</p><p class="text-xs text-slate-400">Printable document</p></div>
                        </button>
                    </div>
                </div>
                <button onclick="openCreateProductModal()" class="h-11 px-5 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition shadow-lg shadow-sky-600/20 flex items-center gap-2">
                    <i data-lucide="plus" class="w-4 h-4"></i> Add Product
                </button>
            </div>
        </div>

        ${ProductCards()}

        <div class="premium-surface rounded-3xl p-6 bg-white shadow-sm border border-slate-100 relative">
            ${ProductToolbar()}
            
            <div id="bulk-action-toolbar" class="hidden absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl items-center gap-4 border border-slate-700 transition-all">
                <span class="text-sm font-medium"><span id="selected-count">0</span> selected</span>
                <div class="w-px h-5 bg-slate-600"></div>
                <button onclick="window.openBulkEditModal()" class="text-sm font-medium hover:text-sky-400 transition flex items-center gap-2"><i data-lucide="edit-2" class="w-4 h-4"></i> Bulk Edit</button>
                <button onclick="window.bulkDeleteProducts()" class="text-sm font-medium text-rose-400 hover:text-rose-300 transition flex items-center gap-2"><i data-lucide="trash-2" class="w-4 h-4"></i> Delete All</button>
            </div>

            <div id="products-table"></div>
        </div>

        <div class="flex items-center justify-between px-6 py-4 border-t mt-4 bg-white rounded-2xl shadow-sm border border-slate-100">
            <p id="pagination-info" class="text-sm text-gray-500"></p>
            <div class="flex items-center gap-2">
                <button id="prev-page" class="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition" disabled>
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                <div id="pagination-numbers" class="text-sm text-gray-600 font-medium">
                    <span class="px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">Page 1 of 1</span>
                </div>
                <button id="next-page" class="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition" disabled>
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
            </div>
        </div>

        <!-- Product Form Modal -->
        <div id="product-form-modal" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div class="bg-[#f4f7f6] rounded-[24px] w-full max-w-[1200px] shadow-2xl overflow-hidden my-4 relative flex flex-col max-h-[95vh]">
                <!-- Header -->
                <div class="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-100 shrink-0">
                    <h2 id="form-modal-title" class="text-xl font-bold text-slate-800">Add Product</h2>
                    <button type="button" onclick="closeProductModal()" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <!-- Form Content -->
                <form id="product-form" class="flex-1 overflow-y-auto p-6" onsubmit="window.submitProductForm(event)">
                    <input type="hidden" id="product-id" />
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        <!-- Left Column -->
                        <div class="space-y-6">
                            <!-- Basic Information Card -->
                            <div class="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm">
                                <div class="flex items-center gap-2 mb-6">
                                    <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><i data-lucide="layout-template" class="w-4 h-4"></i></div>
                                    <h3 class="text-[15px] font-bold text-slate-800">Basic Information</h3>
                                </div>
                                <div class="space-y-5">
                                    <div>
                                        <label class="flex justify-between text-[13px] font-semibold text-slate-700 mb-1.5">
                                            <span>Product Name <span class="text-rose-500">*</span></span>
                                            <span class="text-slate-400 font-normal text-[11px]" id="name-count">0/100</span>
                                        </label>
                                        <input id="product-name" type="text" required class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="e.g. Premium T-Shirt" maxlength="100" oninput="document.getElementById('name-count').innerText = this.value.length + '/100'">
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">SKU <span class="text-rose-500">*</span></label>
                                            <input id="product-sku" type="text" required class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="e.g. SKU-123">
                                        </div>
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Barcode</label>
                                            <div class="relative">
                                                <input id="product-barcode" type="text" class="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="e.g. 890123456789">
                                                <i data-lucide="scan-line" class="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Category <span class="text-rose-500">*</span></label>
                                            <select id="product-category" required class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700 bg-white appearance-none cursor-pointer"></select>
                                        </div>
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Brand</label>
                                            <select id="product-brand" class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700 bg-white appearance-none cursor-pointer"></select>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Description</label>
                                        <div class="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
                                            <!-- Rich Text Toolbar -->
                                            <div class="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50 overflow-x-auto">
                                                <select class="text-xs border-none bg-transparent font-medium text-slate-600 focus:ring-0 outline-none w-24 cursor-pointer">
                                                    <option>Normal</option>
                                                    <option>Heading 1</option>
                                                    <option>Heading 2</option>
                                                </select>
                                                <div class="w-px h-4 bg-slate-200 mx-1"></div>
                                                <button type="button" class="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600 font-serif font-bold">B</button>
                                                <button type="button" class="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600 font-serif italic">I</button>
                                                <button type="button" class="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600 font-serif underline">U</button>
                                                <div class="w-px h-4 bg-slate-200 mx-1"></div>
                                                <button type="button" class="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600"><i data-lucide="list" class="w-4 h-4"></i></button>
                                                <button type="button" class="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600"><i data-lucide="list-ordered" class="w-4 h-4"></i></button>
                                                <div class="w-px h-4 bg-slate-200 mx-1"></div>
                                                <button type="button" class="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600"><i data-lucide="align-left" class="w-4 h-4"></i></button>
                                                <button type="button" class="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600"><i data-lucide="align-center" class="w-4 h-4"></i></button>
                                                <div class="w-px h-4 bg-slate-200 mx-1"></div>
                                                <button type="button" class="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600"><i data-lucide="link" class="w-4 h-4"></i></button>
                                            </div>
                                            <textarea id="product-description" rows="4" class="w-full p-4 text-sm outline-none text-slate-700 resize-none" placeholder="Enter product description..." maxlength="1000" oninput="document.getElementById('desc-count').innerText = this.value.length + '/1000'"></textarea>
                                            <div class="px-4 pb-2 flex justify-end">
                                                <span class="text-slate-400 font-normal text-[11px]" id="desc-count">0/1000</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Product Image Card -->
                            <div class="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm">
                                <div class="flex items-center gap-2 mb-6">
                                    <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600"><i data-lucide="image" class="w-4 h-4"></i></div>
                                    <h3 class="text-[15px] font-bold text-slate-800">Product Image</h3>
                                </div>
                                
                                <div class="border border-slate-200 rounded-xl p-4 flex gap-6 items-center border-dashed">
                                    <div class="flex-1 flex flex-col items-center justify-center border-r border-slate-100 py-4" id="prod-img-dropzone">
                                        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                                            <i data-lucide="cloud-upload" class="w-6 h-6"></i>
                                        </div>
                                        <p class="text-[13px] font-semibold text-slate-700 mb-1">Drag & drop an image here</p>
                                        <p class="text-xs text-slate-400 mb-4">or</p>
                                        <button type="button" onclick="document.getElementById('product-image').click()" class="h-9 px-5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition">Choose File</button>
                                        <input id="product-image" type="file" accept="image/*" class="hidden">
                                    </div>
                                    <div class="flex-1 space-y-2">
                                        <p class="text-xs font-semibold text-slate-500">Recommended</p>
                                        <ul class="text-[11px] text-slate-400 space-y-1.5 list-disc pl-4 marker:text-slate-300">
                                            <li>JPG, PNG or WEBP</li>
                                            <li>Max size 2MB</li>
                                            <li>Recommended 800x800px</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column -->
                        <div class="space-y-6">
                            <!-- Pricing & Inventory Card -->
                            <div class="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm">
                                <div class="flex items-center gap-2 mb-6">
                                    <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><i data-lucide="dollar-sign" class="w-4 h-4"></i></div>
                                    <h3 class="text-[15px] font-bold text-slate-800">Pricing & Inventory</h3>
                                </div>
                                <div class="space-y-5">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Cost Price <span class="text-rose-500">*</span></label>
                                            <div class="relative">
                                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                                                <input id="product-cost-price" type="number" step="0.01" required class="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="0.00">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Sales Price <span class="text-rose-500">*</span></label>
                                            <div class="relative">
                                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                                                <input id="product-sales-price" type="number" step="0.01" required class="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="0.00">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-3 gap-4">
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Stock Qty</label>
                                            <input id="product-stock" type="number" class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="0">
                                        </div>
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Min Stock <span class="text-rose-500">*</span></label>
                                            <input id="product-min-stock" type="number" required class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="5">
                                        </div>
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Max Stock</label>
                                            <input id="product-max-stock" type="number" class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="100">
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Unit <span class="text-rose-500">*</span></label>
                                            <input id="product-unit" type="text" required class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="e.g. pcs, kg, box">
                                        </div>
                                        <div>
                                            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Unit Type</label>
                                            <select class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700 bg-white appearance-none cursor-pointer">
                                                <option>Single Unit</option>
                                                <option>Box / Pack</option>
                                                <option>Weight (kg/lb)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="pt-2">
                                        <label class="flex items-start gap-3 cursor-pointer group">
                                            <div class="relative flex items-center justify-center mt-0.5">
                                                <input type="checkbox" id="product-is-active" class="peer appearance-none w-5 h-5 rounded border-2 border-slate-300 checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer" checked>
                                                <i data-lucide="check" class="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                                            </div>
                                            <div>
                                                <span class="text-[13px] font-bold text-slate-700 block">Active Product</span>
                                                <span class="text-xs text-slate-500 block mt-0.5">Inactive products won't be visible in POS</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Additional Information Card -->
                            <div class="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm">
                                <div class="flex items-center gap-2 mb-6">
                                    <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600"><i data-lucide="info" class="w-4 h-4"></i></div>
                                    <h3 class="text-[15px] font-bold text-slate-800">Additional Information</h3>
                                </div>
                                <div class="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">HSN / SAC Code</label>
                                        <input id="product-hsn" type="text" class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="e.g. 21069099">
                                    </div>
                                    <div>
                                        <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Tax Class</label>
                                        <select id="product-tax" class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700 bg-white appearance-none cursor-pointer">
                                            <option value="">Select Tax Class</option>
                                            <option value="standard">Standard (10%)</option>
                                            <option value="zero">Zero (0%)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Supplier</label>
                                        <select id="product-supplier" class="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700 bg-white appearance-none cursor-pointer">
                                            <option value="">Select Supplier</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Tags</label>
                                        <div class="relative">
                                            <input id="product-tags" type="text" class="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none text-slate-700" placeholder="Add tags...">
                                            <i data-lucide="tag" class="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Variant Slot (Full Width Bottom) -->
                        <div class="lg:col-span-2 bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm mt-2">
                             <div class="flex items-center justify-between mb-6">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><i data-lucide="layers" class="w-4 h-4"></i></div>
                                    <h3 class="text-[15px] font-bold text-slate-800">Variants (Optional)</h3>
                                </div>
                                <button type="button" onclick="window.addVariantRow()" class="h-9 px-4 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1.5 transition">
                                    <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Variant
                                </button>
                            </div>
                            
                            <div id="variants-container" class="space-y-4">
                                <!-- Variant Rows will be injected here -->
                            </div>
                            <div id="variants-empty" class="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                                <p class="text-[13px] font-medium text-slate-500">No variants added. Click "Add Variant" to configure sizes, colors, etc.</p>
                            </div>
                        </div>

                    </div>
                </form>
                
                <!-- Footer -->
                <div class="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 rounded-b-[24px]">
                    <button type="button" onclick="document.getElementById('product-form').reset()" class="text-[13px] font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-2">
                        <i data-lucide="rotate-ccw" class="w-4 h-4"></i> Reset Form
                    </button>
                    <div class="flex gap-3">
                        <button type="button" onclick="window.closeProductModal()" class="h-11 px-6 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                        <button type="button" onclick="window.submitProductForm(event)" class="h-11 px-8 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm shadow-blue-600/20">
                            <i data-lucide="save" class="w-4 h-4"></i> Save Product
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Bulk Edit Modal -->
        <div id="bulk-edit-modal" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 items-center justify-center p-4">
            <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 class="text-xl font-bold text-slate-800">Bulk Edit Products</h2>
                    <button onclick="window.closeBulkEditModal()" class="text-slate-400 hover:bg-slate-100 hover:text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Change Category</label>
                        <select id="bulk-category" class="premium-input w-full h-11 px-4 rounded-xl border-slate-200 focus:ring-sky-500"></select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Price Adjustment (%)</label>
                        <input type="number" id="bulk-price-adjustment" class="premium-input w-full h-11 px-4 rounded-xl border-slate-200 focus:ring-sky-500" placeholder="e.g. 10 or -10">
                    </div>
                </div>
                <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                    <button onclick="window.closeBulkEditModal()" class="h-10 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                    <button onclick="window.submitBulkEdit()" class="h-10 px-4 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700">Apply Changes</button>
                </div>
            </div>
        </div>








        

<div class="p-6 space-y-6">

    <!-- Upload Area -->
    <div id="import-dropzone"
        class="relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 hover:border-sky-400 transition-all duration-300 cursor-pointer">

        <div class="absolute inset-0 opacity-40 pointer-events-none">
            <div class="absolute w-72 h-72 -top-24 -right-24 rounded-full bg-sky-100 blur-3xl"></div>
            <div class="absolute w-56 h-56 -bottom-20 -left-20 rounded-full bg-indigo-100 blur-3xl"></div>
        </div>

        <div class="relative z-10 px-8 py-10 text-center">

            <!-- Icons -->
            <div class="flex justify-center mb-6">

                <div
                    class="relative w-24 h-20 flex items-center justify-center">

                    <div
                        class="absolute left-1 rotate-[-15deg] w-12 h-14 rounded-xl bg-white shadow border flex items-center justify-center">
                        <span class="text-[10px] font-bold text-green-600">
                            XLSX
                        </span>
                    </div>

                    <div
                        class="absolute z-20 w-14 h-16 rounded-xl bg-white shadow-xl border flex items-center justify-center">
                        <span class="text-xs font-bold text-emerald-600">
                            CSV
                        </span>
                    </div>

                    <div
                        class="absolute right-1 rotate-[15deg] w-12 h-14 rounded-xl bg-white shadow border flex items-center justify-center">
                        <span class="text-[10px] font-bold text-red-500">
                            PDF
                        </span>
                    </div>

                </div>

            </div>

            <h3 class="text-lg font-semibold text-slate-800">
                Drag & Drop Product File
            </h3>

            <p class="mt-2 text-sm text-slate-500">
                Supports CSV, Excel (.xlsx), or PDF files up to
                <strong>5 MB</strong>
            </p>

            <div class="mt-6">

                <button
                    onclick="document.getElementById('hidden-file-input').click()"
                    class="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-lg shadow-sky-500/20 transition">

                    <i data-lucide="upload" class="w-4 h-4"></i>

                    Browse Files

                </button>

            </div>

            <input
                id="hidden-file-input"
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                class="hidden"
                onchange="window.handleImportFileSelect(event)">

        </div>

    </div>

    <!-- Upload Preview -->
    <div id="import-file-info"
        class="hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <div class="flex items-center gap-4">

            <div
                class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">

                <i data-lucide="file-spreadsheet"
                    class="w-6 h-6 text-emerald-600"></i>

            </div>

            <div class="flex-1">

                <h4 id="import-file-name"
                    class="font-semibold text-slate-800">
                </h4>

                <p id="import-file-size"
                    class="text-sm text-slate-500">
                </p>

            </div>

            <button
                onclick="window.removeImportFile()"
                class="w-9 h-9 rounded-xl hover:bg-red-50 text-red-500">

                <i data-lucide="trash-2" class="w-4 h-4"></i>

            </button>

        </div>

        <div class="mt-5">

            <div
                class="flex justify-between text-xs text-slate-500 mb-2">

                <span>Uploading...</span>

                <span id="import-progress-text">
                    0%
                </span>

            </div>

            <div
                class="w-full h-2 rounded-full bg-slate-200 overflow-hidden">

                <div
                    id="import-progress-bar"
                    class="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                    style="width:0%">
                </div>

            </div>

        </div>

    </div>

    <!-- Divider -->

    <div class="flex items-center gap-4">

        <div class="flex-1 h-px bg-slate-200"></div>

        <span
            class="text-xs font-semibold text-slate-400 uppercase tracking-widest">

            OR

        </span>

        <div class="flex-1 h-px bg-slate-200"></div>

    </div>

    <!-- Google Sheet -->

    <div>

        <label
            class="text-sm font-semibold text-slate-700 mb-2 block">

            Import from Google Sheets

        </label>

        <div class="flex gap-3">

            <div
                class="flex flex-1 overflow-hidden rounded-xl border border-slate-200">

                <div
                    class="px-4 bg-slate-50 border-r border-slate-200 flex items-center">

                    <i data-lucide="sheet"
                        class="w-4 h-4 text-green-600"></i>

                </div>

                <input
                    id="google-sheet-link"
                    type="text"
                    placeholder="Paste Google Sheet URL..."
                    class="flex-1 h-11 px-4 outline-none">

            </div>

            <button
                class="px-5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 font-semibold">

                Fetch

            </button>

        </div>

    </div>

    <!-- Tips -->

    <div
        class="rounded-2xl bg-amber-50 border border-amber-200 p-4">

        <div class="flex gap-3">

            <i data-lucide="info"
                class="w-5 h-5 text-amber-600 mt-0.5"></i>

            <div>

                <h4
                    class="font-semibold text-amber-800">

                    Import Tips

                </h4>

                <ul
                    class="mt-2 space-y-1 text-sm text-amber-700">

                    <li>• Download the sample CSV before importing.</li>

                    <li>• SKU and Barcode should be unique.</li>

                    <li>• Category must already exist.</li>

                    <li>• Images are imported separately.</li>

                </ul>

            </div>

        </div>

    </div>

</div>

        <!-- History Slide-over -->
        <div id="history-slideover" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 justify-end transition-opacity">
            <div class="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col translate-x-0 transition-transform">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 class="text-xl font-bold text-slate-800">Product History</h2>
                    <button onclick="window.closeHistorySlideover()" class="text-slate-400 hover:bg-slate-100 hover:text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                <div id="history-content" class="flex-1 overflow-y-auto p-6 space-y-4">
                    <!-- History timeline injected here -->
                </div>
            </div>
        </div>
    </main>
</div>
    `;
}