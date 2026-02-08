const express = require('express');
const bodyParser = require('body-parser');

const contactRoutes = require('./routes/contacts');
const usersRoutes = require('./routes/users');
const loginRoutes = require('./routes/login');
const unitRoutes = require('./routes/units');
const itemsRoutes = require('./routes/items');
const quotesRoutes = require('./routes/quotes');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());


app.use('/contacts', contactRoutes);
app.use('/users', usersRoutes);
app.use('/', loginRoutes);
app.use('/units', unitRoutes);
app.use('/items', itemsRoutes);
app.use('/quotes', quotesRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});