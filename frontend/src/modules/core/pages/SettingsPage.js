import { Sidebar } from "../../../components/Sidebar";

export function SettingsPage() {
    return `
<div class="flex h-screen bg-[#f8fafc]">
    ${Sidebar()}
    <main class="flex-1 p-8 overflow-y-auto">
        <!-- Top Header Panel -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <i data-lucide="settings" class="w-8 h-8 text-indigo-600"></i>
                    <span>Premium POS Settings Center</span>
                </h1>
                <p class="text-slate-500 mt-1">Configure and tune all 20 professional operational matrices of your Point of Sale system.</p>
            </div>
            <div class="flex items-center gap-3">
                <button onclick="saveSettings()" class="h-11 px-6 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-sm hover:shadow-md flex items-center gap-2">
                    <i data-lucide="save" class="w-4 h-4"></i>
                    <span>Save Configuration</span>
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <!-- Left Navigation Menu (Scrollable Sidebar) -->
            <div class="lg:col-span-1 space-y-4">
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 max-h-[70vh] overflow-y-auto">
                    
                    <!-- Group 1: Business Profile -->
                    <div class="mb-4">
                        <p class="text-xxs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Business & Store</p>
                        <nav class="space-y-1">
                            <button onclick="switchTab('company')" id="tab-btn-company" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-indigo-600 bg-indigo-50/80 transition text-left">
                                <i data-lucide="building" class="w-4 h-4"></i>
                                <span>1. Company Profile</span>
                            </button>
                            <button onclick="switchTab('store')" id="tab-btn-store" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="store" class="w-4 h-4"></i>
                                <span>2. Store Settings</span>
                            </button>
                        </nav>
                    </div>

                    <!-- Group 2: POS Experience -->
                    <div class="mb-4">
                        <p class="text-xxs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">POS & Checkout</p>
                        <nav class="space-y-1">
                            <button onclick="switchTab('pos')" id="tab-btn-pos" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="laptop" class="w-4 h-4"></i>
                                <span>3. POS Core Rules</span>
                            </button>
                            <button onclick="switchTab('payment')" id="tab-btn-payment" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="credit-card" class="w-4 h-4"></i>
                                <span>6. Payments Matrix</span>
                            </button>
                            <button onclick="switchTab('receipt')" id="tab-btn-receipt" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="receipt" class="w-4 h-4"></i>
                                <span>7. Receipt Layout</span>
                            </button>
                        </nav>
                    </div>

                    <!-- Group 3: Catalog & Rules -->
                    <div class="mb-4">
                        <p class="text-xxs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Catalog & Stock</p>
                        <nav class="space-y-1">
                            <button onclick="switchTab('inventory')" id="tab-btn-inventory" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="package" class="w-4 h-4"></i>
                                <span>4. Inventory Engine</span>
                            </button>
                            <button onclick="switchTab('tax')" id="tab-btn-tax" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="percent" class="w-4 h-4"></i>
                                <span>5. Tax Framework</span>
                            </button>
                            <button onclick="switchTab('barcode')" id="tab-btn-barcode" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="barcode" class="w-4 h-4"></i>
                                <span>11. Barcodes & Labels</span>
                            </button>
                            <button onclick="switchTab('customer')" id="tab-btn-customer" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="users" class="w-4 h-4"></i>
                                <span>12. Loyalty & Credit</span>
                            </button>
                            <button onclick="switchTab('product')" id="tab-btn-product" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                                <span>13. Products & UOM</span>
                            </button>
                        </nav>
                    </div>

                    <!-- Group 4: Hardware & Alerts -->
                    <div class="mb-4">
                        <p class="text-xxs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Hardware & Comms</p>
                        <nav class="space-y-1">
                            <button onclick="switchTab('printer')" id="tab-btn-printer" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="printer" class="w-4 h-4"></i>
                                <span>10. Thermal Printers</span>
                            </button>
                            <button onclick="switchTab('hardware')" id="tab-btn-hardware" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="cpu" class="w-4 h-4"></i>
                                <span>19. Device Terminals</span>
                            </button>
                            <button onclick="switchTab('notification')" id="tab-btn-notification" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="bell" class="w-4 h-4"></i>
                                <span>9. Comms & Alerts</span>
                            </button>
                        </nav>
                    </div>

                    <!-- Group 5: Access Control -->
                    <div class="mb-4">
                        <p class="text-xxs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Access & Safety</p>
                        <nav class="space-y-1">
                            <button onclick="switchTab('user')" id="tab-btn-user" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="user-check" class="w-4 h-4"></i>
                                <span>8. Cashier Sessions</span>
                            </button>
                            <button onclick="switchTab('security')" id="tab-btn-security" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="shield-alert" class="w-4 h-4"></i>
                                <span>14. Access Security</span>
                            </button>
                        </nav>
                    </div>

                    <!-- Group 6: System Operations -->
                    <div class="mb-2">
                        <p class="text-xxs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Database & System</p>
                        <nav class="space-y-1">
                            <button onclick="switchTab('backup')" id="tab-btn-backup" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="upload-cloud" class="w-4 h-4"></i>
                                <span>15. Cloud Backups</span>
                            </button>
                            <button onclick="switchTab('data')" id="tab-btn-data" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="database" class="w-4 h-4"></i>
                                <span>16. Data Purges</span>
                            </button>
                            <button onclick="switchTab('reports')" id="tab-btn-reports" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                                <span>17. Report Schedules</span>
                            </button>
                            <button onclick="switchTab('appearance')" id="tab-btn-appearance" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="palette" class="w-4 h-4"></i>
                                <span>18. Custom Look</span>
                            </button>
                            <button onclick="switchTab('about')" id="tab-btn-about" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-left">
                                <i data-lucide="info" class="w-4 h-4"></i>
                                <span>20. License & About</span>
                            </button>
                        </nav>
                    </div>

                </div>

                <!-- Logo Section -->
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company Logo</p>
                    <div class="w-24 h-24 mx-auto rounded-2xl border border-slate-200 flex items-center justify-center bg-slate-50 mb-3 overflow-hidden relative group">
                        <img id="setting-logo-preview" src="" alt="Logo" class="w-full h-full object-contain hidden" />
                        <div id="setting-logo-placeholder" class="text-slate-400">
                            <i data-lucide="upload-cloud" class="w-6 h-6 mx-auto mb-1 opacity-50"></i>
                            <span class="text-[10px]">No Logo</span>
                        </div>
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer" onclick="document.getElementById('setting-logo').click()">
                            <span class="text-white text-[10px] font-medium flex items-center gap-1"><i data-lucide="edit-2" class="w-3 h-3"></i> Edit</span>
                        </div>
                    </div>
                    <input type="file" id="setting-logo" class="hidden" accept="image/*" onchange="window.previewLogo(event)">
                    <button type="button" onclick="document.getElementById('setting-logo').click()" class="w-full h-8 rounded-lg border border-slate-200 text-xxs font-bold hover:bg-slate-50 transition text-slate-600 flex items-center justify-center gap-1">
                        <i data-lucide="image-plus" class="w-3 h-3"></i> Upload Image
                    </button>
                </div>
            </div>

            <!-- Right Content Panels Container -->
            <div class="lg:col-span-3 space-y-6">
                
                <!-- 1. COMPANY SETTINGS PANEL -->
                <div id="tab-panel-company" class="settings-panel space-y-6">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="building" class="w-5 h-5 text-indigo-500"></i>
                            Company General Profile
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Manage primary legal and marketing credentials of the company.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Business Name</label>
                                <input id="setting-company_name" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Legal Name</label>
                                <input id="setting-company_legal_name" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Business Type</label>
                                <select id="setting-company_type" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="LLC" selected>LLC (Limited Liability)</option>
                                    <option value="Corporation">Corporation</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Industry</label>
                                <input id="setting-company_industry" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" placeholder="e.g. Retail, Grocery">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Tax Registration Number (VAT/GST)</label>
                                <input id="setting-tax_number" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Business Registration Number</label>
                                <input id="setting-company_registration_number" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Business Email</label>
                                <input id="setting-email" type="email" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Business Phone</label>
                                <input id="setting-phone" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Website URL</label>
                                <input id="setting-website" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="map-pin" class="w-5 h-5 text-indigo-500"></i>
                            Headquarters Address
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Official headquarters geographic reference point.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Full Street Address</label>
                                <textarea id="setting-address" rows="2" class="w-full p-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"></textarea>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                                <input id="setting-company_city" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">State / Province</label>
                                <input id="setting-company_state" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Postal Code</label>
                                <input id="setting-company_postal_code" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Country</label>
                                <input id="setting-company_country" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. STORE SETTINGS PANEL -->
                <div id="tab-panel-store" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="store" class="w-5 h-5 text-indigo-500"></i>
                            Store Identity & Regionalization
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Establish the current active store metrics and measurement units.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Store Name</label>
                                <input id="setting-store_name" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" placeholder="Main Store">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Store Code Identifier</label>
                                <input id="setting-store_code" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" placeholder="STR-001">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Store Manager</label>
                                <input id="setting-store_manager" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Regional Language</label>
                                <select id="setting-store_language" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="en" selected>English (US)</option>
                                    <option value="es">Español (Spanish)</option>
                                    <option value="fr">Français (French)</option>
                                    <option value="de">Deutsch (German)</option>
                                    <option value="ar">العربية (Arabic)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Base Weight Unit</label>
                                <select id="setting-store_weight_unit" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="kg" selected>Kilograms (kg)</option>
                                    <option value="lbs">Pounds (lbs)</option>
                                    <option value="g">Grams (g)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Base Dimension Unit</label>
                                <select id="setting-store_dimension_unit" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="cm" selected>Centimeters (cm)</option>
                                    <option value="inch">Inches (in)</option>
                                    <option value="m">Meters (m)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. POS SETTINGS PANEL -->
                <div id="tab-panel-pos" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="laptop" class="w-5 h-5 text-indigo-500"></i>
                            POS Workspace Core Rules
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Govern point-of-sale checkout operations and cashier workspace flexibility.</p>
                        
                        <div class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Customer</label>
                                    <input id="setting-pos_default_customer" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" placeholder="Walk-In Customer">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Payment Method</label>
                                    <select id="setting-pos_default_payment_method" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                        <option value="Cash" selected>Cash</option>
                                        <option value="Card">Credit/Debit Card</option>
                                        <option value="Digital">Mobile/Digital Wallet</option>
                                    </select>
                                </div>
                            </div>

                            <hr class="border-slate-100 my-2">

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                    <div class="pr-4">
                                        <p class="text-xs font-bold text-slate-800">Allow Price Editing</p>
                                        <p class="text-[10px] text-slate-400">Enable cashier to modify unit price of items in active cart.</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting-pos_allow_price_editing" class="sr-only peer">
                                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                    <div class="pr-4">
                                        <p class="text-xs font-bold text-slate-800">Allow Quantity Editing</p>
                                        <p class="text-[10px] text-slate-400">Cashier can type custom quantities manually in input box.</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting-pos_allow_qty_editing" class="sr-only peer" checked>
                                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                    <div class="pr-4">
                                        <p class="text-xs font-bold text-slate-800">Allow Cart Discounts</p>
                                        <p class="text-[10px] text-slate-400">Toggle overall discount button visibility at bottom checkout bar.</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting-pos_allow_discount" class="sr-only peer" checked>
                                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                    <div class="pr-4">
                                        <p class="text-xs font-bold text-slate-800">Auto Focus Barcode Scanner</p>
                                        <p class="text-[10px] text-slate-400">Automatically focus barcode search box after each item added.</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting-pos_auto_focus_barcode" class="sr-only peer" checked>
                                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                    <div class="pr-4">
                                        <p class="text-xs font-bold text-slate-800">Merge Duplicate Cart Items</p>
                                        <p class="text-[10px] text-slate-400">Increase product count instead of appending duplicate row.</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting-pos_cart_merge_duplicates" class="sr-only peer" checked>
                                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                    <div class="pr-4">
                                        <p class="text-xs font-bold text-slate-800">Enable Draft & Hold Orders</p>
                                        <p class="text-[10px] text-slate-400">Allow parking / saving current session shopping cart list.</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting-pos_enable_drafts" class="sr-only peer" checked>
                                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. INVENTORY ENGINE PANEL -->
                <div id="tab-panel-inventory" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="package" class="w-5 h-5 text-indigo-500"></i>
                            Inventory Tracking Controls
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Establish stock threshold triggers and valuation algorithms.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Low Stock Threshold Warning</label>
                                <input id="setting-inventory_low_stock_threshold" type="number" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="10">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Inventory Valuation Method</label>
                                <select id="setting-inventory_valuation_method" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="FIFO" selected>FIFO (First-In, First-Out)</option>
                                    <option value="LIFO">LIFO (Last-In, First-Out)</option>
                                    <option value="AVCO">Weighted Average Cost (AVCO)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Safety Stock Limit Margin</label>
                                <input id="setting-inventory_safety_stock_warning" type="number" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="5">
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-4">
                                    <p class="text-xs font-bold text-slate-800">Hard-Block Negative Stock</p>
                                    <p class="text-[10px] text-slate-400">Strictly block sale of items with 0 stock count.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-inventory_lock_negative_stock" class="sr-only peer">
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            <div class="md:col-span-2 flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-4">
                                    <p class="text-xs font-bold text-slate-800">Auto Reorder Purchase Orders</p>
                                    <p class="text-[10px] text-slate-400">Automatically compile draft purchase order for suppliers when item goes below threshold.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-inventory_auto_reorder" class="sr-only peer">
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 5. TAX FRAMEWORK PANEL -->
                <div id="tab-panel-tax" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="percent" class="w-5 h-5 text-indigo-500"></i>
                            Taxes and Fiscal Rules
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Set up tax calculation types, base rates, and shipping inclusion rules.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Tax Calculation Class</label>
                                <select id="setting-tax_type" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="Exclusive" selected>Exclusive (Added on top of price)</option>
                                    <option value="Inclusive">Inclusive (Pre-built inside price)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Base Tax Rate (%)</label>
                                <input id="setting-tax_default_rate" type="number" step="0.01" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="15.00">
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-4">
                                    <p class="text-xs font-bold text-slate-800">Tax Shipping Fee Costs</p>
                                    <p class="text-[10px] text-slate-400">Apply standard tax rate to shipping/delivery surcharges.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-tax_on_shipping" class="sr-only peer">
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-4">
                                    <p class="text-xs font-bold text-slate-800">Apply Tax on Discounted Total</p>
                                    <p class="text-[10px] text-slate-400">Calculate tax after overall order discount is subtracted.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-tax_on_discount" class="sr-only peer" checked>
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 6. PAYMENTS MATRIX PANEL -->
                <div id="tab-panel-payment" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="credit-card" class="w-5 h-5 text-indigo-500"></i>
                            Financial Gateway and Rounding rules
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Select allowed checkout lanes and cash drawer change rounding logic.</p>
                        
                        <div class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Currency Rounding Strategy</label>
                                    <select id="setting-payment_rounding" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                        <option value="none" selected>Exact (No Rounding)</option>
                                        <option value="0.05">Round to nearest 0.05 (Nickels)</option>
                                        <option value="0.10">Round to nearest 0.10</option>
                                        <option value="1.00">Round to nearest Integer</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Base Currency</label>
                                    <select id="setting-currency_default" onchange="document.getElementById('setting-currency_symbol').value = this.value === 'USD' || this.value === 'CAD' || this.value === 'AUD' ? '$' : this.value === 'EUR' ? '€' : this.value === 'GBP' ? '£' : '₹'; document.getElementById('setting-currency').value = this.value" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="AUD">AUD - Australian Dollar</option>
                                        <option value="CAD">CAD - Canadian Dollar</option>
                                        <option value="INR">INR - Indian Rupee</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Currency Symbol Indicator</label>
                                    <input id="setting-currency_symbol" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="$">
                                    <input id="setting-currency" type="hidden">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Decimal Places</label>
                                    <select id="setting-currency_decimal_places" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                        <option value="0">0 (e.g. $10)</option>
                                        <option value="1">1 (e.g. $10.0)</option>
                                        <option value="2" selected>2 (e.g. $10.00)</option>
                                    </select>
                                </div>
                            </div>

                            <hr class="border-slate-100 my-2">

                            <div class="grid grid-cols-2 gap-4">
                                <label class="flex items-center gap-2 p-3 bg-slate-50/60 rounded-xl cursor-pointer">
                                    <input type="checkbox" id="setting-payment_enable_cash" class="rounded text-indigo-600 focus:ring-indigo-500" checked>
                                    <span class="text-xs font-semibold text-slate-700">Allow Cash</span>
                                </label>
                                <label class="flex items-center gap-2 p-3 bg-slate-50/60 rounded-xl cursor-pointer">
                                    <input type="checkbox" id="setting-payment_enable_card" class="rounded text-indigo-600 focus:ring-indigo-500" checked>
                                    <span class="text-xs font-semibold text-slate-700">Allow Credit Cards</span>
                                </label>
                                <label class="flex items-center gap-2 p-3 bg-slate-50/60 rounded-xl cursor-pointer">
                                    <input type="checkbox" id="setting-payment_enable_digital" class="rounded text-indigo-600 focus:ring-indigo-500">
                                    <span class="text-xs font-semibold text-slate-700">Allow Mobile Wallets</span>
                                </label>
                                <label class="flex items-center gap-2 p-3 bg-slate-50/60 rounded-xl cursor-pointer">
                                    <input type="checkbox" id="setting-payment_enable_bank" class="rounded text-indigo-600 focus:ring-indigo-500">
                                    <span class="text-xs font-semibold text-slate-700">Allow Wire Transfers</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 7. RECEIPT LAYOUT PANEL -->
                <div id="tab-panel-receipt" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="receipt" class="w-5 h-5 text-indigo-500"></i>
                            Thermal Receipt Blueprint Customization
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Design the formatting blocks of physical customer receipt printouts.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Receipt Header (Store Slogan / Greeting)</label>
                                <input id="setting-company_receipt_header" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" placeholder="Welcome to our store!">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Receipt Footer Message</label>
                                <textarea id="setting-receipt_footer" rows="2" class="w-full p-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" placeholder="Thank you for shopping with us!"></textarea>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Return / Exchange Policy Text</label>
                                <textarea id="setting-company_return_policy" rows="2" class="w-full p-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" placeholder="Returns accepted within 14 days with original recipe."></textarea>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-4">
                                    <p class="text-xs font-bold text-slate-800">Print Store Logo on Slip</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-receipt_show_logo" class="sr-only peer" checked>
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-4">
                                    <p class="text-xs font-bold text-slate-800">Print QR Code on Bottom</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-receipt_show_qr" class="sr-only peer">
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 8. CASHIER SESSIONS PANEL -->
                <div id="tab-panel-user" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="user-check" class="w-5 h-5 text-indigo-500"></i>
                            Cashier and Session Control Defaults
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Govern automatic locks, draft restorations, and opening balance enforcements.</p>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Inactivity Auto-Logout Timer</label>
                                <select id="setting-session_auto_logout" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="0" selected>Disabled (Keep logged in)</option>
                                    <option value="5">5 Minutes</option>
                                    <option value="15">15 Minutes</option>
                                    <option value="30">30 Minutes</option>
                                </select>
                            </div>

                            <hr class="border-slate-100 my-1">

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl">
                                    <div class="pr-2">
                                        <p class="text-xs font-bold text-slate-800">Require Drawer Opening Float</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting-cash_drawer_require_opening" class="sr-only peer">
                                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl">
                                    <div class="pr-2">
                                        <p class="text-xs font-bold text-slate-800">Require Shift Session Before Sale</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting-session_require_before_selling" class="sr-only peer">
                                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 9. COMMS & ALERTS PANEL -->
                <div id="tab-panel-notification" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="bell" class="w-5 h-5 text-indigo-500"></i>
                            Outbound Mail & Gateway SMS Diagnostics
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Establish relay credentials and monitor connectivity dispatch logs in real-time.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">SMTP Outbound Host Relay</label>
                                <input id="setting-email_smtp_host" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="smtp.postmarkapp.com">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">SMTP Port</label>
                                <input id="setting-email_smtp_port" type="number" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="587">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">SMTP Authorized Username</label>
                                <input id="setting-email_username" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">SMTP Secret Password</label>
                                <input id="setting-email_password" type="password" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50">
                            </div>
                        </div>

                        <div class="mt-4 flex gap-3">
                            <button onclick="testEmailConfig()" class="h-9 px-4 rounded-lg bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 transition text-xs flex items-center gap-1">
                                <i data-lucide="send" class="w-3.5 h-3.5"></i> Launch SMTP Diagnostic Handshake
                            </button>
                        </div>

                        <div id="email-log-output" class="hidden mt-3 p-3 bg-slate-950 text-slate-300 font-mono text-[10px] rounded-lg max-h-40 overflow-y-auto"></div>
                    </div>
                </div>

                <!-- 10. THERMAL PRINTERS PANEL -->
                <div id="tab-panel-printer" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="printer" class="w-5 h-5 text-indigo-500"></i>
                            Hardware & Thermal Printers Routing
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Direct different document formats automatically to specific connected devices.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Receipt Printer</label>
                                <input id="setting-printer_default_receipt" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="PRN-THERMAL-80">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Invoice Printer</label>
                                <input id="setting-printer_default_invoice" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="PRN-LASER-OFFICE">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Label Printer</label>
                                <input id="setting-printer_default_label" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="PRN-ZEBRA-BARCODE">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Paper Roll Width</label>
                                <select id="setting-printer_paper_width" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="80mm" selected>80mm (Standard)</option>
                                    <option value="58mm">58mm (Compact)</option>
                                </select>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-2">
                                    <p class="text-xs font-bold text-slate-800">Auto Cut Paper</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-printer_auto_cut" class="sr-only peer" checked>
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-2">
                                    <p class="text-xs font-bold text-slate-800">Kick Cash Drawer After Pay</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-printer_open_drawer" class="sr-only peer" checked>
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 11. BARCODES & LABELS PANEL -->
                <div id="tab-panel-barcode" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="barcode" class="w-5 h-5 text-indigo-500"></i>
                            Barcode Scanning & Labeling Blueprint
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Establish barcode format standards, scanner modifiers, and printed tag layouts.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Standard Barcode Format Class</label>
                                <select id="setting-barcode_format_default" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="CODE128" selected>CODE128 (Alphanumeric, high density)</option>
                                    <option value="EAN13">EAN-13 (Standard retail packaging)</option>
                                    <option value="UPCA">UPC-A (North American retail)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Label Tag Size</label>
                                <select id="setting-barcode_label_size" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="50x25">50mm x 25mm (Standard)</option>
                                    <option value="38x25">38mm x 25mm (Small)</option>
                                    <option value="75x50">75mm x 50mm (Large)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Scanner Keyboard Prefix</label>
                                <input id="setting-barcode_prefix" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" placeholder="e.g. ~ (Tilde)">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Scanner Keyboard Suffix (Enter Code)</label>
                                <input id="setting-barcode_suffix" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="\\r\\n">
                            </div>
                            <div class="md:col-span-2 flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-2">
                                    <p class="text-xs font-bold text-slate-800">Print Price Badge On Tag</p>
                                    <p class="text-[10px] text-slate-400">Include clear currency retail sales price text underneath barcode lines.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-barcode_print_price" class="sr-only peer" checked>
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 12. LOYALTY & CREDIT PANEL -->
                <div id="tab-panel-customer" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="users" class="w-5 h-5 text-indigo-500"></i>
                            Customer Profiles & Loyalty Engine
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Establish default customer groups, points ratios, and cashier mandatory alerts.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Customer Group Assigned</label>
                                <select id="setting-customer_default_group" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="Retail" selected>Retail / Casual</option>
                                    <option value="VIP">VIP Customer</option>
                                    <option value="Wholesale">Wholesale Merchant</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Maximum Store Credit Allowed</label>
                                <input id="setting-customer_credit_limit" type="number" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="500">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Loyalty Spent currency to 1 Point Ratio</label>
                                <input id="setting-customer_loyalty_ratio" type="number" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="10">
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-2">
                                    <p class="text-xs font-bold text-slate-800">Activate Loyalty Points Program</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-customer_loyalty_enabled" class="sr-only peer" checked>
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 13. PRODUCTS & UOM PANEL -->
                <div id="tab-panel-product" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="shopping-bag" class="w-5 h-5 text-indigo-500"></i>
                            Product Catalog Defaults & Attributes
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Govern catalog default settings and automatic asset resizing algorithms.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Unit of Measure (UOM)</label>
                                <select id="setting-product_default_uom" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="pcs" selected>Pieces (pcs)</option>
                                    <option value="kg">Kilograms (kg)</option>
                                    <option value="box">Box (box)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Brand Name</label>
                                <input id="setting-product_default_brand" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="Generic">
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-2">
                                    <p class="text-xs font-bold text-slate-800">Enable Serial Tracking</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-product_serial_tracking" class="sr-only peer">
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-2">
                                    <p class="text-xs font-bold text-slate-800">Optimize Images on Upload</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-product_optimize_images" class="sr-only peer" checked>
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 14. ACCESS SECURITY PANEL -->
                <div id="tab-panel-security" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="shield-alert" class="w-5 h-5 text-indigo-500"></i>
                            Operator Login & Access Security Controls
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Mitigate data leaks, enforce strong keys, and prevent brute-force entry.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Enforce Password Complexity</label>
                                <select id="setting-security_password_complexity" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="none">Standard (Any characters)</option>
                                    <option value="medium" selected>Medium (Letters + Numbers, 8 chars)</option>
                                    <option value="strong">High (Special symbols, uppercase, 12 chars)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Max Failed Login Attempts</label>
                                <input id="setting-security_max_login_attempts" type="number" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="5">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Enforce Password Renewal (Days)</label>
                                <input id="setting-security_password_expiry_days" type="number" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="90">
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-2">
                                    <p class="text-xs font-bold text-slate-800">MFA Two-Factor (OTP Code)</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-security_mfa_enabled" class="sr-only peer">
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 15. CLOUD BACKUPS PANEL -->
                <div id="tab-panel-backup" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="upload-cloud" class="w-5 h-5 text-indigo-500"></i>
                            Durable Backups and Auto Schedules
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Ensure physical system database copy backups are compiled on safe offsite locations.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Automatic Backup Frequency</label>
                                <select id="setting-backup_frequency" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="daily" selected>Daily (Midnight)</option>
                                    <option value="weekly">Weekly (Sunday night)</option>
                                    <option value="disabled">Disabled (Manual only)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Destination Location Server</label>
                                <select id="setting-backup_destination" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="local" selected>Local Storage Server Folder</option>
                                    <option value="gdrive">Google Drive Cloud Bucket</option>
                                    <option value="s3">Amazon Web S3 Storage</option>
                                </select>
                            </div>
                        </div>

                        <div class="mt-4 flex gap-3">
                            <a href="/api/settings/backup-download" download class="h-9 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-xs font-bold text-slate-700 flex items-center gap-1">
                                <i data-lucide="download" class="w-3.5 h-3.5"></i> Download Local System SQL Backup
                            </a>
                        </div>
                    </div>
                </div>

                <!-- 16. DATA PURGES PANEL -->
                <div id="tab-panel-data" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="database" class="w-5 h-5 text-indigo-500"></i>
                            Automatic Data Archiving and Purging
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Specify the legal minimum retention limit of temporary telemetry files.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Retain Operator Audit Logs For</label>
                                <select id="setting-retention_audit_logs" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="90" selected>90 Days (Recommended)</option>
                                    <option value="180">180 Days</option>
                                    <option value="365">1 Year</option>
                                    <option value="9999">Keep Indefinitely</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Purge Transaction Logs Older Than</label>
                                <input id="setting-data_purge_days" type="number" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="365">
                            </div>
                            <div class="md:col-span-2 flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-2">
                                    <p class="text-xs font-bold text-slate-800">Clear Temporary Upload Caches Daily</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-retention_delete_temp" class="sr-only peer" checked>
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 17. REPORT SCHEDULES PANEL -->
                <div id="tab-panel-reports" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="bar-chart-3" class="w-5 h-5 text-indigo-500"></i>
                            Reports Schedules & Profit Calculations
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Tune automated metrics calculations and nightly PDF compilation schedules.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nightly Email reports Frequency</label>
                                <select id="setting-reports_email_frequency" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="disabled" selected>Disabled (Off)</option>
                                    <option value="daily">Daily Sales summary (11:30 PM)</option>
                                    <option value="weekly">Weekly performance digest</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Profit margin Formula Method</label>
                                <select id="setting-reports_margin_method" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="gross" selected>Gross Profit Margin Percentage</option>
                                    <option value="markup">Cost Markup Ratio</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Date Period Range</label>
                                <select id="setting-reports_default_period" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="today" selected>Today (Real-time)</option>
                                    <option value="this_week">This Week (Mon-Sun)</option>
                                    <option value="this_month">This Month</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Exported Type Class</label>
                                <select id="setting-reports_export_format" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="csv" selected>CSV Spreadsheet File</option>
                                    <option value="xlsx">Microsoft Excel (.xlsx)</option>
                                    <option value="pdf">Adobe Portable Document PDF</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 18. CUSTOM LOOK PANEL -->
                <div id="tab-panel-appearance" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="palette" class="w-5 h-5 text-indigo-500"></i>
                            User Interface Look and Styling
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Re-brand theme tones, UI densities, and operational audio triggers.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Theme (Visual Mode)</label>
                                <select id="setting-user_theme" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="Light" selected>Light Theme (Classic Clean)</option>
                                    <option value="Dark">Dark Luxury theme</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Workspace Density layout</label>
                                <select id="setting-appearance_density" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="Standard" selected>Standard (Balanced UI)</option>
                                    <option value="Compact">Compact Dense (Maximize items visible)</option>
                                    <option value="Cozy">Cozy (Larger touches for iPad/Tablet)</option>
                                </select>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-2">
                                    <p class="text-xs font-bold text-slate-800">Play POS Sound Effects</p>
                                    <p class="text-[10px] text-slate-400">Beep sound feedback on item checkout and scanner scan success.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-appearance_audio_effects" class="sr-only peer" checked>
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            <div class="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl">
                                <div class="pr-2">
                                    <p class="text-xs font-bold text-slate-800">Collapse Left Sidebar Default</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="setting-user_sidebar_collapsed" class="sr-only peer">
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 19. DEVICE TERMINALS PANEL -->
                <div id="tab-panel-hardware" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="cpu" class="w-5 h-5 text-indigo-500"></i>
                            Hardware Terminals Integration
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">Configure customer facing display screens and direct weighing scale communication.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Customer-Facing Screen Slogan</label>
                                <input id="setting-hardware_customer_display" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="Thanks for shopping with us!">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Weighing Scale Interface Port</label>
                                <select id="setting-hardware_scale_interface" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white">
                                    <option value="none" selected>None (Disabled)</option>
                                    <option value="COM1">COM1 Serial Interface</option>
                                    <option value="USB">USB Scale (HID Standard)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 20. LICENSE & ABOUT PANEL -->
                <div id="tab-panel-about" class="settings-panel space-y-6 hidden">
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <i data-lucide="info" class="w-5 h-5 text-indigo-500"></i>
                            Software License & Support
                        </h3>
                        <p class="text-xs text-slate-400 mb-4">View operational environment logs, software version matrices, and active licenses.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">System Software Version</label>
                                <input id="setting-about_version" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="v2.4.1-Build-Professional" readonly>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">License Status Key</label>
                                <input id="setting-about_license" type="text" class="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50" value="LIC-RGB-ACTIVE-8821B" readonly>
                            </div>
                        </div>

                        <hr class="border-slate-100 my-2">

                        <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p class="text-xs font-bold text-slate-700 mb-1">Diagnostic Checks & System Audits</p>
                            <p class="text-[11px] text-slate-500 mb-4">Trigger direct automated index rebuilding and memory audits on the database container.</p>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <button onclick="triggerMaintenanceAction('clear-cache')" class="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition gap-1.5 text-center shadow-xs">
                                    <i data-lucide="trash-2" class="w-5 h-5 text-indigo-600"></i>
                                    <span class="text-[10px] font-bold text-slate-700">Clear Cache</span>
                                </button>
                                <button onclick="triggerMaintenanceAction('optimize-db')" class="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition gap-1.5 text-center shadow-xs">
                                    <i data-lucide="database" class="w-5 h-5 text-emerald-600"></i>
                                    <span class="text-[10px] font-bold text-slate-700">Optimize DB</span>
                                </button>
                                <button onclick="triggerMaintenanceAction('rebuild-index')" class="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition gap-1.5 text-center shadow-xs">
                                    <i data-lucide="search" class="w-5 h-5 text-amber-600"></i>
                                    <span class="text-[10px] font-bold text-slate-700">Rebuild Index</span>
                                </button>
                                <button onclick="triggerMaintenanceAction('storage-usage')" class="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition gap-1.5 text-center shadow-xs">
                                    <i data-lucide="hard-drive" class="w-5 h-5 text-pink-600"></i>
                                    <span class="text-[10px] font-bold text-slate-700">View Storage</span>
                                </button>
                            </div>
                        </div>

                        <!-- Maintenance Diagnostics Output Terminal Console -->
                        <div id="maintenance-console" class="mt-4 p-4 bg-slate-900 rounded-xl font-mono text-xs text-emerald-400 hidden max-h-56 overflow-y-auto relative shadow-inner">
                            <button onclick="this.parentElement.classList.add('hidden')" class="absolute top-2 right-2 text-slate-500 hover:text-slate-300">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                            <p class="font-bold border-b border-slate-800 pb-1.5 mb-2 text-slate-400 flex items-center gap-1.5"><i data-lucide="terminal" class="w-3.5 h-3.5"></i> Maintenance Console Terminal Output</p>
                            <div id="maintenance-console-content" class="space-y-1"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>
</div>
    `;
}
