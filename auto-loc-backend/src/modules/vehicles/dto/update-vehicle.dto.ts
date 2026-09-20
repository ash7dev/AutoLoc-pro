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
  IsBoolean,
  ValidateIf,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Carburant, StatutVehicule, Transmission, TypeVehicule } from '@prisma/client';
import { PhotoInputDto, PriceTierDto } from './create-vehicle.dto';

export class UpdateVehicleDto {
  @IsOptional()
  @IsEnum(StatutVehicule)
  statut?: StatutVehicule;

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
  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins 1 type de véhicule doit être sélectionné' })
  @ArrayMaxSize(3, { message: 'Maximum 3 types de véhicule autorisés' })
  @IsEnum(TypeVehicule, { each: true })
  types?: TypeVehicule[];

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
  carburantCondition?: string;

  @IsOptional()
  @IsString()
  reglesSpecifiques?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  tiers?: PriceTierDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipements?: string[];

  // ── Livraison & Hors Dakar ──────────────────────────────────────────────────

  @IsOptional()
  @IsBoolean()
  autoriseHorsDakar?: boolean;

  @ValidateIf((o) => o.autoriseHorsDakar === true)
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  supplementHorsDakarParJour?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fraisLivraison?: number;

  @IsOptional()
  @IsBoolean()
  proposeLivraisonDakar?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fraisLivraisonDakar?: number;

  @IsOptional()
  @IsBoolean()
  proposeLivraisonAibd?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fraisLivraisonAibd?: number;

  // ── Photos & Documents (niveaux de mise à jour) ───────────────────────────

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoInputDto)
  photos?: PhotoInputDto[];

  @IsOptional()
  @IsString()
  carteGriseUrl?: string;

  @IsOptional()
  @IsString()
  carteGrisePublicId?: string;

  @IsOptional()
  @IsString()
  assuranceDocUrl?: string;

  @IsOptional()
  @IsString()
  assuranceDocPublicId?: string;
}
