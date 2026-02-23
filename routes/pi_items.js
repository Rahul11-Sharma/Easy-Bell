const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const {
            pi_id,
            pi_item_id,
            pi_item_unit,
            pi_item_quantity,
            pi_item_rate,
            pi_item_total
        } = req.body;

        if (!pi_id) {
            return res.status(400).json({
                status: false,
                message: "pi_id is required."
            });
        }

        // ✅ Validate PI exists
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

         // ✅ Validate PI exists
         const [piUnitCheck] = await db.promise().query(
            "SELECT unit_id FROM units WHERE unit_id = ?",
            [pi_item_unit]
        );

        if (piUnitCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid PI_Item_Unit. Unit not found."
            });
        }

        // ✅ Validate PI exists
        const [piItemCheck] = await db.promise().query(
            "SELECT item_id FROM items WHERE item_id = ?",
            [pi_item_id]
        );

        if (piItemCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid Item. Unit not found."
            });
        }

        const [result] = await db.promise().query(
            `INSERT INTO pi_items 
            (pi_item_id, pi_item_unit, pi_item_quantity, pi_item_rate, pi_item_total, pi_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                pi_item_id || null,
                pi_item_unit || null,
                pi_item_quantity || null,
                pi_item_rate || null,
                pi_item_total || null,
                pi_id
            ]
        );

        res.status(201).json({
            status: true,
            message: "PI Item created successfully.",
            pi_line_item_id: result.insertId
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
        const [rows] = await db.promise().query("SELECT * FROM pi_items");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM pi_items WHERE pi_line_item_id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "PI Item not found."
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const data = req.body;
        const id = req.params.id;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                status: false,
                message: "No fields provided to update"
            });
        }

        // ✅ Check if record exists
        const [existing] = await db.promise().query(
            "SELECT * FROM pi_items WHERE pi_line_item_id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                status: false,
                message: "PI Item not found"
            });
        }

        // ✅ Validate purchase_order_id
        if (data.pi_id) {
            const [piCheck] = await db.promise().query(
                "SELECT pi_id FROM pi WHERE pi_id = ?",
                [data.pi_id]
            );

            if (piCheck.length === 0) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid PI. Parent PI not found."
                });
            }
        }

        // ✅ Validate item_id
        if (data.pi_item_id) {
            const [itemCheck] = await db.promise().query(
                "SELECT item_id FROM items WHERE item_id = ?",
                [data.pi_item_id]
            );

            if (itemCheck.length === 0) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid purchase_order_item_id. Item not found."
                });
            }
        }

        // ✅ Validate unit_id
        if (data.pi_item_unit) {
            const [unitCheck] = await db.promise().query(
                "SELECT unit_id FROM units WHERE unit_id = ?",
                [data.pi_item_unit]
            );

            if (unitCheck.length === 0) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid purchase_order_item_unit. Unit not found."
                });
            }
        }

        // ✅ Build dynamic update query
        let fields = [];
        let values = [];

        for (let key in data) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }

        values.push(id);

        const sql = `
            UPDATE pi_items
            SET ${fields.join(', ')}
            WHERE pi_line_item_id = ?
        `;

        await db.promise().query(sql, values);

        res.json({
            status: true,
            message: "Pi item updated successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.promise().query(
            "DELETE FROM pi_items WHERE pi_line_item_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: "PI Item not found."
            });
        }

        res.json({
            status: true,
            message: "PI Item deleted successfully."
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error." });
    }
});

router.get('/search/pi/:pi_id', async (req, res) => {
    const { pi_id } = req.params;

    const [rows] = await db.promise().query(
        "SELECT * FROM pi_items WHERE pi_id = ?",
        [pi_id]
    );

    res.json(rows);
});


router.get('/search/unit/:pi_item_unit', async (req, res) => {
    const { pi_item_unit } = req.params;
    const [rows] = await db.promise().query(
        "SELECT * FROM pi_items WHERE pi_item_unit = ?",
        [pi_item_unit]
    );

    res.json(rows);
});


router.get('/search/item/:pi_item_id', async (req, res) => {
    const { pi_item_id } = req.params;
    const [rows] = await db.promise().query(
        "SELECT * FROM pi_items WHERE pi_item_id = ?",
        [pi_item_id]
    );

    res.json(rows);
});


module.exports = router;