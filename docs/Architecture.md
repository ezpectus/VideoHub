# Video Streaming Platform (Mini YouTube)
Course Project Architecture

---

# 1. Project Overview

## EN

This project is a **Full-Stack Video Streaming Platform (Mini YouTube)** built as a course project.

The goal is to implement a **minimal viable product (MVP)** that demonstrates:

- backend architecture
- REST API design
- database interaction
- authentication
- file uploading
- frontend integration

The project focuses on **clean architecture and separation of concerns**, rather than implementing complex video processing.

---

## RU

Этот проект — **Full-Stack платформа для стриминга видео (мини-YouTube)**, реализованная как курсовая работа.

Цель проекта — создать **MVP (Minimal Viable Product)**, который демонстрирует:

- архитектуру backend
- проектирование REST API
- работу с базой данных
- аутентификацию
- загрузку файлов
- интеграцию frontend и backend

Главный акцент — **правильная архитектура и разделение ответственности**, а не сложная обработка видео.

---

# 2. Technology Stack

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Multer (file upload)

## Frontend

- Next.js
- React
- TypeScript
- Axios / Fetch API

---

## RU

### Backend

- Node.js — runtime для JavaScript
- Express — web framework для API
- TypeScript — типизированный JavaScript
- Prisma ORM — работа с базой данных
- PostgreSQL — реляционная база данных
- JWT — аутентификация
- Multer — загрузка файлов

### Frontend

- Next.js — React framework
- React — UI библиотека
- TypeScript
- Axios / Fetch — запросы к API

---

# 3. Project Architecture

The backend follows a **Layered Architecture**.

## Layers

Client  
↓  
Routes  
↓  
Controllers  
↓  
Services  
↓  
Repositories  
↓  
Database

---

## Explanation

### Routes

Define API endpoints and map HTTP requests to controllers.

Example:
``````
POST /auth/login
GET /videos
POST /videos/upload
``````

---

### Controllers

Controllers receive HTTP requests and call services.

Responsibilities:

- read request data
- validate input
- call service logic
- return response

Example:```video.controller.ts```

---

### Services

Services contain the **business logic**.

Responsibilities:

- process application logic
- coordinate repositories
- enforce business rules

Example:```video.service.ts```

---

### Repositories

Repositories handle **database interaction**.

Responsibilities:

- read/write database
- use Prisma ORM
- isolate DB logic

Example:```video.repository.ts```


---

### Database

The system uses **PostgreSQL**.

Prisma ORM provides:

- type-safe queries
- schema management
- migrations

---

## RU объяснение архитектуры

Backend построен на **слоистой архитектуре (Layered Architecture)**.

Каждый слой выполняет свою задачу.

### Поток запроса

Client  
↓  
Route  
↓  
Controller  
↓  
Service  
↓  
Repository  
↓  
Database

---

### Route

Маршруты определяют **API endpoints**.

Пример:
```
POST /auth/login
GET /videos
POST /videos/upload

```


---

### Controller

Контроллер:

- получает HTTP запрос
- извлекает данные
- вызывает сервис
- возвращает ответ

---

### Service

Сервис содержит **бизнес-логику приложения**.

Пример:

- создание пользователя
- проверка пароля
- обработка загрузки видео

---

### Repository

Repository работает с **базой данных**.

Он:

- выполняет SQL операции
- использует Prisma
- изолирует работу с БД

---
# 4. Repository Structure
```
videohub
│
├── backend
│   │
│   ├── src
│   │   ├── controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── video.controller.ts
│   │   │   └── comment.controller.ts
│   │   │
│   │   ├── services
│   │   │   ├── auth.service.ts
│   │   │   ├── video.service.ts
│   │   │   └── comment.service.ts
│   │   │
│   │   ├── repositories
│   │   │   ├── user.repository.ts
│   │   │   ├── video.repository.ts
│   │   │   └── comment.repository.ts
│   │   │
│   │   ├── routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── video.routes.ts
│   │   │   └── comment.routes.ts
│   │   │
│   │   ├── middleware
│   │   │   └── auth.middleware.ts
│   │   │
│   │   ├── config
│   │   │   ├── prisma.ts
│   │   │   └── env.ts
│   │   │
│   │   ├── utils
│   │   │   └── jwt.ts
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── prisma
│   │   └── schema.prisma
│   │
│   └── uploads
│       └── videos
│
├── frontend
│   │
│   ├── src
│   │   ├── pages
│   │   │   ├── index.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── upload.tsx
│   │   │   └── video
│   │   │       └── [id].tsx
│   │   │
│   │   ├── components
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── VideoCard.tsx
│   │   │   ├── CommentList.tsx
│   │   │   └── CommentForm.tsx
│   │   │
│   │   ├── services
│   │   │   └── apiClient.ts
│   │   │
│   │   ├── hooks
│   │   │   └── useAuth.ts
│   │   │
│   │   └── styles
│   │
│   ├── package.json
│   └── tsconfig.json
│
└── docs
```

---

# 5. Design Patterns Used

## Layered Architecture

Separates the application into logical layers:

- presentation
- business logic
- data access

Benefits:

- easier testing
- better maintainability
- separation of responsibilities

---

## Repository Pattern

Encapsulates database logic inside repository classes.

Example:```video.repository.ts```


Benefits:

- isolates database queries
- easier to change database technology
- cleaner services

---

## Service Layer Pattern

Business logic is separated from controllers.

Example:```video.service.ts```


Benefits:

- reusable logic
- controllers remain simple
- easier testing

---

## Middleware Pattern

Used in Express for request processing.

Example:```auth.middleware.ts```


Responsibilities:

- JWT verification
- request validation
- logging

---

# 6. API Endpoints

## Authentication
- POST /auth/register
- POST /auth/login

---

## Videos

- POST /videos/upload
- GET /videos
- GET /videos/:id


---

## Comments
- POST /videos/:id/comments
- GET /videos/:id/comments


---

# 7. Video Upload Flow

1. User selects a video file.

Frontend page:```upload.tsx```

2. Frontend sends request:```POST /videos/upload```
3. Backend uses **Multer** to store the file.
4. Backend saves video metadata in PostgreSQL.
5. Frontend opens video page. ```/video/[id]```
6. Video is played using HTML5 player. ``<video src="video_url"> ``



# 8. Why This Architecture Is Good

This architecture demonstrates:

- full-stack development
- REST API design
- database interaction
- authentication
- file uploads

At the same time it remains simple enough for a course project.













