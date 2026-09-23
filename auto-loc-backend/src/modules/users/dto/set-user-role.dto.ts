import { IsEnum, IsNotEmpty } from 'class-validator';
import { RoleProfile } from '@prisma/client';

export class SetUserRoleDto {
  @IsNotEmpty()
  @IsEnum(RoleProfile)
  role!: RoleProfile;
}
