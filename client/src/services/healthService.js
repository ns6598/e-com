import api from './api'

/**
 * Health check service to test backend connectivity
 */
export const healthService = {
  checkHealth: async () => {
    return api.get('/health')
  },
}

export default healthService
