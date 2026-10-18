import axios from 'axios'

/**
 * AUREVA Atelier API Client
 * Centralized Axios instance configured with environment-based base URL,
 * withCredentials for secure cookie exchange, and standard error interceptors.
 *
 * In production deployments:
 * 1. Uses VITE_API_URL environment variable if configured (e.g. deployed backend URL).
 * 2. If VITE_API_URL is omitted and running in production, uses relative '/api'
 *    to avoid Mixed Content browser security blocks against http://localhost:5000.
 * 3. In local development, falls back to 'http://localhost:5000/api'.
 */
const rawApiUrl = import.meta.env.VITE_API_URL
const API_BASE_URL = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '')
  : import.meta.env.PROD
  ? '/api'
  : 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // 6s timeout so catalog fallbacks trigger rapidly if backend is unreachable
  timeout: 6000,
})

// Request interceptor: attach bearer token and persistent anonymous session ID
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('aureva_auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      let sessionId = localStorage.getItem('aureva_session_id')
      if (!sessionId) {
        sessionId = `sess_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`
        localStorage.setItem('aureva_session_id', sessionId)
      }
      config.headers['x-session-id'] = sessionId
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
