const express = require('express');
const router = express.Router();
const db = require('../db');


// ✅ CREATE UNIT
router.post('/', (req, res) => {
    const { unit_name } = req.body;

    if (!unit_name) {
        return res.status(400).json({ message: 'unit_name is required' });
    }

    db.query(
        'INSERT INTO units (unit_name) VALUES (?)',
        [unit_name],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.status(201).json({
                message: 'Unit created successfully',
                unit_id: result.insertId
            });
        }
    );
});


// ✅ GET ALL UNITS
router.get('/', (req, res) => {
    db.query('SELECT * FROM units', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


// ✅ GET SINGLE UNIT BY ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        'SELECT * FROM units WHERE unit_id = ?',
        [id],
        (err, results) => {
            if (err) return res.status(500).json(err);

            if (results.length === 0) {
                return res.status(404).json({ message: 'Unit not found' });
            }

            res.json(results[0]);
        }
    );
});


// ✅ UPDATE UNIT (PARTIAL UPDATE)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { unit_name } = req.body;

    if (!unit_name) {
        return res.status(400).json({ message: 'unit_name is required' });
    }

    db.query(
        'UPDATE units SET unit_name = ? WHERE unit_id = ?',
        [unit_name, id],
        (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Unit not found' });
            }

            res.json({ message: 'Unit updated successfully' });
        }
    );
});


// ✅ DELETE UNIT
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM units WHERE unit_id = ?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Unit not found' });
            }

            res.json({ message: 'Unit deleted successfully' });
        }
    );
});

module.exports = router;