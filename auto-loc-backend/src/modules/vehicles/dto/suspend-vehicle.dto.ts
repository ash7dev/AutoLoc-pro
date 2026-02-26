import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SuspendVehicleDto {
  @IsString()
  @IsNotEmpty({ message: 'La raison de suspension est obligatoire.' })
  @MaxLength(500)
  raison!: string;
}
