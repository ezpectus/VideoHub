# VideoHub Architecture

## Overview

VideoHub is a lightweight, high-performance video streaming platform built with a focus on clean architecture and smart optimizations. The system demonstrates how to achieve production-grade performance without over-engineering or unnecessary cloud infrastructure.

## Clean Architecture Flow

The application follows a layered architecture pattern with clear separation of concerns:

```
Client Request (Frontend)
    ↓
Express Routes (API Endpoints)
    ↓
Controllers (Request Validation & Response)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access via Prisma ORM)
    ↓
PostgreSQL Database
```

### Layer Responsibilities

**Routes Layer** (`src/routes/`)
- Defines API endpoints and HTTP methods
- Maps requests to appropriate controllers
- Handles middleware application (auth, rate limiting)

**Controllers Layer** (`src/controllers/`)
- Validates incoming request data
- Extracts parameters from requests
- Calls service layer for business logic
- Formats and returns HTTP responses

**Services Layer** (`src/services/`)
- Contains core business logic
- Implements view buffering and batch operations
- Handles atomic transactions for data consistency
- Coordinates between multiple repositories

**Repositories Layer** (`src/repositories/`)
- Encapsulates database operations
- Uses Prisma ORM for type-safe queries
- Isolates database-specific logic

## Custom Video Delivery System

### HTTP 206 Partial Content Protocol

VideoHub implements native HTTP 206 (Partial Content) streaming using Node.js `fs.createReadStream`. This enables efficient video playback with timeline scrubbing and seeking capabilities while protecting server RAM.

### Implementation Details

**Location**: `backend/src/app.ts` (lines 31-103)

**Key Features**:
- **Range Request Parsing**: Parses `Range` header (e.g., `bytes=0-1023`) to determine requested byte range
- **Stream Creation**: Uses `fs.createReadStream(filePath, { start, end })` to stream only the requested chunk
- **Memory Efficiency**: Streams video data directly from disk to response without loading entire file into RAM
- **Security**: Validates filenames to prevent path traversal attacks
- **Error Handling**: Graceful error handling for stream failures

**Response Headers**:
```typescript
{
  'Content-Range': `bytes ${start}-${end}/${fileSize}`,
  'Accept-Ranges': 'bytes',
  'Content-Length': chunkSize,
  'Content-Type': 'video/mp4',
  'Cache-Control': 'public, max-age=31536000'
}
```

**Benefits**:
- **Timeline Scrubbing**: Users can seek to any position in the video
- **Bandwidth Optimization**: Only requested bytes are transferred
- **RAM Protection**: No full-file buffering in memory
- **CDN-Friendly**: Supports standard HTTP caching headers

### Static File Streaming

Thumbnails and avatars are served with optimized caching:
- **Location**: `backend/src/app.ts` (lines 106-156)
- **Cache Strategy**: 1-year cache duration (`max-age=31536000`)
- **Content-Type**: Proper MIME type detection for images

## Database Optimization: View Buffer System

### Problem Statement

Every video view requires a database write to increment the view counter. With high traffic, this can:
- Exhaust PostgreSQL connection pool
- Cause database write contention
- Impact overall application performance

### Solution: In-Memory View Buffer

VideoHub implements an MVP-grade in-memory buffering system that batches view writes to the database.

**Location**: `backend/src/services/video.service.ts` (lines 7-50)

### Architecture

```
User Views Video
    ↓
Increment in Memory Buffer (Map<videoId, count>)
    ↓
Return Total Views (DB + Buffer)
    ↓
[Every 60 seconds]
    ↓
Batch Flush to PostgreSQL
    ↓
Clear Buffer
```

### Implementation Details

**Data Structure**:
```typescript
const viewBuffer = new Map<string, number>();
```

**Key Functions**:

1. **Increment View Count** (lines 12-17):
   - Increments counter in memory for specific video ID
   - Returns new buffered count
   - O(1) time complexity

2. **Get Buffered Count** (lines 20-22):
   - Retrieves current buffered count for video
   - Returns 0 if video not in buffer

3. **Batch Flush** (lines 25-41):
   - Converts Map to array of entries
   - Clears buffer to prevent double-counting
   - Iterates through entries and updates database
   - Handles individual failures gracefully
   - Uses Prisma's `increment` operation for atomic updates

4. **Scheduler** (lines 44-50):
   - Runs every 60 seconds via `setInterval`
   - Automatically starts on module load
   - Prevents multiple schedulers with guard check

### Performance Benefits

- **Connection Pool Protection**: Reduces database writes by factor of ~60x (assuming 1 view/second per video)
- **Reduced Contention**: Batch updates minimize lock contention
- **Real-Time Accuracy**: View counts include buffered values for immediate feedback
- **Graceful Degradation**: Individual flush failures don't affect other videos

### Trade-offs

