const API_BASE = 'http://127.0.0.1:8000/api';

function getHeaders() {
    const token = localStorage.getItem('pos_token');
    return {
        'Authorization': 'Token ' + token,
        'Content-Type': 'application/json'
    };
}

let storesData = [];

window.initializeStores = async function() {
    await fetchWarehousesCount();
    await fetchStores();
    
    document.getElementById('store-search')?.addEventListener('input', (e) => {
        renderStores(e.target.value);
    });

    document.getElementById('store-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveStore();
    });
};

async function fetchWarehousesCount() {
    try {
        const res = await fetch(`${API_BASE}/enterprise/warehouses/`, { headers: getHeaders() });
        if (res.ok) {
            const data = await res.json();
            const count = data.length !== undefined ? data.length : (data.count || 0);
            const wElement = document.getElementById('total-warehouses');
            if (wElement) wElement.textContent = count;
        }
    } catch (err) {
        console.error("Error fetching warehouses count", err);
    }
}

async function fetchStores() {
    try {
        const res = await fetch(`${API_BASE}/stores/`, { headers: getHeaders() });
        if (res.ok) {
            let data = await res.json();
            storesData = data.results ? data.results : data;
            updateStats();
            renderStores();
        } else {
            console.error("Failed to fetch stores", await res.text());
        }
    } catch (err) {
        console.error("Error fetching stores", err);
    }
}

function updateStats() {
    const totalEl = document.getElementById('total-stores');
    const activeEl = document.getElementById('active-stores');
    const defaultEl = document.getElementById('default-store-name');

    if (totalEl) totalEl.textContent = storesData.length;
    
    const activeCount = storesData.filter(s => s.is_active).length;
    if (activeEl) activeEl.textContent = activeCount;
    
    const defaultStore = storesData.find(s => s.is_default);
    if (defaultEl) defaultEl.textContent = defaultStore ? defaultStore.name : 'None';
}

