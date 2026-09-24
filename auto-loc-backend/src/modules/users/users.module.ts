import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AdminController } from './admin.controller';
import { ProfileController } from './profile.controller';
import { HostsController } from './hosts.controller';
import { UsersService } from './users.service';
import { RevalidateModule } from '../../infrastructure/revalidate/revalidate.module';
import { SecurityService } from './security.service';

@Module({
  imports: [RevalidateModule],
  controllers: [UsersController, AdminController, ProfileController, HostsController],
  providers: [UsersService, SecurityService],
})
export class UsersModule { }