- **Memory Usage**: Buffer grows with unique videos viewed (mitigated by 60-second flush)
- **Potential Data Loss**: Server crash before flush loses buffered views (acceptable for MVP)
- **Eventual Consistency**: Database lags behind real-time by up to 60 seconds

## Data Consistency: Atomic Operations

### Problem Statement

Social features like likes and subscriptions are prone to race conditions when users rapidly click buttons. Without proper transaction handling, this can lead to:
- Duplicate likes/subscriptions
- Inconsistent counts
- Data corruption

### Solution: Prisma Transactions

VideoHub uses Prisma's `$transaction` API to ensure atomic operations for all toggle-based social features.

### Like Toggle Implementation

**Location**: `backend/src/services/video.service.ts` (lines 239-271)

**Transaction Flow**:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Check if like exists
  const existingLike = await tx.like.findUnique({
    where: { userId_videoId: { userId, videoId } }
  });

  // 2. Either delete existing or create new
  if (existingLike) {
    await tx.like.delete({ where: { id: existingLike.id } });
  } else {
    await tx.like.create({ data: { userId, videoId } });
  }

  // 3. Get updated count atomically
  const likesCount = await tx.like.count({ where: { videoId } });

  return { isLiked: !existingLike, likesCount };
});
```

**Key Features**:
- **Atomicity**: All operations succeed or fail together
- **Isolation**: Transaction runs in isolated context
- **Consistency**: Database state remains valid
- **Race Condition Prevention**: Concurrent requests are serialized

### Subscription Toggle

**Location**: `backend/src/controllers/subscription.controller.ts` (lines 8-46)

**Implementation**:
- Uses unique constraint on `(subscriberId, channelId)` pair
- Checks for existing subscription before toggle
- Prevents self-subscription
- Returns success message for both subscribe and unsubscribe actions

**Database Schema**:
```prisma
model Subscription {
  @@unique([subscriberId, channelId])
}
```

This unique constraint ensures database-level prevention of duplicate subscriptions.

## Performance Optimizations Summary

### 1. Video Streaming
- HTTP 206 partial content for efficient streaming
- Direct disk-to-response streaming (no RAM buffering)
- 1-year cache headers for static assets

### 2. Database Operations
- In-memory view buffer with 60-second batch flush
- Prisma transactions for atomic social operations
- Indexed database columns for fast queries

### 3. API Design
- RESTful endpoints with clear separation
- JWT-based stateless authentication
- CORS configuration for multi-environment support

### 4. Frontend Optimization
- Next.js with server-side rendering
- React Player for efficient video playback
- Intersection Observer for lazy loading

## Database Schema Highlights

**Indexed Columns**:
- `User.email`, `User.googleId` - Fast authentication lookups
- `Video.authorId`, `Video.createdAt` - Efficient video queries
- `Comment.userId`, `Comment.videoId` - Fast comment retrieval
- `Like.videoId` - Quick like counting
- `Subscription.channelId`, `Subscription.subscriberId` - Fast subscription checks

**Unique Constraints**:
- `User.email`, `User.username` - Prevent duplicates
- `Like.userId_videoId` - One like per user per video
- `Subscription.subscriberId_channelId` - One subscription per user per channel

## Security Considerations

1. **Path Traversal Prevention**: Filename validation in streaming endpoints
2. **JWT Authentication**: Secure token-based auth with configurable secrets
3. **CORS Configuration**: Controlled cross-origin access
4. **Input Validation**: Type-safe TypeScript throughout the stack
5. **SQL Injection Prevention**: Prisma ORM parameterized queries

## Scalability Considerations

### Current MVP Limitations
- Single-server architecture
- In-memory view buffer (not distributed)
- Local file storage (no CDN integration)

### Future Scaling Paths
1. **Redis Integration**: Replace in-memory buffer with Redis for distributed caching
2. **CDN Integration**: Move video storage to cloud CDN (AWS CloudFront, Cloudflare)
3. **Database Sharding**: Partition videos by author or region
4. **Microservices**: Separate streaming, auth, and social features
5. **Message Queue**: Use RabbitMQ/Kafka for async view processing

## Technology Rationale

### Why No Redis?
- MVP scope doesn't require distributed caching
- In-memory buffer is sufficient for single-server deployment
- Reduces infrastructure complexity and cost

### Why No Cloud Storage?
- Local file storage simplifies development and deployment
- HTTP 206 streaming works with local files
- Easy migration path to cloud storage when needed

### Why Prisma?
- Type-safe database queries
- Automatic migrations
- Excellent TypeScript integration
- Built-in transaction support

### Why Next.js?
- Server-side rendering for SEO
- API routes for backend integration
- Built-in optimization
- Strong TypeScript support

## Conclusion

VideoHub demonstrates that production-grade performance can be achieved with:
- Clean, layered architecture
- Smart optimizations (HTTP 206, view buffering, atomic transactions)
- Minimal infrastructure complexity
- Type-safe development practices

The system is ready for deployment, review, and presentation while maintaining a clear path for future scaling when needed.
