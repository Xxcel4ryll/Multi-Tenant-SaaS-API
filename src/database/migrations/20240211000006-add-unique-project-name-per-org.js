'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add unique constraint: project name must be unique within an organization
    await queryInterface.addConstraint('projects', {
      fields: ['organization_id', 'name'],
      type: 'unique',
      name: 'unique_project_name_per_org',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('projects', 'unique_project_name_per_org');
  },
};
