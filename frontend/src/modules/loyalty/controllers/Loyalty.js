window.initializeLoyalty = function() {
    if (window.lucide) {
        lucide.createIcons();
    }
    
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const headers = {
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    };

    const form = document.getElementById('loyalty-config-form');
    const pointsInput = document.getElementById('points-equivalent');
    const earnEnabledToggle = document.getElementById('earn-enabled');
    const tbody = document.getElementById('loyalty-transactions-list');

    async function loadConfig() {
        try {
            const res = await fetch(`${API_BASE}/loyalty/program/`, { headers });
            if (res.ok) {
                const data = await res.json();
                pointsInput.value = data.points_equivalent || '';
                earnEnabledToggle.checked = data.is_active !== false;
            } else if (res.status !== 404) {
                console.error("Failed to load loyalty config");
            }
        } catch (e) {
            console.error("Failed to load loyalty config", e);
        }
    }

    async function loadTransactions() {
        try {
            const res = await fetch(`${API_BASE}/loyalty/transactions/`, { headers });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-gray-500 text-sm">No transactions found.</td></tr>`;
                return;
            }
            
            tbody.innerHTML = data.map(tx => `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(tx.created_at).toLocaleDateString()} ${new Date(tx.created_at).toLocaleTimeString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${tx.customer_name || tx.customer || 'Unknown'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.transaction_type === 'EARN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${tx.transaction_type || 'Unknown'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}">
                        ${tx.points > 0 ? '+' : ''}${tx.points}
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load transactions.</td></tr>`;
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                points_equivalent: parseFloat(pointsInput.value),
                is_active: earnEnabledToggle.checked
            };
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Saving...';
            submitBtn.disabled = true;
            
            try {
                const res = await fetch(`${API_BASE}/loyalty/program/`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    alert('Configuration saved successfully!');
                } else {
                    alert('Failed to save configuration.');
                }
            } catch (error) {
                alert('Error saving configuration.');
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    loadConfig();
    loadTransactions();
};