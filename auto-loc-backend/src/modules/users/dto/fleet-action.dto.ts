import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum FleetActionType {
  SUSPEND_ALL = 'SUSPEND_ALL',
  ACTIVATE_ALL = 'ACTIVATE_ALL',
}

export class HostFleetActionDto {
  @IsEnum(FleetActionType)
  action!: FleetActionType;

  @IsOptional()
  @IsString()
  raison?: string;
}
