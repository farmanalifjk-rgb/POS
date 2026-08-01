export function initializeSecurity() {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const authHeaders = {
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    };

    let loadedTabs = new Set();
    window.loginHistoryPage = 1;
    window.auditPage = 1;

    // Toast helper
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
        toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 z-50 flex items-center gap-3`;
        toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-5 h-5"></i><span>${message}</span>`;
        document.body.appendChild(toast);
        if (window.lucide) lucide.createIcons();
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Common fetch wrapper
    async function apiFetch(url, options = {}) {
        options.headers = { ...authHeaders, ...options.headers };
        const response = await fetch(`${API_BASE}${url}`, options);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || err.message || 'API Error');
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }

    window.switchTab = function(tabName) {
        // Update nav styling
        document.querySelectorAll('nav button').forEach(btn => {
            if (btn.id === `nav-${tabName}`) {
                btn.classList.add('text-blue-700', 'bg-blue-50');
                btn.classList.remove('text-slate-700', 'hover:bg-slate-100');
            } else {
                btn.classList.remove('text-blue-700', 'bg-blue-50');
                btn.classList.add('text-slate-700', 'hover:bg-slate-100');
            }
        });

        // Hide all tabs, show active
        document.querySelectorAll('[id^="tab-"]').forEach(el => el.classList.add('hidden'));
        document.getElementById(`tab-${tabName}`).classList.remove('hidden');

        // Lazy load
        if (!loadedTabs.has(tabName)) {
            if (tabName === 'sessions') window.loadSessions();
            if (tabName === 'login-history') window.loadLoginHistory();
            if (tabName === 'audit-logs') window.loadAuditLogs();
            if (tabName === 'api-tokens') window.loadApiTokens();
            if (tabName === 'devices') window.loadDevices();
            loadedTabs.add(tabName);
        }
    };

    // --- SESSIONS ---
    window.loadSessions = async function() {
        try {
            document.getElementById('sessions-loading').classList.remove('hidden');
            const data = await apiFetch('/auth/sessions/');
            const sessions = data.results || data || [];
            
            const tbody = document.getElementById('sessions-table-body');
            tbody.innerHTML = '';
            
            let currentSessionId = localStorage.getItem('session_id') || 'current-123';
            
            sessions.forEach(s => {
                const isCurrent = s.is_current || s.id === currentSessionId;
                const created = new Date(s.created_at).toLocaleString();
                const lastUsed = new Date(s.last_used).toLocaleString();
                
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50/50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                <span class="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">${(s.id || '').substring(0, 8)}...</span>
                                ${isCurrent ? '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Current</span>' : ''}
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-medium text-slate-800">${s.device_name || 'Unknown Device'}</div>
                            <div class="text-xs text-slate-500 mt-0.5">${s.ip_address || '0.0.0.0'}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm">${created}</div>
                            <div class="text-xs text-slate-500 mt-0.5">Last used: ${lastUsed}</div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            ${!isCurrent ? `
                            <button onclick="window.revokeSession('${s.id}')" class="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded hover:bg-red-50 transition-colors">
                                Revoke
                            </button>` : '<span class="text-sm text-slate-400">Active</span>'}
                        </td>
                    </tr>
                `;
            });

            document.getElementById('stat-total-sessions').textContent = sessions.length;
            document.getElementById('stat-sessions-today').textContent = sessions.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;
            document.getElementById('stat-authorized-devices').textContent = new Set(sessions.map(s => s.device_name)).size;
            
        } catch (error) {
            console.error(error);
            showToast('Failed to load active sessions', 'error');
        } finally {
            document.getElementById('sessions-loading').classList.add('hidden');
        }
    };

    window.revokeSession = async function(id) {
        if (!confirm('Are you sure you want to revoke this session? The user will be logged out immediately.')) return;
        try {
            await apiFetch(`/auth/sessions/${id}/revoke/`, { method: 'POST' });
            showToast('Session revoked successfully');
            window.loadSessions();
        } catch (error) {
            showToast('Failed to revoke session: ' + error.message, 'error');
        }
    };

    // --- LOGIN HISTORY ---
    window.loadLoginHistory = async function(page = 1) {
        window.loginHistoryPage = page;
        const status = document.getElementById('login-filter-status').value;
        const start = document.getElementById('login-filter-start').value;
        const end = document.getElementById('login-filter-end').value;
        
        let query = `?page=${page}`;
        if (status) query += `&status=${status}`;
        if (start) query += `&start_date=${start}`;
        if (end) query += `&end_date=${end}`;

        try {
            const data = await apiFetch(`/security/login-attempts/${query}`);
            const attempts = data.results || data || [];
            
            const tbody = document.getElementById('login-history-table-body');
            tbody.innerHTML = '';
            
            attempts.forEach(a => {
                const isSuccess = a.status === 'success';
                const time = new Date(a.timestamp).toLocaleString();
                
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50/50">
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isSuccess ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}">
                                <span class="w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}"></span>
                                ${isSuccess ? 'Success' : 'Failed'}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-medium text-slate-800">${a.username || 'Unknown'}</div>
                            <div class="text-xs text-slate-500 mt-0.5">${a.ip_address || '0.0.0.0'}</div>
                        </td>
                        <td class="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" title="${a.user_agent}">
                            ${a.user_agent || '-'}
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600">
                            <div>${time}</div>
                            ${a.reason ? `<div class="text-xs text-slate-500 mt-0.5">${a.reason}</div>` : ''}
                        </td>
                    </tr>
                `;
            });
            
            document.getElementById('login-pagination-info').textContent = `Showing page ${page}`;
            document.getElementById('login-prev-btn').disabled = page <= 1;
            document.getElementById('login-next-btn').disabled = !data.next;
            
        } catch (error) {
            showToast('Failed to load login history', 'error');
        }
    };

    // --- AUDIT LOGS ---
    window.loadAuditLogs = async function(page = 1) {
        window.auditPage = page;
        const action = document.getElementById('audit-filter-action').value;
        let query = `?page=${page}`;
        if (action) query += `&action=${action}`;

        try {
            const data = await apiFetch(`/security/audit-logs/${query}`);
            const logs = data.results || data || [];
            
            const tbody = document.getElementById('audit-logs-table-body');
            tbody.innerHTML = '';
            
            logs.forEach(l => {
                const time = new Date(l.timestamp).toLocaleString();
                let actionColor = 'slate';
                if (l.action === 'create') actionColor = 'green';
                if (l.action === 'update') actionColor = 'blue';
                if (l.action === 'delete') actionColor = 'red';
                
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50/50">
                        <td class="px-6 py-4">
                            <span class="inline-flex px-2 py-1 rounded text-xs font-medium bg-${actionColor}-100 text-${actionColor}-700">
                                ${(l.action || '').toUpperCase()}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-medium text-slate-800">${l.entity_type || '-'}</div>
                            <div class="text-xs text-slate-500 mt-0.5 font-mono">${l.entity_id || '-'}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600">${l.description || '-'}</td>
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-slate-700">${l.user || 'System'}</div>
                            <div class="text-xs text-slate-500 mt-0.5">${l.ip_address || '-'}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-500">${time}</td>
                    </tr>
                `;
            });
            
            document.getElementById('audit-pagination-info').textContent = `Showing page ${page}`;
            document.getElementById('audit-prev-btn').disabled = page <= 1;
            document.getElementById('audit-next-btn').disabled = !data.next;
            
        } catch (error) {
            showToast('Failed to load audit logs', 'error');
        }
    };

    window.exportAuditLogs = function() {
        showToast('Exporting audit logs to CSV...', 'success');
        setTimeout(() => {
            const url = `${API_BASE}/security/audit-logs/export/`;
            window.open(url, '_blank');
        }, 1000);
    };

    // --- API TOKENS ---
    window.loadApiTokens = async function() {
        try {
            const data = await apiFetch(`/api-keys/`);
            const tokens = data.results || data || [];
            
            const tbody = document.getElementById('api-tokens-table-body');
            tbody.innerHTML = '';
            
            tokens.forEach(t => {
                const created = new Date(t.created_at).toLocaleDateString();
                const lastUsed = t.last_used ? new Date(t.last_used).toLocaleDateString() : 'Never';
                const scopesHtml = (t.scopes || []).map(s => `<span class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-xs mr-1">${s}</span>`).join('');
                
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50/50">
                        <td class="px-6 py-4 font-medium text-slate-800">${t.name}</td>
                        <td class="px-6 py-4 font-mono text-sm text-slate-500">${t.prefix}...****</td>
                        <td class="px-6 py-4">${scopesHtml}</td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-slate-700">${created}</div>
                            <div class="text-xs text-slate-500 mt-0.5">Last used: ${lastUsed}</div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <button onclick="window.deleteApiKey('${t.id}')" class="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded hover:bg-red-50 transition-colors">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            });
        } catch (error) {
            showToast('Failed to load API tokens', 'error');
        }
    };

    window.openApiTokenModal = () => document.getElementById('modal-api-token').classList.remove('hidden');
    window.closeApiTokenModal = () => {
        document.getElementById('modal-api-token').classList.add('hidden');
        document.getElementById('token-name').value = '';
        document.querySelectorAll('input[name="token-scope"]').forEach(c => c.checked = false);
    };

    window.createApiToken = async function() {
        const name = document.getElementById('token-name').value;
        const scopes = Array.from(document.querySelectorAll('input[name="token-scope"]:checked')).map(c => c.value);
        
        if (!name) return showToast('Token name is required', 'error');
        if (scopes.length === 0) return showToast('Select at least one scope', 'error');
        
        try {
            const data = await apiFetch(`/api-keys/`, {
                method: 'POST',
                body: JSON.stringify({ name, scopes })
            });
            
            window.closeApiTokenModal();
            document.getElementById('new-token-value').value = data.key;
            document.getElementById('modal-token-success').classList.remove('hidden');
            window.loadApiTokens();
        } catch (error) {
            showToast('Failed to create token: ' + error.message, 'error');
        }
    };

    window.deleteApiKey = async function(id) {
        if (!confirm('Are you sure you want to delete this API token? Any integrations using it will immediately fail.')) return;
        try {
            await apiFetch(`/api-keys/${id}/`, { method: 'DELETE' });
            showToast('API token deleted');
            window.loadApiTokens();
        } catch (error) {
            showToast('Failed to delete API token', 'error');
        }
    };

    window.copyToClipboard = function(elementId) {
        const el = document.getElementById(elementId);
        el.select();
        document.execCommand('copy');
        showToast('Copied to clipboard!');
    };

    // --- TRUSTED DEVICES ---
    window.loadDevices = async function() {
        try {
            const data = await apiFetch(`/security/trusted-devices/`);
            const devices = data.results || data || [];
            
            const tbody = document.getElementById('devices-table-body');
            tbody.innerHTML = '';
            
            let authorizedCount = 0;
            let pendingCount = 0;

            devices.forEach(d => {
                const lastSeen = new Date(d.last_seen).toLocaleString();
                
                let statusBadge = '';
                let actions = '';
                if (d.status === 'authorized') {
                    authorizedCount++;
                    statusBadge = '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Authorized</span>';
                    actions = `<button onclick="window.revokeDevice('${d.id}')" class="text-sm text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded mr-2 font-medium">Revoke</button>`;
                } else if (d.status === 'pending') {
                    pendingCount++;
                    statusBadge = '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Pending</span>';
                    actions = `<button onclick="window.authorizeDevice('${d.id}')" class="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded mr-2 font-medium">Authorize</button>`;
                } else {
                    statusBadge = '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Revoked</span>';
                }
                
                actions += `<button onclick="window.deleteDevice('${d.id}')" class="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded font-medium">Delete</button>`;

                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50/50">
                        <td class="px-6 py-4">
                            <div class="font-medium text-slate-800">${d.name}</div>
                            <div class="text-xs text-slate-500 mt-0.5 font-mono">ID: ${(d.device_id || '').substring(0, 12)}...</div>
                        </td>
                        <td class="px-6 py-4">${statusBadge}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">${lastSeen}</td>
                        <td class="px-6 py-4 text-right">${actions}</td>
                    </tr>
                `;
            });

            document.getElementById('stat-total-devices').textContent = devices.length;
            document.getElementById('stat-auth-devices').textContent = authorizedCount;
            document.getElementById('stat-pending-devices').textContent = pendingCount;

        } catch (error) {
            showToast('Failed to load trusted devices', 'error');
        }
    };

    window.authorizeDevice = async function(id) {
        try {
            await apiFetch(`/security/trusted-devices/${id}/authorize/`, { method: 'POST' });
            showToast('Device authorized successfully');
            window.loadDevices();
        } catch (error) {
            showToast('Failed to authorize device', 'error');
        }
    };

    window.revokeDevice = async function(id) {
        if (!confirm('Are you sure you want to revoke access for this device?')) return;
        try {
            await apiFetch(`/security/trusted-devices/${id}/revoke/`, { method: 'POST' });
            showToast('Device access revoked');
            window.loadDevices();
        } catch (error) {
            showToast('Failed to revoke device', 'error');
        }
    };

    window.deleteDevice = async function(id) {
        if (!confirm('Are you sure you want to delete this device?')) return;
        try {
            await apiFetch(`/security/trusted-devices/${id}/`, { method: 'DELETE' });
            showToast('Device deleted');
            window.loadDevices();
        } catch (error) {
            showToast('Failed to delete device', 'error');
        }
    };

    // Initial render setup - call createIcons
    setTimeout(() => {
        if (window.lucide) lucide.createIcons();
        window.switchTab('sessions');
    }, 0);
}