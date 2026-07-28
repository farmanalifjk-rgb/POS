window.initializeStoreDashboard = function() {
    // Mock API call to simulate dashboard loading
    setTimeout(() => {
        const stats = {
            stores: 42,
            terminals: 318,
            revenue: '$124,500',
            alerts: 3
        };

        const elStores = document.getElementById('statTotalStores');
        const elTerminals = document.getElementById('statActiveTerminals');
        const elRevenue = document.getElementById('statRevenue');
        const elAlerts = document.getElementById('statAlerts');

        if (elStores) elStores.textContent = stats.stores;
        if (elTerminals) elTerminals.textContent = stats.terminals;
        if (elRevenue) elRevenue.textContent = stats.revenue;
        if (elAlerts) elAlerts.textContent = stats.alerts;

    }, 600); // simulate network delay

    if (window.lucide) {
        window.lucide.createIcons();
    }
};
