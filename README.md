# VideoHub

A modern, high-performance YouTube clone built as a lightweight MVP. VideoHub demonstrates clean full-stack architecture with optimized video streaming, atomic social mechanics, and real-time view counting without unnecessary cloud infrastructure bloat.

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for REST API
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database toolkit with type-safe queries
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Multer** - File upload handling

### Frontend
- **Next.js** - React framework with server-side rendering
- **React** - UI library
- **TypeScript** - Type-safe frontend development
- **Axios** - HTTP client for API requests
- **TailwindCSS** - Utility-first CSS framework
- **React Player** - Video player component

## Features

- **Native HTML5 Video Streaming** - HTTP 206 Partial Content protocol for timeline scrubbing and seeking
- **Iframe Upload/Embed System** - Support for both local file uploads and YouTube URL embedding
- **Atomic Social Mechanics** - Race-condition-free likes and subscriptions using database transactions
- **Real-time Optimized View Counts** - In-memory buffering with batch writes to prevent database overload
- **User Authentication** - JWT-based auth with optional Google OAuth integration
- **Video Management** - Upload, edit, delete, and search videos
- **Comments System** - Threaded comments on videos
- **User Profiles** - Custom avatars, banners, and channel descriptions

## Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd VideoHub
```

### 2. Install Dependencies

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### 3. Database Setup

Create a PostgreSQL database named `videohub`:
```bash
# Using psql
psql -U postgres
CREATE DATABASE videohub;
\q
```

### 4. Environment Configuration

Copy the example environment file and configure it:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/videohub"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration - Generate a strong secret using:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_generated_jwt_secret_here

# Google OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

### 5. Run Database Migrations

Generate Prisma client and run migrations:
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 6. Start the Development Servers

Start the backend server (in `backend/` directory):
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

Start the frontend server (in a new terminal, in `frontend/` directory):
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 7. Access the Application

Open your browser and navigate to:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Project Structure

```
VideoHub/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/             # Database migrations
│   ├── src/
│   │   ├── config/                 # Configuration files
│   │   ├── controllers/            # Request handlers
│   │   ├── middleware/             # Express middleware
│   │   ├── repositories/           # Database access layer
│   │   ├── routes/                 # API route definitions
│   │   ├── services/               # Business logic
│   │   ├── utils/                  # Utility functions
│   │   ├── app.ts                  # Express app setup
│   │   └── server.ts               # Server entry point
│   ├── uploads/                    # Uploaded files
│   ├── .env.example                # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js app directory
│   │   ├── components/             # React components
│   │   ├── hooks/                  # Custom React hooks
│   │   └── services/               # API client
│   ├── public/                     # Static assets
│   └── package.json
├── docs/
│   └── Architecture.md             # Detailed architecture documentation
├── README.md
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Videos
- `GET /api/videos` - Get all videos (with optional filters)
- `GET /api/videos/:id` - Get single video by ID
- `POST /api/videos/upload` - Upload video file
- `POST /api/videos/upload-url` - Upload video by URL
- `PATCH /api/videos/:id` - Update video metadata
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/like` - Toggle like on video

### Comments
- `GET /api/videos/:id/comments` - Get video comments
- `POST /api/videos/:id/comments` - Add comment to video

### Subscriptions
- `POST /api/subscriptions/:channelId` - Toggle subscription to channel

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update user profile

### Streaming
- `GET /stream/videos/:filename` - Stream video with HTTP 206 support
- `GET /stream/thumbnails/:filename` - Serve thumbnail images
- `GET /stream/avatars/:filename` - Serve avatar images

## Development Scripts

### Backend
```bash
cd backend
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server
npx prisma studio    # Open Prisma Studio for database management
```

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL in `.env` matches your PostgreSQL credentials
- Check that the `videohub` database exists

### Port Already in Use
- Change PORT in backend `.env` file
- Change frontend port by modifying the dev script in `frontend/package.json`

### Prisma Client Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to apply schema changes to database

### File Upload Issues
- Ensure `uploads/` directory exists in backend
- Check file size limits in Express configuration (default: 10MB)

## License

ISC 