import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtCookieAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();

    console.log('[GUARD] canActivate called');
    console.log('[GUARD] cookie mw_access?', !!req.cookies?.mw_access);

    const token = req.cookies?.mw_access;
    if (!token) {
      console.log('[GUARD] Missing access token');
      throw new UnauthorizedException('Missing access token');
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET missing');

    try {
      const payload = this.jwt.verify(token, { secret });
      req.user = payload;
      console.log('[GUARD] JWT OK for user', payload.sub);
      return true;
    } catch (err: any) {
      console.log('[GUARD] JWT verify failed:', err?.name, err?.message);
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
