import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SignalOverloadDto {
  @IsInt()
  @Min(1, { message: 'Le nombre d\'occupants doit être au moins 1' })
  nombreOccupantsReel!: number;

  @IsString()
  @IsOptional()
  commentaire?: string;

  @IsString()
  @IsOptional()
  preuveUrl?: string; // URL photo/vidéo si dispo
}
