import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LinkPhotoEtatDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsNotEmpty()
  publicId!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsOptional()
  @IsString()
  categorie?: string;
}
