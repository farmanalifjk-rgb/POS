window.initializeLedger = function() {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    
    function fmt(n) { 
        return 'Rs. ' + Number(n||0).toLocaleString('en-PK', {minimumFractionDigits:0}); 
    }

    window.LedgerController = {
        fetchAccounts: async function() {
            try {
                const token = localStorage.getItem('pos_token');
                const response = await fetch(`${API_BASE}/accounting/accounts/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                
                if (response.ok) {
                    const accounts = await response.json();
                    const select = document.getElementById('ledger-account-select');
                    accounts.forEach(acc => {
                        const opt = document.createElement('option');
                        opt.value = acc.id;
                        opt.textContent = `${acc.code} - ${acc.name}`;
                        select.appendChild(opt);
                    });
                }
            } catch (error) {
                console.error("Failed to load accounts for Ledger", error);
            }
        },

        fetchLedger: async function(accountId) {
            if (!accountId) {
                document.getElementById('ledger-empty').classList.remove('hidden');
                document.getElementById('ledger-content').classList.add('hidden');
                document.getElementById('ledger-loading').classList.add('hidden');
                return;
            }
            
            try {
                document.getElementById('ledger-empty').classList.add('hidden');
                document.getElementById('ledger-content').classList.add('hidden');
                document.getElementById('ledger-loading').classList.remove('hidden');
                document.getElementById('ledger-loading').classList.add('flex');
                
                const token = localStorage.getItem('pos_token');
                const response = await fetch(`${API_BASE}/accounting/ledger/${accountId}/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                
                if (!response.ok) throw new Error('Failed to load ledger data');
                
                const data = await response.json();
                this.renderLedger(data);
            } catch (error) {
                const errDiv = document.getElementById('ledger-error');
                errDiv.textContent = error.message;
                errDiv.classList.remove('hidden');
            } finally {
                document.getElementById('ledger-loading').classList.add('hidden');
                document.getElementById('ledger-loading').classList.remove('flex');
            }
        },
        
        renderLedger: function(lines) {
            document.getElementById('ledger-content').classList.remove('hidden');
            const tbody = document.getElementById('ledger-list');
            
            if (!lines || lines.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">No transactions found for this account.</td></tr>`;
                return;
            }
            
            let html = '';
            
            lines.forEach(line => {
                html += `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-4 text-gray-600">${line.date}</td>
                        <td class="p-4 text-gray-800 font-medium">${line.reference || '-'}</td>
                        <td class="p-4 text-gray-600">${line.description}</td>
                        <td class="p-4 text-right text-gray-700">${line.debit > 0 ? fmt(line.debit) : '-'}</td>
                        <td class="p-4 text-right text-gray-700">${line.credit > 0 ? fmt(line.credit) : '-'}</td>
                        <td class="p-4 text-right font-semibold text-gray-900">${fmt(line.running_balance || line.balance)}</td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
        }
    };
    
    // Initialize
    window.LedgerController.fetchAccounts();
    if (window.lucide) window.lucide.createIcons();
};