const express = require('express');
const bodyParser = require('body-parser');

const contactRoutes = require('./routes/contacts');
const usersRoutes = require('./routes/users');
const loginRoutes = require('./routes/login');
const unitRoutes = require('./routes/units');
const itemsRoutes = require('./routes/items');
const quotesRoutes = require('./routes/quotes');
const quoteItemsRoutes = require('./routes/quote_items');
const piRoutes = require('./routes/pi');
const piItemsRoutes = require('./routes/pi_items');
const invoicesRoutes = require('./routes/invoices');
const invoiceItemRoutes = require('./routes/invoices');
const poRoutes = require('./routes/purchase_order');
const poItemRoutes = require('./routes/purchase_order_items');


const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use('/contacts', contactRoutes);
app.use('/users', usersRoutes);
app.use('/', loginRoutes);
app.use('/units', unitRoutes);
app.use('/items', itemsRoutes);
app.use('/quotes', quotesRoutes);
app.use('/quote_items', quoteItemsRoutes);
app.use('/pi', piRoutes);
app.use('/pi_items', piItemsRoutes);
app.use('/invoices', invoicesRoutes);
app.use('/invoice_items', invoiceItemRoutes);
app.use('/purchase_order', poRoutes);
app.use('/purchase_order_item', poItemRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});