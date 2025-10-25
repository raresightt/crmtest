// Vercel Serverless Function: POST /api/auth/login
const { sql } = require('../_db');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, password, rememberMe } = req.body;
        
        const userResult = await sql`SELECT * FROM users WHERE username = ${username}`;
        const user = userResult.rows[0];
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await sql`
            UPDATE users 
            SET lastLogin = ${new Date().toISOString()} 
            WHERE id = ${user.id}
        `;

        // Create session
        const sessionId = `session_${Date.now()}_${Math.random().toString(36)}`;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (rememberMe ? 720 : 1)); // 30 days or 1 hour
        
        await sql`
            INSERT INTO sessions (id, userId, expiresAt, rememberMe, createdAt)
            VALUES (
                ${sessionId},
                ${user.id},
                ${expiresAt.toISOString()},
                ${rememberMe ? 1 : 0},
                ${new Date().toISOString()}
            )
        `;

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
};

