import { IsBoolean, IsOptional } from 'class-validator';

export class CheckinDto {
  @IsOptional()
  @IsBoolean()
  soldeRecu?: boolean;
}
