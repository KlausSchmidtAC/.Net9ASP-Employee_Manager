<template>
  <div class="employee-list">
    <!-- Sort & Filter Controls -->
    <div class="controls">
      <button @click="setSortBy('firstName')">Sort by Name</button>
      <button @click="setSortBy('birthDate')">Sort by Age</button>
      <button @click="setFilter(true)">Active Only</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">Loading employees...</div>

    <!-- Employee Items -->
    <div v-else class="employee-grid">
      <EmployeeCard 
        v-for="employee in filteredEmployees" 
        :key="employee.id"
        :employee="employee"
        @select="selectEmployee"
      />
    </div>
  </div>
</template>

<script setup>
import { useEmployeeStore } from '@/stores/employeeStore'
import { computed } from 'vue'

const employeeStore = useEmployeeStore()

// Reactive Store Data
const filteredEmployees = computed(() => employeeStore.filteredEmployees)
const isLoading = computed(() => employeeStore.isLoading)

// Store Actions
const setSortBy = (field) => employeeStore.setSortBy(field)
const setFilter = (active) => employeeStore.setActiveFilter(active)
const selectEmployee = (employee) => employeeStore.selectEmployee(employee)
</script>