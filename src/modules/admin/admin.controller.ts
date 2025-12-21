import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';

import { JwtCookieAuthGuard } from '../auth/jwt-cookie.guard';
import { AdminOnlyGuard } from './admin-only.guard';
import { AdminService } from './admin.service';
import { ImpersonateDto } from './dto/impersonate.dto';

@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  private setAccessCookie(res: Response, access: string) {
    const secure = process.env.COOKIE_SECURE === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as any;

    res.cookie('mw_access', access, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });
  }

  @Post('impersonate')
  @UseGuards(JwtCookieAuthGuard, AdminOnlyGuard)
  async impersonate(@Body() dto: ImpersonateDto, @Req() req: Request, @Res() res: Response) {
    const adminUserId = (req as any).user.sub as number;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
    const ua = req.headers['user-agent'] || null;

    const { access } = await this.admin.impersonate(adminUserId, dto.user_id, dto.reason, ip ?? undefined, ua ?? undefined);
    this.setAccessCookie(res, access);
    return res.json({ ok: true, impersonating: dto.user_id });
  }

  @Post('impersonate/stop')
  @UseGuards(JwtCookieAuthGuard)
  async stop(@Req() req: any, @Res() res: Response) {
    // Si tu veux “stop”, le plus simple: le front refait /auth/refresh (ou re-login) et récupère un access normal.
    // Ici on clear juste l’access pour forcer un refresh normal.
    res.clearCookie('mw_access', { path: '/' });
    return res.json({ ok: true });
  }
}
