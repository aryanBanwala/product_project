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
    'Home',
    'Toys',
    'Books',
    'Sports',
    'Beauty',
    'Clothing',
    'Automotive',
    'Electronics'
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
            [PRODUCT_FIELDS.createdBy]: productData.userId,
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

    /**
     * Finds all products with advanced filtering, sorting, and pagination.
     * @param {object} options - The options for querying.
     * @param {object} options.filters - The filter criteria (e.g., { NAME: /search/i }).
     * @param {object} options.sort - The sort criteria (e.g., { PRICE: -1 }).
     * @param {object} options.pagination - The pagination criteria (e.g., { skip: 0, limit: 10 }).
     * @returns {Promise<{products: object[], totalCount: number}>} The list of products and total count.
     */
    async findAll({ filters, sort, pagination }) {
        // The aggregation pipeline allows for complex data processing.
        const pipeline = [
            { $match: filters }, // First, filter the documents
            {
                $facet: { // $facet processes multiple aggregation pipelines within a single stage
                    // Pipeline 1: Get the metadata (total count)
                    metadata: [{ $count: 'total' }],
                    // Pipeline 2: Get the paginated data
                    data: [
                        { $sort: sort }, // Then, sort the results
                        { $skip: pagination.skip }, // Then, apply pagination skip
                        { $limit: pagination.limit }, // Finally, apply pagination limit
                    ],
                },
            },
        ];

        const result = await this.collection.aggregate(pipeline).toArray();

        // Extract and sanitize the data from the aggregation result
        const products = result[0].data.map(this._sanitizeProduct);
        const totalCount = result[0].metadata[0] ? result[0].metadata[0].total : 0;

        return { products, totalCount };
    }

    /**
     * Deletes a product by its ID without checking for ownership.
     * @param {string} productId - The ID of the product to delete.
     * @returns {Promise<object>} The result of the delete operation from MongoDB.
     */
    async deleteOneById(productId) {
        return this.collection.deleteOne({
            [PRODUCT_FIELDS.id]: new ObjectId(productId)
        });
    }

    /**
     * Updates a product's details, correctly mapping application fields to DB fields.
     * @param {string} productId - The ID of the product to update.
     * @param {object} updateData - An object with app-level fields to update (e.g., { name: 'New Name' }).
     * @returns {Promise<object|null>} The updated, sanitized user document.
     */
    async updateById(productId, updateData) {
        const dbUpdateData = {};
        // Loop through incoming data and map keys to the DB schema using PRODUCT_FIELDS
        for (const appField in updateData) {
            if (PRODUCT_FIELDS[appField]) { // Check if the field is in our mapping
                const dbField = PRODUCT_FIELDS[appField];
                dbUpdateData[dbField] = updateData[appField];
            }
        }

        if (Object.keys(dbUpdateData).length === 0) {
            return this.findById(productId); // No valid fields to update, return unchanged
        }

        const updateDocument = {
            $set: {
                ...dbUpdateData,
                [PRODUCT_FIELDS.updatedAt]: new Date()
            }
        };

        await this.collection.updateOne(
            { [PRODUCT_FIELDS.id]: new ObjectId(productId) },
            updateDocument
        );

        return this.findById(productId);
    }

      /**
     * Fetch all products with a simple limit.
     * No filters, no pagination logic.
     * @param {number} limit - Max number of products to fetch.
     * @returns {Promise<Array>} - Array of sanitized product objects.
     */
    async getProducts(limit = 10000) {
        const docs = await this.collection
            .find({}, { projection: {} })
            .limit(limit)
            .toArray();

        // Sanitize each product (same as other methods)
        const products = docs.map(doc => this._sanitizeProduct(doc));

        return products;
    }

}

module.exports = { ProductModel, PRODUCT_FIELDS , PRODUCT_CATEGORIES, DISCOUNT_VALUES };