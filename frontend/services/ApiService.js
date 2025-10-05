// Base API service class to handle HTTP requests.

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Abstracted method for making requests.
  async request(endpoint, method = 'GET', data = null, needsAuth = true, needsUserId = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (needsAuth) {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['token'] = token; // Custom header for backend compatibility
      }
    }

    if (needsUserId) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        headers['userid'] = userId;
      }
    }

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      // Parse response (even in case of errors)
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
         if (response.status === 403) {
                // Clear auth info
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');

                // Optional: redirect to login page
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        // Throw structured error
        const error = new Error(responseData.message || 'API request failed');
        error.status = response.status;
        error.data = responseData;
        return {success : false,message :responseData.message}
      }
      

      return responseData;
    } catch (err) {
        
      // If fetch itself fails (network error), rethrow with consistent structure
      return {success : false,message :err.message}
    }
  }
}

export default ApiService;
