import { IsNotEmpty, IsOptional, IsString, IsDateString, Matches } from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  @IsNotEmpty()
  prenom!: string;

  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'Telephone must be a valid international number',
  })
  telephone!: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
