// Author: Denys(ezpectus)
// Redis configuration for view counter caching and performance optimization

import { createClient, RedisClientType } from 'redis';
import { ENV } from './env';

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createClient({
      url: ENV.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis reconnection failed after 10 retries');
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    await redisClient.connect();
  }

  return redisClient;
};

export const incrementViewCount = async (videoId: string): Promise<number> => {
  try {
    const client = await getRedisClient();
    const key = `video:${videoId}:views`;
    const count = await client.incr(key);
    
    // Set expiration to 1 hour to prevent memory bloat
    await client.expire(key, 3600);
    
    return count;
  } catch (error) {
    console.error('Redis increment error:', error);
    // Fallback to 0 if Redis fails
    return 0;
  }
};

export const getViewCount = async (videoId: string): Promise<number> => {
  try {
    const client = await getRedisClient();
    const key = `video:${videoId}:views`;
    const count = await client.get(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Redis get error:', error);
    return 0;
  }
};

export const resetViewCount = async (videoId: string): Promise<void> => {
  try {
    const client = await getRedisClient();
    const key = `video:${videoId}:views`;
    await client.del(key);
  } catch (error) {
    console.error('Redis reset error:', error);
  }
};

export const batchUpdateViewCounts = async (): Promise<void> => {
  try {
    const client = await getRedisClient();
    const keys = await client.keys('video:*:views');
    
    for (const key of keys) {
      const videoId = key.split(':')[1];
      const count = await client.get(key);
      
      if (count && parseInt(count, 10) > 0) {
        // Update database with batched count
        const { prisma } = await import('../config/prisma');
        await prisma.video.update({
          where: { id: videoId },
          data: { views: { increment: parseInt(count, 10) } },
        });
        
        // Reset Redis counter after successful DB update
        await client.del(key);
      }
    }
  } catch (error) {
    console.error('Batch update error:', error);
  }
};

// Start batch update interval (every 60 seconds)
let batchUpdateInterval: NodeJS.Timeout | null = null;

export const startBatchUpdateScheduler = (): void => {
  if (batchUpdateInterval) {
    clearInterval(batchUpdateInterval);
  }
  
  batchUpdateInterval = setInterval(async () => {
    await batchUpdateViewCounts();
  }, 60000); // Run every 60 seconds
};

export const stopBatchUpdateScheduler = (): void => {
  if (batchUpdateInterval) {
    clearInterval(batchUpdateInterval);
    batchUpdateInterval = null;
  }
};
