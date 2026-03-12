// Domain Layer : Employee Entity Model
export class Employee {
  constructor(id = 0, firstName = '', lastName = '', birthDate = '', isActive = true) {
    this.id = id;
    this.FirstName = firstName;
    this.LastName = lastName;
    this.BirthDate = birthDate;
    this.IsActive = isActive;
  }

  get fullName() {
    return `${this.FirstName} ${this.LastName}`.trim();
  }

  get formattedBirthDate() {
    if (!this.BirthDate) return '';
    return new Date(this.BirthDate).toLocaleDateString('de-DE');
  }

  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  // to handle API data format(JSON)
  toApiFormat() {
    return {
      id: this.id,
      FirstName: this.FirstName,
      LastName: this.LastName,
      BirthDate: this.BirthDate,
      IsActive: this.IsActive
    };
  }

   static fromApiResponse(apiData) {
    return new Employee(
      apiData.id,
      apiData.firstName,
      apiData.lastName,
      apiData.birthDate,
      apiData.isActive
    );
  }

  toString() {
    return `Employee: ${this.fullName} (ID: ${this.id}, Born: ${this.BirthDate}, Active: ${this.IsActive})`;
  }
}

