import ApiService from './ApiService';

// Use environment variable for backend URL
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://product-project-1t31.onrender.com/api/product';

class ProductService extends ApiService {
    constructor() {
        super(BASE_URL);
    }

    async createProduct(productData) {
        return this.request('/add', 'POST', productData,true,true);
    }

    async getProducts({ sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10, categories = [], ownedByMe = false } = {}) {
    const categoryParam = categories.length ? `&categories=${encodeURIComponent(categories.join(','))}` : '';
    const ownedByMeParam = ownedByMe ? '&ownedByMe=1' : '';
    const query = `?sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=${limit}${categoryParam}${ownedByMeParam}`;

    return this.request(query, 'GET', null, true, true);
    }

    async deleteProduct(productId) {
        return this.request(`/?productId=${productId}`, 'DELETE', null, true, true);
    }

    async getProductById(productId){
        return this.request(`/getProduct/?productId=${productId}`, 'GET', null, true, true);
    }

    async updateProduct(productId, productData) {
    try {
        // Send a PUT or PATCH request with productId as query param
        const response = await this.request(`/?productId=${productId}`, 'PATCH', productData, true, true);

        // response should be like { success, message, data }
       

        return response; // updated product
    } catch (err) {
        console.error('Error updating product:', err);
        throw err; // propagate to caller
    }
    }
    async searchProducts(query) {
        try{
            const response = await this.request(`/search?keyword=${query}`, 'GET', null, true, true);
            console.log(response)
            return response; // { success, message, data
        }
        catch{
            console.error('Error updating product:', err);
            throw err; // propagate to caller
        }
    
}




}
const productService = new ProductService();
export default productService;