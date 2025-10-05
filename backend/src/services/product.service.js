const { models: db } = require('../db/mongo/index');
const { PRODUCT_CATEGORIES, DISCOUNT_VALUES } = require('../db/mongo/product');

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
}

module.exports = new ProductService();