import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateIndisponibiliteDto {
    @IsDateString()
    dateDebut!: string;

    @IsDateString()
    dateFin!: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    motif?: string;
}
