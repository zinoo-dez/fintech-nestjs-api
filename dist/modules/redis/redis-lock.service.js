"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisLockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisLockService = exports.REDIS_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const uuid_1 = require("uuid");
exports.REDIS_CLIENT = 'REDIS_CLIENT';
let RedisLockService = RedisLockService_1 = class RedisLockService {
    redisClient;
    logger = new common_1.Logger(RedisLockService_1.name);
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async acquireLock(lockKey, ttlMs = 5000) {
        const lockToken = (0, uuid_1.v4)();
        const result = await this.redisClient.set(lockKey, lockToken, 'PX', ttlMs, 'NX');
        if (result === 'OK') {
            this.logger.debug(`Lock acquired: ${lockKey} (Token: ${lockToken})`);
            return lockToken;
        }
        this.logger.warn(`Failed to acquire lock: ${lockKey}`);
        return null;
    }
    async releaseLock(lockKey, lockToken) {
        const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
        const result = await this.redisClient.eval(luaScript, 1, lockKey, lockToken);
        const isReleased = result === 1;
        if (isReleased) {
            this.logger.debug(`Lock released: ${lockKey}`);
        }
        else {
            this.logger.warn(`Failed to release lock or lock expired: ${lockKey}`);
        }
        return isReleased;
    }
};
exports.RedisLockService = RedisLockService;
exports.RedisLockService = RedisLockService = RedisLockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(exports.REDIS_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.default])
], RedisLockService);
//# sourceMappingURL=redis-lock.service.js.map