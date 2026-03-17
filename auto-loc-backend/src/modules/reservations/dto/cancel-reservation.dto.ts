import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CancelReservationDto {
    @IsString()
    @IsNotEmpty({ message: 'La raison d\'annulation est obligatoire' })
    @MinLength(5, { message: 'La raison doit contenir au moins 5 caractères' })
    raison!: string;
}
