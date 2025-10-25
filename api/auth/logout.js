// Vercel Serverless Function: POST /api/auth/logout
const { sql } = require('../_db');

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
        const { sessionId } = req.body;
        await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
        res.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

