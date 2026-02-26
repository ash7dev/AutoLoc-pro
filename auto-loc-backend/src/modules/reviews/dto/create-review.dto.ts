import { IsUUID, IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReviewDto {
    @IsUUID()
    reservationId!: string;

    @IsInt()
    @Min(1)
    @Max(5)
    note!: number;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    commentaire?: string;
}
