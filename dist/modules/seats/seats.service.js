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
var SeatsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const seat_entity_1 = require("./entities/seat.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const redis_lock_service_1 = require("../redis/redis-lock.service");
const seat_expiration_processor_1 = require("../queues/seat-expiration.processor");
let SeatsService = SeatsService_1 = class SeatsService {
    seatRepository;
    bookingRepository;
    redisLockService;
    expirationQueue;
    logger = new common_1.Logger(SeatsService_1.name);
    constructor(seatRepository, bookingRepository, redisLockService, expirationQueue) {
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.redisLockService = redisLockService;
        this.expirationQueue = expirationQueue;
    }
    async findByEvent(eventId) {
        return this.seatRepository.find({
            where: { eventId },
            order: { seatNumber: 'ASC' },
        });
    }
    async findOne(id) {
        const seat = await this.seatRepository.findOne({ where: { id } });
        if (!seat) {
            throw new common_1.NotFoundException(`Seat with ID ${id} not found`);
        }
        return seat;
    }
    async holdSeat(seatId, userId) {
        const lockKey = `lock:seat:${seatId}`;
        const lockToken = await this.redisLockService.acquireLock(lockKey, 5000);
        if (!lockToken) {
            throw new common_1.ConflictException('Seat is currently being processed by another user. Please try again.');
        }
        try {
            const seat = await this.seatRepository.findOne({ where: { id: seatId } });
            if (!seat) {
                throw new common_1.NotFoundException(`Seat with ID ${seatId} not found`);
            }
            if (seat.status !== seat_entity_1.SeatStatus.AVAILABLE) {
                throw new common_1.ConflictException(`Seat ${seat.seatNumber} is no longer available (Status: ${seat.status}).`);
            }
            const holdDurationMinutes = 5;
            const heldUntil = new Date(Date.now() + holdDurationMinutes * 60 * 1000);
            seat.status = seat_entity_1.SeatStatus.HELD;
            seat.heldByUserId = userId;
            seat.heldUntil = heldUntil;
            const updatedSeat = await this.seatRepository.save(seat);
            const booking = this.bookingRepository.create({
                userId,
                seatId: seat.id,
                amount: seat.price,
                status: booking_entity_1.BookingStatus.PENDING,
                expiresAt: heldUntil,
            });
            const savedBooking = await this.bookingRepository.save(booking);
            const delayMs = holdDurationMinutes * 60 * 1000;
            await this.expirationQueue.add('expire-seat', { seatId: seat.id, bookingId: savedBooking.id }, { delay: delayMs });
            this.logger.log(`🎉 Seat ${seat.seatNumber} successfully HELD for user ${userId}. Delayed BullMQ job enqueued for ${holdDurationMinutes} mins.`);
            return { seat: updatedSeat, booking: savedBooking };
        }
        finally {
            await this.redisLockService.releaseLock(lockKey, lockToken);
        }
    }
};
exports.SeatsService = SeatsService;
exports.SeatsService = SeatsService = SeatsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(seat_entity_1.Seat)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(3, (0, bullmq_1.InjectQueue)(seat_expiration_processor_1.SEAT_EXPIRATION_QUEUE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        redis_lock_service_1.RedisLockService,
        bullmq_2.Queue])
], SeatsService);
//# sourceMappingURL=seats.service.js.map