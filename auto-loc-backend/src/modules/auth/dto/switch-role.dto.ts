import { IsIn } from 'class-validator';

export class SwitchRoleDto {
  @IsIn(['LOCATAIRE', 'PROPRIETAIRE'])
  role!: 'LOCATAIRE' | 'PROPRIETAIRE';
}
