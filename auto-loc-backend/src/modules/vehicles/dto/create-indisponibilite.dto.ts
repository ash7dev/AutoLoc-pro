import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TypeIndisponibilite } from '@prisma/client';

export class CreateIndisponibiliteDto {
  @IsDateString()
  dateDebut!: string;

  @IsDateString()
  dateFin!: string;

  @IsOptional()
  @IsEnum(TypeIndisponibilite)
  type?: TypeIndisponibilite = TypeIndisponibilite.USAGE_PERSONNEL;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  motif?: string;
}
