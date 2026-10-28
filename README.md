# Support Ticket System

A full-stack support-ticket application. Customers can create and follow tickets, support agents can work on tickets assigned to them, and administrators can manage staff and ticket assignments.

## Technology stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Material UI, Axios
- **Backend:** ASP.NET Core Web API on .NET 10, C#
- **Database:** PostgreSQL
- **ORM and migrations:** Entity Framework Core 10 with the Npgsql provider
- **Authentication:** JWT bearer tokens and ASP.NET Core password hashing

## Architecture

The React single-page application calls the API through a shared Axios client. Authentication state is managed by a React context; the client sends the JWT stored in browser session storage with authenticated requests.

The ASP.NET Core API is organized around controllers, request/response DTOs, domain models, and services. Controllers enforce authentication and role-based access, while `TicketService` contains ticket-specific logic such as severity calculation and least-loaded-agent assignment. Entity Framework Core maps users, tickets, and comments to PostgreSQL. The `AppDbContext` and checked-in migrations define the database schema.

Roles are `USER`, `AGENT`, and `ADMIN`. Users see their own tickets, agents see tickets assigned to them, and administrators can access all tickets and manage staff/assignments.

## Prerequisites

- .NET 10 SDK
- Node.js and npm
- PostgreSQL
- (For manual migrations) the `dotnet-ef` tool, version 10

## Database setup

Create a PostgreSQL database and a user with permission to access it. For example, using `psql` as a PostgreSQL administrator:

```sql
CREATE USER support_app WITH PASSWORD 'replace-with-a-local-password';
CREATE DATABASE support_ticket_db OWNER support_app;
```

Configure the connection string as described in [Environment and configuration](#environment-and-configuration). The default database name in the project is `support_ticket_db`; use the connection string to set the host, port, database, username, and password for your environment.

## Backend setup

From the repository root, restore and build the API:

```powershell
dotnet restore .\backend\SupportTicketSystem.slnx
dotnet build .\backend\SupportTicketSystem.slnx
```

Set local configuration before starting the API. For example, from the API project directory, store values in .NET user secrets:

```powershell
Set-Location .\backend\SupportTicket.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=support_ticket_db;Username=support_app;Password=replace-with-a-local-password"
dotnet user-secrets set "Jwt:Key" "replace-with-a-long-random-secret-of-at-least-32-bytes"
```

The project already has a user-secrets ID configured. User secrets are intended for local development and are not committed with the source.

## Frontend setup

From the repository root, install the frontend dependencies:

```powershell
npm --prefix frontend install
```

The frontend defaults to the API at `http://localhost:5164/api`. To use another API URL, set `VITE_API_BASE_URL` in `frontend/.env.local` (for example, `VITE_API_BASE_URL=http://localhost:5164/api`). Vite reads this value when the development server starts.

## Environment and configuration

The backend uses standard ASP.NET Core configuration. Values can be supplied through .NET user secrets in development or environment variables. Use double underscores (`__`) in environment-variable names to represent nested configuration keys.

| Setting | Environment variable | Purpose |
| --- | --- | --- |
| `ConnectionStrings:DefaultConnection` | `ConnectionStrings__DefaultConnection` | PostgreSQL connection string; required |
| `Jwt:Key` | `Jwt__Key` | Secret used to sign JWTs; required and should be a long random value |
| `Jwt:Issuer` | `Jwt__Issuer` | Token issuer; defaults to `SupportTicket.Api` |
| `Jwt:Audience` | `Jwt__Audience` | Token audience; defaults to `SupportTicket.Client` |
| `Jwt:ExpiryMinutes` | `Jwt__ExpiryMinutes` | Token lifetime in minutes; defaults to `60` |
| `FrontendOrigins` | `FrontendOrigins__0`, `FrontendOrigins__1`, ... | Allowed browser origins for CORS; defaults include `http://localhost:5173` and `http://localhost:4173` |
| `SeedAccounts:AdminEmail` | `SeedAccounts__AdminEmail` | Optional development admin account email |
| `SeedAccounts:AdminPassword` | `SeedAccounts__AdminPassword` | Optional development admin account password |
| `SeedAccounts:AgentEmail` | `SeedAccounts__AgentEmail` | Optional development agent account email |
| `SeedAccounts:AgentPassword` | `SeedAccounts__AgentPassword` | Optional development agent account password |
| `ASPNETCORE_ENVIRONMENT` | `ASPNETCORE_ENVIRONMENT` | Controls the ASP.NET Core environment; use `Development` for local development |
| Frontend API URL | `VITE_API_BASE_URL` | Optional frontend API base URL; defaults to `http://localhost:5164/api` |

From the API project directory, set seed account values in user secrets if you want to log in with staff roles during development. For example:

```powershell
dotnet user-secrets set "SeedAccounts:AdminEmail" "admin@example.test"
dotnet user-secrets set "SeedAccounts:AdminPassword" "choose-a-strong-local-password"
dotnet user-secrets set "SeedAccounts:AgentEmail" "agent@example.test"
dotnet user-secrets set "SeedAccounts:AgentPassword" "choose-another-strong-local-password"
```

These accounts are created only when the API runs in `Development`, and only if the corresponding email and password are configured. Existing accounts are not overwritten or reset. Do not use sample values or development secrets in production.

## EF Core migration and database setup

An initial migration is included. When the API starts in the `Development` environment, it applies pending migrations automatically before serving requests. This requires a reachable PostgreSQL database and a valid connection string.

To apply migrations manually, install the EF Core CLI tool if needed, then run from the repository root:

```powershell
dotnet tool install --global dotnet-ef --version 10.0.14
dotnet ef database update --project .\backend\SupportTicket.Api\SupportTicket.Api.csproj --startup-project .\backend\SupportTicket.Api\SupportTicket.Api.csproj
```

The API project must be configured with a valid connection string when running EF commands. To add a migration after changing the models:

```powershell
dotnet ef migrations add MigrationName --project .\backend\SupportTicket.Api\SupportTicket.Api.csproj --startup-project .\backend\SupportTicket.Api\SupportTicket.Api.csproj
```

## Run the application

Run the backend from the repository root:

```powershell
dotnet run --project .\backend\SupportTicket.Api\SupportTicket.Api.csproj --launch-profile http
```

The HTTP launch profile listens at `http://localhost:5164`. In Development, the API's Swagger UI is available at `http://localhost:5164/swagger`.

In a second terminal, start the frontend:

```powershell
npm --prefix frontend run dev
```

Open the Vite URL printed in the terminal (by default, `http://localhost:5173`). The backend's configured CORS origins include the default frontend development URL.

Useful frontend commands:

```powershell
npm --prefix frontend run build
npm --prefix frontend run lint
```

## Test login credentials

There are no fixed test login credentials in the repository. Register through the application to create a `USER` account. To test `ADMIN` or `AGENT` functionality, configure the optional seed-account settings above before the first development startup, then sign in using the email and password you supplied. The seeder does not change credentials for accounts that already exist.

## Assumptions and known limitations

- The documented local setup assumes PostgreSQL is available on `localhost:5432`, the API uses `http://localhost:5164`, and Vite uses `http://localhost:5173`. Adjust the connection string, frontend API URL, and CORS origins if your setup differs.
- The database is migrated automatically only in the `Development` environment. Apply migrations through your deployment process in other environments.
- Development staff accounts are opt-in through configuration; registering in the UI creates a customer (`USER`) account, not an administrator or agent.
- The repository currently does not define a dedicated automated test project or a frontend test script.
