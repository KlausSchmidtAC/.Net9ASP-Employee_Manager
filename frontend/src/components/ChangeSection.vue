<!-- ChangeSection.vue - Add / Delete / Patch Employees -->
<template>
  <div class="ops-card">
    <section class="change-section">
      <h2>✏️ Add & Delete & Patch</h2>

      <div class="ops-layout">
        <!-- Linke Spalte: Formular -->
        <div class="ops-form">

          <div class="ops-field">
            <label for="changeType">Operation:</label>
            <select v-model="changeSettings.changeType" id="changeType" class="ops-select">
              <option value="add">➕ Add Employee</option>
              <option value="delete">🗑️ Delete Employee</option>
              <option value="patch">🔧 Patch Employee</option>
            </select>
          </div>

          <div v-if="['add', 'patch'].includes(changeSettings.changeType)" class="ops-field">
            <label for="firstNameInput">First Name:</label>
            <input v-model="changeSettings.employeeData.FirstName" type="text" id="firstNameInput"
              class="ops-input" placeholder="First name..." />
          </div>

          <div v-if="['add', 'patch'].includes(changeSettings.changeType)" class="ops-field">
            <label for="lastNameInput">Last Name:</label>
            <input v-model="changeSettings.employeeData.LastName" type="text" id="lastNameInput"
              class="ops-input" placeholder="Last name..." />
          </div>

          <div v-if="['add', 'patch'].includes(changeSettings.changeType)" class="ops-field">
            <label for="birthdateInput">Birthdate:</label>
            <input v-model="changeSettings.employeeData.BirthDate" type="date" id="birthdateInput"
              class="ops-input" />
          </div>

          <div v-if="['add', 'patch'].includes(changeSettings.changeType)" class="ops-field">
            <label>Employment Status:</label>
            <div class="ops-toggle-row">
              <label class="switch">
                <input type="checkbox" id="isActiveSwitch" v-model="changeSettings.employeeData.IsActive">
                <span class="slider round"></span>
              </label>
              <span class="toggle-label">{{ changeSettings.employeeData.IsActive ? 'Active' : 'Inactive' }}</span>
            </div>
          </div>

          <div v-if="['delete', 'patch'].includes(changeSettings.changeType)" class="ops-field">
            <label for="changeEmployeeId">Employee ID:</label>
            <input v-model.number="changeSettings.employeeId" type="number" id="changeEmployeeId"
              class="ops-input" placeholder="Enter ID" />
          </div>

        </div>

        <!-- Rechte Spalte: Buttons -->
        <div class="ops-actions">
          <p class="ops-actions-label">🛠 Actions</p>
          <button @click="onExecuteChanges" :disabled="employeeStore.isLoading" class="ops-btn primary">
            {{ employeeStore.isLoading ? 'Working...' : '▶ Execute' }}
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
const changeSettings = ref({
  changeType: 'add',
  employeeId: null,
  employeeData: {}
})

// Change Execution
const onExecuteChanges = async () => {
  try {
    const result = await executePostPutDeleteRequest()
    if (result?.success) {
      if (result.data) {
        emit('results', [result.data])
      }
      let op = changeSettings.value.changeType
      let opText = op === 'add' ? 'Add' : op === 'delete' ? 'Delete' : 'Patch'
      let extra = op === 'delete' ? ' The deleted employee is shown below.' : op === 'add' ? ' The new employee is shown below.' : ' The updated employee is shown below.'
      emit('success', `${opText} operation successful!${extra}` + (result.message ? ' ' + result.message : ''))
    }
    else {
      const msg = (result.message || 'Unknown error')
        .replace("'yyyy-MM-dd'", "'TT.MM.JJJJ'")
      emit('error', `Operation failed: ${msg}`)
    }
  } catch (err) {
    emit('error', `Operation failed: ${err.message}`)
  }
}

const executePostPutDeleteRequest = async () => {
  if (changeSettings.value.changeType === 'add') {
    const addResult = await employeeStore.createEmployee(changeSettings.value.employeeData)
    return { success: addResult.success, data: addResult.employee, message: addResult.message }
  } else if (changeSettings.value.changeType === 'delete') {
    if (!changeSettings.value.employeeId) throw new Error('Employee ID is required for deletion')
    const deleteResult = await employeeStore.deleteEmployee(changeSettings.value.employeeId)
    return { success: deleteResult.success, data: deleteResult.employee, message: deleteResult.message }
  } else if (changeSettings.value.changeType === 'patch') {
    if (!changeSettings.value.employeeId) throw new Error('Employee ID is required for patching')
    const patchResult = await employeeStore.updateEmployee(changeSettings.value.employeeId, changeSettings.value.employeeData)
    return { success: patchResult.success, data: patchResult.employee, message: patchResult.message }
  } else {
    throw new Error('Invalid change type')
  }
}
</script>

<style src="../styles/SearchSection.css" scoped></style>
