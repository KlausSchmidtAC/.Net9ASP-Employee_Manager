<!-- SearchSection.vue - Search & Filter -->
<template>
  <div class="ops-card">
    <section class="search-section">
      <h2>🔍 Search & Filter</h2>

      <div class="ops-layout">
        <!-- Linke Spalte: Formular -->
        <div class="ops-form">

          <div class="ops-field">
            <label for="searchType">Filter:</label>
            <select v-model="searchSettings.searchType" id="searchType" class="ops-select">
              <option value="all">📋 Get All Employees</option>
              <option value="byId">🆔 Get by ID</option>
              <option value="byLastName">👤 Search by Last Name</option>
              <option value="activeOnly">✅ Get Active Only</option>
              <option value="byBirthDate">📅 Older than BirthDate</option>
            </select>
          </div>

          <div v-if="['byLastName', 'byBirthDate'].includes(searchSettings.searchType)" class="ops-field">
            <label for="searchTerm">
              {{ searchSettings.searchType === 'byLastName' ? 'Last Name:' : 'Birth Date:' }}
            </label>
            <input v-model="searchSettings.searchTerm"
              :type="searchSettings.searchType === 'byBirthDate' ? 'date' : 'text'"
              id="searchTerm" class="ops-input"
              :placeholder="searchSettings.searchType === 'byBirthDate' ? 'YYYY-MM-DD' : 'Enter last name...'" />
          </div>

          <div v-if="searchSettings.searchType === 'byId'" class="ops-field">
            <label for="searchEmployeeId">Employee ID:</label>
            <input v-model.number="searchSettings.employeeId" type="number" id="searchEmployeeId"
              class="ops-input" placeholder="Enter ID" />
          </div>

        </div>

        <!-- Rechte Spalte: Buttons -->
        <div class="ops-actions">
          <p class="ops-actions-label">🛠 Actions</p>
          <button @click="onExecuteSearch" :disabled="employeeStore.isLoading" class="ops-btn primary">
            {{ employeeStore.isLoading ? 'Searching...' : '🔍 Search' }}
          </button>
          <button @click="emit('clear')" class="ops-btn danger">
            🗑️ Clear
          </button>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEmployeeStore } from '@/stores/employeeStore'

// Emits
const emit = defineEmits(['results', 'success', 'error', 'clear'])

const employeeStore = useEmployeeStore()

// Reactive Data
const searchSettings = ref({
  searchType: 'all',
  searchTerm: '',
  employeeId: null
})

// Search Execution
const onExecuteSearch = async () => {
  try {
    const result = await executeGetRequest()
    if (result?.success) {
      const data = result.data
        ? (Array.isArray(result.data) ? result.data : [result.data])
        : []
      emit('results', data)
      emit('success', `Search operation successful!` + (result.message ? ' ' + result.message : ''))
    }
  } catch (err) {
    emit('error', `Search failed: ${err.message}`)
  }
}

const executeGetRequest = async () => {
  if (searchSettings.value.searchType === 'all') {
    const allResult = await employeeStore.loadAllEmployees()
    return {
      success: allResult.success,
      data: employeeStore.employees,
      message: `Loaded ${employeeStore.employees.length} employees`
    }
  } else if (searchSettings.value.searchType === 'byId') {
    if (!searchSettings.value.employeeId) throw new Error('Employee ID is required')
    const byIdResult = await employeeStore.loadEmployeeById(searchSettings.value.employeeId, false)
    return {
      success: byIdResult.success,
      data: byIdResult.employee,
      message: `Employee loaded: ${byIdResult.employee?.FirstName} ${byIdResult.employee?.LastName}`
    }
  } else if (searchSettings.value.searchType === 'byLastName') {
    if (!searchSettings.value.searchTerm) throw new Error('Last name is required')
    const searchResult = await employeeStore.searchEmployees(searchSettings.value.searchTerm)
    return {
      success: searchResult.success,
      data: searchResult.results,
      message: `Found ${searchResult.count} employees`
    }
  } else if (searchSettings.value.searchType === 'activeOnly') {
    const activeResult = await employeeStore.searchEmployees('isActive')
    return {
      success: activeResult.success,
      data: activeResult.results,
      message: `Found ${activeResult.count} active employees`
    }
  } else if (searchSettings.value.searchType === 'byBirthDate') {
    if (!searchSettings.value.searchTerm) throw new Error('Birth date is required')
    const selectedDate = new Date(searchSettings.value.searchTerm)
    const today = new Date()
    if (selectedDate > today) throw new Error('Birth date cannot be in the future')
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
</script>

<style src="../styles/SearchSection.css" scoped></style>
