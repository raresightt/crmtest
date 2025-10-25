// Vercel Serverless Function: GET /api/orders, POST /api/orders, DELETE /api/orders
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

    try {
        if (req.method === 'GET') {
            // Get all orders
            const result = await sql`SELECT * FROM orders ORDER BY createdAt DESC`;
            res.json(result.rows);
        } else if (req.method === 'POST') {
            // Add order
            const { id, marketplace, customerName, customerEmail, product, quantity, price, status, notes } = req.body;
            
            await sql`
                INSERT INTO orders (id, marketplace, customerName, customerEmail, product, quantity, price, status, notes, createdAt)
                VALUES (${id}, ${marketplace}, ${customerName}, ${customerEmail}, ${product}, ${quantity}, ${price}, ${status}, ${notes || ''}, ${new Date().toISOString()})
            `;
            
            res.json({ success: true });
        } else if (req.method === 'DELETE') {
            // Clear all orders
            await sql`DELETE FROM orders`;
            res.json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

