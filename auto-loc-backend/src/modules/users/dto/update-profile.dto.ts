import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    prenom?: string;

    @IsOptional()
    @IsString()
    nom?: string;

    @IsOptional()
    @IsUrl()
    avatarUrl?: string;

    @IsOptional()
    @IsDateString()
    dateNaissance?: string;
}
