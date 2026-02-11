'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Password hash for "Password123!"
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Insert users
    const users = await queryInterface.bulkInsert(
      'users',
      [
        {
          id: '650e8400-e29b-41d4-a716-446655440001',
          email: 'john@acme.com',
          password_hash: passwordHash,
          first_name: 'John',
          last_name: 'Doe',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440002',
          email: 'jane@acme.com',
          password_hash: passwordHash,
          first_name: 'Jane',
          last_name: 'Smith',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440003',
          email: 'bob@techstartup.com',
          password_hash: passwordHash,
          first_name: 'Bob',
          last_name: 'Johnson',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: true }
    );

    // Insert organizations
    await queryInterface.bulkInsert('organizations', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Acme Corporation',
        slug: 'acme-corp',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Tech Startup Inc',
        slug: 'tech-startup',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Insert organization users
    await queryInterface.bulkInsert('organization_users', [
      {
        id: '750e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: '650e8400-e29b-41d4-a716-446655440001',
        role: 'owner',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '750e8400-e29b-41d4-a716-446655440002',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: '650e8400-e29b-41d4-a716-446655440002',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '750e8400-e29b-41d4-a716-446655440003',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        user_id: '650e8400-e29b-41d4-a716-446655440003',
        role: 'owner',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '750e8400-e29b-41d4-a716-446655440004',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        user_id: '650e8400-e29b-41d4-a716-446655440002',
        role: 'member',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Insert clients
    const clientIds = [
      '850e8400-e29b-41d4-a716-446655440001',
      '850e8400-e29b-41d4-a716-446655440002',
      '850e8400-e29b-41d4-a716-446655440003',
    ];

    await queryInterface.bulkInsert('clients', [
      {
        id: clientIds[0],
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Alice Williams',
        email: 'alice@client.com',
        company: 'Client Corp',
        created_by: '650e8400-e29b-41d4-a716-446655440001',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: clientIds[1],
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        company: 'Example Ltd',
        created_by: '650e8400-e29b-41d4-a716-446655440001',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: clientIds[2],
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'David Lee',
        email: 'david@startup.com',
        company: 'Startup Co',
        created_by: '650e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Insert projects
    await queryInterface.bulkInsert('projects', [
      {
        id: '950e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        client_id: clientIds[0],
        name: 'Website Redesign',
        description: 'Complete overhaul of company website',
        status: 'active',
        created_by: '650e8400-e29b-41d4-a716-446655440001',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '950e8400-e29b-41d4-a716-446655440002',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        client_id: clientIds[2],
        name: 'Mobile App Development',
        description: 'Native iOS and Android apps',
        status: 'planning',
        created_by: '650e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('projects', null, {});
    await queryInterface.bulkDelete('clients', null, {});
    await queryInterface.bulkDelete('organization_users', null, {});
    await queryInterface.bulkDelete('organizations', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
