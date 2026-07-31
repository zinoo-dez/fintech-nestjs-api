import { Repository, DataSource } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Seat } from '../seats/entities/seat.entity';
import { CheckoutBookingDto } from './dto/checkout-booking.dto';
export declare class BookingsService {
    private readonly bookingRepository;
    private readonly seatRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(bookingRepository: Repository<Booking>, seatRepository: Repository<Seat>, dataSource: DataSource);
    checkout(dto: CheckoutBookingDto): Promise<Booking>;
    getUserBookings(userId: string): Promise<Booking[]>;
    getBookingDetails(bookingId: string): Promise<Booking>;
}
