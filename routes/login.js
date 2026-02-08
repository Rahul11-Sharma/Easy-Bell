const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

/* LOGIN USER */
/* LOGIN USER */
router.post('/login', (req, res) => {
    const { user_email, password } = req.body;

    if (!user_email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    const sql = `
        SELECT user_id, user_name, user_email, user_type
        FROM users
        WHERE user_email = ? AND password = ?
    `;

    db.query(sql, [user_email, password], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            message: 'Login successful',
            user: results[0]
        });
    });
});

module.exports = router;