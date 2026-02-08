const express = require('express');
const router = express.Router();
const db = require('../db');

/* GET ALL USERS */
router.get('/', (req, res) => {
    db.query(
        'SELECT user_id, user_name, user_email, user_type FROM users',
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

/* GET SINGLE USER */
router.get('/:id', (req, res) => {
    const userId = req.params.id;

    db.query(
        'SELECT user_id, user_name, user_email, user_type FROM users WHERE user_id = ?',
        [userId],
        (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0)
                return res.status(404).json({ message: 'User not found' });

            res.json(results[0]);
        }
    );
});

/* CREATE USER */
router.post('/', (req, res) => {
    const { user_name, user_email, password, user_type } = req.body;

    const sql = `
        INSERT INTO users (user_name, user_email, password, user_type)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [user_name, user_email, password, user_type],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.status(201).json({
                message: 'User created',
                user_id: result.insertId
            });
        }
    );
});

/* UPDATE USER (PARTIAL) */
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const data = req.body;

    let fields = [];
    let values = [];

    for (let key in data) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
    }

    values.push(userId);

    const sql = `
        UPDATE users SET ${fields.join(', ')}
        WHERE user_id = ?
    `;

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'User updated' });
    });
});

/* DELETE USER */
router.delete('/:id', (req, res) => {
    db.query(
        'DELETE FROM users WHERE user_id = ?',
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'User deleted' });
        }
    );
});

module.exports = router;