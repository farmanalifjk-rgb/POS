window.initializePayroll = function() {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const getHeaders = () => ({
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    });

    const loadPayroll = async () => {
        try {
            const response = await fetch(`${API_BASE}/hr/payroll/`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch payroll');
            const runs = await response.json();
            renderPayroll(runs);
        } catch (error) {
            console.error(error);
            document.getElementById('payrollList').innerHTML = `
                <tr><td colspan="5" class="p-8 text-center text-red-500">Error loading payroll runs.</td></tr>
            `;
        }
    };

    const renderPayroll = (runs) => {
        const tbody = document.getElementById('payrollList');
        if (runs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">No payroll runs found.</td></tr>`;
            return;
        }

        tbody.innerHTML = runs.map(run => {
            const statusClass = run.status === 'Draft' ? 'bg-gray-100 text-gray-700' : 
                                run.status === 'Generated' ? 'bg-blue-100 text-blue-700' : 
                                'bg-green-100 text-green-700';
            return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4 text-gray-900 font-medium">${run.month}</td>
                <td class="p-4 text-gray-600">${run.year}</td>
                <td class="p-4 text-gray-900 font-semibold">$${parseFloat(run.total_net || 0).toFixed(2)}</td>
                <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${run.status}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <div class="flex justify-end gap-2">
                        <button onclick="window.viewEntries(${run.id}, '${run.month} ${run.year}')" class="px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors">
                            View
                        </button>
                        ${run.status === 'Draft' ? `
                            <button onclick="window.generateEntries(${run.id})" class="px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">
                                Generate
                            </button>
                        ` : ''}
                        ${run.status === 'Generated' ? `
                            <button onclick="window.postPayroll(${run.id})" class="px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors">
                                Post
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
            `;
        }).join('');
        lucide.createIcons();
    };

    window.viewEntries = async (id, title) => {
        const modal = document.getElementById('entriesModal');
        const overlay = document.getElementById('modalOverlay');
        const tbody = document.getElementById('entriesList');
        
        document.getElementById('entriesSubtitle').textContent = `Run for ${title}`;
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500"><i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto"></i></td></tr>`;
        lucide.createIcons();

        try {
            const response = await fetch(`${API_BASE}/hr/payroll-entries/?payroll_run=${id}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch entries');
            const entries = await response.json();
            
            if (entries.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500">No entries found for this run.</td></tr>`;
                return;
            }

            tbody.innerHTML = entries.map(entry => `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-3 font-medium text-gray-900">${entry.employee_name || entry.employee}</td>
                    <td class="p-3 text-gray-600">$${parseFloat(entry.basic_salary || 0).toFixed(2)}</td>
                    <td class="p-3 text-green-600">+$${parseFloat(entry.allowances || 0).toFixed(2)}</td>
                    <td class="p-3 text-red-600">-$${parseFloat(entry.deductions || 0).toFixed(2)}</td>
                    <td class="p-3 font-bold text-gray-900">$${parseFloat(entry.net_pay || 0).toFixed(2)}</td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-red-500">Error loading entries.</td></tr>`;
        }
    };

    // Observers for modal closing
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('hidden')) {
                document.getElementById('modalOverlay').classList.add('hidden');
            }
        });
    });
    const modalEl = document.getElementById('entriesModal');
    if(modalEl) observer.observe(modalEl, { attributes: true, attributeFilter: ['class'] });

    window.generateEntries = async (id) => {
        if(!confirm('Generate payroll entries for this run?')) return;
        try {
            const response = await fetch(`${API_BASE}/hr/payroll/${id}/generate_entries/`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to generate entries');
            loadPayroll();
        } catch (error) {
            alert(error.message);
        }
    };

    window.postPayroll = async (id) => {
        if(!confirm('Post payroll? This cannot be undone.')) return;
        try {
            const response = await fetch(`${API_BASE}/hr/payroll/${id}/post_payroll/`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to post payroll');
            loadPayroll();
        } catch (error) {
            alert(error.message);
        }
    };

    loadPayroll();
};