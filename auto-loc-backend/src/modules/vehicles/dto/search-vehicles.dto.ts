import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  IsString,
  Min,
  Max,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Carburant, Transmission, TypeVehicule } from '@prisma/client';

@ValidatorConstraint({ name: 'IsAfterStartDate', async: false })
class IsAfterStartDate implements ValidatorConstraintInterface {
  validate(end: string, args: ValidationArguments) {
    const dto = args.object as SearchVehiclesDto;
    if (!dto.dateDebut) return true;
    const start = new Date(dto.dateDebut).getTime();
    const finish = new Date(end).getTime();
    return Number.isFinite(start) && Number.isFinite(finish) && finish >= start;
  }

  defaultMessage() {
    return 'dateFin doit être postérieure ou égale à dateDebut';
  }
}

export class SearchVehiclesDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ville?: string;

  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsDateString()
  @ValidateIf((o: SearchVehiclesDto) => Boolean(o.dateDebut))
  @Validate(IsAfterStartDate)
  dateFin?: string;

  @IsOptional()
  @IsEnum(TypeVehicule)
  type?: TypeVehicule;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prixMax?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsEnum(Carburant)
  carburant?: Carburant;

  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  placesMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  noteMin?: number;

  @IsOptional()
  @IsIn(['totalLocations', 'note', 'prixParJour', 'annee'])
  sortBy?: 'totalLocations' | 'note' | 'prixParJour' | 'annee';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
