# Booking Appointment App

A scalable and flexible booking system for beauty centers, hairdressers, and other appointment-based businesses.

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Status](#project-status)
4. [Getting Started](#getting-started)
5. [Project Milestones](#project-milestones)
6. [Architecture Overview](#architecture-overview)
7. [Contact](#contact)
8. [License](#license)
---

## Features
- User roles: Admin and Worker.
- CRUD operations for services, clients, and appointments.
- Flexible time slots for appointments.
- Secure authentication with JWT.
- Scalable architecture with Node.js and PostgreSQL.
- Ready for future enhancements like notifications (email/SMS) and analytics.

---

## Tech Stack
- **Back-End**: Express (Node.js), Prisma ORM, PostgreSQL
- **Front-End**: React/Next.js
- **Authentication**: JWT
- **Hosting**: Docker, Vercel/Heroku
- **Testing**: Jest, Supertest, Cypress

---

## Project Status
🚧 In progress - Initial setup and planning phase.

---

## Project Milestones
- [x] Define project scope and architecture
- [x] Set up the Back-End environment
- [ ] Build the Front-End components
- [ ] Integrate Back-End and Front-End
- [ ] Deploy and test the application

## Architecture Overview
This project follows a modular architecture for scalability and maintainability.

### High-Level Architecture
```[Browser] -> [Front-End (React/Next.js)] -> [Back-End (Express)] -> [Database (PostgreSQL)]```

### ER Diagram
```
Users (Admin/Worker)
  |
  |--- Appointments
  |
Clients --- Services
```
### Backend Folder Structure
```
### Backend Folder Structure
backend/
│
├── .env
│
├── .gitignore
│
├── package.json
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── index.js
│   ├── db.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── services/
│   └── utils/
│
└── tsconfig.json
```
### Frontend Folder Structure
```

```
## Contact
For questions or suggestions, reach me at tsvetanilievdev@gmail.com.

## License
MIT License

Copyright (c) 2025 [Tsvetan Iliev]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
