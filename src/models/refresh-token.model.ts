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
import { User } from './user.model';

@Table({ tableName: 'refresh_tokens', underscored: true })
export class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
  @Column({ type: DataType.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare user_id: number;

  @Column({ type: DataType.STRING(120), allowNull: false })
  declare token_hash: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare revoked_at: CreationOptional<Date | null>;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expires_at: Date;

  @CreatedAt declare created_at: CreationOptional<Date>;
  @UpdatedAt declare updated_at: CreationOptional<Date>;
}
