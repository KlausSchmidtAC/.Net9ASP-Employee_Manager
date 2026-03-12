<!-- EmployeeApp.vue - Main Container für Clean Architecture RRR -->
<template>
  <div class="app-container">
    <!-- Header -->
    <header class="app-header">
      <h1>🏢 Employee Management API Tester</h1>
      <p>Vue.js + Pinia + Clean Architecture Demo</p>
    </header>

    <!-- 1. AUTH SECTION -->
    <section class="auth-section">
      <!-- JWT Authentication Section -->
      <div class="card mt-4">
        <div class="card-header">
          <h3>🔐 JWT Authentication</h3>
        </div>
        <div class="card-body">
          <!-- JWT Token Status -->
          <div class="form-group">
            <div class="alert alert-info">
              <strong>🔐 JWT Token Status:</strong>
              <span :class="authStore.isAuthenticated ? 'text-success' : 'text-danger'">
                {{ authStore.isAuthenticated ? '✅ Token Active & Valid' : '❌ No Valid Token' }}
              </span>
              <div v-if="authStore.isAuthenticated && decodedToken" class="mt-2">
                <small class="text-muted">
                  Expires: {{ decodedToken.exp ? new Date(decodedToken.exp * 1000).toLocaleString() : 'N/A' }}
                </small>
              </div>
            </div>
          </div>

          <!-- JWT Generation Parameters -->
          <h5>🔑 Token Generation Parameters:</h5>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="jwtUsername">Username *:</label>
                <input v-model="authData.username" type="text" id="jwtUsername" class="form-control"
                  placeholder="Enter username" required />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="jwtPassword">Password *:</label>
                <input v-model="authData.password" type="password" id="jwtPassword" class="form-control"
                  placeholder="Enter password" required />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="jwtEmail">Email *:</label>
                <input v-model="authData.email" type="email" id="jwtEmail" class="form-control"
                  placeholder="user@example.com" required />
              </div>
            </div>
            <!--
            <div class="col-md-6">
              <div class="form-group">
                <label for="jwtUserId">User ID *:</label>
                <input v-model="authData.userId" type="text" id="jwtUserId" class="form-control"
                  placeholder="Enter user ID (e.g. 12345)" required />
              </div>
            </div>
          -->
          </div>
          <!-- Custom Claims Section -->
          <div class="form-group">
            <label>🏷️ Custom Claims:</label>
            <div class="custom-claims-container">
              <div v-for="(claim, index) in authData.customClaims" :key="index" class="custom-claim-row">
                <div class="row">
                  <div class="col-md-5">
                    <input v-model="claim.key" type="text" class="form-control" placeholder="Claim key (e.g. 'role')" />
                  </div>
                  <div class="col-md-5">
                    <input v-model="claim.value" type="text" class="form-control"
                      placeholder="Claim value (e.g. 'Admin')" />
                  </div>
                  <div class="col-md-2">
                    <button @click="removeCustomClaim(index)" class="btn btn-sm btn-outline-danger" type="button">
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add Custom Claim Button -->
              <button @click="addCustomClaim" class="btn btn-sm btn-outline-primary mt-2" type="button">
                ➕ Add Custom Claim
              </button>
            </div>

            <!-- Predefined Claims Quick Add -->
            <div class="predefined-claims mt-3">
              <small class="text-muted">Quick add common claims:</small><br>
              <button @click="addRoleClaim('Admin')" class="btn btn-sm btn-outline-secondary me-2" type="button">
                + Admin Role
              </button>
              <button @click="addRoleClaim('User')" class="btn btn-sm btn-outline-secondary me-2" type="button">
                + User Role
              </button>
              <button @click="addRoleClaim('Manager')" class="btn btn-sm btn-outline-secondary" type="button">
                + Manager Role
              </button>
            </div>
          </div>

          <!-- JWT Action Buttons -->
          <div class="btn-toolbar mt-3" role="toolbar">
            <div class="btn-group me-2" role="group">
              <button @click="generateJWT" class="btn btn-primary" :disabled="!canGenerateToken || authStore.isLoading">
                {{ authStore.isLoading ? 'Generating...' : '🔐 Generate JWT Token' }}
              </button>
              <button @click="validateJWT" class="btn btn-info" :disabled="!authStore.token">
                ✅ Validate Token
              </button>
            </div>
            <div class="btn-group me-2" role="group">
              <button @click="copyTokenToClipboard" class="btn btn-secondary" :disabled="!authStore.token">
                📋 Copy Token (Secure)
              </button>
              <button @click="clearJWTData" class="btn btn-warning">
                🧹 Clear All
              </button>
            </div>
          </div>

          <!-- JWT Token Information -->
          <div v-if="authStore.token && decodedToken" class="mt-3">
            <div class="alert alert-info">
              <h6>🔍 Current Token Information:</h6>
              <p><strong>Username:</strong> {{ decodedToken.username || decodedToken.sub || 'N/A' }}</p>
              <p><strong>Email:</strong> {{ decodedToken.email || 'N/A' }}</p>
              <!--<p><strong>User ID:</strong> {{ decodedToken.userId || decodedToken.uid || 'N/A' }}</p>-->
              <p><strong>Issued:</strong> {{ decodedToken.iat ? new Date(decodedToken.iat * 1000).toLocaleString() :
                'N/A' }}</p>
              <p><strong>Expires:</strong> {{ decodedToken.exp ? new Date(decodedToken.exp * 1000).toLocaleString() :
                'N/A' }}</p>
              <p><strong>Valid:</strong>
                <span :class="authStore.isAuthenticated ? 'text-success' : 'text-danger'">
                  {{ authStore.isAuthenticated ? 'Yes' : 'No' }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Auth Test Buttons -->
      <div class="auth-test-buttons">
        <button @click="testPublicRoute" class="test-btn public">
          Test Public Route
        </button>
        <button @click="testProtectedRoute" class="test-btn protected" :disabled="!authStore.token">
          Test Protected Route
        </button>
      </div>
    </section>

    <!-- 2. SEARCH & FILTER -->
    <section class="search-section">
      <h2>🔍 Search & Filter</h2>

      <!-- Search Type Selection -->
      <div class="search-selection">
        <label for="searchType">Filter Options:</label>
        <select v-model="searchSettings.searchType" id="searchType" class="search-select">
          <option value="all">📋 Get All Employees</option>
          <option value="byId">🆔 Get by ID</option>
          <option value="byLastName">👤 Search by Last Name</option>
          <option value="activeOnly">✅ Get Active Only</option>
          <option value="byBirthDate">📅 Search older than BirthDate</option>
        </select>
      </div>

      <!-- Search Term Input -->
      <div v-if="['byLastName', 'byBirthDate'].includes(searchSettings.searchType)" class="form-group">
        <label for="searchTerm">
          {{ searchSettings.searchType === 'byLastName' ? 'Last Name:' : 'Birth Date (YYYY-MM-DD):' }}
        </label>
        <input v-model="searchSettings.searchTerm" :type="searchSettings.searchType === 'byBirthDate' ? 'date' : 'text'"
          id="searchTerm" class="form-control"
          :placeholder="searchSettings.searchType === 'byBirthDate' ? 'YYYY-MM-DD' : 'Enter last name...'" />
      </div>

      <!-- Employee ID Input for byId -->
      <div v-if="searchSettings.searchType === 'byId'" class="form-group">
        <label for="employeeId">Employee ID:</label>
        <input v-model.number="searchSettings.employeeId" type="number" id="employeeId" class="form-control"
          placeholder="Enter employee ID" />
      </div>
    </section>

    <!-- 3. SEARCH EXECUTION -->
    <section class="execute-section">
      <button @click="executeSearch" :disabled="employeeStore.isLoading" class="execute-btn">
        {{ employeeStore.isLoading ? 'Searching...' : '🔍 Search Employees' }}
      </button>
      <button @click="clearResults" class="clear-btn">
        Clear Results
      </button>
    </section>

    <!-- 3. CHANGE EXECUTION -->
    <section class="change-section">
      <h2>🔍 Add & Delete & Patch Employees</h2>

      <!-- Change Type Selection -->
      <div class="change-selection">
        <label for="changeType">Select operation:</label>
        <select v-model="changeSettings.changeType" id="changeType" class="change-select">
          <option value="add">Add Employee</option>
          <option value="delete">Delete Employee</option>
          <option value="patch">Patch Employee</option>
        </select>
      </div>

      <!-- Change Term Input -->
      <div v-if="['add', 'patch'].includes(changeSettings.changeType)" class="form-group">
        <label for="firstNameInput">First Name:</label>
        <input v-model="changeSettings.employeeData.FirstName" type="text" id="firstNameInput" class="form-control"
          placeholder="Enter first name..." />
      </div>

      <div v-if="['add', 'patch'].includes(changeSettings.changeType)" class="form-group">
        <label for="lastNameInput">Last Name:</label>
        <input v-model="changeSettings.employeeData.LastName" type="text" id="lastNameInput" class="form-control"
          placeholder="Enter last name..." />
      </div>

      <div v-if="['add', 'patch'].includes(changeSettings.changeType)" class="form-group">
        <label for="birthdateInput">Birthdate:</label>
        <input v-model="changeSettings.employeeData.BirthDate" type="date" id="birthdateInput" class="form-control"
          placeholder="YYYY-MM-DD" />
      </div>

      <div v-if="['add', 'patch'].includes(changeSettings.changeType)" class="form-group">
        <label for="isActiveSwitch" class="form-label">
          Employment Status:
        </label>
        <label class="switch">
          <input type="checkbox" id="isActiveSwitch" v-model="changeSettings.employeeData.IsActive">
          <span class="slider round"></span>
        </label>
        <span class="toggle-label">
          {{ changeSettings.employeeData.IsActive ? 'Active' : 'Inactive' }}
        </span>
      </div>

      <!-- Employee ID Input for Delete -->
      <div v-if="['delete', 'patch'].includes(changeSettings.changeType)" class="form-group">
        <label for="employeeId">Employee ID:</label>
        <input v-model.number="changeSettings.employeeId" type="number" id="employeeId" class="form-control"
          placeholder="Enter employee ID" />
      </div>
    </section>

    <!-- 4. EXECUTION BUTTONS -->

    <section class="execute-section">
      <button @click="executeChanges" :disabled="employeeStore.isLoading" class="execute-btn">
        {{ employeeStore.isLoading ? 'Executing...' : 'Execute selected action' }}
      </button>
      <button @click="clearResults" class="clear-btn">
        Clear Results
      </button>
    </section>

    <!-- 5. RESULTS SECTION -->
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
      <div v-else-if="!employeeStore.isLoading && !error" class="empty-state">
        <p>📭 No data to display. Database is empty.</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!employeeStore.isLoading" class="empty-state">
        <p>📭 No data to display. Execute a request to see results.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useEmployeeStore } from '@/stores/employeeStore'
