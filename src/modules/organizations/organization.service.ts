import { StatusCodes } from 'http-status-codes';
import { Transaction } from 'sequelize';
import { AppError, UserRole } from '../../types';
import sequelize from '../../database';
import organizationRepository from './organization.repository';
import userRepository from '../users/user.repository';

export class OrganizationService {
  async create(data: { name: string; slug: string }, userId: string) {
    const existing = await organizationRepository.findBySlug(data.slug);
    if (existing) {
      throw new AppError('Organization slug already exists', StatusCodes.CONFLICT);
    }

    const transaction: Transaction = await sequelize.transaction();

    try {
      const organization = await organizationRepository.create(
        {
          name: data.name,
          slug: data.slug,
        },
        transaction
      );

      await organizationRepository.addMember(organization.id, userId, 'owner', transaction);

      await transaction.commit();

      return organization;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getMyOrganizations(userId: string) {
    return await organizationRepository.findByUserId(userId);
  }

  async getById(organizationId: string, userId: string) {
    const organization = await organizationRepository.findById(organizationId);

    if (!organization) {
      throw new AppError('Organization not found', StatusCodes.NOT_FOUND);
    }

    const isMember = await organizationRepository.isMember(organizationId, userId);
    if (!isMember) {
      throw new AppError('Organization not found', StatusCodes.NOT_FOUND);
    }

    const membership = await organizationRepository.getUserRole(organizationId, userId);

    return {
      ...organization.toJSON(),
      role: membership?.role,
    };
  }

  async getMembers(organizationId: string) {
    return await organizationRepository.getMembers(organizationId);
  }

  async addMember(organizationId: string, userId: string, role: UserRole = 'member') {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    const isMember = await organizationRepository.isMember(organizationId, userId);
    if (isMember) {
      throw new AppError('User is already a member of this organization', StatusCodes.CONFLICT);
    }

    return await organizationRepository.addMember(organizationId, userId, role);
  }
}

export default new OrganizationService();
