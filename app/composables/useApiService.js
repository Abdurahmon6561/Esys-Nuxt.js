export function useApiService() {
  const { locale } = useI18n();

  // All requests go through the server-side proxy (/api/backend/**),
  // which attaches Basic Auth credentials. The browser never sees them.
  const makeRequest = async (endpoint, options = {}) => {
    try {
      const response = await $fetch(`/api/backend/${endpoint}`, {
        ...options,
        headers: {
          "Content-Language": locale.value,
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
  };

  const servicesApi = {
    getServices: () => makeRequest("services"),
  };

  const api = {
    // GET request
    get: (endpoint) => makeRequest(endpoint),

    // POST request
    post: (endpoint, data) =>
      makeRequest(endpoint, {
        method: "POST",
        body: data,
      }),
  };

  return {
    blogApi,
    portfolioApi,
    reviewsApi,
    servicesApi,
    api,
  };
}
