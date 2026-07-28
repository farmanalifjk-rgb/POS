const API_BASE = 'http://127.0.0.1:8000/api';
import { createIcons, icons } from "lucide";

window.initializeBackup = function() {
    let currentPage = 1;
    let selectedBackupId = null;

    const getHeaders = () => ({
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    });

    const loadBackups = async (page = 1) => {
        try {
            const res = await fetch(`${API_BASE}/backups/?page=${page}`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch backups');
            const data = await res.json();
            
            // Assuming pagination format { results: [], count: 0, next: '', previous: '', system_stats: {} }
            const results = data.results || [];
            const stats = data.system_stats || {};

            renderStats(stats);
            renderTable(results);
            renderPagination(data, page);
        } catch (error) {
            console.error('Error loading backups:', error);
            // toast here ideally
        }
    };

    const loadSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/settings/backup/`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();
            
            document.getElementById('setting-auto-backup').checked = data.auto_backup;
            document.getElementById('setting-frequency').value = data.frequency || 'daily';
            document.getElementById('setting-retention').value = data.retention_count || 7;
            document.getElementById('setting-notify').checked = data.email_notify;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const renderStats = (stats) => {
        document.getElementById('stat-last-backup').textContent = stats.last_backup || 'Never';
        document.getElementById('stat-total-backups').textContent = stats.total_backups || '0';
        document.getElementById('stat-db-size').textContent = stats.db_size || '0 MB';
        
        const scheduleEl = document.getElementById('stat-schedule');
        if (stats.schedule_enabled) {
            scheduleEl.innerHTML = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>`;
        } else {
            scheduleEl.innerHTML = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Disabled</span>`;
        }
    };

    const renderTable = (results) => {
        const tbody = document.getElementById('backup-table-body');
        if (results.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">No backups found.</td></tr>`;
            return;
        }

        tbody.innerHTML = results.map((item, index) => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-sm text-gray-500">${index + 1}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${item.file_name}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${item.type}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${item.size}</td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${item.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${new Date(item.created_at).toLocaleString()}</td>
                <td class="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <button onclick="window.downloadBackup(${item.id})" class="text-indigo-600 hover:text-indigo-900" title="Download">
                        <i data-lucide="download" class="w-4 h-4 inline"></i>
                    </button>
                    <button onclick="window.openRestoreModal(${item.id}, '${item.file_name}')" class="text-amber-600 hover:text-amber-900" title="Restore">
                        <i data-lucide="rotate-ccw" class="w-4 h-4 inline"></i>
                    </button>
                    <button onclick="window.deleteBackup(${item.id})" class="text-red-600 hover:text-red-900" title="Delete">
                        <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        createIcons({ icons });
    };

    const renderPagination = (data, page) => {
        // Simplified pagination
        const container = document.getElementById('backup-pagination');
        container.innerHTML = `
            <span class="text-sm text-gray-700">Page ${page}</span>
            <div class="flex space-x-2">
                <button ${!data.previous ? 'disabled' : ''} onclick="window.changeBackupPage(${page - 1})" class="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
                <button ${!data.next ? 'disabled' : ''} onclick="window.changeBackupPage(${page + 1})" class="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
            </div>
        `;
    };

    window.changeBackupPage = (page) => {
        currentPage = page;
        loadBackups(page);
    };

    window.createBackup = async () => {
        const btn = document.getElementById('btn-create-backup');
        btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i> Running...`;
        btn.disabled = true;
        createIcons({ icons });

        try {
            const res = await fetch(`${API_BASE}/backups/create/`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to create backup');
            const data = await res.json();
            
            const successMsg = document.getElementById('backup-success-msg');
            document.getElementById('backup-success-name').textContent = data.file_name || 'Backup created';
            successMsg.classList.remove('hidden');
            setTimeout(() => successMsg.classList.add('hidden'), 5000);
            
            loadBackups(currentPage);
        } catch (error) {
            console.error(error);
            alert('Failed to create backup.');
        } finally {
            btn.innerHTML = `<i data-lucide="plus" class="w-4 h-4 mr-2"></i> Create Backup`;
            btn.disabled = false;
            createIcons({ icons });
        }
    };

    window.downloadBackup = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/backups/${id}/download/`, {
                headers: { 'Authorization': `Token ${localStorage.getItem('pos_token')}` }
            });
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_${id}.zip`; // Ideally get from headers
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error(error);
            alert('Download failed.');
        }
    };

    window.openRestoreModal = (id, fileName) => {
        selectedBackupId = id;
        document.getElementById('restore-filename-display').textContent = fileName;
        document.getElementById('restore-confirm-input').value = '';
        document.getElementById('btn-confirm-restore').disabled = true;
        document.getElementById('restore-modal').classList.remove('hidden');
    };

    window.closeRestoreModal = () => {
        document.getElementById('restore-modal').classList.add('hidden');
        selectedBackupId = null;
    };

    window.checkRestoreConfirm = (val) => {
        document.getElementById('btn-confirm-restore').disabled = (val !== 'RESTORE');
    };

    window.confirmRestore = async () => {
        if (!selectedBackupId) return;
        const btn = document.getElementById('btn-confirm-restore');
        btn.innerHTML = 'Restoring...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/backups/restore/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ backup_id: selectedBackupId })
            });
            if (!res.ok) throw new Error('Restore failed');
            
            alert('Restore completed successfully. The system will now reload.');
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Restore failed.');
            btn.innerHTML = 'Confirm Restore';
            btn.disabled = false;
        }
    };

    window.saveBackupSettings = async () => {
        const payload = {
            auto_backup: document.getElementById('setting-auto-backup').checked,
            frequency: document.getElementById('setting-frequency').value,
            retention_count: parseInt(document.getElementById('setting-retention').value, 10),
            email_notify: document.getElementById('setting-notify').checked
        };

        try {
            const res = await fetch(`${API_BASE}/settings/backup/`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to save settings');
            alert('Settings saved successfully.');
            loadBackups(currentPage); // refresh stats
        } catch (error) {
            console.error(error);
            alert('Failed to save settings.');
        }
    };

    // Placeholder for delete
    window.deleteBackup = async (id) => {
        if (!confirm('Are you sure you want to delete this backup?')) return;
        try {
            const res = await fetch(`${API_BASE}/backups/${id}/`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Delete failed');
            loadBackups(currentPage);
        } catch(error) {
            console.error(error);
        }
    };

    // Init
    loadSettings();
    loadBackups();
    if (typeof lucide !== 'undefined') createIcons({ icons });
};
