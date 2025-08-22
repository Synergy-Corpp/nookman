// Admin Panel JavaScript
const API_BASE = 'http://localhost:3000/api';
let adminToken = null;
let allUsers = [];
let allTransactions = [];

// Admin credentials (in production, this would be secure)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPanel();
    setupEventListeners();
});

function initializeAdminPanel() {
    // Check if admin is already logged in
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
        adminToken = savedToken;
        showAdminDashboard();
        loadDashboardData();
    }
}

function setupEventListeners() {
    // Admin login
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    
    // Logout
    document.getElementById('adminLogout').addEventListener('click', handleAdminLogout);
    
    // Sidebar navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            switchSection(section);
        });
    });
    
    // Refresh data
    document.getElementById('refreshData').addEventListener('click', loadDashboardData);
    
    // User management
    document.getElementById('addUserBtn').addEventListener('click', () => {
        document.getElementById('addUserModal').style.display = 'block';
    });
    
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('searchUsers').addEventListener('click', searchUsers);
    
    // Transaction filtering
    document.getElementById('filterTransactions').addEventListener('click', filterTransactions);
    
    // Settings
    document.getElementById('saveRates').addEventListener('click', saveExchangeRates);
    document.getElementById('saveSettings').addEventListener('click', saveSystemSettings);
    
    // Modal close
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // Export functions
    document.getElementById('exportUsersBtn').addEventListener('click', exportUsers);
    document.getElementById('exportTransactionsBtn').addEventListener('click', exportTransactions);
}

// Authentication
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    const loginBtn = document.querySelector('.admin-login-btn');
    const loginText = loginBtn.querySelector('.login-text');
    const loginLoader = loginBtn.querySelector('.login-loader');
    
    // Show loading state
    loginText.style.display = 'none';
    loginLoader.style.display = 'inline';
    loginBtn.disabled = true;
    
    // Simulate authentication delay
    setTimeout(() => {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Generate admin token (in production, this would come from server)
            adminToken = 'admin_' + Date.now();
            localStorage.setItem('adminToken', adminToken);
            
            showAdminDashboard();
            loadDashboardData();
            showMessage('Admin login successful!', 'success');
        } else {
            showMessage('Invalid admin credentials!', 'error');
        }
        
        // Reset button state
        loginText.style.display = 'inline';
        loginLoader.style.display = 'none';
        loginBtn.disabled = false;
    }, 1000);
}

function handleAdminLogout() {
    localStorage.removeItem('adminToken');
    adminToken = null;
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    showMessage('Logged out successfully!', 'success');
}

function showAdminDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'grid';
}

// Navigation
function switchSection(sectionName) {
    // Update menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}Section`).classList.add('active');
    
    // Load section-specific data
    switch(sectionName) {
        case 'users':
            loadUsers();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'dashboard':
            loadDashboardData();
            break;
    }
}

// Dashboard Data Loading
async function loadDashboardData() {
    try {
        // Simulate API calls (in real app, these would be actual API endpoints)
        await Promise.all([
            loadSystemStats(),
            loadRecentActivity()
        ]);
        
        showMessage('Dashboard data refreshed!', 'success');
    } catch (error) {
        showMessage('Failed to load dashboard data', 'error');
    }
}

async function loadSystemStats() {
    // Simulate loading system statistics
    const stats = {
        totalUsers: Math.floor(Math.random() * 500) + 150,
        totalBalance: (Math.random() * 1000000 + 500000).toFixed(2),
        totalTransactions: Math.floor(Math.random() * 5000) + 1000,
        dailyVolume: (Math.random() * 100000 + 50000).toFixed(2)
    };
    
    // Update UI with animation
    updateStatCard('totalUsers', stats.totalUsers);
    updateStatCard('totalBalance', `$${stats.totalBalance}`);
    updateStatCard('totalTransactions', stats.totalTransactions);
    updateStatCard('dailyVolume', `$${stats.dailyVolume}`);
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    const card = element.closest('.stat-card');
    
    card.classList.add('updating');
    setTimeout(() => {
        element.textContent = value;
        card.classList.remove('updating');
    }, 200);
}