import { useAuthStore } from '@/stores/authStore'

// Stores
const employeeStore = useEmployeeStore()
const authStore = useAuthStore()

// Reactive Data
const authData = ref({
  username: 'admin',
  password: 'password123',
  email: 'admin@example.com',
  // userId: '12345',
  customClaims: [
    { key: 'admin', value: 'false' },
    { key: 'department', value: 'IT' }
  ],
  issuer: 'http://localhost:5100',
  audience: 'http://localhost:5100',
  expirationMinutes: 60
})

const searchSettings = ref({
  searchType: 'all',
  searchTerm: '',
  employeeId: null
})

const changeSettings = ref({
  changeType: 'add',
  employeeId: null,
  employeeData: {}
})

const results = ref([])
const error = ref(null)
const successMessage = ref(null)

// Computed Properties
const canGenerateToken = computed(() => {
  return authData.value.username &&
    authData.value.password &&
    authData.value.email
  // && authData.value.userId
})

const decodedToken = computed(() => {
  if (!authStore.token) return null

  try {
    const parts = authStore.token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
})

// JWT Methods
const generateJWT = async () => {
  try {
    console.log('🔐 Generating JWT token...')

    const customClaimsObject = {}
    authData.value.customClaims.forEach(claim => {
      if (claim.key && claim.value) {
        customClaimsObject[claim.key] = claim.value
      }
    })

    const tokenRequest = {
      username: authData.value.username,
      password: authData.value.password,
      email: authData.value.email,
      // userId: authData.value.userId,
      customClaims: customClaimsObject
    }

    console.log('🔍 Token request payload:', tokenRequest)

    const result = await authStore.createToken(tokenRequest)

    if (result.success && result.token) {
      successMessage.value = `JWT Token generated successfully! Expires in ${authData.value.expirationMinutes} minutes.`
      error.value = null
    } else {
      throw new Error(result.message || 'Failed to generate token')
    }

  } catch (err) {
    console.error('❌ Error generating JWT:', err)
    error.value = `Error generating JWT: ${err.message}`
    successMessage.value = null
  }
}

const addCustomClaim = () => {
  authData.value.customClaims.push({ key: '', value: '' })
}

const removeCustomClaim = (index) => {
  authData.value.customClaims.splice(index, 1)
}

const addRoleClaim = (role) => {
  const existingRoleIndex = authData.value.customClaims.findIndex(claim => claim.key === 'role')

  if (existingRoleIndex >= 0) {
    authData.value.customClaims[existingRoleIndex].value = role
  } else {
    authData.value.customClaims.push({ key: 'role', value: role })
  }
}

const validateJWT = () => {
  try {
    const isValid = authStore.isAuthenticated
    const decoded = decodedToken.value

    if (isValid && decoded) {
      successMessage.value = `✅ Token is valid! User: ${decoded.username}, Role: ${decoded.role || 'N/A'}`
      error.value = null
    } else {
      throw new Error('Token is invalid or expired')
    }

  } catch (err) {
    error.value = `❌ Token validation failed: ${err.message}`
    successMessage.value = null
  }
}

const copyTokenToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(authStore.token)
    successMessage.value = '📋 Token copied to clipboard!'
    setTimeout(() => { successMessage.value = null }, 3000)
  } catch (err) {
    error.value = '❌ Failed to copy token to clipboard'
  }
}

