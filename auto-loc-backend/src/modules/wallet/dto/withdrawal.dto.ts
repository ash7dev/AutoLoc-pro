import { IsEnum, IsNumber, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MethodeRetrait } from '@prisma/client';

export class WithdrawalDto {
  @IsNumber()
  @Min(500)
  @Type(() => Number)
  montant!: number;

  @IsEnum(MethodeRetrait)
  methode!: MethodeRetrait;

  @IsString()
  @Matches(/^\+?[0-9\s]{7,15}$/, { message: 'Numéro de téléphone invalide' })
  numeroDestinataire!: string;
}
