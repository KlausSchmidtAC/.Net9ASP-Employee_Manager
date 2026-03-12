# 🏢 Employee Management – Full Stack Demo

A full-stack **Employee Management** application built with **.NET 9 Web API** (backend) and **Vue.js 3** (frontend), demonstrating JWT authentication, Clean Architecture, and a modern reactive UI.

---

## 📦 Repository Structure

```
WebAPI_Net9ASP-Mitarbeiterverwaltung/
├── WebAPI_NET9/       # ASP.NET Core – Controllers, Program.cs
├── Application/       # Business Logic – Services, Interfaces
├── Data/              # Infrastructure – Repositories, SQL
├── Domain/            # Core – Entities (Employee, OperationResult)
├── Tests/             # NUnit Unit Tests (37 Tests)
└── frontend/          # Vue.js 3 SPA
    └── src/
        ├── components/   # AuthSection, SearchSection, ChangeSection, LoginForm, EmployeeCard ...
        ├── stores/       # Pinia – authStore, employeeStore
        ├── services/     # Axios API client
        └── styles/       # Per-component CSS files
```

---

## 🖥️ Frontend – Vue.js 3

**UI Layout (Desktop)**

```
+-----------------------------------------------------------------+
|  Employee Management API Tester                  [ Logout ]    |
+-----------------------------------------------------------------+
|  Session & Token Info                                           |
|  Status: Active  Exp: 15:02  |  Validate   Copy Token         |
|  User / Email / Role / Admin  |  Public Route  Protected Route |
|  [ Show Token ]               |                                |
+-------------------------------+---------------------------------+
|  Search & Filter              |  Add & Delete & Patch          |
|  Filter:  [ Dropdown ]        |  Operation: [ Dropdown ]       |
|  [ Search ]   [ Clear ]       |  Fields...  [ Execute ] [Clear]|
+-------------------------------+---------------------------------+
|  Results                                                        |
|  [ Employee Card ]  [ Employee Card ]  [ Employee Card ]        |
+-----------------------------------------------------------------+
```

### Frontend Features

| Feature | Details |
|---|---|
| **Login Gate** | `LoginForm.vue` – JWT token creation before app access |
| **JWT Token Info** | Decoded payload: user, role, admin, issued, expiry |
| **Token Toggle** | Masked preview + Show/Hide raw JWT |
| **Search & Filter** | All · By ID · By last name · Active only · By birth date |
| **Employee CRUD** | Add · Delete · Patch via REST API |
| **Results Display** | Card grid with `EmployeeCard` + expandable `EmployeeDetails` |
| **Route Testing** | One-click test for public and protected API endpoints |
| **Responsive Layout** | Side-by-side sections on desktop, stacked on mobile |
| **Pinia State** | `authStore` (token, login, logout) + `employeeStore` (CRUD, search) |
| **Scoped CSS** | Per-component CSS files, pill-style buttons, gradient header |

### Frontend Tech Stack

| Technology | Purpose |
|---|---|
| Vue.js 3 (`script setup`) | UI Framework |
| Pinia | State Management |
| Axios | HTTP Client |
| Vue CLI 5 | Build Tool |

### Frontend Quick Start

```bash
cd frontend
npm install
npm run serve        # http://localhost:8080
```

> The backend must be running on `http://localhost:5100` (CORS is pre-configured).

---

## ⚙️ Backend – .NET 9 Web API

**Request Flow**

```
HTTP Request
     |
     v
Controller  (WebAPI_NET9)
     |  OperationResult<T>
     v
IEmployeeService  (Application Layer)
     |  Business Logic + Validation
     v
IEmployeeRepository  (Data Layer)
     |  Dapper + MySQL + async/await
     v
MySQL Database  <--  Connection Factory (1-3 ms/request)
```

### Backend Features

| Feature | Details |
|---|---|
| **JWT Authentication** | Custom claims · role-based access · `admin` claim controls write access |
| **Clean Architecture** | Domain / Application / Data / Presentation separation |
| **OperationResult Pattern** | Typed results without exceptions for control flow |
| **Async/Await** | All endpoints and DB operations fully async |
| **CancellationToken** | Graceful request cancellation on all endpoints |
| **MySQL + Dapper** | Micro-ORM, thread-safe connection factory (1–3 ms/request) |
| **OpenTelemetry OTLP** | Structured logging + traces (Seq / Jaeger compatible) |
| **Health Checks** | `/health` · `/health/ready` · `/health/live` (Kubernetes-ready) |
| **Swagger/OpenAPI** | Full JWT-authenticated Swagger UI |
| **Unit Tests** | 37 NUnit tests covering all layers (NSubstitute mocks) |
| **Startup Validation** | Config checked at startup – fails fast if misconfigured |
| **MySQL Exception Handling** | Granular error handling for DB-specific errors |
| **JSON Source Generation** | `System.Text.Json` AOT-ready serialization |
| **CORS** | Pre-configured for `localhost:8080` (Vue dev server) |