const clearJWTData = () => {
  authData.value.username = ''
  authData.value.password = ''
  authData.value.email = ''
  // authData.value.userId = ''
  authData.value.customClaims = []
  authStore.logout()
  successMessage.value = '🧹 JWT data cleared'
  error.value = null
}

const testPublicRoute = async () => {
  try {
    error.value = null
    successMessage.value = null

    const response = await authStore.testPublicRoute()
    successMessage.value = `Public route test successful: ${response.Message || response.message || 'OK'}`
  } catch (err) {
    error.value = `Public route test failed: ${err.response?.data?.Message || err.message}`
  }
}

const testProtectedRoute = async () => {
  try {
    error.value = null
    successMessage.value = null

    const response = await authStore.testProtectedRoute()
    successMessage.value = `Protected route test successful: ${response.Message || response.message || 'OK'}`
  } catch (err) {
    error.value = `Protected route test failed: ${err.response?.data?.Message || err.message}`
  }
}

const executeSearch = async () => {
  try {
    error.value = null
    successMessage.value = null

    const result = await executeGetRequest()

    if (result?.success) {
      if (result.data) {
        results.value = Array.isArray(result.data) ? result.data : [result.data]
      }
      successMessage.value = `Search operation successful!` + (result.message ? ' ' + result.message : '')
    }
  } catch (err) {
    error.value = `Search failed: ${err.message}`
  }
}

