import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdatePhotoDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  estPrincipale?: boolean;
}
