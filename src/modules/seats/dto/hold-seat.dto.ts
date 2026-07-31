import { IsUUID, IsNotEmpty } from 'class-validator';

export class HoldSeatDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
