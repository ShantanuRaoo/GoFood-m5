// Base API URL - Update to use relative URL for deployment compatibility
const BASE_URL = "/api"

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type")

  if (!response.ok) {
    // If the response is not JSON, return a standardized error object
    if (!contentType || !contentType.includes("application/json")) {
      return {
        success: false,
        error: `Server error: ${response.status} ${response.statusText}`,
      }
    }
  }

  // Try to parse as JSON, fallback to error object if it fails
  try {
    return await response.json()
  } catch (error) {
    console.error("Failed to parse response as JSON:", error)
    return {
      success: false,
      error: "Invalid response format from server",
    }
  }
}

// API service for authentication
export const authService = {
  // Register a new user
  register: async (userData: { name: string; email: string; password: string; location: string }) => {
    try {
      const response = await fetch(`${BASE_URL}/createuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        error: "Registration failed. Please try again.",
      }
    }
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch(`${BASE_URL}/loginuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: "Login failed. Please try again.",
      }
    }
  },

  // Google authentication
  googleAuth: async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/google-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error("Google auth error:", error)
      return {
        success: false,
        error: "Google authentication failed. Please try again.",
      }
    }
  },
}

// API service for food data
export const foodService = {
  // Get all food items and categories
  getFoodData: async () => {
    try {
      const response = await fetch(`${BASE_URL}/foodData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching food data:", error)
      throw error
    }
  },

  // Place an order
  placeOrder: async (orderData: any, authToken: string) => {
    try {
      const response = await fetch(`${BASE_URL}/orderData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error("Error placing order:", error)
      return {
        success: false,
        error: "Failed to place order. Please try again.",
      }
    }
  },

  // Get user orders
  getMyOrders: async (authToken: string) => {
    try {
      const response = await fetch(`${BASE_URL}/myOrderData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error("Error fetching orders:", error)
      return {
        success: false,
        error: "Failed to fetch orders. Please try again.",
        orderData: { order_data: [] },
      }
    }
  },
}
