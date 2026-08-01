window.initializeNotificationsCenter = function() {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    let currentTab = 'inapp';
    const content = document.getElementById('notificationsContent');
    const loading = document.getElementById('notificationsLoading');
    const errorAlert = document.getElementById('notificationsError');
    const errorMsg = document.getElementById('notificationsErrorMessage');
    const markAllReadBtn = document.getElementById('markAllReadBtn');

    function getAuthHeaders() {
        return {
            'Authorization': `Token ${localStorage.getItem('pos_token')}`,
            'Content-Type': 'application/json'
        };
    }

    async function loadData() {
        loading.classList.remove('hidden');
        errorAlert.classList.add('hidden');
        content.innerHTML = '';
        markAllReadBtn.classList.add('hidden');
        
        let endpoint = '';
        if (currentTab === 'inapp') endpoint = '/notifications/';
        else if (currentTab === 'email') endpoint = '/notifications/email-queue/';
        else if (currentTab === 'sms') endpoint = '/notifications/sms-queue/';

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error(`Failed to fetch ${currentTab} notifications`);
            const data = await res.json();
            renderData(data);
            if (currentTab === 'inapp') markAllReadBtn.classList.remove('hidden');
        } catch (error) {
            errorMsg.textContent = error.message;
            errorAlert.classList.remove('hidden');
        } finally {
            loading.classList.add('hidden');
        }
    }

    function renderData(data) {
        if (!data || data.length === 0) {
            content.innerHTML = `<div class="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">No notifications found in this queue.</div>`;
            return;
        }

        if (currentTab === 'inapp') {
            content.innerHTML = data.map(item => `
                <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-start space-x-4 ${item.is_read ? 'opacity-70' : 'border-l-4 border-l-indigo-500'}">
                    <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <i data-lucide="bell" class="w-5 h-5"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-sm font-semibold text-gray-900">${item.title || 'Notification'}</h4>
                        <p class="text-sm text-gray-600 mt-1">${item.message || item.body || ''}</p>
                        <p class="text-xs text-gray-400 mt-2">${item.created_at || 'Just now'}</p>
                    </div>
                </div>
            `).join('');
        } else {
            content.innerHTML = `<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${data.map(item => `
                            <tr>
                                <td class="px-6 py-4 text-sm text-gray-900">${item.recipient || item.to || 'N/A'}</td>
                                <td class="px-6 py-4"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${item.status || 'Pending'}</span></td>
                                <td class="px-6 py-4 text-sm text-gray-500">${item.created_at || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
        }
        if (window.lucide) window.lucide.createIcons();
    }

    // Tabs handling
    document.querySelectorAll('#notificationTabs button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#notificationTabs button').forEach(b => {
                b.className = "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300";
            });
            e.target.className = "inline-block p-4 border-b-2 border-indigo-600 text-indigo-600 rounded-t-lg active dark:text-indigo-500 dark:border-indigo-500";
            currentTab = e.target.getAttribute('data-tab');
            loadData();
        });
    });

    markAllReadBtn?.addEventListener('click', async () => {
        try {
            const res = await fetch(`${API_BASE}/notifications/mark-all-read/`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to mark as read');
            loadData();
        } catch (e) {
            alert(e.message);
        }
    });

    loadData();
};