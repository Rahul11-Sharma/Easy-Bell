const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET all quotes
 */
router.get('/', (req, res) => {
    db.query('SELECT * FROM quotes', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

/* GET quote by ID*/
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM quotes WHERE quote_id = ?';

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        res.json(results[0]);
    });
});

/**
 * CREATE quote
 */
router.post('/', (req, res) => {
    const {
        quotes_number,
        quotes_status,
        contact_id,
        quote_total
    } = req.body;

    // 1️⃣ Basic validation
    if (!quotes_number || !quotes_status || !contact_id) {
        return res.status(400).json({
            message: 'quotes_number, quotes_status and contact_id are required'
        });
    }

    // 2️⃣ Check if contact exists (FOREIGN KEY safety)
    const checkContactSql = `
        SELECT contact_id
        FROM contacts
        WHERE contact_id = ?
    `;

    db.query(checkContactSql, [contact_id], (err, contactResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Database error while checking contact',
                error: err
            });
        }

        if (contactResult.length === 0) {
            return res.status(400).json({
                message: 'Invalid contact_id. Contact does not exist.'
            });
        }

        // 3️⃣ Insert quote
        const insertQuoteSql = `
            INSERT INTO quotes (
                quotes_number,
                quotes_status,
                contact_id,
                quote_total
            ) VALUES (?, ?, ?, ?)
        `;

        const values = [
            quotes_number,
            quotes_status,
            contact_id,
            quote_total || 0.00
        ];

        db.query(insertQuoteSql, values, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: 'Failed to create quote',
                    error: err
                });
            }

            // 4️⃣ Success response
            res.status(201).json({
                message: 'Quote created successfully',
            });
        });
    });
});

/**
 * UPDATE quote
 */
router.put('/:id', (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            message: 'No fields provided to update'
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
        UPDATE quotes
        SET ${fields.join(', ')}
        WHERE quote_id = ?
    `;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Update failed',
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Quote not found'
            });
        }

        res.json({
            message: 'Quote updated successfully'
        });
    });
});

/**
 * DELETE quote
 */
router.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM quotes WHERE quote_id = ?';

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Failed to delete quote',
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Quote not found'
            });
        }

        res.json({
            message: 'Quote deleted successfully'
        });
    });
});


/**
 * GET quote by ID
 */
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM quotes WHERE quote_id = ?';

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        res.json(results[0]);
    });
});


router.get('/search/quote-number', (req, res) => {
    const { quotes_number } = req.query;

    if (!quotes_number) {
        return res.status(400).json({
            message: 'quotes_number is required'
        });
    }

    const sql = `
        SELECT *
        FROM quotes
        WHERE LOWER(TRIM(quotes_number)) = LOWER(TRIM(?))
    `;

    db.query(sql, [quotes_number], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Search failed',
                error: err
            });
        }

        res.json(results);
    });
});

router.get('/search/status', (req, res) => {
    const { quotes_status } = req.query;

    if (!quotes_status) {
        return res.status(400).json({
            message: 'quotes_status is required'
        });
    }

    const sql = `
        SELECT *
        FROM quotes
        WHERE quotes_status = ?
    `;

    db.query(sql, [quotes_status], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Search failed',
                error: err
            });
        }

        res.json(results);
    });
});

router.get('/search/contact', (req, res) => {
    const { contact_id } = req.query;

    if (!contact_id) {
        return res.status(400).json({
            message: 'contact_id is required'
        });
    }

    const sql = `
        SELECT *
        FROM quotes
        WHERE contact_id = ?
    `;

    db.query(sql, [contact_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Search failed',
                error: err
            });
        }

        res.json(results);
    });
});

router.get('/search/contact', (req, res) => {
    const { contact_id } = req.query;

    if (!contact_id) {
        return res.status(400).json({
            message: 'contact_id is required'
        });
    }

    const sql = `
        SELECT *
        FROM quotes
        WHERE contact_id = ?
    `;

    db.query(sql, [contact_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Search failed',
                error: err
            });
        }

        res.json(results);
    });
});

module.exports = router;