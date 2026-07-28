window.initializeLeave = function() {
    const API_BASE = 'http://127.0.0.1:8000/api';
    const getHeaders = () => ({
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    });

    const loadLeaves = async () => {
        try {
            const response = await fetch(`${API_BASE}/hr/leave-requests/`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch leave requests');
            const leaves = await response.json();
            renderLeaves(leaves);
        } catch (error) {
            console.error(error);
            document.getElementById('leaveList').innerHTML = `
                <tr><td colspan="6" class="p-8 text-center text-red-500">Error loading requests.</td></tr>
            `;
        }
    };

    const renderLeaves = (leaves) => {
        const tbody = document.getElementById('leaveList');
        if (leaves.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">No leave requests found.</td></tr>`;
            return;
        }

        tbody.innerHTML = leaves.map(leave => {
            const statusClass = leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                                'bg-blue-100 text-blue-700';
            return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4 font-medium text-gray-900">${leave.employee_name || leave.employee}</td>
                <td class="p-4 text-gray-600">${leave.leave_type || leave.type}</td>
                <td class="p-4 text-gray-600">${leave.start_date}</td>
                <td class="p-4 text-gray-600">${leave.end_date}</td>
                <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${leave.status}
                    </span>
                </td>
                <td class="p-4 text-right">
                    ${leave.status === 'Pending' ? `
                    <div class="flex justify-end gap-2">
                        <button onclick="window.approveLeave(${leave.id})" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip" title="Approve">
                            <i data-lucide="check" class="w-5 h-5"></i>
                        </button>
                        <button onclick="window.rejectLeave(${leave.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip" title="Reject">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    ` : '<span class="text-gray-400 text-sm">Actioned</span>'}
                </td>
            </tr>
            `;
        }).join('');
        lucide.createIcons();
    };

    window.approveLeave = async (id) => {
        if(!confirm('Are you sure you want to approve this request?')) return;
        try {
            const response = await fetch(`${API_BASE}/hr/leave-requests/${id}/approve/`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to approve');
            loadLeaves();
        } catch (error) {
            alert(error.message);
        }
    };

    window.rejectLeave = async (id) => {
        if(!confirm('Are you sure you want to reject this request?')) return;
        try {
            const response = await fetch(`${API_BASE}/hr/leave-requests/${id}/reject/`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to reject');
            loadLeaves();
        } catch (error) {
            alert(error.message);
        }
    };

    loadLeaves();
};
