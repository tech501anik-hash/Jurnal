// Register Service Worker for Offline Capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Offline mode ready.'))
            .catch(err => console.log('Service Worker failed:', err));
    });
}

// Network Status Tracking
const statusIndicator = document.getElementById('network-status');
function updateNetworkStatus() {
    if (navigator.onLine) {
        statusIndicator.textContent = 'Online';
        statusIndicator.className = 'online';
    } else {
        statusIndicator.textContent = 'Offline (Working Locally)';
        statusIndicator.className = 'offline';
    }
}
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus(); // Initial check

// Local Storage Logic
let trades = JSON.parse(localStorage.getItem('my_local_trades')) || [];

document.getElementById('journalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const asset = document.getElementById('asset').value.toUpperCase();
    const type = document.getElementById('type').value;
    const entry = parseFloat(document.getElementById('entry').value);
    const exit = parseFloat(document.getElementById('exit').value);
    const size = parseFloat(document.getElementById('size').value);
    const notes = document.getElementById('notes').value;
    const date = new Date().toLocaleDateString();

    let pnl = 0;
    if (type === 'Long') {
        pnl = (exit - entry) * size;
    } else {
        pnl = (entry - exit) * size;
    }

    const trade = { id: Date.now(), date, asset, type, entry, exit, pnl, notes };
    trades.push(trade);
    
    // Save to device storage immediately
    localStorage.setItem('my_local_trades', JSON.stringify(trades));
    
    this.reset();
    renderTrades();
});

function deleteTrade(id) {
    trades = trades.filter(t => t.id !== id);
    localStorage.setItem('my_local_trades', JSON.stringify(trades));
    renderTrades();
}

function renderTrades() {
    const tbody = document.getElementById('tradeBody');
    tbody.innerHTML = '';
    
    let totalPnl = 0;
    let wins = 0;

    // Load from memory to UI
    trades.forEach(trade => {
        totalPnl += trade.pnl;
        if (trade.pnl > 0) wins++;

        const tr = document.createElement('tr');
        const pnlClass = trade.pnl >= 0 ? 'profit' : 'loss';
        const pnlSign = trade.pnl >= 0 ? '+' : '';
        
        tr.innerHTML = `
            <td>${trade.date}</td>
            <td>${trade.asset}</td>
            <td>${trade.type}</td>
            <td>$${trade.entry}</td>
            <td>$${trade.exit}</td>
            <td class="${pnlClass}">${pnlSign}$${trade.pnl.toFixed(2)}</td>
            <td><button class="delete-btn" onclick="deleteTrade(${trade.id})">X</button></td>
        `;
        tbody.appendChild(tr);
    });

    const winRate = trades.length ? ((wins / trades.length) * 100).toFixed(1) : 0;
    
    document.getElementById('totalPnl').innerText = totalPnl.toFixed(2);
    document.getElementById('totalPnl').className = totalPnl >= 0 ? 'profit' : 'loss';
    document.getElementById('winRate').innerText = `${winRate}%`;
}

// Initial render from local storage
renderTrades();

