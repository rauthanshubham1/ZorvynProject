# Finance Dashboard Backend

This is the backend API for the Finance Dashboard application, built with Spring Boot. It provides authentication, user management, financial record management, and dashboard analytics.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- A relational database (PostgreSQL)

## How to Start the Project

1. Clone the repository and navigate to the backend folder.
2. Ensure Java 17 and Maven are installed.
3. Set the required environment variables.
4. Run the application:

   ```bash
   ./mvnw spring-boot:run
   ```

   Or build and run the JAR:

   ```bash
   ./mvnw clean package
   java -jar target/demo-0.0.1-SNAPSHOT.jar
   ```

The application will start on port 8080 (or the port specified in `PORT`).

## API Endpoints

### Authentication

- **POST /auth/login**
  - Description: Authenticates a user and returns a JWT token.
  - Body: `LoginRequest` (email, password)
  - Response: `AuthResponse` (token)
  - Roles: Public (no authentication required)

- **GET /auth/me**
  - Description: Retrieves the current authenticated user's information.
  - Headers: `Authorization: Bearer <token>`
  - Response: User details
  - Roles: Any authenticated user

### Dashboard

- **GET /dashboard/summary**
  - Description: Provides a summary of financial data for the dashboard.
  - Headers: `Authorization: Bearer <token>`
  - Response: Map of summary data
  - Roles: Any authenticated user

### Financial Records

- **POST /records**
  - Description: Creates a new financial record.
  - Body: `RecordRequest`
  - Headers: `Authorization: Bearer <token>`
  - Response: `FinancialRecord`
  - Roles: ADMIN

- **GET /records**
  - Description: Retrieves paginated list of financial records with optional filters.
  - Query Params: search, category, type, startDate, endDate, page, size, sortBy, sortDir
  - Headers: `Authorization: Bearer <token>`
  - Response: Page of `FinancialRecord`
  - Roles: ADMIN, ANALYST

- **PUT /records/{id}**
  - Description: Updates an existing financial record.
  - Path Param: id (record ID)
  - Body: `RecordRequest`
  - Headers: `Authorization: Bearer <token>`
  - Response: `FinancialRecord`
  - Roles: ADMIN

- **DELETE /records/{id}**
  - Description: Deletes a financial record.
  - Path Param: id (record ID)
  - Headers: `Authorization: Bearer <token>`
  - Response: No content
  - Roles: ADMIN

### User Management

- **POST /api/v1/users**
  - Description: Creates a new user.
  - Body: `CreateUserRequest`
  - Headers: `Authorization: Bearer <token>`
  - Response: `UserResponse`
  - Roles: ADMIN

- **GET /api/v1/users**
  - Description: Retrieves paginated list of users.
  - Query Params: search, page, size, sortBy, sortDir
  - Headers: `Authorization: Bearer <token>`
  - Response: Page of `UserResponse`
  - Roles: ADMIN

- **PUT /api/v1/users/{id}/status**
  - Description: Updates a user's status.
  - Path Param: id (user ID)
  - Query Param: status
  - Headers: `Authorization: Bearer <token>`
  - Response: No content
  - Roles: ADMIN

- **PUT /api/v1/users/{id}/roles**
  - Description: Assigns roles to a user.
  - Path Param: id (user ID)
  - Body: Set of role names (e.g., ["ADMIN", "ANALYST"])
  - Headers: `Authorization: Bearer <token>`
  - Response: No content
  - Roles: ADMIN

## Roles

- **ADMIN**: Full access to all endpoints, including user and record management.
- **ANALYST**: Can view financial records and dashboard.
- **VIEWER**: Basic authenticated user (may have limited access).

## Database

The application uses JPA with Hibernate. Set `spring.jpa.hibernate.ddl-auto=update` to automatically create/update tables.

## Security

- JWT-based authentication.
- Role-based access control using Spring Security.
- CORS configuration for frontend integration.
