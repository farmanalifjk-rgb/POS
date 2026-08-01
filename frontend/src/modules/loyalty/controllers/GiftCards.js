window.initializeGiftCards = function() {
    if (window.lucide) {
        lucide.createIcons();
    }
    
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const headers = {
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    };

    const tbody = document.getElementById('gift-cards-list');
    const issueForm = document.getElementById('issue-card-form');
    const redeemForm = document.getElementById('redeem-card-form');

    window.openRedeemModal = function(id, balance, code) {
        document.getElementById('redeem-card-id').value = id;
        document.getElementById('redeem-amount').max = balance;
        document.getElementById('redeem-amount').value = '';
        document.getElementById('redeem-max-info').innerText = `Max available: $${balance} (Code: ${code})`;
        document.getElementById('redeem-card-modal').classList.remove('hidden');
    };

    async function loadCards() {
        try {
            const res = await fetch(`${API_BASE}/loyalty/gift-cards/`, { headers });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-500 text-sm">No gift cards found.</td></tr>`;
                return;
            }
            
            tbody.innerHTML = data.map(card => `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">${card.code}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${card.customer_name || card.customer || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">$${parseFloat(card.balance).toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        ${card.is_active 
                            ? (parseFloat(card.balance) > 0 ? '<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>' : '<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Empty</span>')
                            : '<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>'
                        }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        ${card.is_active && parseFloat(card.balance) > 0 ? `
                            <button onclick="openRedeemModal(${card.id}, ${card.balance}, '${card.code}')" class="text-indigo-600 hover:text-indigo-900 font-semibold bg-indigo-50 px-3 py-1 rounded-md transition-colors">
                                Redeem
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-red-500 text-sm">Failed to load gift cards.</td></tr>`;
        }
    }

    if (issueForm) {
        issueForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const codeVal = document.getElementById('card-code').value.trim();
            const payload = {
                balance: parseFloat(document.getElementById('card-balance').value),
                initial_value: parseFloat(document.getElementById('card-balance').value)
            };
            if (codeVal) payload.code = codeVal;
            
            const submitBtn = issueForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Issuing...';
            submitBtn.disabled = true;
            
            try {
                const res = await fetch(`${API_BASE}/loyalty/gift-cards/`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    document.getElementById('issue-card-modal').classList.add('hidden');
                    issueForm.reset();
                    loadCards();
                } else {
                    alert('Failed to issue gift card.');
                }
            } catch (error) {
                alert('Error issuing gift card.');
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    if (redeemForm) {
        redeemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cardId = document.getElementById('redeem-card-id').value;
            const amount = parseFloat(document.getElementById('redeem-amount').value);
            
            const submitBtn = redeemForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Redeeming...';
            submitBtn.disabled = true;
            
            try {
                const res = await fetch(`${API_BASE}/loyalty/gift-cards/${cardId}/redeem/`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ amount })
                });
                
                if (res.ok) {
                    document.getElementById('redeem-card-modal').classList.add('hidden');
                    redeemForm.reset();
                    loadCards();
                } else {
                    alert('Failed to redeem gift card. Check balance.');
                }
            } catch (error) {
                alert('Error redeeming gift card.');
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    loadCards();
};