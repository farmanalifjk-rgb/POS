window.initializeApprovals = function() {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const tbody = document.getElementById('approvalsTableBody');
    const loading = document.getElementById('approvalsLoading');
    const errorAlert = document.getElementById('approvalsError');
    const errorMsg = document.getElementById('approvalsErrorMessage');

    function getAuthHeaders() {
        return {
            'Authorization': `Token ${localStorage.getItem('pos_token')}`,
            'Content-Type': 'application/json'
        };
    }

    async function fetchApprovals() {
        if (!tbody) return;
        loading.classList.remove('hidden');
        errorAlert.classList.add('hidden');
        tbody.innerHTML = '';
        
        try {
            const res = await fetch(`${API_BASE}/workflow/requests/`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed to fetch approvals');
            const data = await res.json();
            renderApprovals(data);
        } catch (error) {
            errorMsg.textContent = error.message;
            errorAlert.classList.remove('hidden');
        } finally {
            loading.classList.add('hidden');
        }
    }

    function renderApprovals(approvals) {
        if (approvals.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No pending approvals</td></tr>`;
            return;
        }

        tbody.innerHTML = approvals.map(app => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#${app.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${app.type || 'General'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${app.requester_name || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        ${app.status || 'Pending'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="window.handleApprovalAction(${app.id}, 'approve')" class="text-green-600 hover:text-green-900 mr-3">Approve</button>
                    <button onclick="window.handleApprovalAction(${app.id}, 'reject')" class="text-red-600 hover:text-red-900">Reject</button>
                </td>
            </tr>
        `).join('');
        if (window.lucide) window.lucide.createIcons();
    }

    window.handleApprovalAction = async function(id, action) {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        
        try {
            const res = await fetch(`${API_BASE}/workflow/requests/${id}/${action}/`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error(`Failed to ${action}`);
            fetchApprovals();
        } catch (error) {
            alert(error.message);
        }
    };

    document.getElementById('refreshApprovals')?.addEventListener('click', fetchApprovals);
    
    fetchApprovals();
};