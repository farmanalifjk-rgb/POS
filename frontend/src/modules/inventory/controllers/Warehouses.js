window.initializeWarehouses = function() {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const authHeaders = {
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    };

    let allWarehouses = [];
    let stores = [];

    async function loadData() {
        try {
            const [whRes, stRes, prodRes] = await Promise.all([
                fetch(`${API_BASE}/enterprise/warehouses/`, { headers: authHeaders }),
                fetch(`${API_BASE}/stores/`, { headers: authHeaders }),
                fetch(`${API_BASE}/inventory/products/?page_size=1`, { headers: authHeaders })
            ]);

            allWarehouses = await whRes.json();
            stores = await stRes.json();
            const products = await prodRes.json();
            
            updateStats(products.count || products.length || 0);
            renderWarehouses();
            populateStores();
        } catch (error) {
            console.error('Error loading warehouses:', error);
        }
    }

    function updateStats(totalProducts) {
        const totalWh = allWarehouses.length;
        const activeWh = allWarehouses.filter(w => w.is_active).length;
        
        if (document.getElementById('total-warehouses')) {
            document.getElementById('total-warehouses').innerText = totalWh;
            document.getElementById('active-warehouses').innerText = activeWh;
            document.getElementById('total-products').innerText = totalProducts;
        }
    }

    function renderWarehouses() {
        const list = document.getElementById('warehouse-list');
        if (!list) return;

        const search = (document.getElementById('warehouse-search')?.value || '').toLowerCase();
        const filtered = allWarehouses.filter(w => 
            w.name.toLowerCase().includes(search) || 
            (w.code && w.code.toLowerCase().includes(search))
        );

        list.innerHTML = filtered.map(w => `
            <div onclick="window.selectWarehouse(${w.id})" class="cursor-pointer bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <i data-lucide="warehouse" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800">${w.name}</h3>
                            <p class="text-xs text-slate-500">Code: ${w.code || 'N/A'}</p>
                        </div>
                    </div>
                    ${w.is_active 
                        ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>'
                        : '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Inactive</span>'
                    }
                </div>
                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span class="text-slate-500 truncate"><i data-lucide="map-pin" class="w-3 h-3 inline mr-1"></i>${w.address || 'No address'}</span>
                    <button onclick="event.stopPropagation(); window.deleteWarehouse(${w.id})" class="text-slate-400 hover:text-red-500 hidden group-hover:block transition-colors"><i data-lucide="trash" class="w-4 h-4"></i></button>
                </div>
            </div>
        `).join('');

        if (window.lucide) lucide.createIcons();
    }

    window.selectWarehouse = async function(id) {
        document.querySelectorAll('#warehouse-list > div').forEach(el => el.classList.remove('border-indigo-500', 'ring-1', 'ring-indigo-500'));
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('border-indigo-500', 'ring-1', 'ring-indigo-500');
        }

        const panel = document.getElementById('warehouse-stock-panel');
        if (!panel) return;
        panel.innerHTML = `<div class="p-8 text-center text-slate-500"><i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2"></i>Loading stock...</div>`;
        if (window.lucide) lucide.createIcons();

        try {
            const res = await fetch(`${API_BASE}/enterprise/warehouses/${id}/stock/`, { headers: authHeaders });
            const stock = await res.json();
            
            let lowStockCount = 0;

            const rows = stock.map(s => {
                const isLow = s.quantity <= (s.reorder_point || 0);
                if (isLow) lowStockCount++;
                
                return `
                <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 font-medium text-slate-800">${s.product_name}</td>
                    <td class="px-4 py-3 text-slate-500 text-sm">${s.sku || 'N/A'}</td>
                    <td class="px-4 py-3 font-medium ${isLow ? 'text-red-600' : 'text-slate-700'}">${s.quantity}</td>
                    <td class="px-4 py-3 text-slate-500 text-sm">${s.reorder_point || 0}</td>
                    <td class="px-4 py-3 text-slate-500 text-sm">${s.bin_location || '-'}</td>
                    <td class="px-4 py-3">
                        ${isLow 
                            ? '<span class="px-2 py-1 rounded text-[10px] uppercase font-bold bg-red-100 text-red-700">Low Stock</span>'
                            : '<span class="px-2 py-1 rounded text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700">OK</span>'
                        }
                    </td>
                </tr>
            `}).join('');

            const wh = allWarehouses.find(w => w.id === id);

            panel.innerHTML = `
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                    <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 class="font-bold text-slate-800 flex items-center"><i data-lucide="box" class="w-4 h-4 mr-2 text-indigo-500"></i> Stock: ${wh?.name || ''}</h3>
                        <div class="text-xs font-medium text-slate-500">${stock.length} items</div>
                    </div>
                    <div class="overflow-y-auto flex-1">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-white sticky top-0 border-b border-slate-100 shadow-sm z-10">
                                <tr>
                                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Product</th>
                                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Min</th>
                                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Bin</th>
                                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${rows || `<tr><td colspan="6" class="px-4 py-8 text-center text-slate-500">No stock found in this warehouse.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            if (document.getElementById('low-stock-count')) {
                document.getElementById('low-stock-count').innerText = lowStockCount;
            }

            if (window.lucide) lucide.createIcons();
        } catch (e) {
            panel.innerHTML = `<div class="p-8 text-center text-red-500">Failed to load stock data.</div>`;
        }
    };

    function populateStores() {
        const sel = document.getElementById('wh_store_id');
        if (!sel) return;
        sel.innerHTML = '<option value="">None (Independent)</option>' + stores.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    window.openWarehouseModal = function() {
        const form = document.getElementById('warehouse-form');
        if (form) form.reset();
        const modal = document.getElementById('warehouse-modal');
        if (modal) modal.classList.remove('hidden');
    };

    window.closeWarehouseModal = function() {
        const modal = document.getElementById('warehouse-modal');
        if (modal) modal.classList.add('hidden');
    };

    window.submitWarehouse = async function(e) {
        e.preventDefault();
        const payload = {
            code: document.getElementById('wh_code').value,
            name: document.getElementById('wh_name').value,
            address: document.getElementById('wh_address').value,
            store_id: document.getElementById('wh_store_id').value || null,
            is_active: document.getElementById('wh_is_active').checked
        };

        try {
            const res = await fetch(`${API_BASE}/enterprise/warehouses/`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                window.closeWarehouseModal();
                loadData();
            } else {
                alert('Failed to create warehouse');
            }
        } catch(e) { console.error(e); }
    };

    window.deleteWarehouse = async function(id) {
        if(!confirm('Delete this warehouse?')) return;
        try {
            const res = await fetch(`${API_BASE}/enterprise/warehouses/${id}/`, { method: 'DELETE', headers: authHeaders });
            if(res.ok) loadData();
        } catch(e) { console.error(e); }
    };

    if(document.getElementById('warehouse-search')) {
        document.getElementById('warehouse-search').addEventListener('input', renderWarehouses);
    }

    loadData();
};