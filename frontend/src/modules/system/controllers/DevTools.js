const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");

window.initializeDevTools = function() {
    let currentLogPage = 1;

    const getHeaders = () => ({
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    });

    const showToast = (msg) => {
        const toast = document.getElementById('toast-success');
        document.getElementById('toast-msg').textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    };

    window.refreshHealth = async () => {
        try {
            const res = await fetch(`${API_BASE}/system-health/`, { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                
                const dbEl = document.getElementById('health-db');
                if (data.db_connected) {
                    dbEl.innerHTML = `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Connected</span>`;
                } else {
                    dbEl.innerHTML = `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Disconnected</span>`;
                }

                document.getElementById('health-errors').textContent = data.error_count || '0';
                document.getElementById('health-sessions').textContent = data.active_sessions || '0';
                document.getElementById('health-dbsize').textContent = data.db_size || 'Unknown';
                document.getElementById('health-python').textContent = data.python_version || 'Unknown';
                document.getElementById('health-django').textContent = data.django_version || 'Unknown';
            }
        } catch (error) {
            console.error('Failed to load system health', error);
        }
    };

    const loadStats = async () => {
        try {
            // In a real scenario, these might be list endpoints where we check count, or explicit stats endpoints.
            const keysRes = await fetch(`${API_BASE}/api-keys/`, { headers: getHeaders() });
            if (keysRes.ok) {
                const data = await keysRes.json();
                document.getElementById('stat-apikeys').textContent = data.count || data.length || 0;
            }

            const hookRes = await fetch(`${API_BASE}/webhooks/`, { headers: getHeaders() });
            if (hookRes.ok) {
                const data = await hookRes.json();
                document.getElementById('stat-webhooks').textContent = data.count || data.length || 0;
            }
        } catch (error) {
            console.error('Failed to load stats', error);
        }
    };

    window.clearCache = async () => {
        if (!confirm('Are you sure you want to clear the system cache?')) return;
        const btn = document.getElementById('btn-clear-cache');
        const origText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 mr-2 inline animate-spin"></i> Clearing...`;
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/data/clear-cache/`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (res.ok) {
                showToast('Cache cleared successfully');
                document.getElementById('dt-last-cleared').textContent = new Date().toLocaleString();
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            alert('Failed to clear cache');
        } finally {
            btn.innerHTML = origText;
            btn.disabled = false;
        }
    };

    window.optimizeDatabase = async () => {
        const btn = document.getElementById('btn-optimize-db');
        const origText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 mr-2 inline animate-spin"></i> Optimizing...`;
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/data/optimize-database/`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (res.ok) {
                showToast('Database optimized successfully');
                document.getElementById('dt-last-optimized').textContent = new Date().toLocaleString();
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            alert('Failed to optimize database');
        } finally {
            btn.innerHTML = origText;
            btn.disabled = false;
        }
    };

    window.loadLogs = async (page = 1) => {
        currentLogPage = page;
        const unresolvedOnly = document.getElementById('log-filter-unresolved').checked;
        const query = `?page=${page}${unresolvedOnly ? '&resolved=false' : ''}`;

        try {
            const res = await fetch(`${API_BASE}/error-logs/${query}`, { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                renderLogs(data.results || []);
                renderLogPagination(data, page);
            }
        } catch (error) {
            console.error('Failed to load logs', error);
        }
    };

    const renderLogs = (logs) => {
        const tbody = document.getElementById('logs-table-body');
        if (!logs.length) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No logs found.</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map(log => {
            const levelClass = log.level === 'ERROR' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';
            const statusBadge = log.resolved 
                ? `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Resolved</span>`
                : `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Unresolved</span>`;
            
            const actionBtn = log.resolved 
                ? `<span class="text-xs text-gray-400">Done</span>`
                : `<button onclick="window.resolveErrorLog(${log.id})" class="text-indigo-600 hover:text-indigo-900 text-xs font-medium">Mark Resolved</button>`;

            return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${levelClass}">${log.level}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="truncate max-w-md" title="${log.message}">${log.message}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(log.timestamp).toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${actionBtn}
                </td>
            </tr>
            `;
        }).join('');
    };

    const renderLogPagination = (data, page) => {
        const container = document.getElementById('logs-pagination');
        container.innerHTML = `
            <span class="text-sm text-gray-700">Page ${page}</span>
            <div class="flex space-x-2">
                <button ${!data.previous ? 'disabled' : ''} onclick="window.loadLogs(${page - 1})" class="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50">Prev</button>
                <button ${!data.next ? 'disabled' : ''} onclick="window.loadLogs(${page + 1})" class="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50">Next</button>
            </div>
        `;
    };

    window.resolveErrorLog = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/error-logs/${id}/resolve/`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (res.ok) {
                showToast('Log marked as resolved');
                window.loadLogs(currentLogPage);
                window.refreshHealth(); // might update error count
            }
        } catch (error) {
            alert('Failed to resolve log');
        }
    };

    window.exportData = async (type) => {
        let endpoint = `${API_BASE}/data/export/${type}/`;
        // Hardcode a date range for sales demo if needed
        if (type === 'sales') {
            endpoint += '?start_date=2000-01-01&end_date=2100-01-01';
        }

        try {
            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Token ${localStorage.getItem('pos_token')}` }
            });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `export_${type}_${new Date().getTime()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error(error);
            alert(`Failed to export ${type} data.`);
        }
    };

    // Init
    window.refreshHealth();
    loadStats();
    window.loadLogs(1);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
};