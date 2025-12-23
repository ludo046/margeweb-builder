import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminOnlyGuard } from './admin-only.guard';

import { User } from '../../models/user.model';
import { ImpersonationLog } from '../../models/impersonation-log.model';

import { AuthModule } from '../auth/auth.module'; // ✅ IMPORTANT

@Module({
  imports: [
    AuthModule, // ✅ fournit JwtService (via export JwtModule)
    SequelizeModule.forFeature([User, ImpersonationLog]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminOnlyGuard],
  exports: [AdminService],
})
export class AdminModule {}
