import { IsNotEmpty, IsString } from 'class-validator';

export class CancelReservationDto {
    @IsString()
    @IsNotEmpty({ message: 'La raison d\'annulation est obligatoire' })
    raison!: string;
}
