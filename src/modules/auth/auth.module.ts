import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtCookieAuthGuard } from './jwt-cookie.guard';

// ✅ adapte les imports de tes modèles
import { User } from '../../models/user.model';
import { RefreshToken } from '../../models/refresh-token.model';

@Module({
  imports: [
    // ✅ JwtService disponible partout où AuthModule est importé
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_SEC ?? 900) },
    }),
    SequelizeModule.forFeature([User, RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtCookieAuthGuard],
  exports: [
    AuthService,
    JwtModule,          // ✅ exporte JwtService
    JwtCookieAuthGuard, // ✅ exporte le guard
  ],
})
export class AuthModule {}
