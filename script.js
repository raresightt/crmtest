// ===== ORDER CRM APPLICATION =====
class OrderCRM {
    constructor() {
        this.orders = [];
        this.currentEditId = null;
        this.importData = null;
        this.currentEditUserId = null;
        
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.checkAuth()) return;
        
        // Load data from server
        await this.loadOrders();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial render
        this.updateStats();
        this.renderRecentOrders();
        this.renderOrders();
        
        // Update user display
        this.updateUserDisplay();
    }

    checkAuth() {
        if (!auth || !auth.getCurrentUser()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    updateUserDisplay() {
        const user = auth.getCurrentUser();
        if (user) {
            const displayName = document.getElementById('user-display-name');
            if (displayName) {
                displayName.textContent = user.name || user.username;
            }
        }
    }

    // ===== DATA MANAGEMENT =====
    async loadOrders() {
        try {
            this.orders = await api.getOrders();
        } catch (error) {
            console.error('Load orders error:', error);
            this.orders = [];
        }
    }

    async saveOrders() {
        // No longer needed - API handles persistence
        // Kept for compatibility
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // Profile menu
        const profileBtn = document.getElementById('profile-menu-btn');
        const profileDropdown = document.getElementById('profile-dropdown');
        
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('show');
            });
            
            document.addEventListener('click', () => {
                profileDropdown.classList.remove('show');
            });
        }

        // Order form
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderSubmit(e);
            });
        }

        // User form
        const userForm = document.getElementById('user-form');
        if (userForm) {
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUserSubmit(e);
            });
        }

        // Password form
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordSubmit(e);
            });
        }

        // Filters
        const searchInput = document.getElementById('search-input');
        const marketplaceFilter = document.getElementById('marketplace-filter');
        const statusFilter = document.getElementById('status-filter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderOrders());
        }
        if (marketplaceFilter) {
            marketplaceFilter.addEventListener('change', () => this.renderOrders());
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.renderOrders());
        }

        // CSV file input
        const csvFile = document.getElementById('csv-file');
        if (csvFile) {
            csvFile.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Prevent modal close on outside click - removed for better UX
        // Modals now only close via close button or cancel button
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`${tabName}-tab`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }

        // Refresh content if needed
        if (tabName === 'orders') {
            this.renderOrders();
        }
    }

    // ===== STATS =====
    updateStats() {
        const stats = {
            pending: this.orders.filter(o => o.status === 'pending').length,
            processing: this.orders.filter(o => o.status === 'processing').length,
            shipped: this.orders.filter(o => o.status === 'shipped').length,
            delivered: this.orders.filter(o => o.status === 'delivered').length
        };

        document.getElementById('stat-pending').textContent = stats.pending;
        document.getElementById('stat-processing').textContent = stats.processing;
        document.getElementById('stat-shipped').textContent = stats.shipped;
        document.getElementById('stat-delivered').textContent = stats.delivered;
    }

    // ===== RENDER ORDERS =====
    renderRecentOrders() {
        const container = document.getElementById('recent-orders-list');
        if (!container) return;

        const recent = this.orders.slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<p class="empty-message">No orders yet</p>';
            return;
        }

        container.innerHTML = recent.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <h4>${order.id}</h4>
                    <p>${order.customerName} - ${order.product}</p>
                </div>
                <div class="order-meta">
                    <span class="status-badge status-${order.status}">${order.status}</span>
                    <strong>₴${(order.price * order.quantity).toFixed(2)}</strong>
                </div>
            </div>
        `).join('');
    }

    renderOrders() {
        const container = document.getElementById('orders-container');
        if (!container) return;

        // Get filter values
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const marketplaceFilter = document.getElementById('marketplace-filter')?.value || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';

        // Filter orders
        let filtered = this.orders.filter(order => {
            const matchesSearch = !searchTerm || 
                order.id.toLowerCase().includes(searchTerm) ||
                order.customerName.toLowerCase().includes(searchTerm) ||
                order.product.toLowerCase().includes(searchTerm);
            
            const matchesMarketplace = !marketplaceFilter || order.marketplace === marketplaceFilter;
            const matchesStatus = !statusFilter || order.status === statusFilter;

            return matchesSearch && matchesMarketplace && matchesStatus;
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-message">No orders found</p>';
            return;
        }

        container.innerHTML = filtered.map(order => this.createOrderCard(order)).join('');
    }

    createOrderCard(order) {
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">${order.id}</div>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <div class="order-body">
                    <div class="order-field">
                        <label>Customer</label>
                        <span>${order.customerName}</span>
                    </div>
                    <div class="order-field">
                        <label>Email</label>
                        <span>${order.customerEmail}</span>
                    </div>
                    <div class="order-field">
                        <label>Product</label>
                        <span>${order.product}</span>
                    </div>
                    <div class="order-field">
                        <label>Marketplace</label>
                        <span>${order.marketplace}</span>
                    </div>
                    <div class="order-field">
                        <label>Quantity</label>
                        <span>${order.quantity}</span>
                    </div>
                    <div class="order-field">
                        <label>Total</label>
                        <span>₴${(order.price * order.quantity).toFixed(2)}</span>
                    </div>
                </div>
                ${order.notes ? `<div class="order-field"><label>Notes</label><span>${order.notes}</span></div>` : ''}
                <div class="order-actions">
                    <button class="btn-small btn-edit" onclick="app.editOrder('${order.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-small btn-delete" onclick="app.deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    // ===== ORDER CRUD =====
    async handleOrderSubmit(e) {
        const formData = new FormData(e.target);
        
        // Get order ID - use currentEditId if editing, otherwise get from form
        const orderId = this.currentEditId || formData.get('orderId');
        
        const orderData = {
            id: orderId,
            marketplace: formData.get('marketplace'),
            customerName: formData.get('customerName'),
            customerEmail: formData.get('customerEmail'),
            product: formData.get('product'),
            quantity: parseInt(formData.get('quantity')),
            price: parseFloat(formData.get('price')),
            status: formData.get('status'),
            notes: formData.get('notes') || ''
        };

        try {
            if (this.currentEditId) {
                // Update existing order
                await api.updateOrder(this.currentEditId, orderData);
            } else {
                // Add new order
                await api.addOrder(orderData);
            }

            // Reload orders from server
            await this.loadOrders();
            this.updateStats();
            this.renderRecentOrders();
            this.renderOrders();
            closeOrderModal();
        } catch (error) {
            console.error('Save order error:', error);
            alert('Error saving order. Please try again.');
        }
    }

    editOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (!order) {
            console.error('Order not found:', id);
            return;
        }

        // Set current edit ID first
        this.currentEditId = id;
        
        const form = document.getElementById('order-form');
        const title = document.getElementById('order-modal-title');
        
        if (!form || !title) {
            console.error('Form elements not found');
            return;
        }
        
        // Update modal title
        title.textContent = 'Edit Order';
        
        // Populate form fields
        form.orderId.value = order.id;
        form.orderId.disabled = true;
        form.marketplace.value = order.marketplace || '';
        form.customerName.value = order.customerName || '';
        form.customerEmail.value = order.customerEmail || '';
        form.product.value = order.product || '';
        form.quantity.value = order.quantity || 1;
        form.price.value = order.price || 0;
        form.status.value = order.status || 'pending';
        form.notes.value = order.notes || '';

        // Show modal
        document.getElementById('order-modal').classList.add('show');
    }

    async deleteOrder(id) {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            await api.deleteOrder(id);
            await this.loadOrders();
            this.updateStats();
            this.renderRecentOrders();
            this.renderOrders();
        } catch (error) {
            console.error('Delete order error:', error);
            alert('Error deleting order. Please try again.');
        }
    }

    async clearAllOrders() {
        if (!confirm('⚠️ WARNING: This will delete ALL orders permanently!\n\nAre you absolutely sure?')) {
            return;
        }

        // Double confirmation for safety
        if (!confirm('This action cannot be undone. Delete all orders?')) {
            return;
        }

        try {
            await api.clearAllOrders();
            await this.loadOrders();
            this.updateStats();
            this.renderRecentOrders();
            this.renderOrders();
            
            alert('✅ All orders have been cleared successfully!');
        } catch (error) {
            console.error('Clear orders error:', error);
            alert('Error clearing orders. Please try again.');
        }
    }

    // ===== EXPORT/IMPORT =====
    exportOrders() {
        if (this.orders.length === 0) {
            alert('No orders to export');
            return;
        }

        const csv = this.generateCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['Order ID', 'Marketplace', 'Customer Name', 'Customer Email', 'Product', 'Quantity', 'Price', 'Status', 'Notes'];
        const rows = this.orders.map(o => [
            o.id,
            o.marketplace,
            o.customerName,
            o.customerEmail,
            o.product,
            o.quantity,
            o.price,
            o.status,
            o.notes || ''
        ]);

        return [headers, ...rows].map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
    }

    downloadTemplate() {
        const template = [
            ['Order ID', 'Marketplace', 'Customer Name', 'Customer Email', 'Product', 'Quantity', 'Price', 'Status', 'Notes'],
            ['ORD-001', 'prom.ua', 'John Doe', 'john@example.com', 'Product Name', '1', '100.00', 'pending', 'Sample note']
        ];

        const csv = template.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csv = event.target.result;
                const lines = csv.split('\n').filter(line => line.trim());
                const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
                
                const orders = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
                    return {
                        id: values[0],
                        marketplace: values[1],
                        customerName: values[2],
                        customerEmail: values[3],
                        product: values[4],
                        quantity: parseInt(values[5]) || 1,
                        price: parseFloat(values[6]) || 0,
                        status: values[7] || 'pending',
                        notes: values[8] || '',
                        createdAt: new Date().toISOString()
                    };
                });

                this.importData = orders;
                this.showImportPreview();
            } catch (error) {
                alert('Error reading CSV file. Please check the format.');
            }
        };
        reader.readAsText(file);
    }

    showImportPreview() {
        const preview = document.getElementById('import-preview');
        const content = document.getElementById('import-preview-content');
        
        content.innerHTML = `
            <p><strong>${this.importData.length} orders</strong> ready to import</p>
            <div class="simple-list">
                ${this.importData.slice(0, 5).map(o => `
                    <div class="order-item">
                        <div class="order-info">
                            <h4>${o.id}</h4>
                            <p>${o.customerName} - ${o.product}</p>
                        </div>
                    </div>
                `).join('')}
                ${this.importData.length > 5 ? `<p class="help-text">...and ${this.importData.length - 5} more</p>` : ''}
            </div>
        `;
        
        preview.style.display = 'block';
    }

    async confirmImport() {
        if (!this.importData) return;

        try {
            await api.bulkImportOrders(this.importData);
            await this.loadOrders();
            this.updateStats();
            this.renderRecentOrders();
            this.renderOrders();
            
            alert(`Successfully imported ${this.importData.length} orders!`);
            closeImportModal();
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing orders. Please try again.');
        }
    }

    // ===== USER MANAGEMENT =====
    async loadUsers() {
        const container = document.getElementById('users-list');
        if (!container) return;

        try {
            const users = await auth.getAllUsers();
            const currentUser = auth.getCurrentUser();
            
            container.innerHTML = users.map(user => `
                <div class="user-card">
                    <div class="user-card-info">
                        <h4>${user.name} (${user.username})</h4>
                        <p>${user.email} - ${user.role}</p>
                    </div>
                    <div class="user-card-actions">
                        <button class="btn-small btn-edit" onclick="app.editUser('${user.id}', '${user.username}', '${user.name}', '${user.email}', '${user.role}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        ${user.id !== currentUser.id ? `
                            <button class="btn-small btn-delete" onclick="app.deleteUser('${user.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Load users error:', error);
            container.innerHTML = '<p class="empty-message">Error loading users</p>';
        }
    }

    editUser(userId, username, name, email, role) {
        this.currentEditUserId = userId;
        
        const form = document.getElementById('user-form');
        const title = document.getElementById('user-form-title');
        
        title.textContent = 'Edit User';
        form.username.value = username;
        form.username.disabled = true;
        form.password.value = '';
        form.password.required = false;
        form.name.value = name;
        form.email.value = email;
        form.role.value = role;

        document.getElementById('user-form-modal').classList.add('show');
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await auth.removeUser(userId);
            await this.loadUsers();
        } catch (error) {
            console.error('Delete user error:', error);
            alert('Error deleting user. Please try again.');
        }
    }

    async handleUserSubmit(e) {
        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username'),
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role')
        };

        const password = formData.get('password');

        try {
            if (this.currentEditUserId) {
                // Update
                if (password) {
                    userData.password = password;
                }
                await auth.updateUser(this.currentEditUserId, userData);
                alert('User updated successfully');
            } else {
                // Add new
                userData.password = password;
                await auth.addUser(userData);
                alert('User added successfully');
            }

            await this.loadUsers();
            closeUserFormModal();
        } catch (error) {
            console.error('User submit error:', error);
            alert('Error saving user. Please try again.');
        }
    }

    async handlePasswordSubmit(e) {
        const formData = new FormData(e.target);
        const current = formData.get('currentPassword');
        const newPass = formData.get('newPassword');
        const confirm = formData.get('confirmPassword');

        if (newPass !== confirm) {
            alert('New passwords do not match');
            return;
        }

        if (newPass.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            const success = await auth.changePassword(auth.getCurrentUser().id, current, newPass);
            if (success) {
                alert('Password changed successfully');
                closePasswordModal();
            } else {
                alert('Current password is incorrect');
            }
        } catch (error) {
            console.error('Change password error:', error);
            alert('Error changing password. Please try again.');
        }
    }
}

