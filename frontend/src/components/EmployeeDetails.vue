<!-- EmployeeDetails.vue - Detailed view of selected employee -->
<template>
  <div class="employee-details">
    <header class="details-header">
      <h3>👤 Employee Details</h3>
      <button @click="$emit('close')" class="close-btn" title="Close Details">
        ✕
      </button>
    </header>

    <div class="employee-info">
      <!-- Profile Section -->
      <section class="profile-section">
        <div class="avatar">
          {{ employee.FirstName.charAt(0) + employee.LastName.charAt(0) }}
        </div>
        
        <div class="basic-info">
          <h4>{{ employee.fullName }}</h4>
          <span class="status-badge" :class="statusClass">
            {{ employee.IsActive ? 'Active Employee' : 'Inactive Employee' }}
          </span>
        </div>
      </section>

      <!-- Details Grid -->
      <section class="details-grid">
        <div class="detail-item">
          <label>🆔 Employee ID:</label>
          <span class="value">{{ employee.id }}</span>
        </div>

        <div class="detail-item">
          <label>👤 First Name:</label>
          <span class="value">{{ employee.FirstName }}</span>
        </div>

        <div class="detail-item">
          <label>👤 Last Name:</label>
          <span class="value">{{ employee.LastName }}</span>
        </div>

        <div class="detail-item">
          <label>📅 Birth Date:</label>
          <span class="value">{{ employee.formattedBirthDate }}</span>
        </div>

        <div class="detail-item">
          <label>🎂 Age:</label>
          <span class="value">{{ calculatedAge }} years</span>
        </div>

        <div class="detail-item">
          <label>⚡ Status:</label>
          <span class="value" :class="statusClass">
            {{ employee.IsActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </section>

      <!-- JSON Debug Info (Development) -->
      <section v-if="showDebugInfo" class="debug-section">
        <h5>🛠️ Debug Info (Development)</h5>
        <pre class="json-display">{{ JSON.stringify(employee, null, 2) }}</pre>
      </section>
    </div>

    <!-- Action Buttons -->
    <footer class="details-actions">
      <button @click="editEmployee" class="edit-btn" title="Edit Employee">
        ✏️ Edit
      </button>
      <button @click="deleteEmployee" class="delete-btn" title="Delete Employee">
        🗑️ Delete
      </button>
      <button @click="toggleDebug" class="debug-btn" title="Toggle Debug Info">
        🛠️ Debug
      </button>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  employee: { type: Object, required: true }
})

const emit = defineEmits(['close', 'edit', 'delete'])

// Local State
const showDebugInfo = ref(false)

// Computed Properties
const statusClass = computed(() => ({
  'status-active': props.employee.IsActive,
  'status-inactive': !props.employee.IsActive
}))

const calculatedAge = computed(() => {
  if (!props.employee.BirthDate) return 'Unknown'
  
  const birthDate = new Date(props.employee.BirthDate)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1
  }
  return age
})

// Event Handlers
const editEmployee = () => {
  emit('edit', props.employee)
}

const deleteEmployee = () => {
  if (confirm(`Are you sure you want to delete ${props.employee.fullName}?`)) {
    emit('delete', props.employee)
  }
}

const toggleDebug = () => {
  showDebugInfo.value = !showDebugInfo.value
}
</script>

<style src="../styles/EmployeeDetails.css" scoped></style>