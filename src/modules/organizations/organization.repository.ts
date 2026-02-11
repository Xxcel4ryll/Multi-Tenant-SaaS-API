import { Transaction } from 'sequelize';
import Organization, { OrganizationCreationAttributes } from './organization.model';
import OrganizationUser from './organization-user.model';
import User from '../users/user.model';
import { UserRole } from '../../types';

export class OrganizationRepository {
  async create(
    data: OrganizationCreationAttributes,
    transaction?: Transaction
  ): Promise<Organization> {
    return await Organization.create(data, { transaction });
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return await Organization.findOne({ where: { slug } });
  }

  async findById(id: string): Promise<Organization | null> {
    return await Organization.findByPk(id);
  }

  async findByUserId(userId: string): Promise<Array<Organization & { role: UserRole }>> {
    const results = await Organization.findAll({
      include: [
        {
          model: OrganizationUser,
          as: 'organization_users',
          where: { user_id: userId },
          attributes: ['role'],
        },
      ],
    });

    return results.map((org) => {
      const orgData = org.toJSON() as unknown as Record<string, unknown>;
      const orgUsers = orgData.organization_users as Array<{ role: UserRole }>;
      return {
        ...orgData,
        role: orgUsers[0].role,
      } as Organization & { role: UserRole };
    });
  }

  async addMember(
    organizationId: string,
    userId: string,
    role: UserRole,
    transaction?: Transaction
  ): Promise<OrganizationUser> {
    return await OrganizationUser.create(
      {
        organization_id: organizationId,
        user_id: userId,
        role,
      },
      { transaction }
    );
  }

  async getMembers(organizationId: string) {
    return await OrganizationUser.findAll({
      where: { organization_id: organizationId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name'],
        },
      ],
    });
  }

  async getUserRole(organizationId: string, userId: string): Promise<OrganizationUser | null> {
    return await OrganizationUser.findOne({
      where: {
        organization_id: organizationId,
        user_id: userId,
      },
    });
  }

  async isMember(organizationId: string, userId: string): Promise<boolean> {
    const membership = await this.getUserRole(organizationId, userId);
    return !!membership;
  }

  async delete(id: string): Promise<number> {
    return await Organization.destroy({ where: { id } });
  }
}

export default new OrganizationRepository();