// ===== GLOBAL FUNCTIONS =====
let app;

function handleNewOrder() {
    app.currentEditId = null;
    const form = document.getElementById('order-form');
    const title = document.getElementById('order-modal-title');
    
    title.textContent = 'New Order';
    form.reset();
    form.orderId.disabled = false;
    form.orderId.value = 'ORD-' + Date.now();
    
    document.getElementById('order-modal').classList.add('show');
}

function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    const form = document.getElementById('order-form');
    
    modal.classList.remove('show');
    form.reset();
    form.orderId.disabled = false;
    app.currentEditId = null;
}

function handleExport() {
    app.exportOrders();
}

function handleImport() {
    app.importData = null;
    document.getElementById('csv-file').value = '';
    document.getElementById('import-preview').style.display = 'none';
    document.getElementById('import-modal').classList.add('show');
}

function closeImportModal() {
    document.getElementById('import-modal').classList.remove('show');
}

function handleDownloadTemplate() {
    app.downloadTemplate();
}

function confirmImport() {
    app.confirmImport();
}

function handleUserManagement() {
    if (!auth.isAdmin()) {
        alert('Only administrators can manage users');
        return;
    }
    app.loadUsers();
    document.getElementById('users-modal').classList.add('show');
}

function closeUsersModal() {
    document.getElementById('users-modal').classList.remove('show');
}

function handleAddUser() {
    app.currentEditUserId = null;
    const form = document.getElementById('user-form');
    const title = document.getElementById('user-form-title');
    
    title.textContent = 'Add User';
    form.reset();
    form.username.disabled = false;
    form.password.required = true;
    
    document.getElementById('user-form-modal').classList.add('show');
}

function closeUserFormModal() {
    document.getElementById('user-form-modal').classList.remove('show');
    app.currentEditUserId = null;
}

function handleChangePassword() {
    document.getElementById('password-form').reset();
    document.getElementById('password-modal').classList.add('show');
}

function closePasswordModal() {
    document.getElementById('password-modal').classList.remove('show');
}

function handleLogout() {
    auth.logout();
}

function handleClearAllOrders() {
    if (app) {
        app.clearAllOrders();
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        app = new OrderCRM();
    }, 100);
});
