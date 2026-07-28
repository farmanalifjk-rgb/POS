window.initializeWarehouseTransfers = function() {
    const API_BASE = 'http://127.0.0.1:8000/api';
    const authHeaders = {
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    };

    let allTransfers = [];
    let currentStatusFilter = 'all';
    let products = [];
    let warehouses = [];
    let lineItemCount = 0;

    async function loadData() {
        try {
            const [transfersRes, warehousesRes, productsRes] = await Promise.all([
                fetch(`${API_BASE}/enterprise/transfers/`, { headers: authHeaders }),
                fetch(`${API_BASE}/enterprise/warehouses/`, { headers: authHeaders }),
                fetch(`${API_BASE}/inventory/products/?page_size=500`, { headers: authHeaders })
            ]);

            allTransfers = await transfersRes.json();
            warehouses = await warehousesRes.json();
            const productsData = await productsRes.json();
            products = productsData.results || productsData;

            renderTable();
            updateStats();
            populateWarehouseSelects();
        } catch (error) {
            console.error('Error loading transfer data:', error);
            const tbody = document.getElementById('transfers-tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr><td colspan="8" class="px-6 py-8 text-center text-red-500">Failed to load data.</td></tr>
                `;
            }
        }
    }

    function updateStats() {
        let pending = 0, receivedToday = 0, cancelled = 0;
        const today = new Date().toISOString().split('T')[0];

        allTransfers.forEach(t => {
            if (t.status === 'draft' || t.status === 'in_transit') pending++;
            if (t.status === 'cancelled') cancelled++;
            if (t.status === 'received' && t.updated_at && t.updated_at.startsWith(today)) receivedToday++;
        });

        const eTotal = document.getElementById('stat-total');
        const ePending = document.getElementById('stat-pending');
        const eReceived = document.getElementById('stat-received');
        const eCancelled = document.getElementById('stat-cancelled');

        if (eTotal) eTotal.innerText = allTransfers.length;
        if (ePending) ePending.innerText = pending;
        if (eReceived) eReceived.innerText = receivedToday;
        if (eCancelled) eCancelled.innerText = cancelled;
    }

    window.filterByStatus = function(status) {
        currentStatusFilter = status;
        document.querySelectorAll('.status-tab').forEach(tab => {
            if (tab.dataset.status === status) {
                tab.classList.remove('border-transparent', 'text-slate-500');
                tab.classList.add('border-indigo-500', 'text-indigo-600');
            } else {
                tab.classList.add('border-transparent', 'text-slate-500');
                tab.classList.remove('border-indigo-500', 'text-indigo-600');
            }
        });
        renderTable();
    };

    function renderTable() {
        const tbody = document.getElementById('transfers-tbody');
        if (!tbody) return;
        
        let filtered = allTransfers;
        if (currentStatusFilter !== 'all') {
            filtered = allTransfers.filter(t => t.status === currentStatusFilter);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="px-6 py-8 text-center text-slate-500">No transfers found.</td></tr>`;
            if (window.lucide) lucide.createIcons();
            return;
        }

        tbody.innerHTML = filtered.map(t => {
            let statusBadge = '';
            if (t.status === 'draft') statusBadge = '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Draft</span>';
            else if (t.status === 'in_transit') statusBadge = '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">In Transit</span>';
            else if (t.status === 'received') statusBadge = '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Received</span>';
            else if (t.status === 'cancelled') statusBadge = '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Cancelled</span>';

            const itemsCount = t.items ? t.items.length : 0;
            const dateStr = new Date(t.created_at).toLocaleDateString();

            let actions = '';
            if (t.status === 'in_transit') {
                actions += `<button onclick="window.openReceiveModal(${t.id})" class="text-indigo-600 hover:text-indigo-900 mr-3 text-xs font-medium">Receive</button>`;
            }
            if (t.status === 'draft') {
                actions += `<button onclick="window.cancelTransfer(${t.id})" class="text-red-600 hover:text-red-900 text-xs font-medium">Cancel</button>`;
            }

            return `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-slate-900">#TRN-${t.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${t.source_warehouse_name || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${t.destination_warehouse_name || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${itemsCount} items</td>
                    <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${t.requested_by_name || 'System'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-slate-500">${dateStr}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">${actions}</td>
                </tr>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    }

    function populateWarehouseSelects() {
        const options = warehouses.map(w => `<option value="${w.id}">${w.name} (${w.code})</option>`).join('');
        const source = document.getElementById('source_warehouse');
        const dest = document.getElementById('destination_warehouse');
        if (source) source.innerHTML = '<option value="">Select source...</option>' + options;
        if (dest) dest.innerHTML = '<option value="">Select destination...</option>' + options;
    }

    function getProductOptions() {
        return products.map(p => `<option value="${p.id}">${p.name} (SKU: ${p.sku})</option>`).join('');
    }

    window.openTransferModal = function() {
        const form = document.getElementById('transfer-form');
        const lines = document.getElementById('transfer-lines');
        if (form) form.reset();
        if (lines) lines.innerHTML = '';
        lineItemCount = 0;
        window.addTransferLine();
        const modal = document.getElementById('transfer-modal');
        if (modal) modal.classList.remove('hidden');
    };

    window.closeTransferModal = function() {
        const modal = document.getElementById('transfer-modal');
        if (modal) modal.classList.add('hidden');
    };

    window.addTransferLine = function() {
        const id = `line-${lineItemCount++}`;
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100';
        div.innerHTML = `
            <div class="flex-1">
                <select class="transfer-product-select w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2 border outline-none" required>
                    <option value="">Select product...</option>
                    ${getProductOptions()}
                </select>
            </div>
            <div class="w-32">
                <input type="number" min="1" class="transfer-qty-input w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2 border outline-none" placeholder="Qty" required>
            </div>
            <button type="button" onclick="window.removeTransferLine('${id}')" class="text-slate-400 hover:text-red-500 mt-1">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;
        const lines = document.getElementById('transfer-lines');
        if (lines) lines.appendChild(div);
        if (window.lucide) lucide.createIcons();
    };

    window.removeTransferLine = function(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    };

    window.submitTransfer = async function(e) {
        e.preventDefault();
        const source_id = document.getElementById('source_warehouse').value;
        const dest_id = document.getElementById('destination_warehouse').value;
        const note = document.getElementById('transfer_note').value;

        if (source_id === dest_id) {
            alert('Source and destination must be different.');
            return;
        }

        const items = [];
        document.querySelectorAll('#transfer-lines > div').forEach(div => {
            const prod = div.querySelector('.transfer-product-select').value;
            const qty = div.querySelector('.transfer-qty-input').value;
            if (prod && qty) {
                items.push({ product_id: parseInt(prod), quantity: parseInt(qty) });
            }
        });

        if (items.length === 0) {
            alert('Add at least one item.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/enterprise/transfers/`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    source_warehouse_id: source_id,
                    destination_warehouse_id: dest_id,
                    note: note,
                    items: items
                })
            });

            if (res.ok) {
                window.closeTransferModal();
                loadData();
            } else {
                alert('Failed to create transfer.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    window.openReceiveModal = function(id) {
        const transfer = allTransfers.find(t => t.id === id);
        if (!transfer) return;

        document.getElementById('receive-transfer-id').innerText = `#TRN-${id}`;
        document.getElementById('receive-route').innerText = `${transfer.source_warehouse_name} → ${transfer.destination_warehouse_name}`;
        document.getElementById('receive_transfer_pk').value = id;

        const tbody = document.getElementById('receive-items-tbody');
        if (tbody) {
            tbody.innerHTML = transfer.items.map(item => `
                <tr>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                        <input type="hidden" class="rec-item-id" value="${item.id}">
                        ${item.product_name}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">${item.quantity}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <input type="number" min="0" max="${item.quantity}" value="${item.quantity}" class="rec-qty-input w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1 px-2 border outline-none">
                    </td>
                </tr>
            `).join('');
        }

        const modal = document.getElementById('receive-modal');
        if (modal) modal.classList.remove('hidden');
    };

    window.closeReceiveModal = function() {
        const modal = document.getElementById('receive-modal');
        if (modal) modal.classList.add('hidden');
    };

    window.submitReceive = async function(e) {
        e.preventDefault();
        const id = document.getElementById('receive_transfer_pk').value;
        const items = [];
        
        document.querySelectorAll('#receive-items-tbody tr').forEach(tr => {
            const itemId = tr.querySelector('.rec-item-id').value;
            const qty = tr.querySelector('.rec-qty-input').value;
            items.push({ id: parseInt(itemId), quantity: parseInt(qty) });
        });

        try {
            const res = await fetch(`${API_BASE}/enterprise/transfers/${id}/receive/`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ items })
            });

            if (res.ok) {
                window.closeReceiveModal();
                loadData();
            } else {
                alert('Failed to receive transfer.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    window.cancelTransfer = async function(id) {
        if (!confirm('Cancel this transfer?')) return;
        try {
            const res = await fetch(`${API_BASE}/enterprise/transfers/${id}/`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ status: 'cancelled' })
            });
            if (res.ok) {
                loadData();
            } else if (res.status === 405) {
                // Try DELETE if PATCH not allowed for draft
                const delRes = await fetch(`${API_BASE}/enterprise/transfers/${id}/`, {
                    method: 'DELETE',
                    headers: authHeaders
                });
                if (delRes.ok) loadData();
            }
        } catch(e) {
            console.error(e);
        }
    };

    loadData();
};
