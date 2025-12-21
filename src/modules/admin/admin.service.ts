import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';

import { User } from '../../models/user.model';
import { ImpersonationLog } from '../../models/impersonation-log.model';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(ImpersonationLog) private logModel: typeof ImpersonationLog,
    private jwt: JwtService,
  ) {}

  async impersonate(adminUserId: number, targetUserId: number, reason: string, ip?: string, ua?: string) {
    const admin = await this.userModel.findByPk(adminUserId);
    if (!admin) throw new NotFoundException('Admin not found');

    const target = await this.userModel.findByPk(targetUserId);
    if (!target) throw new NotFoundException('Target user not found');

    await this.logModel.create({
      admin_user_id: admin.id,
      tenant_id: target.tenant_id,
      impersonated_user_id: target.id,
      reason,
      ip: ip ?? null,
      user_agent: ua ?? null,
    } as any);

    // Token d’accès impersoné: imp=true + imp_by
    const access = this.jwt.sign(
      { sub: target.id, tenant_id: target.tenant_id, role: target.role, imp: true, imp_by: admin.id },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );

    return { access };
  }
}
