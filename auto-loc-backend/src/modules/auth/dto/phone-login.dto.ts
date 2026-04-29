import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PhoneLoginSendOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phone!: string;
}

export class PhoneLoginVerifyOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phone!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Le code doit contenir exactement 6 chiffres' })
  code!: string;
}
