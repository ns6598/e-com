import axios from 'axios'

/**
 * AUREVA Atelier API Client
 * Centralized Axios instance configured with environment-based base URL,
 * withCredentials for secure cookie exchange, and standard error interceptors.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

// Request interceptor: attach bearer token if present in storage as backup to cookies
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('aureva_auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Storage access gracefully handled
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: unwrap response and format standard errors
api.interceptors.response.use(
  (response) => {
    // Return standard payload
    return response.data
  },
  (error) => {
    const errorResponse = {
      success: false,
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected network communication error occurred',
      status: error.response?.status || 500,
      details: error.response?.data?.error?.details || null,
    }
    return Promise.reject(errorResponse)
  }
)

export default api
