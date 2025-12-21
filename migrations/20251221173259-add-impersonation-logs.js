'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('impersonation_logs', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      admin_user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      tenant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      impersonated_user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },

      reason: { type: Sequelize.STRING(240), allowNull: false },
      ip: { type: Sequelize.STRING(64), allowNull: true },
      user_agent: { type: Sequelize.STRING(255), allowNull: true },

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('impersonation_logs', ['tenant_id']);
    await queryInterface.addIndex('impersonation_logs', ['admin_user_id']);
    await queryInterface.addIndex('impersonation_logs', ['impersonated_user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('impersonation_logs');
  },
};
