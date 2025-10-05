const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');
const auth = require('../middlewares/auth.middleware');

// Naya product add karne ke liye route.
router.post('/add', auth.userAuth, productController.addProduct);
router.get('/', auth.userAuth, productController.getProducts)

module.exports = router;