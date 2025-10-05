const { ObjectId } = require('mongodb');
const { models: db } = require('../db/mongo/index');
const { PRODUCT_CATEGORIES, DISCOUNT_VALUES , PRODUCT_FIELDS} = require('../db/mongo/product');

const ALLOWED_SORT_FIELDS = ['name', 'price', 'discountFactor', 'finalTotalPrice', 'stock', 'createdAt'];
class ProductService {
    /**
     * Validates the input data for a new product.
     * @param {object} data - The product data from the request body.
     * @returns {{isValid: boolean, message: string}} The validation result.
     */
    validateNewProductInput(data) {
        const requiredFields = ['name', 'price', 'category', 'stock'];
        for (const field of requiredFields) {
            if (data[field] === undefined || data[field] === null) {
                return { isValid: false, message: `Validation failed: '${field}' is a required field.` };
            }
        }
        if (typeof data.price !== 'number' || data.price <= 0) {
            return { isValid: false, message: 'Validation failed: Price must be a positive number.' };
        }
        if (typeof data.stock !== 'number' || data.stock < 0) {
            return { isValid: false, message: 'Validation failed: Stock must be a non-negative number.' };
        }
        if (!PRODUCT_CATEGORIES.includes(data.category)) {
            return { isValid: false, message: `Validation failed: '${data.category}' is not a valid category.` };
        }
        // New validation for discount factor
        if (data.discountFactor && !DISCOUNT_VALUES.includes(data.discountFactor)) {
             return { isValid: false, message: `Validation failed: '${data.discountFactor}' is not a valid discount.` };
        }

        return { isValid: true, message: 'Validation successful.' };
    }

    /**
     * Prepares and adds a new product to the database.
     * This function now handles the business logic for price calculation.
     * @param {object} productData - The validated product data.
     * @param {string} userId - The ID of the user creating the product.
     * @returns {Promise<object>} The newly created, sanitized product object.
     */
    async addProductToDB(productData, userId) {
        const { price, stock, discountFactor } = productData;

        // Step 1: Calculate the discount and final price
        const totalPrice = price*stock;
        const discount = (discountFactor && DISCOUNT_VALUES.includes(discountFactor)) ? discountFactor : 0;
        const finalTotalPrice = totalPrice - (totalPrice * (discount / 100));

        // Step 2: Prepare the complete data object for the model
        const dataForModel = {
            ...productData,
            discount: discount,
            finalTotalPrice: finalTotalPrice,
            userId: userId
        };
        
        // Step 3: Call the model to create the entry in the database
        const newProduct = await db.product.create(dataForModel);
        return newProduct;
    }

     /**
     * Retrieves a list of products based on query parameters.
     * @param {object} queryParams - The raw query parameters from the request.
     * @param {string} userId - The ID of the authenticated user (from middleware).
     * @returns {Promise<object>} The paginated list of products and metadata.
     */
    async getProducts(queryParams, userId) {
        // 1. Pagination
        const page = parseInt(queryParams.page, 10) || 1;
        const limit = Math.min(parseInt(queryParams.limit, 10) || 10, 100); // guard limit
        const pagination = { skip: (page - 1) * limit, limit };

        // 2. Sorting
        let sortBy = 'createdAt';
        if (queryParams.sortBy && ALLOWED_SORT_FIELDS.includes(queryParams.sortBy)) {
            sortBy = queryParams.sortBy;
        }
        const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
        // Map application field name to DB field name safely
        const dbSortField = PRODUCT_FIELDS[sortBy] || PRODUCT_FIELDS.createdAt;
        const sort = { [dbSortField]: sortOrder };

        // 3. Filters
        const filters = {};
        if (queryParams.categories) {
            const requested = queryParams.categories.split(',').map(s => s.trim());
            const validCategories = requested.filter(cat => PRODUCT_CATEGORIES.includes(cat));

            if (validCategories.length) {
                filters[PRODUCT_FIELDS.category] = { $in: validCategories }; // use DB field name directly
            }
        }
        if (queryParams.ownedByMe === '1' && userId) {
            try {
                filters[PRODUCT_FIELDS.createdBy] = userId; // DB field name
            } catch (err) {
                // If userId is not a valid ObjectId, skip the ownedByMe filter
            }
        }

        // 4. Call the model - use singular `product` to match other calls (e.g., db.product.create)
        const { products, totalCount } = await db.product.findAll({ filters, sort, pagination });

        // 5. Response
        return {
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil((totalCount || 0) / limit),
                totalProducts: totalCount || 0,
                limit
            }
        };
    }

    /**
     * Validates if a given string is a valid MongoDB ObjectId.
     * @param {string} productId The ID to validate.
     */
    validateProductId(productId) {
        if (!ObjectId.isValid(productId)) {
            const error = new Error('Invalid product ID format.');
            error.statusCode = 400; // Bad Request
            throw error;
        }
    }

    /**
     * Fetches a product and verifies that the given user is its owner.
     * @param {string} productId The ID of the product to check.
     * @param {string} userId The ID of the user to verify against.
     */
    async verifyProductOwner(productId, userId) {
        const product = await db.product.findById(productId);
        if (!product) {
            const error = new Error('Product not found.');
            error.statusCode = 404;
            throw error;
        }

        // The 'createdBy' field is already a string from the _sanitizeProduct method
        if (product.createdBy.toString() !== userId) {
            const error = new Error('Forbidden. You can only delete your own products.');
            error.statusCode = 403;
            throw error;
        }
    }

    /**
     * Deletes a product from the database after ownership has been verified.
     * @param {string} productId The ID of the product to delete.
     */
    async deleteProductFromDB(productId) {
        const result = await db.product.deleteOneById(productId);
        if (result.deletedCount === 0) {
            // This is a safeguard. This error shouldn't be hit if verifyProductOwner runs first.
            throw new Error('Product could not be deleted or was already deleted.');
        }
    }

}

module.exports = new ProductService();