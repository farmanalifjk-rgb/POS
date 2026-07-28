window.initializeTrialBalance = function() {
    const API_BASE = 'http://127.0.0.1:8000/api';
    
    function fmt(n) { 
        return 'Rs. ' + Number(n||0).toLocaleString('en-PK', {minimumFractionDigits:0}); 
    }

    window.TrialBalanceController = {
        fetchTrialBalance: async function() {
            try {
                document.getElementById('tb-loading').classList.remove('hidden');
                document.getElementById('tb-content').classList.add('hidden');
                
                const token = localStorage.getItem('pos_token');
                const response = await fetch(`${API_BASE}/accounting/trial-balance/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                
                if (!response.ok) throw new Error('Failed to load trial balance');
                
                const data = await response.json();
                this.renderTrialBalance(data);
            } catch (error) {
                const errDiv = document.getElementById('tb-error');
                errDiv.textContent = error.message;
                errDiv.classList.remove('hidden');
            } finally {
                document.getElementById('tb-loading').classList.add('hidden');
                document.getElementById('tb-content').classList.remove('hidden');
            }
        },
        
        renderTrialBalance: function(data) {
            const tbody = document.getElementById('tb-list');
            const accounts = data.accounts || [];
            
            let html = '';
            
            accounts.forEach(acc => {
                html += `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-4 text-gray-500 font-medium">${acc.code}</td>
                        <td class="p-4 text-gray-800">${acc.name}</td>
                        <td class="p-4 text-right text-gray-700">${acc.debit > 0 ? fmt(acc.debit) : ''}</td>
                        <td class="p-4 text-right text-gray-700">${acc.credit > 0 ? fmt(acc.credit) : ''}</td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
            
            document.getElementById('tb-total-debit').textContent = fmt(data.total_debit || 0);
            document.getElementById('tb-total-credit').textContent = fmt(data.total_credit || 0);
            
            if (Math.abs((data.total_debit || 0) - (data.total_credit || 0)) > 0.001) {
                document.getElementById('tb-total-debit').classList.add('text-red-600');
                document.getElementById('tb-total-credit').classList.add('text-red-600');
            }
        }
    };
    
    // Initialize
    window.TrialBalanceController.fetchTrialBalance();
    if (window.lucide) window.lucide.createIcons();
};
