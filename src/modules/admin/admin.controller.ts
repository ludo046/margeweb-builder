import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie.guard';
import { AdminService } from './admin.service';

const isProd = process.env.NODE_ENV === 'production';

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
  };
}

@Controller('admin')
@UseGuards(JwtCookieAuthGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Post('impersonate')
  async impersonate(
    @Req() req: any,
    @Body() body: { user_id: number; reason: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    /**
     * Expected service:
     * - check req.user is ADMIN_PLATFORM and not already impersonating
     * - returns { access }
     */
    const { access } = await this.admin.impersonate(req.user, body.user_id, body.reason);

    res.cookie('mw_access', access, {
      ...cookieBase(),
      path: '/',
    });

    // V1: prevent admin refresh token being used during impersonation
    res.clearCookie('mw_refresh', { path: '/auth/refresh' });

    return { ok: true, impersonating: body.user_id };
  }
}
