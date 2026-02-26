import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Carburant, Transmission, TypeVehicule } from '@prisma/client';
import { PriceTierDto } from './create-vehicle.dto';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  marque?: string;

  @IsOptional()
  @IsString()
  modele?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2030)
  @Type(() => Number)
  annee?: number;

  @IsOptional()
  @IsEnum(TypeVehicule)
  type?: TypeVehicule;

  @IsOptional()
  @IsEnum(Carburant)
  carburant?: Carburant;

  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  nombrePlaces?: number;

  @IsOptional()
  @IsString()
  immatriculation?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prixParJour?: number;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  joursMinimum?: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Type(() => Number)
  ageMinimum?: number;

  @IsOptional()
  @IsString()
  zoneConduite?: string;

  @IsOptional()
  @IsString()
  assurance?: string;

  @IsOptional()
  @IsString()
  reglesSpecifiques?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  tiers?: PriceTierDto[];
}
