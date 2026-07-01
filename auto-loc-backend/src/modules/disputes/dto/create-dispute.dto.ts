import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @MinLength(3)
  motif!: string; // Ex: DEPASSEMENT_PERSONNES, DEGRADATION, LOGEMENT_NON_CONFORME, etc.

  @IsString()
  @MinLength(10)
  description!: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  coutEstime?: number;
}
