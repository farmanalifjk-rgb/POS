window.initializeShifts = function() {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const getHeaders = () => ({
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    });

    const loadShifts = async () => {
        try {
            const response = await fetch(`${API_BASE}/hr/shifts/`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch shifts');
            const shifts = await response.json();
            renderShifts(shifts);
        } catch (error) {
            console.error(error);
            document.getElementById('shiftsList').innerHTML = `
                <tr><td colspan="5" class="p-8 text-center text-red-500">Error loading shifts.</td></tr>
            `;
        }
    };

    const renderShifts = (shifts) => {
        const tbody = document.getElementById('shiftsList');
        if (shifts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">No shifts scheduled.</td></tr>`;
            return;
        }

        tbody.innerHTML = shifts.map(shift => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4 font-medium text-gray-900">${shift.employee_name || shift.employee}</td>
                <td class="p-4 text-gray-600">${shift.date}</td>
                <td class="p-4 text-gray-600">${shift.start_time}</td>
                <td class="p-4 text-gray-600">${shift.end_time}</td>
                <td class="p-4 text-gray-500 text-sm max-w-xs truncate" title="${shift.notes || ''}">
                    ${shift.notes || '-'}
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    };

    document.getElementById('addShiftForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.spinner');
        
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (data.start_time && data.start_time.length === 5) data.start_time += ":00";
        if (data.end_time && data.end_time.length === 5) data.end_time += ":00";

        try {
            const response = await fetch(`${API_BASE}/hr/shifts/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Failed to create shift');
            
            document.getElementById('addShiftModal').classList.add('hidden');
            form.reset();
            loadShifts();
        } catch (error) {
            alert(error.message);
        } finally {
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    loadShifts();
};