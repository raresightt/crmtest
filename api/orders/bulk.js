// Vercel Serverless Function: POST /api/orders/bulk
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
        const { orders } = req.body;
        
        // Insert orders one by one (PostgreSQL doesn't have the same transaction API as SQLite)
        for (const order of orders) {
            await sql`
                INSERT INTO orders (id, marketplace, customerName, customerEmail, product, quantity, price, status, notes, createdAt)
                VALUES (
                    ${order.id},
                    ${order.marketplace},
                    ${order.customerName},
                    ${order.customerEmail},
                    ${order.product},
                    ${order.quantity},
                    ${order.price},
                    ${order.status},
                    ${order.notes || ''},
                    ${order.createdAt || new Date().toISOString()}
                )
            `;
        }
        
        res.json({ success: true, count: orders.length });
    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