async function loadRecentActivity() {
    const activities = [
        { icon: '👤', title: 'New user registration', time: '2 minutes ago', amount: '' },
        { icon: '💸', title: 'Money transfer completed', time: '5 minutes ago', amount: '$250.00' },
        { icon: '🔄', title: 'Currency conversion', time: '8 minutes ago', amount: '$1,500.00' },
        { icon: '👤', title: 'User login', time: '12 minutes ago', amount: '' },
        { icon: '💸', title: 'Large transfer flagged', time: '15 minutes ago', amount: '$5,000.00' }
    ];
    
    const container = document.getElementById('recentActivity');
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-info">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
            ${activity.amount ? `<div class="activity-amount">${activity.amount}</div>` : ''}
        </div>
    `).join('');
}

// User Management
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="7">Loading users...</td></tr>';
    
    // Simulate user data
    const users = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', balance: 1250.00, created: '2025-08-20', status: 'active' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', balance: 890.50, created: '2025-08-19', status: 'active' },
        { id: 3, firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', balance: 2100.75, created: '2025-08-18', status: 'suspended' },
        { id: 4, firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com', balance: 567.25, created: '2025-08-17', status: 'active' }
    ];
    
    allUsers = users;
    displayUsers(users);
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>$${user.balance.toFixed(2)}</td>
            <td>${user.created}</td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>
                <button class="action-btn edit" onclick="editUser(${user.id})">✏️ Edit</button>
                <button class="action-btn ${user.status === 'active' ? 'suspend' : 'edit'}" 
                        onclick="toggleUserStatus(${user.id})">
                    ${user.status === 'active' ? '⏸️ Suspend' : '▶️ Activate'}
                </button>
                <button class="action-btn delete" onclick="deleteUser(${user.id})">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const statusFilter = document.getElementById('userStatusFilter').value;
    
    let filteredUsers = allUsers;
    
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }
    
    displayUsers(filteredUsers);
}

async function handleAddUser(e) {
    e.preventDefault();
    
    const userData = {
        firstName: document.getElementById('newFirstName').value,
        lastName: document.getElementById('newLastName').value,
        email: document.getElementById('newEmail').value,
        password: document.getElementById('newPassword').value,
        balance: parseFloat(document.getElementById('newBalance').value)
    };
    
    // Simulate API call
    const newUser = {
        id: allUsers.length + 1,
        ...userData,
        created: new Date().toISOString().split('T')[0],
        status: 'active'
    };
    
    allUsers.push(newUser);
    displayUsers(allUsers);
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('addUserForm').reset();
    showMessage('User created successfully!', 'success');
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        // Pre-fill form with user data
        document.getElementById('newFirstName').value = user.firstName;
        document.getElementById('newLastName').value = user.lastName;
        document.getElementById('newEmail').value = user.email;
        document.getElementById('newBalance').value = user.balance;
        document.getElementById('addUserModal').style.display = 'block';
    }
}

function toggleUserStatus(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        user.status = user.status === 'active' ? 'suspended' : 'active';
        displayUsers(allUsers);
        showMessage(`User ${user.status === 'active' ? 'activated' : 'suspended'} successfully!`, 'success');
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        allUsers = allUsers.filter(u => u.id !== userId);
        displayUsers(allUsers);
        showMessage('User deleted successfully!', 'success');
    }
}

// Transaction Management
async function loadTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '<tr><td colspan="7">Loading transactions...</td></tr>';
    
    // Simulate transaction data
    const transactions = [
        { id: 1, user: 'John Doe', type: 'transfer_out', amount: 250.00, description: 'Payment to Jane', date: '2025-08-21 10:30', status: 'completed' },
        { id: 2, user: 'Jane Smith', type: 'transfer_in', amount: 250.00, description: 'Payment from John', date: '2025-08-21 10:30', status: 'completed' },
        { id: 3, user: 'Bob Wilson', type: 'transfer_out', amount: 1500.00, description: 'Business payment', date: '2025-08-21 09:15', status: 'completed' },
        { id: 4, user: 'Alice Brown', type: 'transfer_in', amount: 500.00, description: 'Salary deposit', date: '2025-08-20 14:20', status: 'completed' }
    ];
    
    allTransactions = transactions;
    displayTransactions(transactions);
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No transactions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${transaction.id}</td>
            <td>${transaction.user}</td>
            <td>
                <span class="status-badge ${transaction.type === 'transfer_in' ? 'status-active' : 'status-suspended'}">
                    ${transaction.type === 'transfer_in' ? 'Received' : 'Sent'}
                </span>
            </td>
            <td>$${transaction.amount.toFixed(2)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.date}</td>
            <td><span class="status-badge status-${transaction.status}">${transaction.status}</span></td>
        </tr>
    `).join('');
}

