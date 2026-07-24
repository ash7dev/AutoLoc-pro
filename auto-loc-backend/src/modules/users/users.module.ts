import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AdminController } from './admin.controller';
import { ProfileController } from './profile.controller';
import { UsersService } from './users.service';
import { RevalidateModule } from '../../infrastructure/revalidate/revalidate.module';

@Module({
  imports: [RevalidateModule],
  controllers: [UsersController, AdminController, ProfileController],
  providers: [UsersService],
})
export class UsersModule { }
