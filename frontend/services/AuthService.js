import ApiService from './ApiService';

/**
 * AuthService class handles all user authentication operations (signup, login).
 * It inherits the core network logic (request method) from ApiService.
 * This demonstrates OOP principle of Inheritance and provides a specialized
 * layer of Abstraction for authentication features.
 */
class AuthService extends ApiService {
  constructor() {
    // Call the parent constructor with the base URL for the authentication endpoints.
    super('https://product-project-1t31.onrender.com/api/users'); // Adjust the base URL as needed
  }

  /**
   * Handles user login.
   * @param {Object} credentials - The user's login credentials ({ email, password }).
   * @returns {Object} The API response data, typically containing user info.
   */
  async login(credentials) {
    // Use the encapsulated 'request' method.
    // 'false' indicates this specific call does NOT require an Authorization header.
    const data = await this.request('/login', 'POST', credentials, false);
    
    // Encapsulation: Store the token upon successful login.
    if (data?.data?.token) {
      localStorage.setItem('authToken', data.data.token);
    }
    if(data?.data?.user?.id){
        localStorage.setItem('userId', data.data.user.id);
    }
    
    return data;
  }

  /**
   * Handles user sign-up (registration).
   * @param {Object} userData - The user's registration data ({ name, email, password }).
   * @returns {Object} The API response data.
   */
  async signup(userData) {
    // 'false' indicates this specific call does NOT require an Authorization header.
    return this.request('/signup', 'POST', userData, false);
  }

  /**
   * Handles user logout by removing the stored token.
   * This is a simple client-side operation for state management.
   */
  logout() {
    localStorage.removeItem('authToken');
    // You might also clear other user-related state here if needed
  }

  /**
   * Checks if a user is currently logged in based on the presence of a token.
   * @returns {boolean} True if an authToken exists, false otherwise.
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
}

// Singleton Pattern: Export an instance to ensure consistent use across the app.
const authService = new AuthService();
export default authService;