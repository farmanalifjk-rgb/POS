window.initializeBalanceSheet = function() {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    
    function fmt(n) { 
        return 'Rs. ' + Number(n||0).toLocaleString('en-PK', {minimumFractionDigits:0}); 
    }

    window.BalanceSheetController = {
        fetchBalanceSheet: async function() {
            try {
                document.getElementById('bs-loading').classList.remove('hidden');
                document.getElementById('bs-content').classList.add('hidden');
                
                const token = localStorage.getItem('pos_token');
                const response = await fetch(`${API_BASE}/accounting/balance-sheet/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                
                if (!response.ok) throw new Error('Failed to load balance sheet');
                
                const data = await response.json();
                this.renderBalanceSheet(data);
            } catch (error) {
                const errDiv = document.getElementById('bs-error');
                errDiv.textContent = error.message;
                errDiv.classList.remove('hidden');
            } finally {
                document.getElementById('bs-loading').classList.add('hidden');
                document.getElementById('bs-content').classList.remove('hidden');
            }
        },
        
        renderSection: function(containerId, items) {
            const container = document.getElementById(containerId);
            if (!items || items.length === 0) {
                container.innerHTML = `<div class="text-gray-400 text-sm italic py-2">No accounts found</div>`;
                return;
            }
            
            let html = '';
            items.forEach(item => {
                html += `
                    <div class="flex justify-between items-center py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                        <span class="text-gray-700">${item.name}</span>
                        <span class="text-gray-900 font-medium">${fmt(Math.abs(item.balance || item.current_balance || 0))}</span>
                    </div>
                `;
            });
            container.innerHTML = html;
        },
        
        renderBalanceSheet: function(data) {
            this.renderSection('bs-assets-list', data.assets);
            this.renderSection('bs-liabilities-list', data.liabilities);
            this.renderSection('bs-equity-list', data.equity);
            
            document.getElementById('bs-total-assets').textContent = fmt(data.total_assets);
            document.getElementById('bs-total-liabilities').textContent = fmt(data.total_liabilities);
            document.getElementById('bs-total-equity').textContent = fmt(data.total_equity);
            document.getElementById('bs-total-liab-equity').textContent = fmt((data.total_liabilities || 0) + (data.total_equity || 0));
        }
    };
    
    // Initialize
    window.BalanceSheetController.fetchBalanceSheet();
    if (window.lucide) window.lucide.createIcons();
};