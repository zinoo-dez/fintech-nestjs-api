import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Seat, Booking])],
  controllers: [SeatsController],
  providers: [SeatsService],
  exports: [SeatsService, TypeOrmModule],
})
export class SeatsModule {}
