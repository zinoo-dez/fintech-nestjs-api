import { BookingsService } from './bookings.service';
import { CheckoutBookingDto } from './dto/checkout-booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    checkout(dto: CheckoutBookingDto): Promise<import("./entities/booking.entity").Booking>;
    getUserBookings(userId: string): Promise<import("./entities/booking.entity").Booking[]>;
    getBookingDetails(bookingId: string): Promise<import("./entities/booking.entity").Booking>;
}
