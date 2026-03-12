<!-- AuthSection.vue - Token Info & Developer Tools -->
<template>
  <section class="auth-section">
    <div class="token-info-card">

      <!-- Linke Spalte: Status + Token-Details -->
      <div class="token-info-left">

        <!-- Status Badge -->
        <div class="token-status-row">
          <span class="token-status-label">🔐 Status:</span>
          <span :class="authStore.isAuthenticated ? 'badge-active' : 'badge-inactive'">
            {{ authStore.isAuthenticated ? '✅ Active' : '❌ No Token' }}
          </span>
          <span v-if="decodedToken?.exp" class="token-expiry">
            Exp: {{ new Date(decodedToken.exp * 1000).toLocaleTimeString() }}
          </span>
        </div>

        <!-- Token Details Grid -->
        <div v-if="authStore.token && decodedToken" class="token-details-grid">
          <span class="td-label">User</span>
          <span class="td-value">{{ decodedToken.username || decodedToken.sub || '—' }}</span>

          <span class="td-label">Email</span>
          <span class="td-value">{{ decodedToken.email || '—' }}</span>

          <span class="td-label">Role</span>
          <span class="td-value">{{ decodedToken.role || '—' }}</span>

          <span class="td-label">Admin</span>
          <span :class="decodedToken.admin === 'true' ? 'td-value text-success' : 'td-value text-muted'">
            {{ decodedToken.admin === 'true' ? '✅ Yes' : 'No' }}
          </span>

          <span class="td-label">Issued</span>
          <span class="td-value">{{ decodedToken.iat ? new Date(decodedToken.iat * 1000).toLocaleString() : '—' }}</span>

          <span class="td-label">Expires</span>
          <span class="td-value">{{ decodedToken.exp ? new Date(decodedToken.exp * 1000).toLocaleString() : '—' }}</span>
        </div>

        <!-- Raw Token -->
        <div v-if="authStore.token" class="token-raw-row">
          <button @click="showToken = !showToken" class="btn-token-toggle">
            {{ showToken ? '🙈 Hide Token' : '👁 Show Token' }}
          </button>
          <code v-if="showToken" class="token-raw-code">{{ authStore.token }}</code>
          <code v-else class="token-raw-code text-muted">{{ tokenPreview }}</code>
        </div>

      </div>

      <!-- Rechte Spalte: Aktionen -->
      <div class="token-info-right">
        <p class="token-actions-label">🛠 Actions</p>
        <button @click="validateJWT" class="token-action-btn validate" :disabled="!authStore.token">
          ✅ Validate
        </button>
        <button @click="copyTokenToClipboard" class="token-action-btn copy" :disabled="!authStore.token">
          📋 Copy Token
        </button>
        <hr class="token-action-divider" />
        <p class="token-actions-label">🧪 Dev Tests</p>
        <button @click="testPublicRoute" class="token-action-btn public">
          🌐 Public Route
        </button>
        <button @click="testProtectedRoute" class="token-action-btn protected" :disabled="!authStore.token">
          🔒 Protected Route
        </button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const showToken = ref(false)

const emit = defineEmits(['success', 'error'])

const authStore = useAuthStore()

const decodedToken = computed(() => {
  if (!authStore.token) return null
  try {
    const parts = authStore.token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1]))
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
})

const tokenPreview = computed(() => {
  if (!authStore.token) return ''
  const parts = authStore.token.split('.')
  // Nur Header + Payload-Anfang anzeigen, Signature maskieren
  return `${parts[0]}.${parts[1].substring(0, 12)}…[signature hidden]`
})

const validateJWT = () => {
  try {
    if (authStore.isAuthenticated && decodedToken.value) {
      const decoded = decodedToken.value
      emit('success', `✅ Token is valid! User: ${decoded.sub || decoded.username}, Role: ${decoded.role || 'N/A'}, Admin: ${decoded.admin === 'true' ? 'Yes' : 'No'}`)
    } else {
      throw new Error('Token is invalid or expired')
    }
  } catch (err) {
    emit('error', `❌ Token validation failed: ${err.message}`)
  }
}

const copyTokenToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(authStore.token)
    emit('success', '📋 Token copied to clipboard!')
  } catch (err) {
    emit('error', '❌ Failed to copy token to clipboard')
  }
}

const testPublicRoute = async () => {
  try {
    const response = await authStore.testPublicRoute()
    emit('success', `Public route test successful: ${response.Message || response.message || 'OK'}`)
  } catch (err) {
    emit('error', `Public route test failed: ${err.response?.data?.Message || err.message}`)
  }
}

const testProtectedRoute = async () => {
  try {
    const response = await authStore.testProtectedRoute()
    emit('success', `Protected route test successful: ${response.Message || response.message || 'OK'}`)
  } catch (err) {
    emit('error', `Protected route test failed: ${err.response?.data?.Message || err.message}`)
  }
}
</script>

<style src="../styles/AuthSection.css" scoped></style>
