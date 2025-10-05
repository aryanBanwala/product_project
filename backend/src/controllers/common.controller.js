const { PRODUCT_CATEGORIES, DISCOUNT_VALUES } = require('../db/mongo/product');

class CommonController {
    /**
     * Application ki general config details (jaise product categories) lautata hai.
     */
    getAppConfig(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'App configuration fetched successfully.',
                data: {
                    productCategories: PRODUCT_CATEGORIES,
                    discountFactors: DISCOUNT_VALUES
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Could not fetch app configuration.'
            });
        }
    }
}

module.exports = new CommonController();