import apiClient from './apiClient.js';
import { Employee } from '../Domain/Models/employee.js';

// Infrastructure Layer: Repository Pattern for Employee entity-Management (CRUD-Operations according to Backend-Controllermethods,
// JSON-Parsing, Error-Handling) with Axios HTTP client
export class EmployeeRepository{

// Helper method to extract error message from backend response
extractErrorMessage(error, fallbackMessage) {
    // Priority: Backend Message → Fallback → Generic
    return error.response?.data?.message || 
           error.response?.data || 
           fallbackMessage || 
           error.message || 
           'Unknown error';
  }

// ✅ Fetch all employees, analogous to GetAll(CancellationToken cancellationToken = default) in Backend-EmployeeRepository.cs
async getAll() {
    try {
        console.log('📤 Repository: Fetching all employees...');                  
        const response = await apiClient.get('/employees');  // ← /Employee → /employees
        console.log('Backend Response:', response.data);
        const employeesData = response.data.data;
        return employeesData.map(empData => Employee.fromApiResponse(empData));
    } catch (error) {
        console.error("Error fetching employees:", error);
        const backendMessage = this.extractErrorMessage(error, 'Unknown error');
        throw new Error(`Error fetching employees: ${backendMessage}`);
    }
}

// ✅ Fetch employee by ID, analogous to GetById(int id, CancellationToken cancellationToken = default) in Backend-EmployeeRepository.cs
async getById(id) {
    try {
      console.log(`📤 Repository: Fetching employee with ID ${id}...`);
      const response = await apiClient.get(`/employees/${id}`);  // ← /Employee/${id} → /employees/${id}
      
      const emp = response.data.data;
      return Employee.fromApiResponse(emp);
    } catch (error) {
      console.error(`❌ Repository.getById(${id}) Error:`, error);
      const backendMessage = this.extractErrorMessage(error, 'Unknown error');
      throw new Error(`Error fetching employee with ID ${id}: ${backendMessage}`);
    }
  }

 // ✅ Create new employee, needs Admin role in JWT. Analogous to Add(Employee? employee, CancellationToken cancellationToken = default) in Backend-EmployeeRepository.cs
async create(employee) {
    try {
        const response = await apiClient.post('/employees', employee.toApiFormat());  // ← /Employee → /employees
        const createdEmp = response.data.data;
        return Employee.fromApiResponse(createdEmp);
    } catch (error) {   
      console.error('❌ Repository.create() Error:', error);

      const backendMessage = this.extractErrorMessage(error, 'Unknown error');
      if (error.response?.status === 403) {
       throw new Error(`Authorization error: ${backendMessage}`);
      }
      
      if (error.response?.status === 401) {
        throw new Error(`Authorization error: ${backendMessage}`);
      }    
      if (error.response?.status === 400) {
        // Backend Validation Errors
        const backendMessage = this.extractErrorMessage(error, 'Invalid data');
        throw new Error(`Validation error: ${backendMessage}`);
      }
    
      throw new Error('Error creating employee');
    }
    }

// ✅ Update existing employee by ID, needs Admin role in JWT. Analogous to Update(int id, Employee? employee, CancellationToken cancellationToken = default) in Backend-EmployeeRepository.cs
async update(id, employee) {
      try {
      console.log('📤 Repository: Updating employee ID:', id);
      const requestData = employee.toApiFormat();
      const response = await apiClient.patch(`/employees/${id}`, requestData);  // ← PUT /Employee/${id} → PATCH /employees/${id}
      const responseData = response.data.data;
      const updatedEmployee = Employee.fromApiResponse(responseData);
      console.log('📦 Updated Data:', updatedEmployee.toString());
      return updatedEmployee;
      } catch (error) {
      console.error(`❌ Repository.update(${id}) Error:`, error);
      const backendMessage = this.extractErrorMessage(error, 'Unknown error');

      if (error.response?.status === 403) {
        throw new Error(`Authorization error: ${backendMessage}`);
      }
      
      if (error.response?.status === 404) {
        throw new Error(`Employee with ID ${id} not found: ${backendMessage}`);
      }
      throw new Error(backendMessage);
    }
  }

// ✅ Delete employee by ID, needs Admin role in JWT. Analogous to Delete(int id, CancellationToken cancellationToken = default) in Backend-EmployeeRepository.cs
async delete(id) {
  try{
    console.log(`📤 Repository: Deleting employee with ID ${id}...`);

    // ✅ HTTP DELETE /api/employees/{id}
    await apiClient.delete(`/employees/${id}`);  
    console.log(`✅ employee with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error(`❌ Repository.delete(${id}) Error:`, error); 
    const backendMessage = this.extractErrorMessage(error, 'Unknown error');

    if (error.response?.status === 403) {
      throw new Error(`Authorization error: ${backendMessage}`);
    } 
    throw new Error(`Error deleting employee with ID ${id}: ${backendMessage}`);
  }
}

// ✅ Search employees by term (last name, Birthdate or isActive), analogous to Search(string searchTerm, CancellationToken cancellationToken = default) in Backend-EmployeeRepository.cs 
async search(searchTerm) {
  try{
    console.log(`📤 Repository: Searching employees with term "${searchTerm}"...`);
    const response = await apiClient.get(`/employees/search`, {  // /employees/search
      params: { search: searchTerm }
    });
    console.log('📊 Search Results:', {
        searchTerm,
        resultCount: response.data.data?.length,
        message: response.data.message
      });
    const employeesData = response.data.data;
    return employeesData.map(empData => Employee.fromApiResponse(empData));
  }
  catch(error) {
    console.error(`❌ Repository.search("${searchTerm}") Error:`, error); 
    const backendMessage = this.extractErrorMessage(error, 'Unknown error');
    throw new Error(`Error searching employees with term "${searchTerm}": ${backendMessage}`);
  }
}

// ✅ Get employees by birth date
async getByBirthDate(birthDate) {
  try {
    console.log(`📤 Repository: Fetching employees with BirthDate older than ${birthDate}...`);
    const response = await apiClient.get(`/employees/birthDate`, {  // ← /Employee/birthDate → /employees/birthDate
      params: { birthDate: birthDate }
    });
    const employeesData = response.data.data;
    return employeesData.map(empData => Employee.fromApiResponse(empData));
  } catch (error) {
    console.error(`❌ Repository.getByBirthDate("${birthDate}") Error:`, error); 
    const backendMessage = this.extractErrorMessage(error, 'Unknown error');
    throw new Error(`Error fetching employees with BirthDate older than ${birthDate}: ${backendMessage}`);
  }
}

}

