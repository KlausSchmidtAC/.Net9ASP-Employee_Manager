import { defineStore } from 'pinia';
import { EmployeeRepository } from '../services/EmployeeRepository.js';
import { useAuthStore } from './authStore.js'
import { Employee } from '../Domain/Models/employee.js';

// EMPLOYEE STORE - Application Layer / Pinia Store for Employee Entity and State Management. 
// Business logic and API integration

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        employees: [],
        selectedEmployee: null,
        isLoading: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        error: null,
        validationErrors: {},
        searchTerm: '',             // current search term
        searchResults: [],          // search results cache
        lastSearchTerm: '',         // last search term (for cache invalidation)

        // 🎛️ UI STATE 
        sortBy: 'lastName',         // sorting: 'firstName', 'lastName', 'birthDate'
        sortDirection: 'asc',       // 'asc' or 'desc'
        filterActive: null,         // null = all, true = only active, false = only inactive
        showInactiveEmployees: true // UI toggle for inactive display
    }),
    getters: {

        // Filtered and sorted employee list - main view for components
        filteredEmployees: (state) => {
            let result = [...state.employees];

            // 1. Filter by active status (Dropdown-Menue)
            if (state.filterActive !== null) {
                result = result.filter(emp => emp.IsActive === state.filterActive);
            }

            // 2. Search filter (FirstName, LastName, BirthDate in textfield)
            if (state.searchTerm) {
                const searchLower = state.searchTerm.toLowerCase();
                result = result.filter(emp =>
                    emp.FirstName.toLowerCase().includes(searchLower) ||
                    emp.LastName.toLowerCase().includes(searchLower) ||
                    emp.BirthDate.includes(searchLower)
                );
            }

            // 3. Sorting by selected field 
            result.sort((a, b) => {
                let aValue, bValue;

                switch (state.sortBy) {
                    case 'firstName':
                        aValue = a.FirstName.toLowerCase();
                        bValue = b.FirstName.toLowerCase();
                        break;
                    case 'lastName':
                        aValue = a.LastName.toLowerCase();
                        bValue = b.LastName.toLowerCase();
                        break;
                    case 'birthDate':  // 🎯 HERE: birthDate sorting
                        aValue = new Date(a.BirthDate);
                        bValue = new Date(b.BirthDate);
                        break;
                    case 'isActive':
                        aValue = a.IsActive;
                        bValue = b.IsActive;
                        break;
                    case 'id':
                    default:
                        aValue = a.id;
                        bValue = b.id;
                }

                // Apply sort direction
                if (state.sortDirection === 'desc') {
                    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
                } else {
                    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
                }
            });

            return result;
        },

        // Statistics getters - for dashboard/overview components
        activeEmployees: (state) => state.employees.filter(emp => emp.IsActive),
        inactiveEmployees: (state) => state.employees.filter(emp => !emp.IsActive),
        totalEmployees: (state) => state.employees.length,
        activeCount: (state) => state.employees.filter(emp => emp.IsActive).length,
        inactiveCount: (state) => state.employees.filter(emp => !emp.IsActive).length,

        // Employee by ID lookup - for detail views
        getEmployeeById: (state) => (id) => {
            return state.employees.find(emp => emp.id === id);
        },

        // Form state helpers
        hasErrors: (state) => state.error || Object.keys(state.validationErrors).length > 0,
        isOperationRunning: (state) => state.isLoading || state.isCreating || state.isUpdating || state.isDeleting,
    },

    actions: {

        // Repository instance - lazy loading pattern
        initRepository() {
            if (!this._repository) {
                this._repository = new EmployeeRepository();
            }
        },

        // Fetch all employees from backend API GET /api/employees
        async loadAllEmployees() {
            this.initRepository();
            this.isLoading = true;
            this.error = null;

            try {
                console.log('📤 Store: Loading all employees...');
                const employeeList = await this._repository.getAll();
                this.employees = employeeList;
                console.log(`✅ Loaded ${employeeList.length} employees.`);
                return { success: true, count: employeeList.length };
            } catch (error) {
                this.error = error.message;
                return { success: false, error: error.message };
            } finally {
                this.isLoading = false;
            }
        },

        async loadEmployeeById(id, setAsSelected = true) {
            this.initRepository();
            this.isLoading = true;
            this.error = null;
            try {
                console.log(`📤 Store: Loading employee with ID ${id}...`);
                const employee = await this._repository.getById(id);
                const existingIndex = this.employees.findIndex(emp => emp.id === employee.id);
                if (existingIndex >= 0) {
                    this.employees.splice(existingIndex, 1, employee); // Update existing
                } else {
                    this.employees.push(employee); // Add new
                }
                if (setAsSelected) {
                    this.selectedEmployee = employee;
                }
                console.log(`✅ Loaded employee: ${employee.toString()}`);
                return { success: true, employee };
            } catch (error) {
                console.error(`❌ Store.loadEmployeeById(${id}) Error:`, error);
                this.error = error.message;
                return { success: false, error: error.message };
            }
            finally {
                this.isLoading = false;
            }
        },
        // Create Employee - POST /api/employees  [Admin-Role / Claim required]
        async createEmployee(employeeData) {
            this.initRepository();
            this.isCreating = true;
            this.error = null,
                this.validationErrors = {};

            try {
                // ✅ Check JWT Token via AuthStore
                const authStore = useAuthStore()
                if (!authStore.token) {
                    throw new Error('Authentication required for employee creation')
                }

                if (!authStore.hasAdminRole) {
                    throw new Error('Admin role required for employee creation')
                }

                console.log('🏪 Store: Creating employee (Admin authenticated)...')
                const employeeDataModel = new Employee(employeeData.id, employeeData.FirstName, employeeData.LastName, employeeData.BirthDate, employeeData.IsActive)
                const newEmployee = await this._repository.create(employeeDataModel)
                this.employees.push(newEmployee)
                return { success: true, employee: newEmployee }
            } catch (err) {
                console.error('🏪 Store: Error creating employee:', err)
                this.error.value = err.message
                return { success: false, error: err.message }
            } finally {
                this.isCreating = false;
            }
        },

        // Delete Employee - DELETE /api/employees/{id}  [Admin-Role / Claim required]
        async deleteEmployee(id) {
            this.initRepository();
            this.isDeleting = true;
            this.error = null;
            try {
                // ✅ Check JWT Token via AuthStore
                const authStore = useAuthStore()
                if (!authStore.token) {
                    throw new Error('Authentication required for employee deletion')
                }
                console.log('AdminRole:', authStore.hasAdminRole);
                if (!authStore.hasAdminRole) {
                    throw new Error('Admin role required for employee deletion')
                }

                console.log(`🏪 Store: Deleting employee ${id} (Admin authenticated)...`)
                await this._repository.delete(id)

                this.employees = this.employees.filter(emp => emp.id !== id)
                return { success: true }
            } catch (err) {
                console.error(`🏪 Store: Error deleting employee ${id}:`, err)
                this.error.value = err.message
                return { success: false, error: err.message }
            } finally {
                this.isDeleting = false;
            }
        },
        // Update Employee - PUT /api/employees/{id}  [Admin-Role / Claim required]
        async updateEmployee(id, employeeData) {
            this.initRepository();
            this.isUpdating = true;
            this.error = null;
            this.validationErrors = {};

            try {
                // ✅ Check JWT Token via AuthStore
                const authStore = useAuthStore()
                if (!authStore.token) {
                    throw new Error('Authentication required for employee updates')
                }

                if (!authStore.hasAdminRole) {
                    throw new Error('Admin role required for employee updates')
                }

                console.log(`🏪 Store: Updating employee ${id} (Admin authenticated)...`)
                const employeeDataModel = new Employee(employeeData.id, employeeData.FirstName, employeeData.LastName, employeeData.BirthDate, employeeData.IsActive)
                const updatedEmployee = await this._repository.update(id, employeeDataModel)

                const index = this.employees.findIndex(emp => emp.id === id)
                if (index !== -1) {
                    this.employees[index] = updatedEmployee
                }

                return { success: true, employee: updatedEmployee }
            } catch (err) {
                console.error(`🏪 Store: Error updating employee ${id}:`, err)
                this.error.value = err.message
                return { success: false, error: err.message }
            } finally {
                this.isUpdating = false;
            }

        },
    // Search Employees - GET /api/employees/search?search=searchterm
    async searchEmployees(searchterm) {
        this.initRepository();
        this.isLoading = true; 
        this.error = null;
        this.searchTerm = searchterm;
        
        try{
            console.log(`📤 Store: Searching employees with term "${searchterm}"...`);
            const results = await this._repository.search(searchterm);
            this.searchResults = results;
            this.lastSearchTerm = searchterm;
            this.employees = results; // Update main list with search results
            console.log(`✅ Found ${results.length} employees matching "${searchterm}".`);
            return { success: true, results, count: results.length };
        } catch(error){
            console.error(`❌ Store.searchEmployees("${searchterm}") Error:`, error);
            this.error = error.message;
            return { success: false, error: error.message};
        } finally{
            this.isLoading = false;
        }
        },

    
    async getEmployeesByBirthDate(birthDate) {
        this.initRepository();
        this.isLoading = true;
        this.error = null;
        
        try {
            console.log(`🏪 Store: Getting employees older than birth date ${birthDate}...`);
            
            // Validierung des Datums
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(birthDate)) {
                throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
            }
            
            const birthDateObj = new Date(birthDate);
            if (isNaN(birthDateObj.getTime())) {
                throw new Error('Invalid date value.');
            }
            
            // Repository-Call
            const employees = await this._repository.getByBirthDate(birthDate);
            
            console.log(`✅ Store: Found ${employees.length} employees older than ${birthDate}`);
            
            return {
                success: true,
                employees: employees,
                message: `Found ${employees.length} employees born before ${birthDate}`
            };
            
        } catch (error) {
            console.error('❌ Store: Error getting employees by birth date:', error);
            this.error = error.message;
            
            return {
                success: false,
                employees: [],
                message: error.message || 'Error fetching employees by birth date'
            };
        } finally {
            this.isLoading = false;
        }
    },

    // 🔄 UI STATE MANAGEMENT ACTIONS (NO API-Interaction)
    // Sorting control - handle sortBy: 'birthDate' and other fields
    setSortBy(field, direction = null) {
        if (this.sortBy === field && !direction) {
            // Toggle direction if same field clicked
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = field;  // 'id' | 'firstName' | 'lastName' | 'birthDate' | 'isActive'
            this.sortDirection = direction || 'asc';
        }
        console.log(`🔄 Sort changed: ${this.sortBy} ${this.sortDirection}`);
    },

    // Filter control based on IsActive-Status (Dropdown-Menue)
    setActiveFilter(filter) {
        this.filterActive = filter; // null = all | true = active only | false = inactive only
        console.log(`🔄 Filter changed: ${filter}`);
    },

    // Search control
    setSearchTerm(term) {
        this.searchTerm = term;
        console.log(`🔄 Search term: ${term}`);
    },

    // Selection control
    selectEmployee(employee) {
        this.selectedEmployee = employee;
        console.log(`👤 Selected employee: ${employee?.fullName || 'none'}`);
    },

    clearSelection() {
        this.selectedEmployee = null;
    },

    // Error management
    clearError() {
        this.error = null;
        this.validationErrors = {};
    },

    // Reset all UI state to defaults
    resetUIState() {
        this.searchTerm = '';
        this.sortBy = 'lastName';
        this.sortDirection = 'asc';
        this.filterActive = null;
        this.selectedEmployee = null;
        this.clearError();
        console.log('🔄 UI state reset to defaults');
    },

    // 🔧 Repository management (für Testing/Dependency Injection)
    setRepository(customRepository) {
        this.employeeRepository = customRepository;
        console.log('🔧 Custom repository injected');
    }
    }
})



