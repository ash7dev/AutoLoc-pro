import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RefusCheckinDto {
  @IsString()
  @IsNotEmpty()
  motif!: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsString()
  raison?: string;
}
