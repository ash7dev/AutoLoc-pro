import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdatePhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'Telephone must be a valid international number',
  })
  telephone!: string;
}
