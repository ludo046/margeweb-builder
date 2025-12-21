import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

export type TicketStatus = 'open' | 'pending' | 'solved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

@Table({ tableName: 'tickets', underscored: true })
export class Ticket extends Model<InferAttributes<Ticket>, InferCreationAttributes<Ticket>> {
  @Column({ type: DataType.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare tenant_id: number;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare site_id: CreationOptional<number | null>;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare created_by_user_id: number;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare assigned_admin_user_id: CreationOptional<number | null>;

  @Column({ type: DataType.STRING(140), allowNull: false })
  declare subject: string;

  @Column({ type: DataType.ENUM('open', 'pending', 'solved', 'closed'), allowNull: false, defaultValue: 'open' })
  declare status: CreationOptional<TicketStatus>;

  @Column({ type: DataType.ENUM('low', 'normal', 'high', 'urgent'), allowNull: false, defaultValue: 'normal' })
  declare priority: CreationOptional<TicketPriority>;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare last_message_at: CreationOptional<Date>;

  @CreatedAt declare created_at: CreationOptional<Date>;
  @UpdatedAt declare updated_at: CreationOptional<Date>;
}
