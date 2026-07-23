import { IsNotEmpty, IsString } from 'class-validator';

export class LinkPhotoDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsNotEmpty()
  publicId!: string;
}
