const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// Initialize SQLite database
const db = new Database('crm_database.db');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// ===== DATABASE INITIALIZATION =====
function initializeDatabase() {
    // Create users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL,
            lastLogin TEXT,
            createdAt TEXT NOT NULL
        )
    `);

    // Create orders table
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            marketplace TEXT NOT NULL,
            customerName TEXT NOT NULL,
            customerEmail TEXT NOT NULL,
            product TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            status TEXT NOT NULL,
            notes TEXT,
            createdAt TEXT NOT NULL
        )
    `);

    // Create sessions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            expiresAt TEXT NOT NULL,
            rememberMe INTEGER NOT NULL,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `);

    // Check if default admin exists
    const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    
    if (!adminExists) {
        // Create default admin user
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        const stmt = db.prepare(`
            INSERT INTO users (id, username, password, name, email, role, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            'user_' + Date.now(),
            'admin',
            hashedPassword,
            'Administrator',
            'admin@example.com',
            'admin',
            new Date().toISOString()
        );
        
        console.log('✅ Default admin user created (admin/admin123)');
    }

    console.log('✅ Database initialized successfully');
}

// ===== USER ROUTES =====

// Login
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        db.prepare('UPDATE users SET lastLogin = ? WHERE id = ?')
            .run(new Date().toISOString(), user.id);

        // Create session
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (rememberMe ? 720 : 1)); // 30 days or 1 hour
        
        db.prepare(`
            INSERT INTO sessions (id, userId, expiresAt, rememberMe, createdAt)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            sessionId,
            user.id,
            expiresAt.toISOString(),
            rememberMe ? 1 : 0,
            new Date().toISOString()
        );

        // Return user data without password
        const { password: _, ...userData } = user;
        
        res.json({
            success: true,
            user: userData,
            sessionId: sessionId,
            expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify session
app.post('/api/auth/verify', (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(401).json({ error: 'No session' });
        }

        const session = db.prepare(`
            SELECT s.*, u.* FROM sessions s
            JOIN users u ON s.userId = u.id
            WHERE s.id = ? AND s.expiresAt > ?
        `).get(sessionId, new Date().toISOString());

        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        const { password: _, ...userData } = session;
        res.json({ success: true, user: userData });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    try {
        const { sessionId } = req.body;
        db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
        res.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users
app.get('/api/users', (req, res) => {
    try {
        const users = db.prepare('SELECT id, username, name, email, role, lastLogin FROM users').all();
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add user
app.post('/api/users', (req, res) => {
    try {
        const { username, password, name, email, role } = req.body;
        
        const hashedPassword = bcrypt.hashSync(password, 10);
        const userId = 'user_' + Date.now();
        
        db.prepare(`
            INSERT INTO users (id, username, password, name, email, role, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, username, hashedPassword, name, email, role, new Date().toISOString());
        
        res.json({ success: true, id: userId });
    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user
app.put('/api/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, name, email, role } = req.body;
        
        if (password) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            db.prepare(`
                UPDATE users SET username = ?, password = ?, name = ?, email = ?, role = ?
                WHERE id = ?
            `).run(username, hashedPassword, name, email, role, id);
        } else {
            db.prepare(`
                UPDATE users SET username = ?, name = ?, email = ?, role = ?
                WHERE id = ?
            `).run(username, name, email, role, id);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Change password
app.post('/api/users/:id/change-password', (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        
        const user = db.prepare('SELECT password FROM users WHERE id = ?').get(id);
        
        if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===== ORDER ROUTES =====

// Get all orders
app.get('/api/orders', (req, res) => {
    try {
        const orders = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add order
app.post('/api/orders', (req, res) => {
    try {
        const { id, marketplace, customerName, customerEmail, product, quantity, price, status, notes } = req.body;
        
        db.prepare(`
            INSERT INTO orders (id, marketplace, customerName, customerEmail, product, quantity, price, status, notes, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, marketplace, customerName, customerEmail, product, quantity, price, status, notes || '', new Date().toISOString());
        
        res.json({ success: true });
    } catch (error) {
        console.error('Add order error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order
app.put('/api/orders/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { marketplace, customerName, customerEmail, product, quantity, price, status, notes } = req.body;
        
        db.prepare(`
            UPDATE orders 
            SET marketplace = ?, customerName = ?, customerEmail = ?, product = ?, 
                quantity = ?, price = ?, status = ?, notes = ?
            WHERE id = ?
        `).run(marketplace, customerName, customerEmail, product, quantity, price, status, notes || '', id);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM orders WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Clear all orders
app.delete('/api/orders', (req, res) => {
    try {
        db.prepare('DELETE FROM orders').run();
        res.json({ success: true });
    } catch (error) {
        console.error('Clear orders error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Bulk import orders
app.post('/api/orders/bulk', (req, res) => {
    try {
        const { orders } = req.body;
        
        const stmt = db.prepare(`
            INSERT INTO orders (id, marketplace, customerName, customerEmail, product, quantity, price, status, notes, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const insertMany = db.transaction((ordersList) => {
            for (const order of ordersList) {
                stmt.run(
                    order.id,
                    order.marketplace,
                    order.customerName,
                    order.customerEmail,
                    order.product,
                    order.quantity,
                    order.price,
                    order.status,
                    order.notes || '',
                    order.createdAt || new Date().toISOString()
                );
            }
        });
        
        insertMany(orders);
        res.json({ success: true, count: orders.length });
    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===== START SERVER =====
initializeDatabase();

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     🚀 Order CRM Server Running       ║
╠════════════════════════════════════════╣
║  Server:    http://localhost:${PORT}     ║
║  Database:  crm_database.db            ║
║  Status:    ✅ Ready                    ║
╠════════════════════════════════════════╣
║  Default Login:                        ║
║  Username:  admin                      ║
║  Password:  admin123                   ║
╚════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
});

