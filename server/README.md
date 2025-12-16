# Backend Server Architecture Documentation

This document describes the **backend (server) architecture** of the SLRTCE IMS project. It explains the **complete folder structure**, the **purpose of each folder and file**, their **dependencies**, and how each piece fits into the overall backend system.

---

## 1. High-Level Backend Responsibility

The backend is responsible for:

* Handling HTTP requests
* Authentication and authorization
* Business logic execution
* Database interaction
* Centralized error handling
* Providing a stable API contract to the frontend

The backend **does not** handle UI, rendering, or presentation logic.

---

## 2. Root-Level Structure

```
server/
├── README.md
├── package.json
├── package-lock.json
├── node_modules/
└── src/
```

### README.md

**Purpose**: Project-level documentation and onboarding guide.

* Explains how to run the server
* Environment setup instructions
* High-level architectural notes

**Independence**: Independent
**Dependencies**: None

---

### package.json / package-lock.json

**Purpose**: Dependency management and scripts.

* Lists all backend dependencies
* Defines scripts like `start`, `dev`, etc.

**Independence**: Independent
**Dependencies**: npm ecosystem

---

## 3. Source Directory (`src/`)

```
src/
├── server.js
├── app.js
├── routes.js
├── config/
├── constants/
├── database/
├── middlewares/
├── modules/
└── utils/
```

All backend logic lives inside `src/`.

---

## 4. Application Bootstrap Layer

### server.js

**Purpose**: Application entry point.

* Loads environment variables
* Establishes database connection
* Starts the HTTP server

**Independence**: Not independent
**Depends on**:

* `app.js`
* `config/`
* `database/connection.js`

**Fits in puzzle**: This is the **engine ignition** of the backend.

---

### app.js

**Purpose**: Express application configuration.

* Initializes Express
* Registers global middlewares
* Mounts routes
* Registers error handler

**Independence**: Not independent
**Depends on**:

* `middlewares/`
* `routes.js`
* `config/`

**Fits in puzzle**: This is the **request pipeline manager**.

---

## 5. Routing Layer

### routes.js

**Purpose**: Central route aggregator.

* Mounts all module routes
* Defines API entry points

**Independence**: Not independent
**Depends on**:

* `modules/*/*.routes.js`

**Fits in puzzle**: This is the **API surface map** of the backend.

---

## 6. Configuration Layer (`config/`)

```
config/
├── index.js
├── env.js
├── cors.js
└── logger.js
```

### Purpose of config/

Centralized configuration and environment setup.

**Independence**: Semi-independent
**Dependency rule**:

* Can be imported anywhere
* Must never import from `modules/`

---

### env.js

Handles environment variables.

### cors.js

Defines CORS rules.

### logger.js

Configures logging behavior.

### index.js

Barrel file exporting all configs.

**Fits in puzzle**: Provides **environment awareness** to the system.

---

## 7. Constants Layer (`constants/`)

```
constants/
├── roles.js
├── httpStatus.js
└── messages.js
```

**Purpose**:

* Centralized shared values
* Eliminates magic strings

**Independence**: Independent
**Dependencies**: None

**Fits in puzzle**: Defines the **shared language** of the backend.

---

## 8. Database Layer (`database/`)

```
database/
├── connection.js
└── models/
    └── index.js
```

### connection.js

Handles MongoDB connection lifecycle.

### models/

Contains schema definitions.

**Independence**: Not independent
**Depends on**:

* Mongoose

**Rules**:

* No business logic
* No controllers or services

**Fits in puzzle**: Acts as the **data foundation**.

---

## 9. Middleware Layer (`middlewares/`)

```
middlewares/
├── auth.middleware.js
├── role.middleware.js
├── requestLogger.middleware.js
└── error.middleware.js
```

**Purpose**:

* Request interception
* Policy enforcement
* Logging and error handling

**Independence**: Semi-independent
**Depends on**:

* `constants/`
* `utils/`

**Fits in puzzle**: Guards and stabilizes the request flow.

---

## 10. Utility Layer (`utils/`)

```
utils/
├── apiResponse.js
├── asyncHandler.js
├── password.js
└── token.js
```

**Purpose**:

* Stateless helper functions
* Reusable logic

**Independence**: Independent
**Rules**:

* No database access
* No module imports

**Fits in puzzle**: Toolbox for repetitive low-level tasks.

---

## 11. Modules Layer (`modules/`)

```
modules/
├── auth/
├── users/
├── academics/
├── attendance/
├── assignments/
└── notices/
```

This is the **business logic core**.

Each module represents one domain.

---

### Standard Module Structure (Example: users)

```
users/
├── user.model.js
├── user.controller.js
├── user.service.js
├── user.routes.js
├── user.validation.js
└── user.constants.js
```

#### user.routes.js

Defines HTTP routes.
Depends on: controller, middlewares

#### user.controller.js

Handles request/response logic.
Depends on: service, utils

#### user.service.js

Contains business rules.
Depends on: model, other services

#### user.model.js

Defines schema.
Depends on: database layer

#### user.validation.js

Validates input data.
Depends on: validation libraries

#### user.constants.js

Module-specific constants.

**Dependency Direction**:

```
routes → controller → service → model
```

**Fits in puzzle**: Each module is a **self-contained business unit**.

---

## 12. Dependency Rules (Non-Negotiable)

* No circular imports
* Modules never import other modules' controllers
* Shared logic goes to utils or services
* Dependency flow is always top-down

---

## 13. Final Architectural Summary

* `server.js` starts the system
* `app.js` wires the pipeline
* `routes.js` exposes APIs
* `modules/` implement business logic
* `database/` persists data
* `middlewares/` enforce rules
* `utils/` support logic
* `config/` controls environment

This backend is intentionally **predictable**, **boring**, and **robust**—the same qualities that allow real systems to scale without collapsing.
