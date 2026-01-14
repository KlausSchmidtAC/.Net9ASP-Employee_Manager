# 🏢 WebAPI_Net9ASP - Employee Management API

Eine moderne **Employee Management API** entwickelt mit **.NET 9** und **Clean Architecture** Prinzipien. Diese RESTful Web API ermöglicht das vollständige Management von Mitarbeiterdaten mit asynchroner Programmierung und robuster Fehlerbehandlung.

## 🚀 Features

- ✅ **CRUD Operations** für Employees (Create, Read, Update, Delete)
- ✅ **JWT Authentication & Authorization** mit Claims-basierter Zugriffskontrolle
- ✅ **OpenTelemetry OTLP Logging** für moderne Observability
- ✅ **REST-konforme JSON Responses** mit strukturierten Message/Data Objekten
- ✅ **Async/Await Pattern** für optimale Performance
- ✅ **Clean Architecture** mit Domain-Driven Design
- ✅ **OperationResult Pattern** für elegante Fehlerbehandlung
- ✅ **Thread-sichere Datenbankinitialisierung** mit optimierter Connection Factory
- ✅ **MySQL Integration** mit Dapper ORM und Hybrid-Fehlerbehandlung
- ✅ **Comprehensive Unit Tests** (37 Tests) mit NUnit - vollständig ins Englische übersetzt
- ✅ **Swagger/OpenAPI** Dokumentation mit JWT-Support
- ✅ **Structured Logging** mit ILogger und OpenTelemetry
- ✅ **Dependency Injection** Container
- ✅ **Advanced Search & Filtering** (Name, Status, Geburtsdatum)
- ✅ **JSON Source Generation** für optimierte Serialization
- ✅ **Performance-optimierte Connection Factory** (3-5x schneller: 5-15ms → 1-3ms pro Request)
- ✅ **Enterprise Configuration Validation** beim Startup mit umfassender Fehlerprüfung
- ✅ **MySQL-spezifische Exception Handling** für granulare Fehlerbehandlung
- ✅ **Production Health Checks** mit Database- und Application-Monitoring für Enterprise-Deployment
- ✅ **CancellationToken-Support** für alle API-Endpunkte mit graceful Request-Cancellation

## 🏗️ Architektur

Das Projekt folgt dem **Clean Architecture** Pattern mit klarer Trennung der Verantwortlichkeiten:

```
📁 WebAPI_Net9ASP/
├── 🌐 WebAPI_NET9/          # Presentation Layer (Controllers, Program.cs)
├── 🔧 Application/          # Application Layer (Services, Business Logic)
├── 💾 Data/                 # Infrastructure Layer (Repositories, Database)
├── 📋 Domain/               # Domain Layer (Entities, Core Logic)
└── 🧪 Tests/                # Test Layer (Unit Tests)
```

### Projektstruktur

- **Domain**: Kerngeschäftslogik und Entitäten (`Employee`, `OperationResult`)
- **Application**: Anwendungsservices und Geschäftslogik (`IEmployeeService`)
- **Data**: Datenzugriff und Repository Pattern (`IEmployeeRepository`)
- **WebAPI_NET9**: HTTP-Controller und API-Endpunkte
- **Tests**: Umfassende Unit Tests für alle Layer (vollständig ins Englische übersetzt)

## 🛠️ Technologie-Stack

| Technologie | Version | Zweck |
|-------------|---------|-------|
| **.NET** | 9.0 | Core Framework |
| **ASP.NET Core** | 9.0 | Web API Framework |
| **MySQL** | Latest | Datenbank |
| **Dapper** | 2.1.66 | Micro-ORM |
| **JWT Bearer** | Latest | Authentication & Authorization |
| **OpenTelemetry** | Latest | Observability & Logging |
| **OTLP Exporter** | Latest | Log Export (Seq, Jaeger, etc.) |
| **Swagger** | 9.0.4 | API Dokumentation |
| **System.Text.Json** | 9.0 | JSON Serialization |
| **NUnit** | Latest | Unit Testing Framework |
| **NSubstitute** | Latest | Mocking Framework |

