<!-- EmployeeApp.vue - Main Container (Clean Architecture) -->
<template>
  <div>

    <!-- LOGIN FORM – wird angezeigt solange kein gültiger Token vorhanden -->
    <LoginForm
      v-if="!authStore.isAuthenticated"
      @login-success="onLoginSuccess"
    />

    <!-- MAIN APP – nur sichtbar nach erfolgreicher Authentifizierung -->
    <div v-else class="app-container">
      <!-- Header -->
      <header class="app-header">
        <div class="app-header-text">
          <h1>🏢 Employee Management API Tester</h1>
          <p>Vue.js + Pinia + Clean Architecture Demo</p>
        </div>
        <button @click="onLogout" class="btn btn-sm btn-outline-light logout-btn">
          🚪 Logout
        </button>
      </header>

      <!-- 1. AUTH SECTION (Token-Verwaltung für API-Tests) -->
      <AuthSection
        @success="onSuccess"
        @error="onError"
      />

      <!-- 2. SEARCH + CHANGE SIDE BY SIDE -->
      <div class="sections-grid">
        <SearchSection
          @results="onResults"
          @success="onSuccess"
          @error="onError"
          @clear="clearResults"
        />
        <div class="sections-divider" aria-hidden="true"></div>
        <ChangeSection
          @results="onResults"
          @success="onSuccess"
          @error="onError"
          @clear="clearResults"
        />
      </div>

      <!-- 3. RESULTS SECTION -->
      <ResultsSection
        :results="results"
        :error="error"
        :successMessage="successMessage"
        :isLoading="employeeStore.isLoading"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useEmployeeStore } from '@/stores/employeeStore'
import { useAuthStore } from '@/stores/authStore'

import LoginForm from '@/components/LoginForm.vue'
import AuthSection from '@/components/AuthSection.vue'
import SearchSection from '@/components/SearchSection.vue'
import ChangeSection from '@/components/ChangeSection.vue'
import ResultsSection from '@/components/ResultsSection.vue'

// Stores
const employeeStore = useEmployeeStore()
const authStore = useAuthStore()

// Shared State für Feedback und Ergebnisse
const results = ref([])
const error = ref(null)
const successMessage = ref(null)

// Login / Logout
const onLoginSuccess = () => {
  clearResults()
  successMessage.value = `Welcome, ${authStore.token ? JSON.parse(atob(authStore.token.split('.')[1])).username : ''}! You are now logged in.`
  setTimeout(() => { successMessage.value = null }, 4000)
}

const onLogout = () => {
  authStore.logout()
  clearResults()
}

// Event Handler von Kind-Komponenten
const onResults = (data) => {
  results.value = data
  error.value = null
}

const onSuccess = (message) => {
  successMessage.value = message
  error.value = null
  // Automatisch ausblenden nach 5 Sekunden
  setTimeout(() => { successMessage.value = null }, 5000)
}

const onError = (message) => {
  error.value = message
  successMessage.value = null
}

const clearResults = () => {
  results.value = []
  error.value = null
  successMessage.value = null
}

// Auth-Errors automatisch nach 5 Sekunden ausblenden
watchEffect(() => {
  if (authStore.error) {
    setTimeout(() => {
      authStore.clearError()
    }, 5000)
  }
})

// Initialize on mount
onMounted(() => {
  console.log('🚀 Employee API Tester initialized')
  if (authStore.refreshTokenIfNeeded) {
    authStore.refreshTokenIfNeeded()
  }
})
</script>

<style src="./styles/EmployeeApp.css" scoped></style>
