import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { Seat } from './entities/seat.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { RedisLockService } from '../redis/redis-lock.service';
import { SeatExpirationJobData } from '../queues/seat-expiration.processor';
export declare class SeatsService {
    private readonly seatRepository;
    private readonly bookingRepository;
    private readonly redisLockService;
    private readonly expirationQueue;
    private readonly logger;
    constructor(seatRepository: Repository<Seat>, bookingRepository: Repository<Booking>, redisLockService: RedisLockService, expirationQueue: Queue<SeatExpirationJobData>);
    findByEvent(eventId: string): Promise<Seat[]>;
    findOne(id: string): Promise<Seat>;
    holdSeat(seatId: string, userId: string): Promise<{
        seat: Seat;
        booking: Booking;
    }>;
}
