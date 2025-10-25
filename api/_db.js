// Database connection utility for Vercel
// Uses Vercel Postgres instead of SQLite for serverless compatibility

const { sql } = require('@vercel/postgres');
const bcrypt = require('bcrypt');

// Initialize database tables
async function initializeDatabase() {
    try {
        // Create users table
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                role TEXT NOT NULL,
                lastlogin TEXT,
                createdat TEXT NOT NULL
            )
        `;

        // Create orders table
        await sql`
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                marketplace TEXT NOT NULL,
                customername TEXT NOT NULL,
                customeremail TEXT NOT NULL,
                product TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                status TEXT NOT NULL,
                notes TEXT,
                createdat TEXT NOT NULL
            )
        `;

        // Create sessions table
        await sql`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                userid TEXT NOT NULL,
                expiresat TEXT NOT NULL,
                rememberme INTEGER NOT NULL,
                createdat TEXT NOT NULL
            )
        `;

        // Check if default admin exists
        const adminCheck = await sql`SELECT id FROM users WHERE username = 'admin'`;
        
        if (adminCheck.rows.length === 0) {
            // Create default admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await sql`
                INSERT INTO users (id, username, password, name, email, role, createdAt)
                VALUES (
                    ${`user_${Date.now()}`},
                    'admin',
                    ${hashedPassword},
                    'Administrator',
                    'admin@example.com',
                    'admin',
                    ${new Date().toISOString()}
                )
            `;
            console.log('✅ Default admin user created (admin/admin123)');
        }

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

module.exports = { sql, initializeDatabase };

