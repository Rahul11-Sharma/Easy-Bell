const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const {
            qutoe_item_unit,
            quote_item_quantity,
            quote_item_rate,
            quote_id,
            quote_item_id
        } = req.body;

        // ✅ Required field validation
        if (
            quote_item_quantity == null ||
            quote_item_rate == null ||
            quote_id == null ||
            quote_item_id == null
        ) {
            return res.status(400).json({
                status: false,
                message: "Required fields: quote_item_quantity, quote_item_rate, quote_id, quote_item_id"
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

        // ✅ Validate item exists (items table uses item_id)
        const [itemCheck] = await db.promise().query(
            "SELECT item_id FROM items WHERE item_id = ?",
            [quote_item_id]
        );

        if (itemCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid quote_item_id. Item not found."
            });
        }

         // ✅ Validate item exists (items table uses item_id)
        const [unitCheck] = await db.promise().query(
            "SELECT unit_id FROM units WHERE unit_id = ?",
            [qutoe_item_unit]
        );

        if (unitCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid  qutoe_item_unit. Unit not found."
            });
        }   

        // ✅ Auto calculate total
        const quote_item_total = quote_item_quantity * quote_item_rate;

        // ✅ Insert
        const [result] = await db.promise().query(
            `INSERT INTO quote_items
            (qutoe_item_unit, quote_item_quantity, quote_item_rate, quote_item_total, quote_id, quote_item_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                qutoe_item_unit ?? null,
                quote_item_quantity,
                quote_item_rate,
                quote_item_total,
                quote_id,
                quote_item_id
            ]
        );

        return res.status(201).json({
            status: true,
            message: "Quote line item created successfully.",
        });

    } catch (error) {
        console.error("POST ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error."
        });
    }
});

router.get('/', (req, res) => {
  db.query("SELECT * FROM quote_items", (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
  });
});

router.get('/:id', (req, res) => {
  db.query(
      "SELECT * FROM quote_items WHERE quote_item_id = ?",
      [req.params.id],
      (err, result) => {
          if (err) return res.status(500).json(err);
          res.json(result[0]);
      }
  );
});


router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            qutoe_item_unit,
            quote_item_quantity,
            quote_item_rate,
            quote_id,
            quote_item_id
        } = req.body;

        // ✅ Check record exists
        const [existing] = await db.promise().query(
            "SELECT * FROM quote_items WHERE quote_line_item_id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Quote line item not found."
            });
        }

        let fields = [];
        let values = [];

        // ✅ Dynamic updates
        if (qutoe_item_unit !== undefined) {
            fields.push("qutoe_item_unit = ?");
            values.push(qutoe_item_unit);
        }

        if (quote_item_quantity !== undefined) {
            fields.push("quote_item_quantity = ?");
            values.push(quote_item_quantity);
        }

        if (quote_item_rate !== undefined) {
            fields.push("quote_item_rate = ?");
            values.push(quote_item_rate);
        }

        // ✅ Recalculate total if quantity or rate changed
        if (quote_item_quantity !== undefined || quote_item_rate !== undefined) {
            const currentQty = quote_item_quantity ?? existing[0].quote_item_quantity;
            const currentRate = quote_item_rate ?? existing[0].quote_item_rate;
            const newTotal = currentQty * currentRate;

            fields.push("quote_item_total = ?");
            values.push(newTotal);
        }

        // ✅ Validate quote_id if provided
        if (quote_id !== undefined) {
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

            fields.push("quote_id = ?");
            values.push(quote_id);
        }

        // ✅ Validate item_id if provided
        if (quote_item_id !== undefined) {
            const [itemCheck] = await db.promise().query(
                "SELECT item_id FROM items WHERE item_id = ?",
                [quote_item_id]
            );

            if (itemCheck.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: "Invalid quote_item_id. Item not found."
                });
            }

            fields.push("quote_item_id = ?");
            values.push(quote_item_id);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                status: false,
                message: "No fields provided to update."
            });
        }

        values.push(id);

        await db.promise().query(
            `UPDATE quote_items 
             SET ${fields.join(", ")} 
             WHERE quote_line_item_id = ?`,
            values
        );

        return res.json({
            status: true,
            message: "Quote line item updated successfully."
        });

    } catch (error) {
        console.error("PUT ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error."
        });
    }
});

router.delete('/:id', (req, res) => {
  db.query(
      "DELETE FROM quote_items WHERE quote_item_id = ?",
      [req.params.id],
      (err, result) => {
          if (err) return res.status(500).json(err);
          res.json({ message: "Quote Item Deleted" });
      }
  );
});

router.get('/search/quote_id/:quote_id', (req, res) => {
   console.log(req.params.quote_id);
  db.query(
      "SELECT * FROM quote_items WHERE quote_id = ?",
      [req.params.quote_id],
      (err, result) => {
          if (err) return res.status(500).json(err);
          res.json(result);
      }
  );
});

router.get('/search/quote_item_id/:item_id', (req, res) => {
  db.query(
      "SELECT * FROM quote_items WHERE quote_item_id = ?",
      [req.params.item_id],
      (err, result) => {
          if (err) return res.status(500).json(err);
          res.json(result);
      }
  );
});

router.get('/search/unit/:unit', (req, res) => {
  db.query(
      "SELECT * FROM quote_items WHERE qutoe_item_unit = ?",
      [req.params.unit],
      (err, result) => {
          if (err) return res.status(500).json(err);
          res.json(result);
      }
  );
});

module.exports = router;