import { Controller, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { HoldSeatDto } from './dto/hold-seat.dto';

@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Post(':id/hold')
  @HttpCode(HttpStatus.OK)
  async holdSeat(
    @Param('id') seatId: string,
    @Body() holdSeatDto: HoldSeatDto,
  ) {
    return this.seatsService.holdSeat(seatId, holdSeatDto.userId);
  }
}
