import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { StatutLitige } from '@prisma/client';

export class GetDisputesQueueDto {
  @IsOptional()
  @IsIn([...Object.values(StatutLitige), 'ALL'])
  statut?: StatutLitige | 'ALL';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 20;
}
