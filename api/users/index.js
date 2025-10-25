// Vercel Serverless Function: GET /api/users, POST /api/users
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

    try {
        if (req.method === 'GET') {
            // Get all users
            const result = await sql`
                SELECT id, username, name, email, role, lastLogin FROM users
            `;
            res.json(result.rows);
        } else if (req.method === 'POST') {
            // Add user
            const { username, password, name, email, role } = req.body;
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = `user_${Date.now()}`;
            
            await sql`
                INSERT INTO users (id, username, password, name, email, role, createdAt)
                VALUES (${userId}, ${username}, ${hashedPassword}, ${name}, ${email}, ${role}, ${new Date().toISOString()})
            `;
            
            res.json({ success: true, id: userId });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

