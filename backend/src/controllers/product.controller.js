const productService = require('../services/product.service');

class ProductController {
    /**
     * Naya product add karne ki request ko handle karta hai.
     */
    async addProduct(req, res) {
        try {
            // Step 1: Middleware se user ID nikalna
            const userId = req.user.id;

            // Step 2: Input data ko validate karna
            const validationResult = productService.validateNewProductInput(req.body);
            if (!validationResult.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validationResult.message
                });
            }
            // Step 3: Product ko database mein add karna
            const newProduct = await productService.addProductToDB(req.body, userId);

            // Step 4: Safal response bhejna
            res.status(201).json({
                success: true,
                message: 'Product safaltapoorvak add ho gaya!',
                data: newProduct
            });

        } catch (error) {
            console.error('Product add karte waqt error:', error.message);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Ek internal server error hui.'
            });
        }
    }

    /**
     * Handles the request to get a list of products.
     */
    async getProducts(req, res) {
        try {
            const result = await productService.getProducts(req.query, req.user.id);

            res.status(200).json({
                success: true,
                message: 'Products fetched successfully!',
                data: result
            });

        } catch (error) {
            console.error('Error while fetching products:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch products.'
            });
        }
    }

}

module.exports = new ProductController();