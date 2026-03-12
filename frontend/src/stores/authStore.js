import { defineStore } from 'pinia';
import apiClient from '../services/apiClient.js';

// 🔐 AUTH STORE - Frontend JWT Management

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('jwt_token') || null,        // ← Harmonisiert mit EmployeeApp.vue
        user: null,
        isLoading: false,
        error: null                                              // ← Harmonisiert mit EmployeeApp.vue
    }),

    getters: {
        isAuthenticated: (state) => !!state.token && !state.isTokenExpired,

        hasAdminRole: (state) => {                               // ← Harmonisiert mit EmployeeApp.vue
            if (!state.token) return false;
            try {
                const payload = JSON.parse(atob(state.token.split('.')[1]));
                console.log('Getter payload:', payload);
                return payload.admin && (payload.admin === 'true' || payload.admin === true);             // ← Backend verwendet customClaim 'admin'
            } catch {
                return false;
            }
        },

        isTokenExpired: (state) => {
            if (!state.token) return true;
            try {
                const payload = JSON.parse(atob(state.token.split('.')[1]));
                const expiry = payload.exp * 1000;
                return Date.now() > expiry;
            } catch {
                return true;
            }
        }
    },

    actions: {
        // ✅ Neue "login" Methode für Kompatibilität mit EmployeeApp.vue
        async login(credentials) {
            this.isLoading = true;
            this.error = null;

            try {
                console.log('🔐 Auth: Creating JWT token...');
                
                const response = await apiClient.post('/auth/token', credentials);

                // ✅ Backend Response-Struktur angepasst
                this.token = response.data.data.token;           // Backend: { "message": "...", "data": { "token": "..." } }
                this.setUserFromToken(this.token);
                localStorage.setItem('jwt_token', this.token);

                console.log('✅ JWT Token created successfully');
                console.log(`🔍 Token expires in ${response.data.data.expiresIn} seconds`);
                console.log(`👤 User: ${response.data.data.user}, Claims: ${response.data.data.claimsCount}`);
                
                return { 
                    success: true, 
                    token: this.token,
                    message: response.data.message,
                    expiresIn: response.data.data.expiresIn,
                    user: response.data.data.user
                };
            } catch (error) {
                console.error('❌ Login failed:', error);
                this.error = error.response?.data?.Message || error.message || 'Login failed';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // ✅ Für Backward-Kompatibilität mit bestehendem Code
        async createToken(tokenRequest) {
            return await this.login({
                username: tokenRequest.username,
                password: tokenRequest.password || 'defaultPassword', // Dummy password for token creation
                email: tokenRequest.email,
                // userId: tokenRequest.userId,
                customClaims: tokenRequest.customClaims || {}
            });
        },

        setUserFromToken(token) {
            if (!token) return;
            
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.user = {
                    username: payload.sub || payload.username,
                    email: payload.email,
                    // userId: payload.userId,
                    isAdmin: payload.admin && (payload.admin === 'true' || payload.admin === true)
                };
            } catch (error) {
                console.error('Error decoding JWT token:', error);
                this.user = null;
            }
        },

        // ✅ Test-Methoden für EmployeeApp.vue
        async testPublicRoute() {
            try {
                console.log('🔓 Testing public auth route...');
                const response = await apiClient.get('/auth/public');
                return response.data;
            } catch (error) {
                console.error('❌ Public route test failed:', error);
                throw error;
            }
        },

        async testProtectedRoute() {
            if (!this.token) throw new Error('No JWT token available');

            try {
                console.log('🔒 Testing protected auth route...');
                const response = await apiClient.get('/auth/protected');
                return response.data;
            } catch (error) {
                console.error('❌ Protected route test failed:', error);
                throw error;
            }
        },

        logout() {
            this.token = null;
            this.user = null;
            this.error = null;
            localStorage.removeItem('jwt_token');
            console.log('🚪 Logged out successfully');
        },

        // ✅ Neue setError Methode hinzufügen
        setError(errorMessage) {
            this.error = errorMessage;
            console.error('🔴 Auth Error:', errorMessage);
        },

        // ✅ Error löschen
        clearError() {
            this.error = null;
        },

        async refreshTokenIfNeeded() {
            if (this.token && this.isTokenExpired) {
                console.log('🔄 Token expired, logging out...');
                this.logout();
            }
        }
    }
});