const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const { quote_id, pi_number, pi_status, pi_total, contact_id } = req.body;

        if (!quote_id || !contact_id || !pi_number || !pi_number || !pi_total ) {
            return res.status(400).json({
                status: false,
                message: "quote_id and contact_id,pi_number,pi_number,pi_total are required."
            });
        }
        
        // ✅ Validate quote exists
        const [quoteCheck] = await db.promise().query(
            "SELECT quote_id FROM quotes WHERE quote_id = ?",
            [quote_id]
        );

        if (quoteCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid quote_id. Quote not found."
            });
        }
        
        // ✅ Validate quote exists
        const [contactCheck] = await db.promise().query(
            "SELECT contact_id FROM contacts WHERE contact_id = ?",
            [contact_id]
        );

        if (quoteCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid contact id. Contact not found."
            });
        }
        
        

        const [result] = await db.promise().query(
            `INSERT INTO pi (quote_id, pi_number, pi_status, pi_total, contact_id)
             VALUES (?, ?, ?, ?, ?)`,
            [
                quote_id,
                pi_number || null,
                pi_status || null,
                pi_total || 0.00,
                contact_id
            ]
        );

        res.status(201).json({
            status: true,
            message: "PI created successfully.",
            
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal server error."
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM pi");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM pi WHERE pi_id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "PI not found."
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});



router.put('/:id', (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            message: 'No fields provided to update'
        });
    }

    let fields = [];
    let values = [];

    for (let key in data) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
    }

    values.push(req.params.id);

    const sql = `
        UPDATE pi
        SET ${fields.join(', ')}
        WHERE pi_id = ?
    `;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Update failed',
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Quote not found'
            });
        }

        res.json({
            message: 'PI updated successfully'
        });
    });
});


router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.promise().query(
            "DELETE FROM pi WHERE pi_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: "PI not found."
            });
        }

        res.json({
            status: true,
            message: "PI deleted successfully."
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});


router.get('/search/quote/:quote_id', async (req, res) => {
    try {
        const { quote_id } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM pi WHERE quote_id = ?",
            [quote_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No PI found for this quote_id."
            });
        }

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal server error."
        });
    }
});

router.get('/search/number/:pi_number', async (req, res) => {
    try {
        const { pi_number } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM pi WHERE pi_number LIKE ?",
            [`%${pi_number}%`]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No PI found for this pi_number."
            });
        }

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal server error."
        });
    }
});

router.get('/search/status/:pi_status', async (req, res) => {
    try {
        const { pi_status } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM pi WHERE pi_status = ?",
            [pi_status]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No PI found for this status."
            });
        }

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal server error."
        });
    }
});

router.get('/search/contact/:contact_id', async (req, res) => {
    try {
        const { contact_id } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM pi WHERE contact_id = ?",
            [contact_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No PI found for this contact."
            });
        }

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal server error."
        });
    }
});

module.exports = router;