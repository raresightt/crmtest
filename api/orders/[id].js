// Vercel Serverless Function: PUT /api/orders/:id, DELETE /api/orders/:id
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

    const { id } = req.query;

    try {
        if (req.method === 'PUT') {
            // Update order
            const { marketplace, customerName, customerEmail, product, quantity, price, status, notes } = req.body;
            
            await sql`
                UPDATE orders 
                SET marketplace = ${marketplace}, customerName = ${customerName}, 
                    customerEmail = ${customerEmail}, product = ${product}, 
                    quantity = ${quantity}, price = ${price}, status = ${status}, notes = ${notes || ''}
                WHERE id = ${id}
            `;
            
            res.json({ success: true });
        } else if (req.method === 'DELETE') {
            // Delete order
            await sql`DELETE FROM orders WHERE id = ${id}`;
            res.json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Order operation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