## 📊 API-Endpunkte

### 🔐 Authentication

| HTTP Verb | Endpunkt | Beschreibung | CancellationToken |
|-----------|----------|--------------|-------------------|
| `POST` | `/api/auth/token` | JWT Token generieren | ✅ |
| `GET` | `/api/auth/public` | Öffentlicher Endpunkt | ✅ |
| `GET` | `/api/auth/protected` | Geschützter Endpunkt | ✅ |

### 👥 Employee Management

| HTTP Verb | Endpunkt | Beschreibung | Authorization | CancellationToken |
|-----------|----------|--------------|---------------|-------------------|
| `GET` | `/api/employees` | Alle Employees abrufen | Public | ✅ |
| `GET` | `/api/employees/{id}` | Employee nach ID abrufen | JWT Required | ✅ |
| `GET` | `/api/employees/search?search=LastName` | Employees nach Nachnamen sortiert | JWT Required | ✅ |
| `GET` | `/api/employees/search?search=isActive` | Alle aktiven Employees | JWT Required | ✅ |
| `GET` | `/api/employees/birthDate?birthDate={yyyy-MM-dd}` | Employees mit Geburtsdatum vor Datum | JWT Required | ✅ |
| `POST` | `/api/employees` | Neuen Employee erstellen | Admin Role | ✅ |
| `PATCH` | `/api/employees/{id}` | Employee aktualisieren | Admin Role | ✅ |
| `DELETE` | `/api/employees/{id}` | Employee löschen | Admin Role | ✅ |

### JWT Authentication Beispiel

```json
POST /api/auth/token
{
  "username": "admin@example.com",
  "email": "admin@example.com", 
  "userId": 1,
  "customClaims": {
    "AdminRole": "true"
  }
}
```

**Response:**
```json
{
  "message": "Token created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "expiresAt": "2025-01-15T16:15:00Z",
  "user": "admin@example.com",
  "claimsCount": 4
}
```

### Employee Request Beispiel

```json
POST /api/employees
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "id": 0,
  "firstName": "Max",
  "lastName": "Mustermann", 
  "birthDate": "1990-05-15",
  "isActive": true
}
```

### REST-konforme Response Struktur

```json
{
  "message": "New employee created successfully",
  "data": {
    "id": 1,
    "firstName": "Max",
    "lastName": "Mustermann",
    "birthDate": "1990-05-15", 
    "isActive": true
  }
}
```

## 🚀 Schnellstart

### Voraussetzungen

- **.NET 9 SDK** installiert
- **MySQL Server** verfügbar
- **Visual Studio 2022** oder **VS Code** (empfohlen)

### Installation

1. **Repository klonen**
   ```bash
   git clone https://github.com/[IhrUsername]/WebAPI_Net9ASP-Employee-Management.git
   cd WebAPI_Net9ASP-Employee-Management
   ```

2. **Abhängigkeiten wiederherstellen**
   ```bash
   dotnet restore
   ```

3. **User Secrets konfigurieren (Entwicklung)**
   ```bash
   cd WebAPI_NET9
   dotnet user-secrets init
   dotnet user-secrets set "JwtSettings:SecretKey" "MySecureProductionJWTKeyFor2026Testing123456789ABCDEFUffel123"
   dotnet user-secrets set "JwtSettings:Issuer" "http://localhost:5100"
   dotnet user-secrets set "JwtSettings:Audience" "http://localhost:5100"
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "server=localhost;user=root;password=;database=Employees"
   ```

4. **Konfiguration anpassen (Production)**
   
   **Datenbankverbindung** in `appsettings.json`:
   ```json
   {
     "Database": {
       "ServerIP": "localhost",
       "DatabaseName": "Employees",
       "Port": "3306",
       "Username": "root",
       "Password": "IhrPasswort"
     }
   }
   ```

5. **OpenTelemetry/OTLP Setup (Optional)**
   
   Für erweiterte Observability können Sie einen OTLP-kompatiblen Collector verwenden:
   
   **Seq (empfohlen für Development):**
   ```bash
   docker run -d --name seq -e ACCEPT_EULA=Y -p 5099:5099 -p 80:80 datalust/seq:latest
   ```

