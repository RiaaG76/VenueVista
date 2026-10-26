# VenueVista - Event Discovery & Ticket Booking Platform

VenueVista is a full-stack web application designed for discovering events and booking tickets seamlessly. The architecture separates the user-facing client interface from the backend RESTful API service to ensure clean separation of concerns, rapid MVP delivery, and high maintainability.

---

## 1. Architecture Overview

The system is split into two independent applications in the workspace:

```
VenueVista/
├── venuevista-frontend/     # Standalone Vanilla HTML5/CSS3/JavaScript client
├── venuevista-backend/      # Spring Boot REST API service (Maven)
└── README.md                # Project documentation and developer guide
```

- **Frontend Client (`venuevista-frontend`)**: A pure HTML5/CSS3/Vanilla JS application. Requires zero build steps or bundlers, keeping the feedback loop immediate and lightweight.
- **Backend Service (`venuevista-backend`)**: A Spring Boot application adhering to a layered architecture (Controller -> Service -> Repository -> Entity) providing secure REST APIs.
- **Database Layer**: Relational persistence managed with MySQL and Hibernate/Spring Data JPA.

---

## 2. Technology Stack & Version Matrix

| Component | Technology | Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend** | HTML5 / CSS3 / Vanilla JS | ES6+ | Lightweight, fast iteration, zero tooling overhead |
| **Backend Language** | Java (LTS) | 21 | Stable LTS release; modern records, virtual threads, pattern matching; fully compatible with JDK 23 |
| **Backend Framework** | Spring Boot | 3.3.5 (GA) | Current production-grade release with native Java 21 support and Jakarta EE 10 baseline |
| **Build Tool** | Apache Maven | 3.9+ | Standard dependency management and reproducible builds |
| **Web Layer** | Spring Web (MVC) | 3.3.5 | RESTful API endpoints and HTTP request routing |
| **Persistence** | Spring Data JPA / Hibernate | 3.3.5 | Entity-relational mapping and repository abstraction |
| **Security** | Spring Security | 3.3.5 | Role-based authorization, JWT/Session auth, and CORS/CSRF handling |
| **Validation** | Bean Validation (Hibernate Validator) | 3.3.5 | JSR-380 input validation for DTOs and entities |
| **Database Driver** | MySQL Connector/J | 8.3.0+ | Official JDBC driver for MySQL communication |
| **Database** | MySQL | 8.x (Planned) | ACID-compliant relational storage for events, users, and ticket bookings |

---

## 3. Directory Structure

```
VenueVista/
├── .gitignore
├── README.md
│
├── venuevista-frontend/
│   ├── index.html               # Main application single-page layout
│   ├── css/
│   │   └── styles.css           # Global design system, layout, and component styles
│   ├── js/
│   │   └── app.js               # Frontend entry point, state, and API client logic
│   └── assets/                  # Static assets (images, icons, brand assets)
│       ├── .gitkeep
│       └── README.md
│
└── venuevista-backend/
    ├── pom.xml                  # Maven project object model and dependencies
    ├── .gitignore
    └── src/
        ├── main/
        │   ├── java/
        │   │   └── com/
        │   │       └── venuevista/
        │   │           ├── VenueVistaApplication.java   # Spring Boot entry point
        │   │           ├── controller/                  # REST API controllers
        │   │           ├── service/                     # Business logic and transactions
        │   │           ├── repository/                  # Spring Data JPA repositories
        │   │           ├── entity/                      # JPA domain entities
        │   │           ├── dto/                         # Request/Response DTO records & classes
        │   │           ├── config/                      # WebMvc, CORS, and general configs
        │   │           └── security/                    # Security filter chain and auth
        │   └── resources/
        │       └── application.properties               # Application and database configuration
        └── test/
            └── java/
                └── com/
                    └── venuevista/
                        └── VenueVistaApplicationTests.java  # Application context tests
```

---

## 4. Local Development Workflow

### Prerequisites
1. **Java Development Kit (JDK)**: JDK 21 (or compatible JDK 23 already installed on system).
2. **Apache Maven**: Version 3.9+ installed and on system `PATH`.
3. **Web Browser**: Any modern browser (Chrome, Edge, Firefox).
4. **MySQL Server**: Version 8.x (to be installed and started locally).

---

### Step 1: Running the Frontend
Because the frontend uses vanilla web standards with History API client-side routing, it can be served using any static HTTP server.

**Option A: Standard Python static server (All direct routes and refreshes supported)**
The frontend repository includes pre-synchronized directory entrypoints for every logical route (`/events`, `/events/categories`, `/events/:category`, `/events/all`, `/venues`, `/venues/categories`, `/venues/:category`, `/venues/all`).
```bash
cd venuevista-frontend
python -m http.server 3000
```
Then visit: `http://localhost:3000`

**Option B: Using the custom development SPA server (Handles arbitrary non-registered paths)**
For development environments where arbitrary routes need automatic fallback to `index.html`:
```bash
cd venuevista-frontend
python dev-server.py 3000
```

**Option C: Re-synchronizing route entrypoints after editing the master index.html**
```bash
node sync_routes.js
```

---

### Step 2: Building and Running the Backend

1. **Verify Backend Compilation**:
   ```bash
   cd venuevista-backend
   mvn clean compile
   ```

2. **Package the Application**:
   ```bash
   mvn clean package -DskipTests
   ```

3. **Database Preparation (Once MySQL is installed)**:
   - Log into MySQL:
     ```sql
     CREATE DATABASE venuevista_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - Set environment variables or update `src/main/resources/application.properties`:
     - `SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/venuevista_db`
     - `SPRING_DATASOURCE_USERNAME=root`
     - `SPRING_DATASOURCE_PASSWORD=<your_mysql_password>`

4. **Launch Spring Boot**:
   ```bash
   mvn spring-boot:run
   ```
   The backend API will start on: `http://localhost:8080`

---

## 5. Spring Initializr Equivalence

If reproducing this backend configuration using Spring Initializr ([start.spring.io](https://start.spring.io/)):
- **Project**: Maven
- **Language**: Java
- **Spring Boot**: 3.3.5
- **Group**: `com.venuevista`
- **Artifact**: `venuevista-backend`
- **Packaging**: Jar
- **Java**: 21
- **Dependencies**:
  - Spring Web (`spring-boot-starter-web`)
  - Spring Data JPA (`spring-boot-starter-data-jpa`)
  - Spring Security (`spring-boot-starter-security`)
  - Validation (`spring-boot-starter-validation`)
  - MySQL Driver (`mysql-connector-j`)
