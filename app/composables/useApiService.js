import { useAuth } from "./useAuth.js";

export function useApiService() {
  const { apiUrl, headers } = useAuth();

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

  const blogApi = {
    getBlogs: () => makeRequest("blog/all"),

    getBlog: (id) => makeRequest(`blog/${id}`),

    getBlogByAlias: (alias) => makeRequest(`blog/view/${alias}`),

    getBlogsWithPagination: (page = 1, limit = 10) =>
      makeRequest(`blog?page=${page}&limit=${limit}`),
  };

  const portfolioApi = {
    getPortfolios: () => makeRequest("portfolio/all"),

    getPortfolio: (id) => makeRequest(`portfolio/${id}`),

    getPortfolioByAlias: (alias) => makeRequest(`portfolio/view/${alias}`),
  };

  const reviewsApi = {
    getReviews: () => makeRequest("reviews"),
  }

  const servicesApi = {
    getServices: () => makeRequest("services"),
  }

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
    reviewsApi,
    servicesApi,
    api,
    apiUrl,
  };
}