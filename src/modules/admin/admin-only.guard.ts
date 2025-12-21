import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const u = req.user;
    if (!u || u.role !== 'ADMIN_PLATFORM') throw new ForbiddenException('Admin only');
    if (u.imp) throw new ForbiddenException('Impersonated sessions cannot impersonate');
    return true;
  }
}
