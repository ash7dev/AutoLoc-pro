import { IsNotEmpty, IsString } from 'class-validator';

export class LinkPermisDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsNotEmpty()
  publicId!: string;
}
