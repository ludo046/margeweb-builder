import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { JwtCookieAuthGuard } from './jwt-cookie.guard';
import { LoginDto } from './dto/login.dto';

const isProd = process.env.NODE_ENV === 'production';

const cookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProd, // ✅ false en local, true en prod
};

function setAuthCookies(res: Response, access: string, refresh: string) {
  res.cookie('mw_access', access, { ...cookieBase, path: '/' });
  res.cookie('mw_refresh', refresh, { ...cookieBase, path: '/auth/refresh' });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('mw_access', { path: '/' });
  res.clearCookie('mw_refresh', { path: '/auth/refresh' });
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * POST /auth/login
   * - 2FA enabled => { twoFactorRequired:true }
   * - sinon => pose cookies
   */
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if ((user as any).is_2fa_enabled) {
      // ✅ simple: on laisse le front appeler /auth/2fa/verify avec email+password+code
      return { twoFactorRequired: true };
    }

    const { access, refresh } = await this.auth.issueTokens(user as any);
    setAuthCookies(res, access, refresh);
    return { twoFactorRequired: false };
  }

  /**
   * POST /auth/2fa/verify
   * Body: { email, password, code }
   * => validateUser + check2fa + issueTokens + cookies
   */
  @Post('2fa/verify')
  async verify2fa(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const email = body?.email;
    const password = body?.password;
    const code = body?.code ?? body?.otp;

    if (!email || !password || !code) {
      throw new UnauthorizedException('Missing 2FA payload');
    }

    const user = await this.auth.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!(user as any).is_2fa_enabled) {
      throw new UnauthorizedException('2FA not enabled');
    }

    const ok = await this.auth.check2fa(user as any, String(code));
    if (!ok) throw new UnauthorizedException('Invalid 2FA code');

    const { access, refresh } = await this.auth.issueTokens(user as any);
    setAuthCookies(res, access, refresh);
    return { ok: true };
  }

  /**
   * POST /auth/2fa/setup (protégé)
   * retourne { otpauth_url }
   */
  @UseGuards(JwtCookieAuthGuard)
  @Post('2fa/setup')
  async setup2fa(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.auth.setup2fa(Number(userId));
  }

  /**
   * POST /auth/2fa/enable (protégé)
   * Body: { code }
   */
  @UseGuards(JwtCookieAuthGuard)
  @Post('2fa/enable')
  async enable2fa(@Req() req: any, @Body() body: any) {
    const code = body?.code ?? body?.otp;
    if (!code) throw new UnauthorizedException('Missing 2FA code');

    const userId = req.user?.sub ?? req.user?.id;
    return this.auth.verify2faAndEnable(Number(userId), String(code));
  }

  /**
   * POST /auth/refresh
   */
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefresh = (req as any)?.cookies?.mw_refresh;
    if (!oldRefresh) throw new UnauthorizedException('Missing refresh');

    const { access, refresh } = await this.auth.rotateRefresh(oldRefresh);
    setAuthCookies(res, access, refresh);
    return { ok: true };
  }

  /**
   * POST /auth/logout
   */
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);
    return { ok: true };
  }

  /**
   * GET /auth/me
   */
  @UseGuards(JwtCookieAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
