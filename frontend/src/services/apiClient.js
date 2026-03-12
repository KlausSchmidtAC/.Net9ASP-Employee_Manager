// Infastructure Layer: Axios API Client with JWT Interceptor

import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const apiClient = axios.create({
  baseURL: 'http://localhost:5100/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// ✅ JWT Token Interceptor (automatisch für alle Requests)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token')  // ✅ Harmonisiert mit AuthStore
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Response Interceptor für Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // AuthStore für logout und Error-Handling
      const authStore = useAuthStore()
      authStore.logout() // Entfernt Token und setzt State zurück
      
      // User-Benachrichtigung über Store UND Alert
      authStore.setError('JWT Token expired. Please login again.')
      alert('🔒 Session expired. Please login again.')
      
      console.warn('🔒 JWT Token expired, redirecting to login')
    } 
    return Promise.reject(error)
  }
)

export default apiClient


