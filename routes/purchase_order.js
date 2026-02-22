const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const {
            pi_id,
            purchase_order_number,
            purchase_order_status,
            vendor_id,
            purchase_order_total
        } = req.body;
        // console.log("data ",req.body);
        if(!purchase_order_number)
        {
            return res.status(400).json({
                status: false,
                message: "purchase_order_number is required"
            });
        }
        else if(!purchase_order_status)
        {
            return res.status(400).json({
                status: false,
                message: "purchase_order_status is required"
            });
        }
        else if(!vendor_id)
        {
            return res.status(400).json({
                status: false,
                message: "vendor_id is required"
            });
        }
        else if(!purchase_order_total)
        {
            return res.status(400).json({
                status: false,
                message: "purchase_order_total is required"
            });
        }
        // console.log("pi ",pi_id);
          // ✅ Check PI only if pi_id is provided
          if (pi_id !== undefined && pi_id !== null) {

            const [piCheck] = await db.promise().query(
                "SELECT pi_id FROM pi WHERE pi_id = ?",
                [pi_id]
            );

            if (piCheck.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: "Invalid PI Id. PI not found."
                });
            }
        }
        

        // ✅ Validate item exists (items table uses item_id)
        const [vendorCheck] = await db.promise().query(
            "SELECT contact_id FROM contacts  WHERE contact_id = ?",
            [vendor_id]
        );

        if (vendorCheck.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Invalid Vendor Id. Vendor not found."
            });
        }



        const sql = `
        INSERT INTO purchase_orders 
        (pi_id, purchase_order_number, purchase_order_status, vendor_id, purchase_order_total)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [pi_id, purchase_order_number, purchase_order_status, vendor_id, purchase_order_total],
        (err, result) => {
          if (err) return res.status(500).json(err);
          res.json({ message: "Purchase Order Created", id: result.insertId });
        }
      );

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});


  router.get("/", (req, res) => {
    db.query("SELECT * FROM purchase_orders", (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  });

  router.get("/:id", (req, res) => {
    db.query(
      "SELECT * FROM purchase_orders WHERE purchase_order_id = ?",
      [req.params.id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
      }
    );
  });

 router.put('/:id', async (req, res) => {
    try {
        const purchase_order_id = req.params.id;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                status: false,
                message: "At least one field is required to update"
            });
        }

        // ✅ Check if record exists
        const [check] = await db.promise().query(
            "SELECT purchase_order_id FROM purchase_orders WHERE purchase_order_id = ?",
            [purchase_order_id]
        );

        if (check.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Purchase Order not found"
            });
        }

        const allowedFields = [
            "pi_id",
            "purchase_order_number",
            "purchase_order_status",
            "vendor_id",
            "purchase_order_total"
        ];

        let fields = [];
        let values = [];

        for (let key in data) {

            if (!allowedFields.includes(key)) {
                return res.status(400).json({
                    status: false,
                    message: `Invalid field: ${key}`
                });
            }

            fields.push(`${key} = ?`);
            values.push(data[key]);
        }

        // ✅ Important: At least one VALID field must exist
        if (fields.length === 0) {
            return res.status(400).json({
                status: false,
                message: "At least one valid field is required to update"
            });
        }

        values.push(purchase_order_id);

        const sql = `
            UPDATE purchase_orders
            SET ${fields.join(', ')}
            WHERE purchase_order_id = ?
        `;

        await db.promise().query(sql, values);

        return res.json({
            status: true,
            message: "Purchase Order updated successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
});


  router.delete("/:id", (req, res) => {
    db.query(
      "DELETE FROM purchase_orders WHERE purchase_order_id = ?",
      [req.params.id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Purchase Order Deleted" });
      }
    );
  });

  router.get("/search/pi/:pi_id", (req, res) => {
    db.query(
      "SELECT * FROM purchase_orders WHERE pi_id = ?",
      [req.params.pi_id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
      }
    );
  });

  router.get("/search/number/:purchase_order_number", (req, res) => {
    db.query(
      "SELECT * FROM purchase_orders WHERE purchase_order_number = ?",
      [req.params.purchase_order_number],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
      }
    );
  });

  router.get("/search/vendor/:vendor_id", (req, res) => {
    db.query(
      "SELECT * FROM purchase_orders WHERE vendor_id = ?",
      [req.params.vendor_id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
      }
    );
  });

  router.get("/search/status/:purchase_order_status", (req, res) => {
    db.query(
      "SELECT * FROM purchase_orders WHERE purchase_order_status = ?",
      [req.params.purchase_order_status],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
      }
    );
  });


module.exports = router;