window.initializeJournalEntries = function() {
    const API_BASE = 'http://127.0.0.1:8000/api';
    
    function fmt(n) { 
        return 'Rs. ' + Number(n||0).toLocaleString('en-PK', {minimumFractionDigits:0}); 
    }

    const state = {
        entries: [],
        accounts: [],
        lines: [
            { account_id: '', debit: '', credit: '' },
            { account_id: '', debit: '', credit: '' }
        ]
    };

    window.JournalController = {
        fetchAccounts: async function() {
            try {
                const token = localStorage.getItem('pos_token');
                const response = await fetch(`${API_BASE}/accounting/accounts/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                if (response.ok) {
                    state.accounts = await response.json();
                }
            } catch (e) {
                console.error("Error fetching accounts for JE", e);
            }
        },

        fetchEntries: async function() {
            try {
                document.getElementById('journal-loading').classList.remove('hidden');
                document.getElementById('journal-content').classList.add('hidden');
                
                const token = localStorage.getItem('pos_token');
                const response = await fetch(`${API_BASE}/accounting/journal/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                
                if (!response.ok) throw new Error('Failed to load journal entries');
                
                state.entries = await response.json();
                this.renderEntries();
            } catch (error) {
                const errDiv = document.getElementById('journal-error');
                errDiv.textContent = error.message;
                errDiv.classList.remove('hidden');
            } finally {
                document.getElementById('journal-loading').classList.add('hidden');
                document.getElementById('journal-content').classList.remove('hidden');
            }
        },
        
        renderEntries: function() {
            const tbody = document.getElementById('journal-list');
            
            if (state.entries.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">No journal entries found.</td></tr>`;
                return;
            }
            
            let html = '';
            
            state.entries.forEach(entry => {
                const statusColor = entry.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                
                html += `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-4 text-gray-600">${entry.date}</td>
                        <td class="p-4 text-gray-800 font-medium">${entry.reference || '-'}</td>
                        <td class="p-4 text-gray-600">${entry.description}</td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${statusColor}">${entry.status}</span>
                        </td>
                        <td class="p-4 text-right">
                            ${entry.status === 'DRAFT' ? 
                                `<button onclick="window.JournalController.postEntry(${entry.id})" class="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1 rounded-md transition-colors text-sm">Post</button>` : 
                                `<span class="text-gray-400 text-sm">Posted</span>`
                            }
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
        },

        postEntry: async function(id) {
            if(!confirm("Are you sure you want to post this entry? It cannot be undone.")) return;
            try {
                const token = localStorage.getItem('pos_token');
                const response = await fetch(`${API_BASE}/accounting/journal/${id}/post/`, {
                    method: 'POST',
                    headers: { 'Authorization': `Token ${token}` }
                });
                
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || 'Failed to post entry');
                }
                
                await this.fetchEntries();
            } catch (e) {
                alert(e.message);
            }
        },
        
        showAddModal: function() {
            document.getElementById('add-journal-form').reset();
            document.getElementById('je-date').value = new Date().toISOString().split('T')[0];
            state.lines = [
                { account_id: '', debit: '', credit: '' },
                { account_id: '', debit: '', credit: '' }
            ];
            this.renderLines();
            document.getElementById('add-journal-modal').classList.remove('hidden');
        },
        
        hideAddModal: function() {
            document.getElementById('add-journal-modal').classList.add('hidden');
        },

        addLine: function() {
            state.lines.push({ account_id: '', debit: '', credit: '' });
            this.renderLines();
        },

        removeLine: function(index) {
            state.lines.splice(index, 1);
            this.renderLines();
            this.updateTotals();
        },

        updateLine: function(index, field, value) {
            state.lines[index][field] = value;
            if(field === 'debit' && value > 0) state.lines[index].credit = '';
            if(field === 'credit' && value > 0) state.lines[index].debit = '';
            this.updateTotals();
        },
        
        updateTotals: function() {
            let totalDebit = 0;
            let totalCredit = 0;
            
            state.lines.forEach(line => {
                totalDebit += parseFloat(line.debit) || 0;
                totalCredit += parseFloat(line.credit) || 0;
            });
            
            document.getElementById('je-total-debit').textContent = totalDebit.toFixed(2);
            document.getElementById('je-total-credit').textContent = totalCredit.toFixed(2);
        },

        renderLines: function() {
            const tbody = document.getElementById('je-lines');
            let html = '';
            
            const options = state.accounts.map(acc => `<option value="${acc.id}">${acc.code} - ${acc.name}</option>`).join('');
            
            state.lines.forEach((line, index) => {
                html += `
                    <tr>
                        <td class="p-2">
                            <select onchange="window.JournalController.updateLine(${index}, 'account_id', this.value)" class="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
                                <option value="">Select Account</option>
                                ${options}
                            </select>
                        </td>
                        <td class="p-2">
                            <input type="number" step="0.01" min="0" value="${line.debit}" oninput="window.JournalController.updateLine(${index}, 'debit', this.value)" class="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-right" placeholder="0.00">
                        </td>
                        <td class="p-2">
                            <input type="number" step="0.01" min="0" value="${line.credit}" oninput="window.JournalController.updateLine(${index}, 'credit', this.value)" class="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-right" placeholder="0.00">
                        </td>
                        <td class="p-2 text-center">
                            <button type="button" onclick="window.JournalController.removeLine(${index})" class="text-red-500 hover:text-red-700 transition-colors">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
            
            state.lines.forEach((line, index) => {
                if(line.account_id) {
                    const select = tbody.children[index].querySelector('select');
                    select.value = line.account_id;
                }
            });

            if (window.lucide) window.lucide.createIcons();
            this.updateTotals();
        },
        
        handleAddEntry: async function(e) {
            e.preventDefault();
            
            let totalDebit = 0;
            let totalCredit = 0;
            const validLines = [];
            
            for(let i=0; i<state.lines.length; i++) {
                const line = state.lines[i];
                const d = parseFloat(line.debit) || 0;
                const c = parseFloat(line.credit) || 0;
                
                if (line.account_id && (d > 0 || c > 0)) {
                    validLines.push({
                        account_id: parseInt(line.account_id),
                        debit: d,
                        credit: c
                    });
                    totalDebit += d;
                    totalCredit += c;
                }
            }
            
            if (validLines.length < 2) {
                alert("Please provide at least two valid lines.");
                return;
            }
            
            if (Math.abs(totalDebit - totalCredit) > 0.001) {
                alert("Debits and Credits must be equal.");
                return;
            }
            
            const btn = document.getElementById('add-journal-btn');
            btn.innerHTML = `<div class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> Saving...`;
            btn.disabled = true;
            
            const data = {
                date: document.getElementById('je-date').value,
                reference: document.getElementById('je-ref').value,
                description: document.getElementById('je-desc').value,
                lines: validLines
            };
            
            try {
                const token = localStorage.getItem('pos_token');
                const response = await fetch(`${API_BASE}/accounting/journal/create_with_lines/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || 'Failed to create entry');
                }
                
                this.hideAddModal();
                await this.fetchEntries();
            } catch (error) {
                alert(error.message);
            } finally {
                btn.innerHTML = `Save Entry`;
                btn.disabled = false;
            }
        }
    };
    
    // Initialize
    window.JournalController.fetchAccounts();
    window.JournalController.fetchEntries();
    if (window.lucide) window.lucide.createIcons();
};
