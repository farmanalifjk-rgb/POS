window.initializeExpenses = function() {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");
    const tbody = document.getElementById('expensesTableBody');
    const loading = document.getElementById('expensesLoading');
    const errorAlert = document.getElementById('expensesError');
    const modal = document.getElementById('expenseModal');
    const form = document.getElementById('expenseForm');
    const categorySelect = document.getElementById('expenseCategory');

    function getAuthHeaders() {
        return {
            'Authorization': `Token ${localStorage.getItem('pos_token')}`,
            'Content-Type': 'application/json'
        };
    }

    async function loadCategories() {
        try {
            const res = await fetch(`${API_BASE}/accounting/expense-categories/`, { headers: getAuthHeaders() });
            if (res.ok) {
                const cats = await res.json();
                categorySelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            }
        } catch (e) { console.error('Failed to load categories', e); }
    }

    async function loadExpenses() {
        loading.classList.remove('hidden');
        errorAlert.classList.add('hidden');
        tbody.innerHTML = '';
        
        try {
            const res = await fetch(`${API_BASE}/accounting/expenses/`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed to fetch expenses');
            const data = await res.json();
            
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No expenses recorded</td></tr>`;
            } else {
                tbody.innerHTML = data.map(exp => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${exp.date}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${exp.category_name || exp.category}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${exp.description || '-'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">$${parseFloat(exp.amount).toFixed(2)}</td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            errorAlert.textContent = error.message;
            errorAlert.classList.remove('hidden');
        } finally {
            loading.classList.add('hidden');
        }
    }

    document.getElementById('addExpenseBtn')?.addEventListener('click', () => {
        form.reset();
        document.getElementById('expenseDate').valueAsDate = new Date();
        modal.classList.remove('hidden');
    });

    document.getElementById('closeExpenseModal')?.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            category: categorySelect.value,
            amount: document.getElementById('expenseAmount').value,
            date: document.getElementById('expenseDate').value,
            description: document.getElementById('expenseDescription').value
        };

        try {
            const res = await fetch(`${API_BASE}/accounting/expenses/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to create expense');
            modal.classList.add('hidden');
            loadExpenses();
        } catch (error) {
            alert(error.message);
        }
    });

    loadCategories();
    loadExpenses();
};