### API Endpoints

#### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/token` | — | Generate JWT token |
| `GET` | `/api/auth/public` | — | Public test endpoint |
| `GET` | `/api/auth/protected` | JWT | Protected test endpoint |

#### Employee Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/employees` | Public | Get all employees |
| `GET` | `/api/employees/{id}` | JWT | Get by ID |
| `GET` | `/api/employees/search?search=LastName` | JWT | Search by last name |
| `GET` | `/api/employees/search?search=isActive` | JWT | Get active only |
| `GET` | `/api/employees/birthDate?birthDate=YYYY-MM-DD` | JWT | Older than date |
| `POST` | `/api/employees` | Admin | Create employee |
| `PATCH` | `/api/employees/{id}` | Admin | Update employee |
| `DELETE` | `/api/employees/{id}` | Admin | Delete employee |

#### Response Format

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

### Backend Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| .NET / ASP.NET Core | 9.0 | Web API Framework |
| MySQL | Latest | Database |
| Dapper | 2.1.66 | Micro-ORM |
| JWT Bearer | Latest | Authentication |
| OpenTelemetry | Latest | Observability |
| Swagger | 9.0.4 | API Documentation |
| NUnit + NSubstitute | Latest | Testing |

---

## 🚀 Full Stack Quick Start

### 1. Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- MySQL Server running locally

### 2. Database Setup

```sql
CREATE DATABASE IF NOT EXISTS Employees;
USE Employees;

CREATE TABLE IF NOT EXISTS employees (
    Id        INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName  VARCHAR(100) NOT NULL,
    Birthdate DATE NOT NULL,
    IsActive  BOOLEAN NOT NULL DEFAULT TRUE
);
```

Configure `WebAPI_NET9/appsettings.json`:

```json
{
  "Database": {
    "ServerIP": "localhost",
    "DatabaseName": "Employees",
    "Port": "3306",
    "Username": "root",
    "Password": "your_password"
  }
}
```

### 3. Backend Setup

```bash
git clone https://github.com/KlausSchmidtAC/WebAPI_Net9ASP-Mitarbeiterverwaltung.git
cd WebAPI_Net9ASP-Mitarbeiterverwaltung
dotnet restore

cd WebAPI_NET9
dotnet user-secrets init
dotnet user-secrets set "JwtSettings:SecretKey" "MySecureProductionJWTKeyFor2026Testing123456789ABCDEFUffel123"
dotnet user-secrets set "JwtSettings:Issuer"    "http://localhost:5100"
dotnet user-secrets set "JwtSettings:Audience"  "http://localhost:5100"

dotnet run
# API:     http://localhost:5100
# Swagger: https://localhost:5101/swagger
# Health:  http://localhost:5100/health
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run serve
# App: http://localhost:8080
```

### 5. Optional – Observability (Seq)

```bash
docker run -d --name seq -e ACCEPT_EULA=Y -p 5099:5099 -p 80:80 datalust/seq:latest
# Logs: http://localhost:5099
```

---

## 🔍 Health Monitoring

```bash
curl http://localhost:5100/health        # Overall status
curl http://localhost:5100/health/ready  # Kubernetes readiness probe
curl http://localhost:5100/health/live   # Kubernetes liveness probe
```

---

## ⚠️ Security Notice – Demo Mode

> **This project has no real password validation.**
> `POST /api/auth/token` returns a valid JWT for **any credentials**.
> The `admin` CustomClaim (set via Role selection in the frontend) controls write access.
>
> **Missing for production:**
> - User database with stored credentials
> - Password hashing (e.g. BCrypt)
> - Server-side role validation before token issuance

---

## 🧪 Running Tests

```bash
dotnet test
# 37 tests · NUnit + NSubstitute · all layers covered
```

---

⭐ **Star this repo if it helped you!**

🔧 **Built with .NET 9 · Vue.js 3 · JWT · OpenTelemetry · Clean Architecture**