function renderStores(searchQuery = '') {
    const grid = document.getElementById('stores-grid');
    const emptyState = document.getElementById('empty-stores-state');
    
    if (!grid) return;

    const filtered = storesData.filter(s => {
        const query = searchQuery.toLowerCase();
        return (s.name || '').toLowerCase().includes(query) || (s.code || '').toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        grid.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = filtered.map(store => `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div class="p-5 flex-1">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                            ${store.name}
                            ${store.is_default ? '<i data-lucide="star" class="w-5 h-5 text-amber-400 fill-amber-400" title="Default Store"></i>' : ''}
                        </h3>
                        <span class="inline-block mt-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md uppercase tracking-wide">
                            ${store.code}
                        </span>
                    </div>
                    <span class="px-2.5 py-1 text-xs font-medium rounded-full ${store.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}">
                        ${store.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                
                <div class="space-y-2 mb-4">
                    <div class="flex items-center gap-2 text-sm text-slate-600">
                        <i data-lucide="user" class="w-4 h-4 text-slate-400"></i>
                        <span>Manager: <span class="font-medium text-slate-800">${store.manager || 'Unassigned'}</span></span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-slate-600">
                        <i data-lucide="map-pin" class="w-4 h-4 text-slate-400"></i>
                        <span class="truncate" title="${store.address || ''}">${store.address || 'No address provided'}</span>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 mt-4">
                    <span class="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
                        ${store.currency || 'USD'}
                    </span>
                    <span class="px-2 py-1 bg-slate-50 text-slate-700 text-xs rounded border border-slate-100">
                        ${store.timezone || 'UTC'}
                    </span>
                    <span class="px-2 py-1 bg-slate-50 text-slate-700 text-xs rounded border border-slate-100 uppercase">
                        ${store.language || 'en'}
                    </span>
                </div>
            </div>
            
            <div class="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between gap-2">
                <button onclick="window.openStoreModal(${store.id})" class="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <i data-lucide="edit-3" class="w-4 h-4"></i> Edit
                </button>
                <div class="flex gap-3">
                    ${!store.is_default ? `
                    <button onclick="window.setDefaultStore(${store.id})" class="text-sm font-medium text-amber-600 hover:text-amber-800 flex items-center gap-1" title="Set as default">
                        <i data-lucide="star" class="w-4 h-4"></i> Default
                    </button>
                    ` : ''}
                    <button onclick="window.toggleStoreActive(${store.id}, ${store.is_active})" class="text-sm font-medium ${store.is_active ? 'text-slate-500 hover:text-slate-700' : 'text-green-600 hover:text-green-800'} flex items-center gap-1">
                        <i data-lucide="power" class="w-4 h-4"></i> ${store.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onclick="window.deleteStore(${store.id})" class="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

window.openStoreModal = function(id = null) {
    const modal = document.getElementById('store-modal');
    const form = document.getElementById('store-form');
    const title = document.getElementById('store-modal-title');
    
    if (!modal) return;

    form.reset();
    
    if (id) {
        const store = storesData.find(s => s.id === id);
        if (store) {
            title.textContent = 'Edit Store';
            document.getElementById('store-id').value = store.id;
            document.getElementById('store-name').value = store.name || '';
            document.getElementById('store-code').value = store.code || '';
            document.getElementById('store-manager').value = store.manager || '';
            document.getElementById('store-currency').value = store.currency || 'PKR';
            document.getElementById('store-language').value = store.language || 'en';
            document.getElementById('store-timezone').value = store.timezone || '';
            document.getElementById('store-date-format').value = store.date_format || 'DD/MM/YYYY';
            document.getElementById('store-time-format').value = store.time_format || '12h';
            document.getElementById('store-weight-unit').value = store.weight_unit || 'kg';
            document.getElementById('store-dimension-unit').value = store.dimension_unit || 'cm';
            document.getElementById('store-phone').value = store.phone || '';
            document.getElementById('store-address').value = store.address || '';
            document.getElementById('store-active').checked = store.is_active !== false;
            document.getElementById('store-default').checked = !!store.is_default;
        }
    } else {
        title.textContent = 'Add Store';
        document.getElementById('store-id').value = '';
    }
    
    modal.classList.remove('hidden');
};

window.closeStoreModal = function() {
    const modal = document.getElementById('store-modal');
    if (modal) modal.classList.add('hidden');
};

async function saveStore() {
    const id = document.getElementById('store-id').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/stores/${id}/` : `${API_BASE}/stores/`;
    
    const data = {
        name: document.getElementById('store-name').value,
        code: document.getElementById('store-code').value,
        manager: document.getElementById('store-manager').value,
        currency: document.getElementById('store-currency').value,
        language: document.getElementById('store-language').value,
        timezone: document.getElementById('store-timezone').value,
        date_format: document.getElementById('store-date-format').value,
        time_format: document.getElementById('store-time-format').value,
        weight_unit: document.getElementById('store-weight-unit').value,
        dimension_unit: document.getElementById('store-dimension-unit').value,
        phone: document.getElementById('store-phone').value,
        address: document.getElementById('store-address').value,
        is_active: document.getElementById('store-active').checked,
        is_default: document.getElementById('store-default').checked
    };

    try {
        const res = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            window.closeStoreModal();
            await fetchStores();
        } else {
            const errData = await res.json();
            alert('Failed to save store. ' + JSON.stringify(errData));
        }
    } catch (err) {
        console.error("Error saving store", err);
        alert('Error saving store.');
    }
}

window.deleteStore = async function(id) {
    if (!confirm('Are you sure you want to delete this store?')) return;
    
    try {
        const res = await fetch(`${API_BASE}/stores/${id}/`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (res.ok) {
            await fetchStores();
        } else {
            alert('Failed to delete store.');
        }
    } catch (err) {
        console.error("Error deleting store", err);
    }
};

window.toggleStoreActive = async function(id, current) {
    try {
        const res = await fetch(`${API_BASE}/stores/${id}/`, {
            method: 'PATCH', // or PUT if PATCH is not strictly supported
            headers: getHeaders(),
            body: JSON.stringify({ is_active: !current })
        });
        if (res.ok) {
            await fetchStores();
        } else {
            alert('Failed to toggle active status.');
        }
    } catch (err) {
        console.error("Error toggling status", err);
    }
};

window.setDefaultStore = async function(id) {
    try {
        const res = await fetch(`${API_BASE}/stores/${id}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ is_default: true })
        });
        if (res.ok) {
            await fetchStores();
        } else {
            alert('Failed to set default store.');
        }
    } catch (err) {
        console.error("Error setting default store", err);
    }
};
