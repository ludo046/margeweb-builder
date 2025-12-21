import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { InjectModel } from '@nestjs/sequelize';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Verify2faChallengeDto } from './dto/verify-2fa-challenge.dto';
import { Enable2faDto } from './dto/enable-2fa.dto';
import { JwtCookieAuthGuard } from './jwt-cookie.guard';
import { User } from '../../models/user.model';


@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  private setCookies(res: Response, access: string, refresh: string) {
    const secure = process.env.COOKIE_SECURE === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as any;

    res.cookie('mw_access', access, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });

    res.cookie('mw_refresh', refresh, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/auth/refresh',
    });
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const user = await this.auth.validateUser(dto.email, dto.password);

    // If 2FA enabled, we don’t issue tokens here (client must call /auth/2fa/verify)
if (user.is_2fa_enabled) {
  const challenge_token = this.auth.create2faChallenge(user);
  return res.json({ twoFactorRequired: true, challenge_token });
}


    const { access, refresh } = await this.auth.issueTokens(user);
    this.setCookies(res, access, refresh);
    return res.json({ twoFactorRequired: false });
  }

@Post('2fa/verify')
async verify2fa(@Body() dto: Verify2faChallengeDto, @Res() res: Response) {
  const payload = this.auth.verify2faChallengeToken(dto.challenge_token);
  const user = await this.userModel.findByPk(payload.sub);
  if (!user) throw new UnauthorizedException();

  const ok = await this.auth.check2fa(user, dto.code);
  if (!ok) throw new UnauthorizedException('Invalid 2FA code');

  const { access, refresh } = await this.auth.issueTokens(user);
  this.setCookies(res, access, refresh);
  return res.json({ ok: true });
}

@Post('2fa/setup')
@UseGuards(JwtCookieAuthGuard)
async setup2fa(@Req() req: any) {
  const userId = req.user.sub as number;
  return this.auth.setup2fa(userId); // renvoie { otpauth }
}

@Post('2fa/enable')
@UseGuards(JwtCookieAuthGuard)
async enable2fa(@Req() req: any, @Body() dto: Enable2faDto) {
  const userId = req.user.sub as number;
  return this.auth.verify2faAndEnable(userId, dto.code);
}

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const oldRefresh = (req as any).cookies?.mw_refresh;
    if (!oldRefresh) throw new UnauthorizedException('Missing refresh');

    const { access, refresh } = await this.auth.rotateRefresh(oldRefresh);
    this.setCookies(res, access, refresh);
    return res.json({ ok: true });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('mw_access', { path: '/' });
    res.clearCookie('mw_refresh', { path: '/auth/refresh' });
    return res.json({ ok: true });
  }

@Get('me')
@UseGuards(JwtCookieAuthGuard)
me(@Req() req: any) {
  const u = req.user;
  return {
    id: u.sub,
    tenant_id: u.tenant_id,
    role: u.role,
    impersonating: !!u.imp,
    impersonated_by: u.imp_by ?? null,
  };
}
}
