// Vercel Serverless Function: GET /api/init-db
// Manually trigger database initialization
const { initializeDatabase } = require('./_db');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await initializeDatabase();
        res.json({ 
            success: true, 
            message: 'Database initialized successfully',
            defaultAdmin: {
                username: 'admin',
                password: 'admin123'
            }
        });
    } catch (error) {
        console.error('Database initialization error:', error);
        res.status(500).json({ 
            error: 'Database initialization failed', 
            details: error.message 
        });
    }
};

