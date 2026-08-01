window.initializeEmployees = function() {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const getHeaders = () => ({
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    });

    const loadEmployees = async () => {
        try {
            const response = await fetch(`${API_BASE}/hr/employees/`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch employees');
            const employees = await response.json();
            renderEmployees(employees);
        } catch (error) {
            console.error(error);
            document.getElementById('employeesList').innerHTML = `
                <tr><td colspan="6" class="p-8 text-center text-red-500">Error loading employees. Please try again.</td></tr>
            `;
        }
    };

    const renderEmployees = (employees) => {
        const tbody = document.getElementById('employeesList');
        if (employees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">No employees found.</td></tr>`;
            return;
        }

        tbody.innerHTML = employees.map(emp => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            ${emp.name.charAt(0)}
                        </div>
                        <span class="font-medium text-gray-900">${emp.name}</span>
                    </div>
                </td>
                <td class="p-4 text-gray-600">${emp.employee_id || emp.id}</td>
                <td class="p-4 text-gray-600">${emp.role}</td>
                <td class="p-4 text-gray-600">${emp.department}</td>
                <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                        ${emp.status || 'Active'}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <div class="flex justify-end gap-2">
                        <button onclick="window.clockIn(${emp.id})" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip" title="Clock In">
                            <i data-lucide="clock" class="w-5 h-5"></i>
                        </button>
                        <button onclick="window.clockOut(${emp.id})" class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors tooltip" title="Clock Out">
                            <i data-lucide="log-out" class="w-5 h-5"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    };

    window.clockIn = async (id) => {
        try {
            const response = await fetch(`${API_BASE}/hr/employees/${id}/clock_in/`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to clock in');
            alert('Clocked in successfully');
            loadEmployees();
        } catch (error) {
            alert(error.message);
        }
    };

    window.clockOut = async (id) => {
        try {
            const response = await fetch(`${API_BASE}/hr/employees/${id}/clock_out/`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to clock out');
            alert('Clocked out successfully');
            loadEmployees();
        } catch (error) {
            alert(error.message);
        }
    };

    document.getElementById('addEmployeeForm')?.addEventListener('submit', async (e) => {
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

        try {
            const response = await fetch(`${API_BASE}/hr/employees/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Failed to create employee');
            
            document.getElementById('addEmployeeModal').classList.add('hidden');
            form.reset();
            loadEmployees();
        } catch (error) {
            alert(error.message);
        } finally {
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    loadEmployees();
};