const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const {
            pi_id,
            invoice_number,
            invoice_status,
            contact_id,
            invoice_total
        } = req.body;

        if (!pi_id || !contact_id || !invoice_total) {
            return res.status(400).json({
                status: false,
                message: "pi_id, contact_id and invoice_total are required."
            });
        }

        // ✅ Check PI exists
        const [piCheck] = await db.promise().query(
            "SELECT pi_id FROM pi WHERE pi_id = ?",
            [pi_id]
        );

        if (piCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid pi_id. PI not found."
            });
        }

        // ✅ Check Contact exists
        const [contactCheck] = await db.promise().query(
            "SELECT contact_id FROM contacts WHERE contact_id = ?",
            [contact_id]
        );

        if (contactCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid contact_id. Contact not found."
            });
        }

        const [result] = await db.promise().query(
            `INSERT INTO invoices 
            (pi_id, invoice_number, invoice_status, contact_id, invoice_total)
            VALUES (?, ?, ?, ?, ?)`,
            [
                pi_id,
                invoice_number || null,
                invoice_status || null,
                contact_id,
                invoice_total
            ]
        );

        res.status(201).json({
            status: true,
            message: "Invoice created successfully"
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM invoices");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM invoices WHERE invoice_id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invoice not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

router.put('/:id', (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            message: "No fields provided to update"
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
        UPDATE invoices
        SET ${fields.join(', ')}
        WHERE invoice_id = ?
    `;

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Update failed",
                error: err
            });
        }

        res.json({ message: "Invoice updated successfully" });
    });
});


router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.promise().query(
            "DELETE FROM invoices WHERE invoice_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: "Invoice not found"
            });
        }

        res.json({
            status: true,
            message: "Invoice deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

router.get('/search/pi/:pi_id', async (req, res) => {
    try {
        const { pi_id } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM invoices WHERE pi_id = ?",
            [pi_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No invoices found for this pi_id"
            });
        }

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
});

router.get('/search/number/:invoice_number', async (req, res) => {
    try {
        const { invoice_number } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM invoices WHERE invoice_number LIKE ?",
            [`%${invoice_number}%`]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No invoices found for this invoice number"
            });
        }

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
});

router.get('/search/contact/:contact_id', async (req, res) => {
    try {
        const { contact_id } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM invoices WHERE contact_id = ?",
            [contact_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No invoices found for this contact_id"
            });
        }

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
});


router.get('/search/status/:invoice_status', async (req, res) => {
    try {
        const { invoice_status } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM invoices WHERE invoice_status = ?",
            [invoice_status]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No invoices found for this status"
            });
        }

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
});

module.exports = router;