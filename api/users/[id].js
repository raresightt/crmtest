// Vercel Serverless Function: PUT /api/users/:id, DELETE /api/users/:id
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

    const { id } = req.query;

    try {
        if (req.method === 'PUT') {
            // Update user
            const { username, password, name, email, role } = req.body;
            
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await sql`
                    UPDATE users 
                    SET username = ${username}, password = ${hashedPassword}, 
                        name = ${name}, email = ${email}, role = ${role}
                    WHERE id = ${id}
                `;
            } else {
                await sql`
                    UPDATE users 
                    SET username = ${username}, name = ${name}, email = ${email}, role = ${role}
                    WHERE id = ${id}
                `;
            }
            
            res.json({ success: true });
        } else if (req.method === 'DELETE') {
            // Delete user
            await sql`DELETE FROM users WHERE id = ${id}`;
            res.json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('User operation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

