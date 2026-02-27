import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @MinLength(10)
  description!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  coutEstime?: number;
}
