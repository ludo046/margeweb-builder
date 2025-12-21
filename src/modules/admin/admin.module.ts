import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';

import { User } from '../../models/user.model';
import { ImpersonationLog } from '../../models/impersonation-log.model';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminOnlyGuard } from './admin-only.guard';


@Module({
  imports: [
    SequelizeModule.forFeature([User, ImpersonationLog, AdminOnlyGuard]),
    JwtModule.register({}),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
