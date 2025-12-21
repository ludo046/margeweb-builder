import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash, createCipheriv, createDecipheriv } from 'crypto';
import { authenticator } from 'otplib';


import { User } from '../../models/user.model';
import { RefreshToken } from '../../models/refresh-token.model';

function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(RefreshToken) private rtModel: typeof RefreshToken,
    private cfg: ConfigService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  private signAccess(user: User) {
    return this.jwt.sign(
      { sub: user.id, tenant_id: user.tenant_id, role: user.role, imp: false },
      { secret: this.cfg.get('JWT_ACCESS_SECRET'), expiresIn: '15m' },
    );
  }

  private signAccessImpersonated(admin: User, target: User) {
    return this.jwt.sign(
      { sub: target.id, tenant_id: target.tenant_id, role: target.role, imp: true, imp_by: admin.id },
      { secret: this.cfg.get('JWT_ACCESS_SECRET'), expiresIn: '15m' },
    );
  }

  private signRefresh(user: User) {
    return this.jwt.sign(
      { sub: user.id, typ: 'refresh' },
      { secret: this.cfg.get('JWT_REFRESH_SECRET'), expiresIn: '30d' },
    );
  }

  async issueTokens(user: User) {
    const access = this.signAccess(user);
    const refreshPlain = this.signRefresh(user);

        await RefreshToken.create({
        user_id: user.id,
        token_hash: sha256(refreshPlain),
        expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        revoked_at: null,
        } as any);


    return { access, refresh: refreshPlain };
  }

  async rotateRefresh(oldRefresh: string) {
    // verify
    let payload: any;
    try {
      payload = this.jwt.verify(oldRefresh, { secret: this.cfg.get('JWT_REFRESH_SECRET') });
    } catch {
      throw new UnauthorizedException('Invalid refresh');
    }

    const row = await this.rtModel.findOne({ where: { token_hash: sha256(oldRefresh), revoked_at: null } });
    if (!row) throw new UnauthorizedException('Refresh revoked');

    // revoke old
    row.revoked_at = new Date();
    await row.save();

    const user = await this.userModel.findByPk(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    return this.issueTokens(user);
  }

  // ---------- 2FA ----------
  private getEncKey() {
    const key = this.cfg.get<string>('TOTP_ENCRYPTION_KEY') || '';
    if (key.length < 32) throw new Error('TOTP_ENCRYPTION_KEY must be at least 32 chars');
    return createHash('sha256').update(key).digest(); // 32 bytes
  }

  encrypt(text: string) {
    const iv = randomBytes(12);
    const key = this.getEncKey();
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString('base64');
  }

  decrypt(b64: string) {
    const buf = Buffer.from(b64, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const key = this.getEncKey();
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec.toString('utf8');
  }

  async setup2fa(userId: number) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new UnauthorizedException();

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'MargeWeb Builder', secret);

    // store encrypted secret but NOT enabled yet
    user.totp_secret_enc = this.encrypt(secret);
    user.is_2fa_enabled = false;
    await user.save();

    return { otpauth };
  }

  async verify2faAndEnable(userId: number, code: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user || !user.totp_secret_enc) throw new UnauthorizedException();

    const secret = this.decrypt(user.totp_secret_enc);
    const ok = authenticator.check(code, secret);
    if (!ok) throw new UnauthorizedException('Invalid 2FA code');

    user.is_2fa_enabled = true;
    await user.save();
    return { ok: true };
  }

  async check2fa(user: User, code: string) {
    if (!user.is_2fa_enabled) return true;
    if (!user.totp_secret_enc) throw new UnauthorizedException();

    const secret = this.decrypt(user.totp_secret_enc);
    return authenticator.check(code, secret);
  }

      private sign2faChallenge(user: User) {
    // token très court, ne donne pas accès: seulement pour valider le 2FA
    return this.jwt.sign(
      { sub: user.id, tenant_id: user.tenant_id, role: user.role, typ: '2fa' },
      { secret: this.cfg.get('JWT_ACCESS_SECRET'), expiresIn: '5m' },
    );
  }

  // ---------- 2FA CHALLENGE ----------
  create2faChallenge(user: User) {
    return this.jwt.sign(
      { sub: user.id, tenant_id: user.tenant_id, role: user.role, typ: '2fa' },
      { secret: this.cfg.get('JWT_ACCESS_SECRET'), expiresIn: '5m' },
    );
  }

  verify2faChallengeToken(token: string) {
    try {
      const payload = this.jwt.verify(token, { secret: this.cfg.get('JWT_ACCESS_SECRET') });
      if (payload.typ !== '2fa') throw new Error('bad typ');
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid 2FA challenge');
    }
  }
}
