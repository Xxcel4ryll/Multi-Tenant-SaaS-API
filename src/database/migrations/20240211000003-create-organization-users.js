'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ENUM type for user roles
    await queryInterface.sequelize.query(`
      CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');
    `);

    await queryInterface.createTable('organization_users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('owner', 'admin', 'member'),
        allowNull: false,
        defaultValue: 'member',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add unique constraint
    await queryInterface.addConstraint('organization_users', {
      fields: ['organization_id', 'user_id'],
      type: 'unique',
      name: 'unique_org_user',
    });

    // Add indexes
    await queryInterface.addIndex('organization_users', ['organization_id']);
    await queryInterface.addIndex('organization_users', ['user_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('organization_users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS user_role;');
  },
};
