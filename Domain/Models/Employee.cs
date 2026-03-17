namespace Domain;

/// <summary>Represents an employee in the system.</summary>
public class Employee
{
    /// <summary>Unique database ID (auto-generated, read-only).</summary>
    public int id
    { get; set; }

    /// <summary>First name of the employee.</summary>
    public string FirstName
    { get; set; }

    /// <summary>Last name of the employee.</summary>
    public string LastName
    { get; set; }

    /// <summary>Birth date of the employee in 'yyyy-MM-dd' format.</summary>
    public String BirthDate
    { get; set; }

    /// <summary>Indicates whether the employee is currently active.</summary>
    public bool IsActive
    { get; set; }


    public Employee(int id, string firstName, string lastName, string birthDate, bool isActive)
    {
        this.id = id;
        this.FirstName = firstName;
        this.LastName = lastName;
        this.BirthDate = birthDate;
        this.IsActive = isActive;
    }

    public override string ToString()
    {
        return $"Mitarbeiter: ID= {id}, Vorname= {FirstName}, Nachname= {LastName}, Geburtsdatum= {BirthDate}, Aktiv= {IsActive}";
    }
}
