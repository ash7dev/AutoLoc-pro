import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class BanUserDto {
  @IsBoolean()
  actif!: boolean;

  @IsOptional()
  @IsDateString()
  bloqueJusqua?: string;

  @IsOptional()
  @IsString()
  raison?: string;
}
