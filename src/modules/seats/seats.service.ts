import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat, SeatStatus } from './entities/seat.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { RedisLockService } from '../redis/redis-lock.service';

@Injectable()
export class SeatsService {
  private readonly logger = new Logger(SeatsService.name);

  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly redisLockService: RedisLockService,
  ) {}

  async findByEvent(eventId: string): Promise<Seat[]> {
    return this.seatRepository.find({
      where: { eventId },
      order: { seatNumber: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Seat> {
    const seat = await this.seatRepository.findOne({ where: { id } });
    if (!seat) {
      throw new NotFoundException(`Seat with ID ${id} not found`);
    }
    return seat;
  }

  /**
   * Concurrency-Safe Seat Reservation (5-Minute Hold)
   * 1. Acquires Redis Distributed Atomic Lock on seat ID.
   * 2. Verifies seat availability in PostgreSQL.
   * 3. Updates seat status to `HELD` with 5-min expiration timestamp.
   * 4. Creates a `PENDING` booking.
   * 5. Releases Redis Lock cleanly.
   */
  async holdSeat(seatId: string, userId: string): Promise<{ seat: Seat; booking: Booking }> {
    const lockKey = `lock:seat:${seatId}`;

    // 1. Try to acquire Redis Atomic Lock (5-second execution lock TTL)
    const lockToken = await this.redisLockService.acquireLock(lockKey, 5000);
    if (!lockToken) {
      throw new ConflictException(
        'Seat is currently being processed by another user. Please try again.',
      );
    }

    try {
      // 2. Fetch fresh seat state from database
      const seat = await this.seatRepository.findOne({ where: { id: seatId } });
      if (!seat) {
        throw new NotFoundException(`Seat with ID ${seatId} not found`);
      }

      // Check if seat is already HELD or BOOKED
      if (seat.status !== SeatStatus.AVAILABLE) {
        throw new ConflictException(
          `Seat ${seat.seatNumber} is no longer available (Status: ${seat.status}).`,
        );
      }

      // 3. Set 5-Minute Hold Expiration Timestamp
      const holdDurationMinutes = 5;
      const heldUntil = new Date(Date.now() + holdDurationMinutes * 60 * 1000);

      seat.status = SeatStatus.HELD;
      seat.heldByUserId = userId;
      seat.heldUntil = heldUntil;

      const updatedSeat = await this.seatRepository.save(seat);

      // 4. Create PENDING Booking record
      const booking = this.bookingRepository.create({
        userId,
        seatId: seat.id,
        amount: seat.price,
        status: BookingStatus.PENDING,
        expiresAt: heldUntil,
      });

      const savedBooking = await this.bookingRepository.save(booking);

      this.logger.log(
        `🎉 Seat ${seat.seatNumber} successfully HELD for user ${userId} until ${heldUntil.toISOString()}`,
      );

      return { seat: updatedSeat, booking: savedBooking };
    } finally {
      // 5. Always release Redis Distributed Lock
      await this.redisLockService.releaseLock(lockKey, lockToken);
    }
  }
}
