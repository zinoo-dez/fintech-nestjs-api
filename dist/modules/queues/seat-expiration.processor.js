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
var SeatExpirationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatExpirationProcessor = exports.SEAT_EXPIRATION_QUEUE = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const seat_entity_1 = require("../seats/entities/seat.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
exports.SEAT_EXPIRATION_QUEUE = 'seat-expiration';
let SeatExpirationProcessor = SeatExpirationProcessor_1 = class SeatExpirationProcessor extends bullmq_1.WorkerHost {
    seatRepository;
    bookingRepository;
    logger = new common_1.Logger(SeatExpirationProcessor_1.name);
    constructor(seatRepository, bookingRepository) {
        super();
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
    }
    async process(job) {
        const { seatId, bookingId } = job.data;
        this.logger.log(`⏱️ Processing 5-minute expiration check for Seat ID: ${seatId}, Booking ID: ${bookingId}`);
        const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) {
            this.logger.warn(`Booking ID ${bookingId} not found. Skipping.`);
            return;
        }
        if (booking.status === booking_entity_1.BookingStatus.PENDING) {
            booking.status = booking_entity_1.BookingStatus.EXPIRED;
            await this.bookingRepository.save(booking);
            const seat = await this.seatRepository.findOne({ where: { id: seatId } });
            if (seat && seat.status === seat_entity_1.SeatStatus.HELD) {
                seat.status = seat_entity_1.SeatStatus.AVAILABLE;
                seat.heldByUserId = null;
                seat.heldUntil = null;
                await this.seatRepository.save(seat);
                this.logger.log(`⏰ 5-Minute Timeout! Seat ${seat.seatNumber} automatically RELEASED back to AVAILABLE.`);
            }
        }
        else {
            this.logger.log(`✅ Booking ${bookingId} is already ${booking.status}. Skipping seat release.`);
        }
    }
};
exports.SeatExpirationProcessor = SeatExpirationProcessor;
exports.SeatExpirationProcessor = SeatExpirationProcessor = SeatExpirationProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(exports.SEAT_EXPIRATION_QUEUE),
    __param(0, (0, typeorm_1.InjectRepository)(seat_entity_1.Seat)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SeatExpirationProcessor);
//# sourceMappingURL=seat-expiration.processor.js.map