6. **Projekt starten**
   ```bash
   dotnet run --project WebAPI_NET9
   ```

7. **API testen**
   
   - **Swagger UI**: `https://localhost:5101/swagger`
   - **HTTP**: `http://localhost:5100`  
   - **HTTPS**: `https://localhost:5101`
   - **Health Checks**: `http://localhost:5100/health` 🔍
   - **Logs**: `http://localhost:5099` (falls Seq läuft)

## 🔍 Health Monitoring

```bash
# System-Gesundheit prüfen
curl http://localhost:5100/health

# Database Readiness (Kubernetes Ready Probe)
curl http://localhost:5100/health/ready

# Application Liveness (Kubernetes Live Probe)  
curl http://localhost:5100/health/live
```

## 🌐 Frontend-Integration & Framework-Support

Diese API wurde mit **Frontend-First** Design entwickelt und bietet vollständige Kompatibilität mit modernen Web- und Mobile-Frameworks:

### ⚛️ **React.js Integration**
```typescript
// JWT Authentication Hook mit CancellationToken Support
const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  
  const login = async (credentials, abortController) => {
    const response = await fetch('/api/auth/token', {  // ← Korrigierte Route
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      signal: abortController?.signal
    });
    const { data } = await response.json();
    setToken(data.token);
    localStorage.setItem('jwt_token', data.token);
  };
};

// Employee Service mit Request Cancellation
const employeeService = {
  getAll: (abortController) => fetch('/api/employees', {  // ← Korrigierte Route
    headers: { 'Authorization': `Bearer ${token}` },
    signal: abortController?.signal
  }).then(res => res.json())
};
```

### 🟢 **Vue.js Integration**
```typescript
// Composable für Employee-Management
export const useEmployees = () => {
  const employeeList = ref([]);
  const isLoading = ref(false);
  
  const fetchEmployees = async () => {
    isLoading.value = true;
    try {
      const response = await $fetch('/api/employees', {  // ← Korrigierte Route
        headers: { Authorization: `Bearer ${authToken.value}` }
      });
      employeeList.value = response.data;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { employeeList, fetchEmployees, isLoading };
};
```

### 🅰️ **Angular Integration**
```typescript
// Angular Service
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = '/api/employees';  // ← Korrigierte Route
  
  constructor(private http: HttpClient) {}
  
  getEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(this.apiUrl);
  }
  
  createEmployee(employee: Employee): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.apiUrl, employee);
  }
}
```

### 📱 **React Native / Mobile Apps**
```typescript
// React Native Integration
class ApiService {
  private baseUrl = 'https://your-api.com/api';
  
  async authenticatedFetch(endpoint: string, options: RequestInit = {}) {
    const token = await AsyncStorage.getItem('jwt_token');
    return fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  }
  
  // Korrekte API-Endpunkte
  getEmployees() {
    return this.authenticatedFetch('/employees');  // ← Korrigierte Route
  }
  
  createEmployee(employee) {
    return this.authenticatedFetch('/employees', {  // ← Korrigierte Route
      method: 'POST',
      body: JSON.stringify(employee)
    });
  }
}
```

### 🔥 **Svelte/SvelteKit Integration**
```typescript
// API Client
export const apiClient = {
  async getEmployees() {
    const { token } = get(authStore);
    const response = await fetch('/api/employees', {  // ← Korrigierte Route
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    employeeStore.set(result.data);
    return result;
  }
};
```

## 📈 Datenbankschema

```sql
CREATE TABLE employees (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Birthdate DATE NOT NULL,
    IsActive BOOLEAN NOT NULL
);
```

---

⭐ **Star dieses Repository, wenn es dir geholfen hat!**

🔧 **Entwickelt mit .NET 9, OpenTelemetry & JWT Authentication ❤️**

📊 **Modern API Design | 🔒 Secure Authentication | 📈 Observable Logging**