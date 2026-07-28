window.initializeAccounting = function() {
    const API_BASE = 'http://127.0.0.1:8000/api';
    
    function fmt(n) { 
        return 'Rs. ' + Number(n||0).toLocaleString('en-PK', {minimumFractionDigits:0}); 
    }

    const state = {
        accounts: []
    };

    window.AccountingController = {
        fetchAccounts: async function() {
            try {
                document.getElementById('accounts-loading').classList.remove('hidden');
                document.getElementById('accounts-content').classList.add('hidden');
                
                const token = localStorage.getItem('pos_token');
                const response = await fetch(`${API_BASE}/accounting/accounts/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                
                if (!response.ok) throw new Error('Failed to load accounts');
                
                state.accounts = await response.json();
                this.renderAccounts();
            } catch (error) {
                const errDiv = document.getElementById('accounting-error');
                errDiv.textContent = error.message;
                errDiv.classList.remove('hidden');
            } finally {
                document.getElementById('accounts-loading').classList.add('hidden');
                document.getElementById('accounts-content').classList.remove('hidden');
            }
        },
        
        renderAccounts: function() {
            const tbody = document.getElementById('accounts-list');
            
            if (state.accounts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-500">No accounts found.</td></tr>`;
                return;
            }
            
            // Group by type
            const grouped = state.accounts.reduce((acc, account) => {
                if (!acc[account.type]) acc[account.type] = [];
                acc[account.type].push(account);
                return acc;
            }, {});
            
            const types = ['asset', 'liability', 'equity', 'revenue', 'expense'];
            const typeLabels = {
                asset: 'Assets',
                liability: 'Liabilities',
                equity: 'Equity',
                revenue: 'Revenue',
                expense: 'Expenses'
            };
            
            let html = '';
            
            types.forEach(type => {
                if (grouped[type] && grouped[type].length > 0) {
                    html += `
                        <tr class="bg-gray-100">
                            <td colspan="4" class="p-3 font-bold text-gray-700 capitalize border-y border-gray-200">
                                ${typeLabels[type]}
                            </td>
                        </tr>
                    `;
                    grouped[type].forEach(account => {
                        html += `
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="p-4 text-gray-800 font-medium">${account.code}</td>
                                <td class="p-4 text-gray-600">${account.name}</td>
                                <td class="p-4 text-gray-500 capitalize">${account.type}</td>
                                <td class="p-4 text-right font-semibold ${account.current_balance < 0 ? 'text-red-600' : 'text-gray-800'}">${fmt(account.current_balance)}</td>
                            </tr>
                        `;
                    });
                }
            });
            
            tbody.innerHTML = html;
            if (window.lucide) window.lucide.createIcons();
        },
        
        showAddModal: function() {
            document.getElementById('add-account-form').reset();
            document.getElementById('add-account-modal').classList.remove('hidden');
        },
        
        hideAddModal: function() {
            document.getElementById('add-account-modal').classList.add('hidden');
        },
        
        handleAddAccount: async function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('add-account-btn');
            btn.innerHTML = `<div class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> Saving...`;
            btn.disabled = true;
            
            const data = {
                code: document.getElementById('acc-code').value,
                name: document.getElementById('acc-name').value,
                type: document.getElementById('acc-type').value
            };
            
            try {
                const token = localStorage.getItem('pos_token');
                const response = await fetch(`${API_BASE}/accounting/accounts/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || 'Failed to create account');
                }
                
                this.hideAddModal();
                await this.fetchAccounts();
            } catch (error) {
                alert(error.message);
            } finally {
                btn.innerHTML = `Save Account`;
                btn.disabled = false;
            }
        }
    };
    
    // Initialize
    window.AccountingController.fetchAccounts();
    if (window.lucide) window.lucide.createIcons();
};
