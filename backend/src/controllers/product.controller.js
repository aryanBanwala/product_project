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

    async getSingleProduct(req, res) {
        try {
            const { productId } = req.query;
            const userId = req.user.id;

            // Validate the id first
            productService.validateProductId(productId);
            
            // Get the details of the product, if it is verified.
            const result = await productService.verifyProductOwner(productId, userId);

            res.status(200).json({
                success: true,
                message: 'Product fetched successfully!',
                data: result
            });
        } catch (error) {
            console.error('Error while fetching product:', error.message);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch product.'
            });
        }
    }


    /**
     * Handles the request to delete a product by orchestrating service calls.
     */
    async deleteProduct(req, res) {
        try {
            const { productId } = req.query;
            const userId = req.user.id;

            // Step 1: Validate the format of the product ID
            productService.validateProductId(productId);

            // Step 2: Verify that the product exists and the user owns it
            await productService.verifyProductOwner(productId, userId);

            // Step 3: If the above checks pass, delete the product
            await productService.deleteProductFromDB(productId);

            // Send a success response
            res.status(200).json({
                success: true,
                message: 'Product deleted successfully.'
            });

        } catch (error) {
            console.error('Error while deleting product:', error.message);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'An internal server error occurred.'
            });
        }
    }

    /**
     * Handles the request to edit a product by orchestrating service calls.
     */
    async editProduct(req, res) {
        try {
            const { productId } = req.query;
            const userId = req.user.id;

            // Step 1: Validate input data and filter for allowed fields
            const validatedData = productService.validateProductUpdate(req.body);

            // Step 2: Verify product exists and user is the owner.
            // This also returns the original product, which we need for calculations.
            const originalProduct = await productService.verifyProductOwner(productId, userId);

            // Step 3: Update the product in the database
            const updatedProduct = await productService.updateProductInDB(productId, validatedData, originalProduct);

            // Step 4: Send the successful response
            res.status(200).json({
                success: true,
                message: 'Product updated successfully!',
                data: updatedProduct
            });

        } catch (error) {
            console.error('Error while editing product:', error.message);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'An internal server error occurred.'
            });
        }
    }

    async searchProducts(req, res) {
        try {
            // keyword from URL path
            const { keyword } = req.query;

            // 1) validate
            const validated = productService.validateSearchKeyword(keyword);
            if (!validated.isValid) {
                return res.status(400).json({ success: false, message: validated.message });
            }

            // 2) fetch up to 10k products from DB
            // returns array of sanitized product objects
            const products = await productService.fetchProductsForSearch({ limit: 10000 });

            // 3) apply regex filter
            const matched = productService.filterProductsByRegex(products, keyword);
            // send results
            return res.status(200).json({
                success: true,
                keyword,
                totalFetched: products.length,
                totalMatched: matched.length,
                products: matched
            });
        } catch (err) {
            console.error('searchProducts error', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }


}

module.exports = new ProductController();