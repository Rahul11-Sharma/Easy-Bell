const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const {
            invoice_id,
            invoice_item_id,
            invoice_item_unit,
            invoice_item_quantity,
            invoice_item_rate,
            invoice_item_total
        } = req.body;

        if (!invoice_id) {
            return res.status(400).json({
                status: false,
                message: "invoice_id is required"
            });
        }
        else if(!invoice_item_id)
            {
                return res.status(400).json({
                            status: false,
                            message: "invoice_item_id is required"
                        });
            }
            else if(!invoice_item_unit)
            {
                return res.status(400).json({
                            status: false,
                            message: "invoice_item_unit is required"
                        });
            }
            else if(!invoice_item_quantity)
            {
                return res.status(400).json({
                            status: false,
                            message: "invoice_item_quantity is required"
                        });
            }
            else if(!invoice_item_rate)
            {
                return res.status(400).json({
                            status: false,
                            message: "invoice_item_rate is required"
                        });
            }
            else if(!invoice_item_total)
            {
                return res.status(400).json({
                            status: false,
                            message: "invoice_item_total is required"
                        });
            }


        // ✅ Validate invoice exists
        const [invoiceCheck] = await db.promise().query(
            "SELECT invoice_id FROM invoices WHERE invoice_id = ?",
            [invoice_id]
        );

        if (invoiceCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid invoice_id. Invoice not found."
            });
        }

        // ✅ Validate item exists (items table uses item_id)
        const [itemCheck] = await db.promise().query(
            "SELECT item_id FROM items WHERE item_id = ?",
            [invoice_item_id]
        );

        if (itemCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid invoice_item_id. Item not found."
            });
        }

         // ✅ Validate item exists (items table uses item_id)
        const [unitCheck] = await db.promise().query(
            "SELECT unit_id FROM units WHERE unit_id = ?",
            [invoice_item_unit]
        );

        if (unitCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid  invoice_item_unit. Unit not found."
            });
        }


        const [result] = await db.promise().query(
            `INSERT INTO invoice_items
            (invoice_item_id, invoice_item_unit, invoice_item_quantity, invoice_item_rate, invoice_item_total, invoice_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                invoice_item_id || null,
                invoice_item_unit || null,
                invoice_item_quantity || null,
                invoice_item_rate || null,
                invoice_item_total || null,
                invoice_id
            ]
        );

        res.status(201).json({
            status: true,
            message: "Invoice item created successfully",
            
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM invoice_items");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM invoice_items WHERE invoice_line_item_id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invoice item not found"
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
        UPDATE invoice_items
        SET ${fields.join(', ')}
        WHERE invoice_line_item_id = ?
    `;

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Update failed",
                error: err
            });
        }

        res.json({ message: "Invoice item updated successfully" });
    });
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.promise().query(
            "DELETE FROM invoice_items WHERE invoice_line_item_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: "Invoice item not found"
            });
        }

        res.json({
            status: true,
            message: "Invoice item deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

router.get('/search/invoice/:invoice_id', async (req, res) => {
    try {
        const { invoice_id } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM invoice_items WHERE invoice_id = ?",
            [invoice_id]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

router.get('/search/unit/:invoice_item_unit', async (req, res) => {
    try {
        const { invoice_item_unit } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM invoice_items WHERE invoice_item_unit = ?",
            [invoice_item_unit]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

router.get('/search/item/:invoice_item_id', async (req, res) => {
    try {
        const { invoice_item_id } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM invoice_items WHERE invoice_item_id = ?",
            [invoice_item_id]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;