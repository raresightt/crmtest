// Vercel Serverless Function: POST /api/users/:id/change-password
const { sql } = require('../../_db');
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

    const { id } = req.query;

    try {
        const { currentPassword, newPassword } = req.body;
        
        const userResult = await sql`SELECT password FROM users WHERE id = ${id}`;
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        
        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${id}`;
        
        res.json({ success: true });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

