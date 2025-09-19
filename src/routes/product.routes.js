const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/products/all', productController.deleteAllProducts);
router.post('/products', productController.createProduct);
router.get('/products', productController.getAllProducts);
router.get('/products/count', productController.getProductsCount);
router.get('/products/soldby-list', productController.getUniqueSoldBy);
router.get('/products/category-list', productController.getUniqueCategories);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;
