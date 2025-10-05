const { ObjectId } = require('mongodb');

/**
 * Product schema ke liye application-level aur database field names ki mapping.
 */
const PRODUCT_FIELDS = Object.freeze({
    id: '_id',
    name: 'NAME',
    description: 'DESCRIPTION',
    price: 'PRICE',
    category: 'CATEGORY',
    stock: 'STOCK',
    createdBy: 'CREATED_BY',
    createdAt: 'CREATED_AT',
    updatedAt: 'UPDATED_AT',
});

/**
 * Product categories ki ek standard list jo frontend par dropdown mein kaam aayegi.
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

class ProductModel {
    constructor(db) {
        if (!db) {
            throw new Error("ProductModel requires a database instance.");
        }
        this.collection = db.collection('products');
    }

    /**
     * Is class ka instance banane ka official tareeka.
     * @param {Db} db - MongoDB database ka instance.
     * @returns {ProductModel} ProductModel ka naya instance.
     */
    static init(db) {
        return new ProductModel(db);
    }

    /**
     * Database se aaye document ko saaf karke lautata hai.
     * @param {object} productDocument - Database se aaya raw document.
     * @returns {object|null} Ek sanitized product object.
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
            createdBy: productDocument[PRODUCT_FIELDS.createdBy],
            createdAt: productDocument[PRODUCT_FIELDS.createdAt],
            updatedAt: productDocument[PRODUCT_FIELDS.updatedAt],
        };
    }

    /**
     * Database mein ek naya product banata hai.
     * @param {object} productData - Naye product ka data.
     * @returns {Promise<object|null>} Naya banaya gaya, sanitized product.
     */
    async create(productData) {
        const newProductDocument = {
            [PRODUCT_FIELDS.name]: productData.name,
            [PRODUCT_FIELDS.description]: productData.description || null,
            [PRODUCT_FIELDS.price]: productData.price,
            [PRODUCT_FIELDS.category]: productData.category,
            [PRODUCT_FIELDS.stock]: productData.stock || 0,
            [PRODUCT_FIELDS.createdBy]: new ObjectId(productData.userId),
            [PRODUCT_FIELDS.createdAt]: new Date(),
            [PRODUCT_FIELDS.updatedAt]: new Date(),
        };
        const result = await this.collection.insertOne(newProductDocument);
        return this.findById(result.insertedId);
    }

    /**
     * Ek product ko uski ID se dhoondhta hai.
     * @param {string} id - Product ki ID.
     * @returns {Promise<object|null>} Sanitized product ya null.
     */
    async findById(id) {
        const product = await this.collection.findOne({ [PRODUCT_FIELDS.id]: new ObjectId(id) });
        return this._sanitizeProduct(product);
    }
}

module.exports = {ProductModel, PRODUCT_CATEGORIES};