import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';

import { User } from '../../models/user.model';
import { RefreshToken } from '../../models/refresh-token.model';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtCookieAuthGuard } from './jwt-cookie.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([User, RefreshToken]),
    JwtModule.register({}), // fournit JwtService
  ],
  providers: [AuthService, JwtCookieAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, JwtCookieAuthGuard], // 👈 IMPORTANT
})
export class AuthModule {}
