const { ObjectId } = require('mongodb');

/**
 * Defines a mapping between application-level field names and database field names.
 */
const PRODUCT_FIELDS = Object.freeze({
    id: '_id',
    name: 'NAME',
    description: 'DESCRIPTION',
    price: 'PRICE',
    category: 'CATEGORY',
    stock: 'STOCK',
    discountFactor: 'DISCOUNT_FACTOR',
    finalTotalPrice: 'FINAL_TOTAL_PRICE',
    createdBy: 'CREATED_BY',
    createdAt: 'CREATED_AT',
    updatedAt: 'UPDATED_AT',
});

/**
 * A standard list of product categories for frontend use.
 */
const PRODUCT_CATEGORIES = Object.freeze([
    'Electronics',
    'Books',
    'Clothing',
    'Home & Kitchen',
    'Sports & Outdoors',
    'Beauty & Personal Care',
    'Toys & Games',
    'Automotive'
]);

/**
 * A standard list of allowed discount percentages.
 */
const DISCOUNT_VALUES = Object.freeze([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);

class ProductModel {
    constructor(db) {
        if (!db) {
            throw new Error("ProductModel requires a database instance.");
        }
        this.collection = db.collection('products');
    }

    /**
     * A static factory method to initialize and return an instance of the ProductModel.
     * @param {Db} db - The MongoDB database instance.
     * @returns {ProductModel} A new instance of the ProductModel.
     */
    static init(db) {
        return new ProductModel(db);
    }

    /**
     * A private helper to format the product document for application use.
     * @param {object} productDocument - The raw document from the database.
     * @returns {object|null} A sanitized product object.
     */
    _sanitizeProduct(productDocument) {
        if (!productDocument) {
            return null;
        }
        return {
            id: productDocument[PRODUCT_FIELDS.id],
            name: productDocument[PRODUCT_FIELDS.name],
            description: productDocument[PRODUCT_FIELDS.description],
            price: productDocument[PRODUCT_FIELDS.price],
            category: productDocument[PRODUCT_FIELDS.category],
            stock: productDocument[PRODUCT_FIELDS.stock],
            discountFactor: productDocument[PRODUCT_FIELDS.discountFactor],
            finalTotalPrice: productDocument[PRODUCT_FIELDS.finalTotalPrice],
            createdBy: productDocument[PRODUCT_FIELDS.createdBy],
            createdAt: productDocument[PRODUCT_FIELDS.createdAt],
            updatedAt: productDocument[PRODUCT_FIELDS.updatedAt],
        };
    }

    /**
     * Creates a new product in the database, calculating the final price.
     * @param {object} productData - The data for the new product.
     * @returns {Promise<object|null>} The newly created, sanitized product.
     */
    async create(productData) {
        const newProductDocument = {
            [PRODUCT_FIELDS.name]: productData.name,
            [PRODUCT_FIELDS.description]: productData.description || null,
            [PRODUCT_FIELDS.price]: productData.price,
            [PRODUCT_FIELDS.category]: productData.category,
            [PRODUCT_FIELDS.stock]: productData.stock || 0,
            [PRODUCT_FIELDS.discountFactor]: productData.discount || 0,
            [PRODUCT_FIELDS.finalTotalPrice]: productData.finalTotalPrice,
            [PRODUCT_FIELDS.createdBy]: new ObjectId(productData.userId),
            [PRODUCT_FIELDS.createdAt]: new Date(),
            [PRODUCT_FIELDS.updatedAt]: new Date(),
        };
        const result = await this.collection.insertOne(newProductDocument);
        return this.findById(result.insertedId);
    }

    /**
     * Finds a product by its ID.
     * @param {string} id - The ID of the product.
     * @returns {Promise<object|null>} The sanitized product or null if not found.
     */
    async findById(id) {
        const product = await this.collection.findOne({ [PRODUCT_FIELDS.id]: new ObjectId(id) });
        return this._sanitizeProduct(product);
    }
}

module.exports = { ProductModel, PRODUCT_CATEGORIES, DISCOUNT_VALUES };