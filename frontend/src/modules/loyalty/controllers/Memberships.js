window.initializeMemberships = function() {
    if (window.lucide) {
        lucide.createIcons();
    }
    
    const API_BASE = 'http://127.0.0.1:8000/api';
    const headers = {
        'Authorization': `Token ${localStorage.getItem('pos_token')}`,
        'Content-Type': 'application/json'
    };

    const tiersList = document.getElementById('tiers-list');
    const form = document.getElementById('add-tier-form');
    const modal = document.getElementById('add-tier-modal');

    function getGradientByRank(index) {
        const gradients = [
            'from-amber-400 to-amber-600', // Gold-ish
            'from-gray-300 to-gray-500',   // Silver
            'from-orange-700 to-orange-900', // Bronze
            'from-blue-400 to-blue-600',   // Blue/Platinum
        ];
        return gradients[index % gradients.length];
    }

    async function loadTiers() {
        try {
            const res = await fetch(`${API_BASE}/loyalty/tiers/`, { headers });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            
            if (data.length === 0) {
                tiersList.innerHTML = `<div class="col-span-full py-12 flex justify-center items-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">No tiers created yet.</div>`;
                return;
            }
            
            // Sort by min_points
            data.sort((a, b) => a.min_points - b.min_points);

            tiersList.innerHTML = data.map((tier, idx) => `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="h-2 bg-gradient-to-r ${getGradientByRank(idx)}"></div>
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-xl font-bold text-gray-900">${tier.name}</h3>
                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm">
                                ${tier.multiplier}x
                            </span>
                        </div>
                        <div class="space-y-3">
                            <div class="flex items-center text-sm text-gray-600">
                                <i data-lucide="target" class="w-4 h-4 mr-2 text-gray-400"></i>
                                Required: ${tier.min_points} pts
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            lucide.createIcons();
        } catch (e) {
            console.error(e);
            tiersList.innerHTML = `<div class="col-span-full py-12 flex justify-center items-center text-red-500">Failed to load tiers.</div>`;
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('tier-name').value,
                multiplier: parseFloat(document.getElementById('tier-multiplier').value),
                min_points: parseInt(document.getElementById('tier-min-points').value)
            };
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Saving...';
            submitBtn.disabled = true;
            
            try {
                const res = await fetch(`${API_BASE}/loyalty/tiers/`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    modal.classList.add('hidden');
                    form.reset();
                    loadTiers();
                } else {
                    alert('Failed to create tier.');
                }
            } catch (error) {
                alert('Error creating tier.');
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    loadTiers();
};
