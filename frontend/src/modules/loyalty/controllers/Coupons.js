window.initializeCoupons = function() {
    if (window.lucide) {
        lucide.createIcons();
    }
    
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const headers = {
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    };

    const tbody = document.getElementById('coupons-list');
    const form = document.getElementById('add-coupon-form');
    const modal = document.getElementById('add-coupon-modal');

    async function loadCoupons() {
        try {
            const res = await fetch(`${API_BASE}/loyalty/coupons/`, { headers });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-500 text-sm">No coupons found.</td></tr>`;
                return;
            }
            
            tbody.innerHTML = data.map(coupon => {
                const now = new Date();
                const validUntil = new Date(coupon.valid_until);
                const isExpired = validUntil < now;
                const statusBadge = (!coupon.is_active || isExpired) 
                    ? `<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>`
                    : `<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>`;

                const typeBadge = coupon.discount_type === 'percentage'
                    ? `<span class="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">Percentage</span>`
                    : `<span class="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">Fixed Amount</span>`;

                const valueDisplay = coupon.discount_type === 'percentage' 
                    ? `${parseFloat(coupon.discount_value)}%` 
                    : `$${parseFloat(coupon.discount_value).toFixed(2)}`;

                return `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-900">${coupon.code}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${typeBadge}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${valueDisplay}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${validUntil.toLocaleString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                    </tr>
                `;
            }).join('');
        } catch (e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load coupons.</td></tr>`;
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                code: document.getElementById('coupon-code').value.toUpperCase(),
                discount_type: document.getElementById('coupon-type').value,
                discount_value: parseFloat(document.getElementById('coupon-value').value),
                valid_until: new Date(document.getElementById('coupon-expiry').value).toISOString(),
                is_active: true
            };
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Creating...';
            submitBtn.disabled = true;
            
            try {
                const res = await fetch(`${API_BASE}/loyalty/coupons/`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    modal.classList.add('hidden');
                    form.reset();
                    loadCoupons();
                } else {
                    alert('Failed to create coupon.');
                }
            } catch (error) {
                alert('Error creating coupon.');
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    loadCoupons();
};