// app.js
const express = require('express');
const app = express();
const userRoutes = require('./src/routes/user.route');
const commonRoutes = require('./src/routes/common.route');
const productRoutes = require('./src/routes/product.route');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(require('cors')());

app.use('/api/users', userRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/product', productRoutes);

// A simple root route to check if the server is up
app.get('/healthcheck', (req, res) => {
    res.status(200).json({mssg: 'Backend server is running!'});
});

module.exports = app;