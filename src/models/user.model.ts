import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { Tenant } from './tenant.model';

export type UserRole = 'TENANT_USER' | 'ADMIN_PLATFORM';

@Table({ tableName: 'users', underscored: true })
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @Column({ type: DataType.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Tenant)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare tenant_id: number;

  @Column({ type: DataType.STRING(190), allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare password_hash: string;

  @Column({ type: DataType.ENUM('TENANT_USER', 'ADMIN_PLATFORM'), allowNull: false, defaultValue: 'TENANT_USER' })
  declare role: CreationOptional<UserRole>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare is_2fa_enabled: CreationOptional<boolean>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare totp_secret_enc: CreationOptional<string | null>;

  @Column({ type: DataType.DATE, allowNull: true })
  declare last_login_at: CreationOptional<Date | null>;

  @CreatedAt declare created_at: CreationOptional<Date>;
  @UpdatedAt declare updated_at: CreationOptional<Date>;
}
