import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';

// ✅ Adapte ces imports si tes modèles sont ailleurs
import { User } from '../../models/user.model';
import { RefreshToken } from '../../models/refresh-token.model';

type AccessPayload = {
  sub: number;
  tenant_id: number | null;
  role: string | null;
  imp: boolean;
  imp_by?: number | null;
};

type RefreshPayload = {
  sub: number;
  typ: 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(RefreshToken) private readonly rtModel: typeof RefreshToken,
  ) {}

  // ------------------------------------------------------------
  // A) LOGIN
  // ------------------------------------------------------------
  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) return null;

    const hash = (user as any).password_hash ?? (user as any).passwordHash;
    if (!hash) return null;

    const ok = await bcrypt.compare(password, hash);
    if (!ok) return null;

    return user;
  }

  // ------------------------------------------------------------
  // B) TOKENS
  // ------------------------------------------------------------
  async issueTokens(user: User) {
    const id = Number((user as any).id);
    const tenantIdRaw = (user as any).tenant_id ?? (user as any).tenantId ?? null;
    const tenant_id = tenantIdRaw === null ? null : Number(tenantIdRaw);
    const role = ((user as any).role ?? null) as string | null;

    if (!id) throw new UnauthorizedException('Invalid user');

    const accessPayload: AccessPayload = {
      sub: id,
      tenant_id,
      role,
      imp: false,
    };

    const access = this.jwt.sign(accessPayload, {
      secret: process.env.JWT_ACCESS_SECRET!,
      expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_SEC ?? 900), // 15 min
    });

    const refreshPayload: RefreshPayload = { sub: id, typ: 'refresh' };

    const refresh = this.jwt.sign(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_SEC ?? 2592000), // 30j
    });

    // Stocke un hash du refresh (jamais le token en clair)
    const token_hash = this.sha256(refresh);
    const expires_at = new Date(
      Date.now() + Number(process.env.JWT_REFRESH_EXPIRES_SEC ?? 2592000) * 1000,
    );

    await this.rtModel.create({
      user_id: id,
      token_hash,
      expires_at,
      revoked_at: null,
    } as any);

    return { access, refresh };
  }

  async rotateRefresh(oldRefresh: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(oldRefresh, { secret: process.env.JWT_REFRESH_SECRET! });
    } catch {
      throw new UnauthorizedException('Invalid refresh');
    }

    if (!payload?.sub || payload?.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh');
    }

    const userId = Number(payload.sub);

    // Vérifie en DB que ce refresh existe et n'est pas révoqué
    const oldHash = this.sha256(oldRefresh);
    const row = await this.rtModel.findOne({
      where: { user_id: userId, token_hash: oldHash, revoked_at: null },
    });

    if (!row) throw new UnauthorizedException('Refresh revoked');

    // Rotation : on révoque l'ancien
    await row.update({ revoked_at: new Date() } as any);

    // Recharge user pour remettre tenant_id/role dans le nouvel access
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return this.issueTokens(user as any);
  }

  // ------------------------------------------------------------
  // C) 2FA (TOTP via otplib) - sans QR backend
  // ------------------------------------------------------------
  async setup2fa(userId: number) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const secret = authenticator.generateSecret(); // base32

    (user as any).totp_secret_enc = this.encrypt(secret);
    await user.save();

    const email = (user as any).email ?? 'user';
    const otpauth_url = authenticator.keyuri(email, 'MargeWeb Builder', secret);

    // V1: pas de QR backend
    return { otpauth_url };
  }

  async verify2faAndEnable(userId: number, code: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const ok = await this.check2fa(user as any, code);
    if (!ok) throw new UnauthorizedException('Invalid 2FA code');

    (user as any).is_2fa_enabled = true;
    await user.save();

    return { ok: true };
  }

  async check2fa(user: User, code: string) {
    const enc = (user as any).totp_secret_enc;
    if (!enc) return false;

    const secret = this.decrypt(enc);
    return authenticator.check(String(code), secret);
  }

  // ------------------------------------------------------------
  // D) CRYPTO / HELPERS (AES-256-GCM)
  // ------------------------------------------------------------
  private sha256(s: string) {
    return crypto.createHash('sha256').update(s).digest('hex');
  }

  /**
   * AES-256-GCM encryption:
   * - key: AUTH_ENC_KEY (32 bytes base64 or hex)
   * - output: base64(iv).base64(tag).base64(ciphertext)
   */
  private encrypt(plain: string): string {
    const key = this.getEncKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `${iv.toString('base64')}.${tag.toString('base64')}.${ciphertext.toString('base64')}`;
  }

  private decrypt(enc: string): string {
    const key = this.getEncKey();

    const parts = enc.split('.');
    if (parts.length !== 3) throw new UnauthorizedException('Invalid encrypted secret');

    const iv = Buffer.from(parts[0], 'base64');
    const tag = Buffer.from(parts[1], 'base64');
    const ciphertext = Buffer.from(parts[2], 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plain.toString('utf8');
  }

  private getEncKey(): Buffer {
    const raw = process.env.AUTH_ENC_KEY;
    if (!raw) {
      throw new Error('AUTH_ENC_KEY missing (must be 32 bytes)');
    }

    // accepte base64 (recommandé) ou hex
    const key = raw.includes('/') || raw.includes('+') || raw.endsWith('=')
      ? Buffer.from(raw, 'base64')
      : Buffer.from(raw, 'hex');

    if (key.length !== 32) {
      throw new Error(`AUTH_ENC_KEY must be 32 bytes, got ${key.length}`);
    }
    return key;
  }
}
