import { useAuth } from "./useAuth.js";

export function useApiService() {
  const { apiUrl, headers } = useAuth();

  // Generic request handler with error handling
  const makeRequest = async (endpoint, options = {}) => {
    try {
      const url = `${apiUrl}${endpoint}`;
      const response = await $fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });
      return response;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  };

  // Blog API methods
  const blogApi = {
    getBlogs: () => makeRequest("blog/all"),

    // Get blog by ID
    getBlog: (id) => makeRequest(`blog/${id}`),

    // Get blog by alias
    getBlogByAlias: (alias) => makeRequest(`blog/view/${alias}`),

    // Get blogs with pagination
    getBlogsWithPagination: (page = 1, limit = 10) =>
      makeRequest(`blog?page=${page}&limit=${limit}`),
  };

  const portfolioApi = {
    // Get all portfolios
    getPortfolios: () => makeRequest("portfolio/all"),

    // Get portfolio by ID
    getPortfolio: (id) => makeRequest(`portfolio/${id}`),

    // Get portfolio by alias
    getPortfolioByAlias: (alias) => makeRequest(`portfolio/view/${alias}`),
  };

  // Generic CRUD operations
  const api = {
    // GET request
    get: (endpoint) => makeRequest(endpoint),

    // POST request
    post: (endpoint, data) =>
      makeRequest(endpoint, {
        method: "POST",
        body: data,
      }),

    // PUT request
    put: (endpoint, data) =>
      makeRequest(endpoint, {
        method: "PUT",
        body: data,
      }),

    // DELETE request
    delete: (endpoint) =>
      makeRequest(endpoint, {
        method: "DELETE",
      }),
  };

  return {
    blogApi,
    portfolioApi,
    api,
    apiUrl,
  };
}
