import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class SendPhoneOtpDto {
  @IsOptional()
  @IsIn(['whatsapp', 'sms', 'auto'], { message: 'Canal invalide' })
  channel?: 'whatsapp' | 'sms' | 'auto';
}

export class PhoneLoginSendOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phone!: string;

  @IsOptional()
  @IsIn(['whatsapp', 'sms', 'auto'], { message: 'Canal invalide' })
  channel?: 'whatsapp' | 'sms' | 'auto';
}

export class PhoneLoginVerifyOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phone!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Le code doit contenir exactement 6 chiffres' })
  code!: string;
}
