import { IsOptional, IsString } from 'class-validator';

export class RejectKycDto {
  @IsOptional()
  @IsString()
  raison?: string;
}
