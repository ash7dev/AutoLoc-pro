import { IsNotEmpty, IsString } from 'class-validator';

export class LoginWithSupabaseDto {
  @IsString()
  @IsNotEmpty()
  accessToken!: string;
}
