import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterExpoTokenDto {
  @IsString()
  @IsNotEmpty()
  expoPushToken!: string;

  @IsString()
  @IsOptional()
  deviceType?: string;
}