function filterTransactions() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const typeFilter = document.getElementById('transactionTypeFilter').value;
    
    let filteredTransactions = allTransactions;
    
    if (typeFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    // Date filtering would be implemented here
    
    displayTransactions(filteredTransactions);
}

// Analytics
async function loadAnalytics() {
    // Simple chart simulation (in production, use Chart.js or similar)
    const userChart = document.getElementById('userGrowthChart');
    const transactionChart = document.getElementById('transactionChart');
    
    if (userChart.getContext) {
        const ctx1 = userChart.getContext('2d');
        ctx1.fillStyle = '#3b82f6';
        ctx1.fillRect(10, 10, 100, 100);
        ctx1.fillStyle = 'white';
        ctx1.font = '20px Arial';
        ctx1.fillText('User Growth', 20, 60);
        ctx1.fillText('Chart Here', 20, 80);
    }
    
    if (transactionChart.getContext) {
        const ctx2 = transactionChart.getContext('2d');
        ctx2.fillStyle = '#10b981';
        ctx2.fillRect(10, 10, 100, 100);
        ctx2.fillStyle = 'white';
        ctx2.font = '20px Arial';
        ctx2.fillText('Transaction', 20, 50);
        ctx2.fillText('Volume Chart', 20, 70);
        ctx2.fillText('Here', 20, 90);
    }
}

// Settings
function saveExchangeRates() {
    const rates = {};
    document.querySelectorAll('#exchangeRatesSettings input').forEach(input => {
        const from = input.dataset.from;
        const to = input.dataset.to;
        const rate = parseFloat(input.value);
        
        if (!rates[from]) rates[from] = {};
        rates[from][to] = rate;
    });
    
    // In production, save to backend
    localStorage.setItem('exchangeRates', JSON.stringify(rates));
    showMessage('Exchange rates saved successfully!', 'success');
}

function saveSystemSettings() {
    const settings = {
        defaultBalance: parseFloat(document.getElementById('defaultBalance').value),
        maxTransfer: parseFloat(document.getElementById('maxTransfer').value),
        minTransfer: parseFloat(document.getElementById('minTransfer').value)
    };
    
    // In production, save to backend
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    showMessage('System settings saved successfully!', 'success');
}

// Export Functions
function exportUsers() {
    const csv = convertToCSV(allUsers, ['id', 'firstName', 'lastName', 'email', 'balance', 'created', 'status']);
    downloadCSV(csv, 'users_export.csv');
    showMessage('Users exported successfully!', 'success');
}

function exportTransactions() {
    const csv = convertToCSV(allTransactions, ['id', 'user', 'type', 'amount', 'description', 'date', 'status']);
    downloadCSV(csv, 'transactions_export.csv');
    showMessage('Transactions exported successfully!', 'success');
}

function convertToCSV(data, headers) {
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Utility Functions
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at top of main content
    const main = document.querySelector('.admin-main');
    main.insertBefore(messageDiv, main.firstChild);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Real-time updates (simulated)
setInterval(() => {
    if (document.getElementById('dashboardSection').classList.contains('active')) {
        loadSystemStats();
    }
}, 30000); // Update every 30 seconds