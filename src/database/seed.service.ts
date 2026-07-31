import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Event } from '../modules/events/entities/event.entity';
import { Seat, SeatStatus } from '../modules/seats/entities/seat.entity';
import { User } from '../modules/users/entities/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async onApplicationBootstrap() {
    await this.seedData();
  }

  private async seedData() {
    const eventCount = await this.eventRepository.count();
    if (eventCount > 0) {
      this.logger.log('Database already seeded. Skipping initial seeding.');
      return;
    }

    this.logger.log('🌱 Seeding initial sample event and seats...');

    // 1. Create Sample User
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = this.userRepository.create({
      email: 'test@gmail.com',
      passwordHash,
      name: 'Test Student',
    });
    await this.userRepository.save(user);

    // 2. Create Sample Event
    const event = this.eventRepository.create({
      title: 'NestJS Concurrency & Performance Masterclass',
      description: 'Learn high-concurrency seat locking, BullMQ, and Redis',
      venue: 'Tech Convention Hall A',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      totalSeats: 50,
    });
    const savedEvent = await this.eventRepository.save(event);

    // 3. Create 50 Seats (A-1 to A-50)
    const seats: Partial<Seat>[] = [];
    for (let i = 1; i <= 50; i++) {
      seats.push({
        eventId: savedEvent.id,
        seatNumber: `A-${i}`,
        price: 50.0,
        status: SeatStatus.AVAILABLE,
      });
    }

    await this.seatRepository.save(seats);
    this.logger.log(
      `Seeding complete! Sample Event ID: ${savedEvent.id} with 50 seats.`,
    );
  }
}
