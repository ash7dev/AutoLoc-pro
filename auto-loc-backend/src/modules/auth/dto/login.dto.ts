import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// DTO pour un login backend éventuel (si tu ajoutes email/mot de passe).
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
