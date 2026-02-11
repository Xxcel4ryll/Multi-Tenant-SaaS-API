import User from './users/user.model';
import Organization from './organizations/organization.model';
import OrganizationUser from './organizations/organization-user.model';
import Client from './clients/client.model';
import Project from './projects/project.model';

export const initializeAssociations = (): void => {
  User.belongsToMany(Organization, {
    through: OrganizationUser,
    foreignKey: 'user_id',
    otherKey: 'organization_id',
    as: 'organizations',
  });

  Organization.belongsToMany(User, {
    through: OrganizationUser,
    foreignKey: 'organization_id',
    otherKey: 'user_id',
    as: 'users',
  });

  OrganizationUser.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  OrganizationUser.belongsTo(Organization, {
    foreignKey: 'organization_id',
    as: 'organization',
  });

  Organization.hasMany(OrganizationUser, {
    foreignKey: 'organization_id',
    as: 'organization_users',
  });

  Organization.hasMany(Client, {
    foreignKey: 'organization_id',
    as: 'clients',
  });

  Client.belongsTo(Organization, {
    foreignKey: 'organization_id',
    as: 'organization',
  });

  Organization.hasMany(Project, {
    foreignKey: 'organization_id',
    as: 'projects',
  });

  Project.belongsTo(Organization, {
    foreignKey: 'organization_id',
    as: 'organization',
  });

  Client.hasMany(Project, {
    foreignKey: 'client_id',
    as: 'projects',
  });

  Project.belongsTo(Client, {
    foreignKey: 'client_id',
    as: 'client',
  });

  User.hasMany(Client, {
    foreignKey: 'created_by',
    as: 'created_clients',
  });

  Client.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator',
  });

  User.hasMany(Project, {
    foreignKey: 'created_by',
    as: 'created_projects',
  });

  Project.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
};

export { User, Organization, OrganizationUser, Client, Project };
