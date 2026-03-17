import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @MinLength(10)
  description!: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  coutEstime?: number;
}
