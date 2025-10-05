const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');
const auth = require('../middlewares/auth.middleware');

// Route to add a new product (Protected)
router.post('/add', auth.userAuth, productController.addProduct);

// Route to delete a product (Protected)
router.get('/', auth.userAuth, productController.getProducts)

// Route to get a list of products (Protected)
router.delete('/', auth.userAuth, productController.deleteProduct);

// Route to edit a product (Protected)
router.patch('/', auth.userAuth, productController.editProduct);

module.exports = router;