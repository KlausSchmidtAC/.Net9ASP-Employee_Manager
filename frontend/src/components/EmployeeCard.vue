<!-- EmployeeCard.vue - Einzelner Employee -->
<template>
  <div 
    class="employee-card" 
    :class="{ 
      inactive: !employee.IsActive,
      selected: isSelected 
    }"
    @click="handleSelect"
  >
    <!-- Avatar -->
    <div class="avatar">
      {{ employee.FirstName.charAt(0) + employee.LastName.charAt(0) }}
    </div>

    <!-- Employee Info -->
    <div class="employee-info">
      <h3 class="employee-name">{{ employee.fullName }}</h3>
      <p class="employee-birth">📅 {{ employee.formattedBirthDate }}</p>
      <p class="employee-age">🎂 {{ calculatedAge }} years old</p>
    </div>

    <!-- Status Badge -->
    <span class="status" :class="statusClass">
      {{ employee.IsActive ? 'Active' : 'Inactive' }}
    </span>

    <!-- Quick Actions (hover) -->
    <div class="quick-actions">
      <button @click.stop="$emit('quickEdit', employee)" class="quick-btn edit" title="Quick Edit">
        ✏️
      </button>
      <button @click.stop="$emit('quickDelete', employee)" class="quick-btn delete" title="Quick Delete">
        🗑️
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// ✅ Fix defineProps and defineEmits for Vue 3
const props = defineProps({
  employee: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

// Use emit function:
const handleSelect = () => {
  emit('select', props.employee)
}

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
</script>

<style src="../styles/EmployeeCard.css" scoped></style>