import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SignalTenantNoshowDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  commentaire?: string;
}
