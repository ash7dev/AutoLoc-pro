import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitKycLinksDto {
  @IsString()
  @IsNotEmpty()
  documentFrontUrl!: string;

  @IsString()
  @IsNotEmpty()
  documentBackUrl!: string;

  @IsOptional()
  @IsString()
  selfieUrl?: string;
}
