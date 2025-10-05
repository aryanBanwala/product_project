import ApiService from './ApiService';

// Use environment variable for backend URL
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://product-project-1t31.onrender.com/api/common/config';

class CommonService extends ApiService {
    constructor() {
        super(BASE_URL);
    }

    

    async getConfig() {
        return this.request('/', 'GET',null,false,false);
    }

    // ... (Other CRUD methods: getProduct, updateProduct, deleteProduct) ...
}

const commonService = new CommonService();
export default commonService;