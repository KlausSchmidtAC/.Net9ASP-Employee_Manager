<!-- LoginForm.vue - Sicheres Login-Formular vor dem Employee Management -->
<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h2>🔐 Employee Management</h2>
        <p>Please log in to continue</p>
      </div>

      <form @submit.prevent="onLogin" class="login-form">
        <!-- Username -->
        <div class="form-group">
          <label for="loginUsername">Username</label>
          <input
            v-model="credentials.username"
            type="text"
            id="loginUsername"
            class="form-control"
            placeholder="Enter username"
            autocomplete="username"
            required
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="loginPassword">Password</label>
          <input
            v-model="credentials.password"
            type="password"
            id="loginPassword"
            class="form-control"
            placeholder="Enter password"
            autocomplete="current-password"
            required
          />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="loginEmail">Email</label>
          <input
            v-model="credentials.email"
            type="email"
            id="loginEmail"
            class="form-control"
            placeholder="user@example.com"
            autocomplete="email"
            required
          />
        </div>

        <!-- Role (Admin / User) -->
        <div class="form-group">
          <label for="loginRole">Role</label>
          <select v-model="credentials.role" id="loginRole" class="form-control">
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <!-- Error Feedback -->
        <div v-if="errorMessage" class="login-error">
          ❌ {{ errorMessage }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="login-submit-btn"
          :disabled="authStore.isLoading || !canLogin"
        >
          {{ authStore.isLoading ? 'Logging in...' : '🔓 Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits(['login-success'])

const authStore = useAuthStore()

const credentials = ref({
  username: '',
  password: '',
  email: '',
  role: 'User'
})

const errorMessage = ref(null)

const canLogin = computed(() => {
  return credentials.value.username &&
    credentials.value.password &&
    credentials.value.email
})

const onLogin = async () => {
  errorMessage.value = null
  try {
    const tokenRequest = {
      username: credentials.value.username,
      password: credentials.value.password,
      email: credentials.value.email,
      customClaims: {
        role: credentials.value.role,
        admin: credentials.value.role === 'Admin' ? 'true' : 'false'
      }
    }

    const result = await authStore.createToken(tokenRequest)

    if (result.success && result.token) {
      emit('login-success')
    } else {
      errorMessage.value = result.message || 'Login failed. Please check your credentials.'
    }
  } catch (err) {
    errorMessage.value = `Login error: ${err.message}`
  }
}
</script>

<style src="../styles/LoginForm.css" scoped></style>
