const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const {
            purchase_order_id,
            purchase_order_item_id,
            purchase_order_item_unit,
            purchase_order_item_quantity,
            purchase_order_item_rate,
            purchase_order_item_total
        } = req.body;

        // ✅ Required Field Validation
        if (!purchase_order_id) {
            return res.status(400).json({
                status: false,
                message: "purchase_order_id is required"
            });
        }
        else if (!purchase_order_item_id) {
            return res.status(400).json({
                status: false,
                message: "purchase_order_item_id is required"
            });
        }
        else if (!purchase_order_item_unit) {
            return res.status(400).json({
                status: false,
                message: "purchase_order_item_unit is required"
            });
        }
        else if (!purchase_order_item_quantity) {
            return res.status(400).json({
                status: false,
                message: "purchase_order_item_quantity is required"
            });
        }
        else if (!purchase_order_item_rate) {
            return res.status(400).json({
                status: false,
                message: "purchase_order_item_rate is required"
            });
        }
        else if (!purchase_order_item_total) {
            return res.status(400).json({
                status: false,
                message: "purchase_order_item_total is required"
            });
        }

        // ✅ Validate Purchase Order exists
        const [poCheck] = await db.promise().query(
            "SELECT purchase_order_id FROM purchase_orders WHERE purchase_order_id = ?",
            [purchase_order_id]
        );

        if (poCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid purchase_order_id. Purchase Order not found."
            });
        }

        // ✅ Validate Item exists
        const [itemCheck] = await db.promise().query(
            "SELECT item_id FROM items WHERE item_id = ?",
            [purchase_order_item_id]
        );

        if (itemCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid purchase_order_item_id. Item not found."
            });
        }

        // ✅ Validate Unit exists
        const [unitCheck] = await db.promise().query(
            "SELECT unit_id FROM units WHERE unit_id = ?",
            [purchase_order_item_unit]
        );

        if (unitCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid purchase_order_item_unit. Unit not found."
            });
        }

        // ✅ Insert Data
        const [result] = await db.promise().query(
            `INSERT INTO purchase_order_items
            (purchase_order_item_id, purchase_order_item_unit, purchase_order_item_quantity,
             purchase_order_item_rate, purchase_order_item_total, purchase_order_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                purchase_order_item_id,
                purchase_order_item_unit,
                purchase_order_item_quantity,
                purchase_order_item_rate,
                purchase_order_item_total,
                purchase_order_id
            ]
        );

        res.status(201).json({
            status: true,
            message: "Purchase Order item created successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: error
        });
    }
});

router.get("/", (req, res) => {
    db.query("SELECT * FROM purchase_order_items", (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  });

  router.get("/:id", (req, res) => {
    db.query(
      "SELECT * FROM purchase_order_items WHERE purchase_order_line_item_id = ?",
      [req.params.id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
      }
    );
  });


  router.delete('/:id', (req, res) => {
    db.query(
        "DELETE FROM purchase_order_items WHERE purchase_order_line_item_id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            else{
                res.json({ message: "Purchase Order Item Deleted" }); 
            }

        }
    );
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
        UPDATE purchase_order_items
        SET ${fields.join(', ')}
        WHERE purchase_order_line_item_id = ?
    `;

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Update failed",
                error: err
            });
        }

        res.json({ message: "Purchase Order item updated successfully" });
    });
});

router.get('/search/purchase_order/:purchase_order_id', async (req, res) => {
    try {
        const { purchase_order_id } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM purchase_orders WHERE purchase_order_id = ?",
            [purchase_order_id]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ status: false, message: "Purchase Order Item is not found" });
    }
});

router.get('/search/unit/:purchase_item_unit', async (req, res) => {
    try {
        const { purchase_item_unit } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM purchase_order_items WHERE purchase_order_item_unit = ?",
            [purchase_item_unit]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ status: false, message: "Unit is not found" });
    }
});

router.get('/search/item/:purchase_item_id', async (req, res) => {
    try {
        const { purchase_item_id } = req.params;

        const [rows] = await db.promise().query(
            "SELECT * FROM purchase_order_items WHERE purchase_item_id = ?",
            [purchase_item_id]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;

