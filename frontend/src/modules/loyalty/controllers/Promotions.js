window.initializePromotions = function() {
    if (window.lucide) {
        lucide.createIcons();
    }
    
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const headers = {
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    };

    const tbody = document.getElementById('promos-list');
    const form = document.getElementById('add-promo-form');
    const modal = document.getElementById('add-promo-modal');

    async function loadPromos() {
        try {
            const res = await fetch(`${API_BASE}/loyalty/promotions/`, { headers });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-500 text-sm">No promotions found.</td></tr>`;
                return;
            }
            
            tbody.innerHTML = data.map(promo => {
                const now = new Date();
                const start = new Date(promo.start_date);
                const end = new Date(promo.end_date);
                
                let statusBadge = '';
                if (!promo.is_active) {
                    statusBadge = `<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>`;
                } else if (now < start) {
                    statusBadge = `<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Upcoming</span>`;
                } else if (now > end) {
                    statusBadge = `<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Expired</span>`;
                } else {
                    statusBadge = `<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>`;
                }

                const typeBadge = promo.discount_type === 'percentage'
                    ? `<span class="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">Percentage</span>`
                    : `<span class="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">Fixed Amount</span>`;

                const valueDisplay = promo.discount_type === 'percentage' 
                    ? `${parseFloat(promo.discount_value)}%` 
                    : `$${parseFloat(promo.discount_value).toFixed(2)}`;

                return `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${promo.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${typeBadge}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${valueDisplay}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div class="text-xs">From: ${start.toLocaleDateString()}</div>
                            <div class="text-xs">To: ${end.toLocaleDateString()}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                    </tr>
                `;
            }).join('');
        } catch (e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load promotions.</td></tr>`;
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('promo-name').value,
                discount_type: document.getElementById('promo-type').value,
                discount_value: parseFloat(document.getElementById('promo-value').value),
                start_date: new Date(document.getElementById('promo-start').value).toISOString(),
                end_date: new Date(document.getElementById('promo-end').value).toISOString(),
                is_active: true
            };
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Creating...';
            submitBtn.disabled = true;
            
            try {
                const res = await fetch(`${API_BASE}/loyalty/promotions/`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    modal.classList.add('hidden');
                    form.reset();
                    loadPromos();
                } else {
                    alert('Failed to create promotion.');
                }
            } catch (error) {
                alert('Error creating promotion.');
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    loadPromos();
};