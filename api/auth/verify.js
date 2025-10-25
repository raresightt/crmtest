// Vercel Serverless Function: POST /api/auth/verify
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
        
        if (!sessionId) {
            return res.status(401).json({ error: 'No session' });
        }

        const sessionResult = await sql`
            SELECT s.*, u.* FROM sessions s
            JOIN users u ON s.userId = u.id
            WHERE s.id = ${sessionId} AND s.expiresAt > ${new Date().toISOString()}
        `;

        if (sessionResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        const session = sessionResult.rows[0];
        const { password: _, ...userData } = session;
        res.json({ success: true, user: userData });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

