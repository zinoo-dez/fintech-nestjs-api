import Redis from 'ioredis';
export declare const REDIS_CLIENT = "REDIS_CLIENT";
export declare class RedisLockService {
    private readonly redisClient;
    private readonly logger;
    constructor(redisClient: Redis);
    acquireLock(lockKey: string, ttlMs?: number): Promise<string | null>;
    releaseLock(lockKey: string, lockToken: string): Promise<boolean>;
}