const executeGetRequest = async () => {
  if (searchSettings.value.searchType === 'all') {
    const allResult = await employeeStore.loadAllEmployees()
    return { success: allResult.success, data: employeeStore.employees, message: `Loaded ${employeeStore.employees.length} employees` }
  } else if (searchSettings.value.searchType === 'byId') {
    if (!searchSettings.value.employeeId) throw new Error('Employee ID is required')
    const byIdResult = await employeeStore.loadEmployeeById(searchSettings.value.employeeId, false)
    return { success: byIdResult.success, data: byIdResult.employee, message: `Employee loaded: ${byIdResult.employee?.FirstName} ${byIdResult.employee?.LastName}` }
  } else if (searchSettings.value.searchType === 'byLastName') {
    if (!searchSettings.value.searchTerm) throw new Error('Last name is required')
    const searchResult = await employeeStore.searchEmployees(searchSettings.value.searchTerm)
    return { success: searchResult.success, data: searchResult.results, message: `Found ${searchResult.count} employees` }
  } else if (searchSettings.value.searchType === 'activeOnly') {
    const activeResult = await employeeStore.searchEmployees('isActive')
    return { success: activeResult.success, data: activeResult.results, message: `Found ${activeResult.count} active employees` }
  } else if (searchSettings.value.searchType === 'byBirthDate') {
    if (!searchSettings.value.searchTerm) {
      throw new Error('Birth date is required')
    }

    const selectedDate = new Date(searchSettings.value.searchTerm);
    const today = new Date();

    if (selectedDate > today) {
      throw new Error('Birth date cannot be in the future')
    }

    const birthDateResult = await employeeStore.getEmployeesByBirthDate(searchSettings.value.searchTerm)
    return {
      success: birthDateResult.success,
      data: birthDateResult.employees,
      message: birthDateResult.message
    }
  } else {
    throw new Error('Invalid search type')
  }
}


