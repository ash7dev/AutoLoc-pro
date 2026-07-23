import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmReservationDto {
  @IsString()
  @IsNotEmpty()
  heureDebut!: string;
}
