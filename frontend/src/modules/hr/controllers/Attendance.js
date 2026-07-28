window.initializeAttendance = function() {
    const API_BASE = 'http://127.0.0.1:8000/api';
    const getHeaders = () => ({
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    });

    window.loadAttendance = async () => {
        const dateFilter = document.getElementById('attendanceDateFilter').value;
        const query = dateFilter ? `?date=${dateFilter}` : '';
        
        try {
            const response = await fetch(`${API_BASE}/hr/attendance/${query}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch attendance');
            const records = await response.json();
            renderAttendance(records);
        } catch (error) {
            console.error(error);
            document.getElementById('attendanceList').innerHTML = `
                <tr><td colspan="6" class="p-8 text-center text-red-500">Error loading records.</td></tr>
            `;
        }
    };

    const renderAttendance = (records) => {
        const tbody = document.getElementById('attendanceList');
        if (records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">No attendance records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = records.map(record => {
            const statusClass = record.status === 'Present' ? 'bg-green-100 text-green-700' : 
                                record.status === 'Late' ? 'bg-amber-100 text-amber-700' : 
                                'bg-red-100 text-red-700';
            return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4 font-medium text-gray-900">${record.employee_name || record.employee}</td>
                <td class="p-4 text-gray-600">${record.date}</td>
                <td class="p-4 text-gray-600">${record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : '-'}</td>
                <td class="p-4 text-gray-600">${record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : '-'}</td>
                <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${record.status || 'Present'}
                    </span>
                </td>
                <td class="p-4 text-gray-600">${record.hours_worked || '-'}</td>
            </tr>
            `;
        }).join('');
        lucide.createIcons();
    };

    // Set today as default filter
    document.getElementById('attendanceDateFilter').valueAsDate = new Date();
    window.loadAttendance();
};