const executePostPutDeleteRequest = async () => {
  if (changeSettings.value.changeType === 'add') {
    const addResult = await employeeStore.createEmployee(changeSettings.value.employeeData)
    return { success: addResult.success, data: addResult.employee, message: addResult.message }
  } else if (changeSettings.value.changeType === 'delete') {
    if (!changeSettings.value.employeeId) throw new Error('Employee ID is required for deletion')
    const deleteResult = await employeeStore.deleteEmployee(changeSettings.value.employeeId)
    return { success: deleteResult.success, message: deleteResult.message }
  } else if (changeSettings.value.changeType === 'patch') {
    if (!changeSettings.value.employeeId) throw new Error('Employee ID is required for patching')
    const patchResult = await employeeStore.updateEmployee(changeSettings.value.employeeId, changeSettings.value.employeeData)
    return { success: patchResult.success, data: patchResult.employee, message: patchResult.message }
  } else {
    throw new Error('Invalid change type')
  }
}

const executeChanges = async () => {
  try {
    error.value = null
    successMessage.value = null

    const result = await executePostPutDeleteRequest()

    if (result?.success) {
      if (result.data) {
        results.value = [result.data]
      }
      let op = changeSettings.value.changeType;
      let opText = '';
      if (op === 'add') opText = 'Add';
      else if (op === 'delete') opText = 'Delete';
      else if (op === 'patch') opText = 'Patch';
      let extra = '';
      if (op === 'delete') extra = ' The deleted employee is shown below.';
      successMessage.value = `${opText} operation successful!${extra}` + (result.message ? ' ' + result.message : '')
    }
  } catch (err) {
    error.value = `Operation failed: ${err.message}`
  }
}


const clearResults = () => {
  results.value = []
  error.value = null
  successMessage.value = null
}

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

