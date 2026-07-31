import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Seat } from './entities/seat.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { SEAT_EXPIRATION_QUEUE } from '../queues/seat-expiration.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Seat, Booking]),
    BullModule.registerQueue({
      name: SEAT_EXPIRATION_QUEUE,
    }),
  ],
  controllers: [SeatsController],
  providers: [SeatsService],
  exports: [SeatsService, TypeOrmModule],
})
export class SeatsModule {}
