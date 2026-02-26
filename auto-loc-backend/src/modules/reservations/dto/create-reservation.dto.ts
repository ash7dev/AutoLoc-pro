import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { FournisseurPaiement } from '@prisma/client';

export class CreateReservationDto {
  @IsUUID()
  vehiculeId!: string;

  @IsDateString()
  @IsNotEmpty()
  dateDebut!: string;

  @IsDateString()
  @IsNotEmpty()
  dateFin!: string;

  @IsEnum(FournisseurPaiement)
  fournisseur!: FournisseurPaiement;

  /** Clé d'idempotence côté body (alternative au header Idempotency-Key). */
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
