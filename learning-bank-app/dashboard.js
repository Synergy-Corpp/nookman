// Dashboard JavaScript
const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let userToken = null;

// Check if user is logged in
function checkAuth() {
    userToken = localStorage.getItem('bankToken');
    const userData = localStorage.getItem('currentUser');
    
    if (!userToken || !userData) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.firstName}!`;
}

// API Helper function
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API call failed:', error);
        
        if (error.message.includes('token') || error.message.includes('auth')) {
            logout();
        }
        
        throw error;
    }
}

// Load user profile and update balance
async function loadProfile() {
    try {
        const response = await apiCall('/profile');
        currentUser = response.user;
        
        // Update balance display
        document.getElementById('currentBalance').textContent = parseFloat(currentUser.balance).toFixed(2);
        
        // Update localStorage with latest user info
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
    } catch (error) {
        console.error('Failed to load profile:', error);
        showNotification('Failed to load account information', 'error');
    }
}

// Load transaction history
async function loadTransactions() {
    try {
        const response = await apiCall('/transactions');
        const transactions = response.transactions;
        
        displayTransactions(transactions);
        updateTransactionStats(transactions);
        
    } catch (error) {
        console.error('Failed to load transactions:', error);
        document.getElementById('transactionsList').innerHTML = `
            <div class="empty-state">
                <p>Failed to load transactions</p>
                <button onclick="loadTransactions()" class="btn btn-secondary">Try Again</button>
            </div>
        `;
    }
}

// Display transactions in the list
function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No transactions yet</p>
                <p>Start by sending money to someone!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = transactions.map(transaction => {
        const isPositive = transaction.type === 'transfer_in';
        const amountClass = isPositive ? 'amount-positive' : 'amount-negative';
        const amountPrefix = isPositive ? '+' : '-';
        
        const date = new Date(transaction.createdAt).toLocaleDateString();
        const time = new Date(transaction.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-type">
                        ${isPositive ? '📥 Money Received' : '📤 Money Sent'}
                    </div>
                    <div class="transaction-description">
                        ${transaction.description || 'No description'}
                        ${transaction.recipientEmail ? ` to ${transaction.recipientEmail}` : ''}
                    </div>
                    <div class="transaction-date">${date} at ${time}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}$${parseFloat(transaction.amount).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

// Update transaction statistics
function updateTransactionStats(transactions) {
    let totalSent = 0;
    let totalReceived = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'transfer_out') {
            totalSent += parseFloat(transaction.amount);
        } else if (transaction.type === 'transfer_in') {
            totalReceived += parseFloat(transaction.amount);
        }
    });
    
    document.getElementById('totalSent').textContent = `$${totalSent.toFixed(2)}`;
    document.getElementById('totalReceived').textContent = `$${totalReceived.toFixed(2)}`;
    document.getElementById('totalTransactions').textContent = transactions.length;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        zIndex: '10000',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Handle money transfer
async function handleTransfer(event) {
    event.preventDefault();
    
    const recipientEmail = document.getElementById('recipientEmail').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const description = document.getElementById('transferDescription').value;
    
    if (!recipientEmail || !amount) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (amount <= 0) {
        showNotification('Amount must be greater than 0', 'error');
        return;
    }
    
    if (amount > currentUser.balance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.transfer-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled = true;
    
    try {
        const response = await apiCall('/transfer', 'POST', {
            amount,
            recipientEmail,
            description
        });
        
        showNotification('Money sent successfully!', 'success');
        
        // Reset form
        document.getElementById('transferForm').reset();
        
        // Refresh data
        await loadProfile();
        await loadTransactions();
        
    } catch (error) {
        showNotification(`Transfer failed: ${error.message}`, 'error');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('bankToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    checkAuth();
    
    // Load initial data
    loadProfile();
    loadTransactions();
    
    // Form submission
    document.getElementById('transferForm').addEventListener('submit', handleTransfer);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Quick action buttons
    document.getElementById('sendMoneyBtn').addEventListener('click', () => {
        scrollToSection('transfers');
    });
    
    document.getElementById('currencyBtn').addEventListener('click', () => {
        window.open('index.html#currency-section', '_blank');
    });
    
    document.getElementById('viewHistoryBtn').addEventListener('click', () => {
        scrollToSection('history');
    });
    
    // Refresh history button
    document.getElementById('refreshHistory').addEventListener('click', loadTransactions);
    
    // Auto-refresh data every 30 seconds
    setInterval(() => {
        loadProfile();
        loadTransactions();
    }, 30000);
    
    // Real-time form validation
    const amountInput = document.getElementById('transferAmount');
    const recipientInput = document.getElementById('recipientEmail');
    
    amountInput.addEventListener('input', () => {
        const amount = parseFloat(amountInput.value);
        const warningDiv = document.getElementById('amountWarning');
        
        // Remove existing warning
        if (warningDiv) {
            warningDiv.remove();
        }
        
        if (amount > currentUser.balance) {
            const warning = document.createElement('div');
            warning.id = 'amountWarning';
            warning.style.color = '#ef4444';
            warning.style.fontSize = '0.9rem';
            warning.style.marginTop = '0.25rem';
            warning.textContent = 'Amount exceeds available balance';
            amountInput.parentNode.appendChild(warning);
        }
    });
    
    // Email validation
    recipientInput.addEventListener('blur', () => {
        const email = recipientInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const warningDiv = document.getElementById('emailWarning');
        
        // Remove existing warning
        if (warningDiv) {
            warningDiv.remove();
        }
        
        if (email && !emailRegex.test(email)) {
            const warning = document.createElement('div');
            warning.id = 'emailWarning';
            warning.style.color = '#ef4444';
            warning.style.fontSize = '0.9rem';
            warning.style.marginTop = '0.25rem';
            warning.textContent = 'Please enter a valid email address';
            recipientInput.parentNode.appendChild(warning);
        }
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .transaction-item {
        animation: fadeInUp 0.3s ease;
    }
    
    @keyframes fadeInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);