namespace Application;
using Domain;

public interface IEmployeeService
{
    Task<OperationResult<IEnumerable<Employee>>> GetAllEmployees(CancellationToken cancellationToken = default);
    Task<OperationResult<Employee>> GetEmployeeById(int id, CancellationToken cancellationToken = default);
    Task<OperationResult<IEnumerable<Employee>>> SearchEmployees(string search, CancellationToken cancellationToken = default);
    Task<OperationResult<int>> CreateEmployee(Employee employee, CancellationToken cancellationToken = default);
    Task<OperationResult<int>> UpdateEmployee(int id, Employee employee, CancellationToken cancellationToken = default);
    Task<OperationResult<int>> DeleteEmployee(int id, CancellationToken cancellationToken = default);
}
