import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Carburant, Transmission, TypeVehicule } from '@prisma/client';

export class PriceTierDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  joursMin!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  joursMax?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prix!: number;
}

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  marque!: string;

  @IsString()
  @IsNotEmpty()
  modele!: string;

  @IsInt()
  @Min(1900)
  @Max(2030)
  @Type(() => Number)
  annee!: number;

  @IsEnum(TypeVehicule)
  type!: TypeVehicule;

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

  @IsString()
  @IsNotEmpty()
  immatriculation!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prixParJour!: number;

  @IsString()
  @IsNotEmpty()
  ville!: string;

  @IsString()
  @IsNotEmpty()
  adresse!: string;

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

  // ── Conditions de location ──────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  zoneConduite?: string;

  @IsOptional()
  @IsString()
  assurance?: string;

  @IsOptional()
  @IsString()
  reglesSpecifiques?: string;

  // ── Tarification progressive ────────────────────────────────────────────────

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  tiers?: PriceTierDto[];
}
