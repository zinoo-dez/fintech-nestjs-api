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
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("./entities/booking.entity");
const seat_entity_1 = require("../seats/entities/seat.entity");
let BookingsService = BookingsService_1 = class BookingsService {
    bookingRepository;
    seatRepository;
    dataSource;
    logger = new common_1.Logger(BookingsService_1.name);
    constructor(bookingRepository, seatRepository, dataSource) {
        this.bookingRepository = bookingRepository;
        this.seatRepository = seatRepository;
        this.dataSource = dataSource;
    }
    async checkout(dto) {
        const { bookingId, userId, paymentMethod } = dto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const booking = await queryRunner.manager.findOne(booking_entity_1.Booking, {
                where: { id: bookingId },
                relations: { seat: { event: true } },
            });
            if (!booking) {
                throw new common_1.NotFoundException(`Booking with ID ${bookingId} not found`);
            }
            if (booking.userId !== userId) {
                throw new common_1.ForbiddenException(`You do not have access to this booking.`);
            }
            if (booking.status !== booking_entity_1.BookingStatus.PENDING) {
                throw new common_1.ConflictException(`Booking ${bookingId} cannot be checked out because its status is ${booking.status}.`);
            }
            if (new Date() > booking.expiresAt) {
                booking.status = booking_entity_1.BookingStatus.EXPIRED;
                await queryRunner.manager.save(booking);
                throw new common_1.ConflictException(`Booking ${bookingId} has expired past the 5-minute payment window.`);
            }
            const seat = booking.seat;
            if (!seat || seat.status !== seat_entity_1.SeatStatus.HELD || seat.heldByUserId !== userId) {
                throw new common_1.ConflictException(`Seat ${seat?.seatNumber} is no longer held by you.`);
            }
            seat.status = seat_entity_1.SeatStatus.BOOKED;
            seat.heldByUserId = null;
            seat.heldUntil = null;
            await queryRunner.manager.save(seat);
            booking.status = booking_entity_1.BookingStatus.CONFIRMED;
            const updatedBooking = await queryRunner.manager.save(booking);
            await queryRunner.commitTransaction();
            this.logger.log(`🎉 Payment Successful via ${paymentMethod}! Booking ${bookingId} CONFIRMED for Seat ${seat.seatNumber}.`);
            return updatedBooking;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getUserBookings(userId) {
        return this.bookingRepository.find({
            where: { userId },
            relations: { seat: { event: true } },
            order: { createdAt: 'DESC' },
        });
    }
    async getBookingDetails(bookingId) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: { seat: { event: true }, user: true },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${bookingId} not found`);
        }
        return booking;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(seat_entity_1.Seat)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map