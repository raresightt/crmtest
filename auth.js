// Authentication System for Order CRM - API Version
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkExistingSession();
        this.setupEventListeners();
    }

    // ===== SESSION MANAGEMENT =====
    async checkExistingSession() {
        const user = await api.verifySession();
        
        if (user) {
            this.currentUser = user;
            // If on login page and have valid session, redirect to CRM
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'index.html';
            }
        } else {
            // If not on login page and no valid session, redirect to login
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    }

    // ===== AUTHENTICATION =====
    async login(username, password, rememberMe = false) {
        try {
            const result = await api.login(username, password, rememberMe);
            this.currentUser = result.user;
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    async logout() {
        await api.logout();
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    // ===== USER MANAGEMENT =====
    getCurrentUser() {
        return this.currentUser || api.getCurrentUser();
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    async getAllUsers() {
        try {
            return await api.getUsers();
        } catch (error) {
            console.error('Get users error:', error);
            return [];
        }
    }

    async addUser(userData) {
        try {
            const result = await api.addUser(userData);
            return result.success;
        } catch (error) {
            console.error('Add user error:', error);
            return false;
        }
    }

    async updateUser(userId, userData) {
        try {
            const result = await api.updateUser(userId, userData);
            return result.success;
        } catch (error) {
            console.error('Update user error:', error);
            return false;
        }
    }

    async removeUser(userId) {
        try {
            const result = await api.deleteUser(userId);
            return result.success;
        } catch (error) {
            console.error('Delete user error:', error);
            return false;
        }
    }

    getUserById(userId) {
        // For compatibility - in API version, we need to fetch from server
        // This is a simplified version that returns null
        // In practice, you'd fetch from the users list
        return null;
    }

    async changePassword(userId, currentPassword, newPassword) {
        try {
            const result = await api.changePassword(userId, currentPassword, newPassword);
            return result.success;
        } catch (error) {
            console.error('Change password error:', error);
            return false;
        }
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me')?.checked || false;

        if (!username || !password) {
            this.showError('Please enter username and password');
            return;
        }

        this.hideError();

        const success = await this.login(username, password, rememberMe);
        
        if (success) {
            window.location.href = 'index.html';
        } else {
            this.showError('Invalid username or password');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'flex';
        }
    }

    hideError() {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
}

// Initialize auth system
let auth;
document.addEventListener('DOMContentLoaded', () => {
    auth = new AuthSystem();
});

// Global logout function
function logout() {
    if (auth) {
        auth.logout();
    }
}
