import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsArray,
  IsIn,
  IsString,
  Min,
  Max,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Carburant, Transmission, TypeVehicule } from '@prisma/client';

/** Transform empty strings or whitespace-only strings to undefined */
const EmptyToUndefined = () =>
  Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }
    return value;
  });

/** Transform single strings or comma-separated strings to string[] array */
const StringToArray = () =>
  Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (Array.isArray(value)) {
      const filtered = value
        .map((v) => (typeof v === 'string' ? v.trim() : v))
        .filter((v) => Boolean(v) && typeof v === 'string');
      return filtered.length > 0 ? filtered : undefined;
    }
    if (typeof value === 'string') {
      const parts = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return parts.length > 0 ? parts : undefined;
    }
    return undefined;
  });

/** Case-insensitive & alias transformer for TypeVehicule */
const TransformVehicleType = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string' || !value.trim()) return undefined;
    const norm = value.toUpperCase().trim();
    if (norm === 'ALL' || norm === 'TOUS') return undefined;
    if (norm === 'PREMIUM') return TypeVehicule.LUXE;
    if (norm === '4X4' || norm === 'FOUR_X_FOUR' || norm === '4*4') return TypeVehicule.FOUR_X_FOUR;
    if (Object.values(TypeVehicule).includes(norm as TypeVehicule)) {
      return norm as TypeVehicule;
    }
    return undefined;
  });

/** Case-insensitive transformer for Carburant */
const TransformCarburant = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string' || !value.trim()) return undefined;
    const norm = value.toUpperCase().trim();
    if (norm === 'ALL' || norm === 'TOUS') return undefined;
    if (Object.values(Carburant).includes(norm as Carburant)) {
      return norm as Carburant;
    }
    return undefined;
  });

/** Case-insensitive transformer for Transmission */
const TransformTransmission = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string' || !value.trim()) return undefined;
    const norm = value.toUpperCase().trim();
    if (norm === 'ALL' || norm === 'TOUS') return undefined;
    if (Object.values(Transmission).includes(norm as Transmission)) {
      return norm as Transmission;
    }
    return undefined;
  });

@ValidatorConstraint({ name: 'IsAfterStartDate', async: false })
class IsAfterStartDate implements ValidatorConstraintInterface {
  validate(end: string, args: ValidationArguments) {
    const dto = args.object as SearchVehiclesDto;
    const startStr = dto.dateDebut || dto.debut;
    const endStr = end || dto.dateFin || dto.fin;
    if (!startStr || !endStr) return true;
    const start = new Date(startStr).getTime();
    const finish = new Date(endStr).getTime();
    return Number.isFinite(start) && Number.isFinite(finish) && finish >= start;
  }

  defaultMessage() {
    return 'dateFin doit être postérieure ou égale à dateDebut';
  }
}

export class SearchVehiclesDto {
  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  ville?: string;

  /** Alias for ville */
  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  zone?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  q?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsDateString()
  dateDebut?: string;

  /** Alias for dateDebut */
  @IsOptional()
  @EmptyToUndefined()
  @IsDateString()
  debut?: string;

  @IsOptional()
  @EmptyToUndefined()
  @ValidateIf((o: SearchVehiclesDto) => Boolean(o.dateDebut || o.debut) && Boolean(o.dateFin || o.fin))
  @IsDateString()
  @Validate(IsAfterStartDate)
  dateFin?: string;

  /** Alias for dateFin */
  @IsOptional()
  @EmptyToUndefined()
  @ValidateIf((o: SearchVehiclesDto) => Boolean(o.dateDebut || o.debut) && Boolean(o.dateFin || o.fin))
  @IsDateString()
  @Validate(IsAfterStartDate)
  fin?: string;

  @IsOptional()
  @TransformVehicleType()
  @IsEnum(TypeVehicule)
  type?: TypeVehicule;

  @IsOptional()
  @EmptyToUndefined()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prixMin?: number;

  /** Alias for prixMin */
  @IsOptional()
  @EmptyToUndefined()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budgetMin?: number;

  @IsOptional()
  @EmptyToUndefined()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prixMax?: number;

  /** Alias for prixMax */
  @IsOptional()
  @EmptyToUndefined()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budgetMax?: number;

  /** Alias for prixMax */
  @IsOptional()
  @EmptyToUndefined()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budget?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @TransformCarburant()
  @IsEnum(Carburant)
  carburant?: Carburant;

  /** Alias for carburant */
  @IsOptional()
  @TransformCarburant()
  @IsEnum(Carburant)
  fuel?: Carburant;

  @IsOptional()
  @TransformTransmission()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @IsOptional()
  @EmptyToUndefined()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  placesMin?: number;

  /** Alias for placesMin */
  @IsOptional()
  @EmptyToUndefined()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  places?: number;

  @IsOptional()
  @EmptyToUndefined()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  noteMin?: number;

  @IsOptional()
  @EmptyToUndefined()
  @IsIn(['totalLocations', 'note', 'prixParJour', 'annee'])
  sortBy?: 'totalLocations' | 'note' | 'prixParJour' | 'annee';

  /** Alias for sortBy */
  @IsOptional()
  @EmptyToUndefined()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const sortMap: Record<string, string> = {
      popular: 'totalLocations',
      rating: 'note',
      'price-asc': 'prixParJour',
      'price-desc': 'prixParJour',
      newest: 'annee',
    };
    return sortMap[value] || value;
  })
  @IsIn(['totalLocations', 'note', 'prixParJour', 'annee'])
  sort?: 'totalLocations' | 'note' | 'prixParJour' | 'annee';

  @IsOptional()
  @EmptyToUndefined()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  // ── Geolocation (Haversine) ────────────────────────────────────
  @IsOptional()
  @EmptyToUndefined()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @EmptyToUndefined()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  /** Rayon de recherche en km (défaut 30) */
  @IsOptional()
  @EmptyToUndefined()
  @IsNumber()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  rayon?: number;

  /** Flag géolocalisation proche de moi */
  @IsOptional()
  @Transform(({ value }) => value === '1' || value === 'true' || value === true)
  @IsBoolean()
  nearMe?: boolean;

  /** Liste d'équipements requis (ex: GPS,CLIMATISATION) */
  @IsOptional()
  @StringToArray()
  @IsArray()
  @IsString({ each: true })
  equipements?: string[];

  /** IDs à exclure des résultats (pagination invisible du feed accueil) */
  @IsOptional()
  @StringToArray()
  @IsArray()
  @IsString({ each: true })
  excludeIds?: string[];
}
