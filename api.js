// ===== API SERVICE =====
// Handles all communication with the backend server

// Auto-detect API URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

class APIService {
    constructor() {
        this.sessionId = localStorage.getItem('sessionId');
    }

    // ===== AUTH ENDPOINTS =====
    async login(username, password, rememberMe) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, rememberMe })
            });

            const data = await response.json();
            
            if (data.success) {
                this.sessionId = data.sessionId;
                localStorage.setItem('sessionId', data.sessionId);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return data;
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async verifySession() {
        try {
            if (!this.sessionId) return null;

            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: this.sessionId })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return data.user;
            } else {
                this.clearSession();
                return null;
            }
        } catch (error) {
            console.error('Verify session error:', error);
            this.clearSession();
            return null;
        }
    }

    async logout() {
        try {
            if (this.sessionId) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: this.sessionId })
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearSession();
        }
    }

    clearSession() {
        this.sessionId = null;
        localStorage.removeItem('sessionId');
        localStorage.removeItem('currentUser');
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    // ===== USER ENDPOINTS =====
    async getUsers() {
        const response = await fetch(`${API_BASE_URL}/users`);
        return await response.json();
    }

    async addUser(userData) {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    }

    async updateUser(userId, userData) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    }

    async deleteUser(userId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    async changePassword(userId, currentPassword, newPassword) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return await response.json();
    }

    // ===== ORDER ENDPOINTS =====
    async getOrders() {
        const response = await fetch(`${API_BASE_URL}/orders`);
        return await response.json();
    }

    async addOrder(orderData) {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return await response.json();
    }

    async updateOrder(orderId, orderData) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return await response.json();
    }

    async deleteOrder(orderId) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    async clearAllOrders() {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    async bulkImportOrders(orders) {
        const response = await fetch(`${API_BASE_URL}/orders/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders })
        });
        return await response.json();
    }
}

// Create global API instance
const api = new APIService();

