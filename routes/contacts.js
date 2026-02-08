const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET all contacts
 */
router.get('/', (req, res) => {
    db.query('SELECT * FROM contacts', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

/**
 * CREATE contact
 */
router.post('/', (req, res) => {
    const {
        contact_name,
        contact_email,
        contact_type,
        billing_address,
        billing_address_city,
        billing_address_state,
        billing_address_country,
        billing_address_pincode,
        shipping_address,
        shipping_address_city,
        shipping_address_state,
        shipping_address_country,
        shipping_address_pincode
    } = req.body;

    const sql = `
        INSERT INTO contacts (
            contact_name,
            contact_email,
            contact_type,
            billing_address,
            billing_address_city,
            billing_address_state,
            billing_address_country,
            billing_address_pincode,
            shipping_address,
            shipping_address_city,
            shipping_address_state,
            shipping_address_country,
            shipping_address_pincode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        contact_name,
        contact_email,
        contact_type,
        billing_address,
        billing_address_city,
        billing_address_state,
        billing_address_country,
        billing_address_pincode,
        shipping_address,
        shipping_address_city,
        shipping_address_state,
        shipping_address_country,
        shipping_address_pincode
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Failed to create contact',
                error: err
            });
        }

        res.status(201).json({
            message: 'Contact created successfully',
            contact_id: result.insertId
        });
    });
});

/**
 * GET contact by ID
 */
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM contacts WHERE contact_id = ?';

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.json(results[0]);
    });
});

/**
 * DELETE contact
 */
router.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM contacts WHERE contact_id = ?';

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to delete contact', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.json({ message: 'Contact deleted successfully' });
    });
});

/**
 * SEARCH by contact_type
 */
router.get('/search/type', (req, res) => {
    const { contact_type } = req.query;

    if (!contact_type) {
        return res.status(400).json({ message: 'contact_type query parameter is required' });
    }

    const sql = 'SELECT * FROM contacts WHERE contact_type = ?';

    db.query(sql, [contact_type], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Search failed', error: err });
        }

        res.json(results);
    });
});


router.get('/search/contact_name', (req, res) => {
    const { contact_name } = req.query;

    if (!contact_name) {
        return res.status(400).json({ message: 'contact_name query parameter is required' });
    }

    const sql = 'SELECT * FROM contacts WHERE contact_name = ?';

    db.query(sql, [contact_name], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Search failed', error: err });
        }

        res.json(results);
    });
});

/**
 * UPDATE contact
 */
router.put('/:id', (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'No fields provided to update' });
    }

    const fields = [];
    const values = [];

    for (let key in data) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
    }

    values.push(req.params.id);

    const sql = `
        UPDATE contacts
        SET ${fields.join(', ')}
        WHERE contact_id = ?
    `;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Update failed', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.json({ message: 'Contact updated successfully' });
    });
});


module.exports = router;