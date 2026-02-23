const express = require('express');
const router = express.Router();
const db = require('../db');


// ✅ CREATE ITEM
router.post('/', (req, res) => {
  const { item_name, item_cost_price, item_selling_price, item_sku } = req.body;

  const sql = `
    INSERT INTO items 
    (item_name, item_cost_price, item_selling_price, item_sku)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [item_name, item_cost_price, item_selling_price, item_sku], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Item created', item_id: result.insertId });
  });
});


// ✅ GET ALL ITEMS
router.get('/', (req, res) => {
  db.query('SELECT * FROM items', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


// ✅ GET ITEM BY ID
router.get('/:id', (req, res) => {
  db.query(
    'SELECT * FROM items WHERE item_id = ?',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results[0]);
    }
  );
});


// ✅ UPDATE ITEM
router.put('/:id', (req, res) => {
    const data = req.body;
    const id = req.params.id;

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'No fields provided to update' });
    }

    // ✅ Check if record exists
    const [existing] = await db.promise().query(
      "SELECT * FROM items WHERE item_id = ?",
      [id]
    );

if (existing.length === 0) {
  return res.status(404).json({
      status: false,
      message: "Purchase Order Item not found"
  });
}

    const fields = [];
    const values = [];

    for (let key in data) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
    }

    values.push(req.params.id);

    const sql = `
        UPDATE items
        SET ${fields.join(', ')}
        WHERE item_id = ?
    `;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Update failed', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Items not found' });
        }

        res.json({ message: 'Items updated successfully' });
    });
});


// ✅ DELETE ITEM
router.delete('/:id', (req, res) => {
  db.query(
    'DELETE FROM items WHERE item_id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Item deleted' });
    }
  );
});


// 🔍 SEARCH BY ITEM NAME
router.get('/search/item_name', (req, res) => {
    const { item_name } = req.query;

    if (!item_name) {
        return res.status(400).json({ message: 'item_name query parameter is required' });
    }

    const sql = 'SELECT * FROM items WHERE item_name LIKE ?';
    finalItemName = `%${item_name}%`
    db.query(sql, [finalItemName], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Search failed', error: err });
        }

        res.json(results);
    });
});


// 🔍 SEARCH BY SKU
router.get('/search/item_sku', (req, res) => {
    const { item_sku } = req.query;

    if (!item_sku) {
        return res.status(400).json({ message: 'item_sku query parameter is required' });
    }

    const sql = 'SELECT * FROM items WHERE item_sku = ?';

    db.query(sql, [item_sku], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Search failed', error: err });
        }

        res.json(results);
    });
});

module.exports = router;