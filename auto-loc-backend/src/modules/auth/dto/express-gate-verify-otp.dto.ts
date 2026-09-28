import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class ExpressGateVerifyOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phone!: string;

  @IsString()
  @Length(6, 6, { message: 'Le code OTP doit contenir 6 chiffres' })
  @Matches(/^\d{6}$/, { message: 'Le code doit contenir uniquement des chiffres' })
  code!: string;

  @IsString()
  @IsOptional()
  prenom?: string;

  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  dateNaissance?: string;

  @IsString()
  @IsOptional()
  utmSource?: string;

  @IsString()
  @IsOptional()
  utmMedium?: string;

  @IsString()
  @IsOptional()
  utmCampaign?: string;

  @IsString()
  @IsOptional()
  fbclid?: string;
}
