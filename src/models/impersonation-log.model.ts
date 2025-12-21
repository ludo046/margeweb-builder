import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({ tableName: 'impersonation_logs', underscored: true })
export class ImpersonationLog extends Model<InferAttributes<ImpersonationLog>, InferCreationAttributes<ImpersonationLog>> {
  @Column({ type: DataType.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare admin_user_id: number;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare tenant_id: number;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare impersonated_user_id: number;

  @Column({ type: DataType.STRING(240), allowNull: false })
  declare reason: string;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare ip: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare user_agent: CreationOptional<string | null>;

  @CreatedAt declare created_at: CreationOptional<Date>;
  @UpdatedAt declare updated_at: CreationOptional<Date>;
}
