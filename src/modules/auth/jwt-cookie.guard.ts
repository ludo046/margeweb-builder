import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtCookieAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.cookies?.mw_access;

    if (!token) throw new UnauthorizedException('Missing access token');

    try {
      const payload: any = this.jwt.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET!,
      });

      // ✅ Normalisation (très important)
      req.user = {
        sub: payload.sub,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? null,
        role: payload.role ?? null,
        imp: !!payload.imp,
        imp_by: payload.imp_by ?? payload.impBy ?? null,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
