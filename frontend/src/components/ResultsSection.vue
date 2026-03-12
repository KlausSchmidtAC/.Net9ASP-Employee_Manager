<!-- ResultsSection.vue - Feedback, Error, Success und Ergebnistabelle -->
<template>
  <section class="results-section">
    <h2>📊 Results</h2>

    <!-- Error Display -->
    <div v-if="error" class="error-display">
      <h4>❌ Error:</h4>
      <p>{{ error }}</p>
    </div>

    <!-- Auth Error Display -->
    <div v-if="authStore.error" class="alert alert-danger" role="alert">
      🔴 Authentication Error: {{ authStore.error }}
      <button @click="authStore.clearError()" class="btn btn-sm btn-outline-danger ms-2">
        ✕ Dismiss
      </button>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-display">
      <h4>✅ Success:</h4>
      <p>{{ successMessage }}</p>
    </div>

    <!-- Results Table -->
    <div v-if="results.length > 0" class="results-table-container">
      <h4 class="mb-20">📋 Employee Data ({{ results.length }} records):</h4>
      <table class="results-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Birth Date</th>
            <th>Age</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in results" :key="employee.id" :class="{ 'inactive': !employee.IsActive }">
            <td class="font-bold">{{ employee.id }}</td>
            <td>{{ employee.FirstName }}</td>
            <td>{{ employee.LastName }}</td>
            <td>{{ formatDate(employee.BirthDate) }}</td>
            <td>{{ calculateAge(employee.BirthDate) }}</td>
            <td>
              <span :class="employee.IsActive ? 'status-active' : 'status-inactive'">
                {{ employee.IsActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State mit Zusatznachricht -->
    <div v-else-if="!isLoading && !error" class="empty-state">
      <p>📭 No data to display. Database is empty.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="empty-state">
      <p>📭 No data to display. Execute a request to see results.</p>
    </div>
  </section>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'

// Props
defineProps({
  results: {
    type: Array,
    default: () => []
  },
  error: {
    type: String,
    default: null
  },
  successMessage: {
    type: String,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()

// Helper Methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('de-DE')
}

const calculateAge = (birthDate) => {
  if (!birthDate) return 'N/A'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
</script>

<style src="../styles/ResultsSection.css" scoped></style>
