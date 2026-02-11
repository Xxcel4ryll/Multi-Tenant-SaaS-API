import { WhereOptions } from 'sequelize';
import Project, { ProjectCreationAttributes } from './project.model';
import User from '../users/user.model';
import Client from '../clients/client.model';
import { ProjectStatus } from '../../types';

export class ProjectRepository {
  async create(data: ProjectCreationAttributes): Promise<Project> {
    return await Project.create(data);
  }

  async findByOrganization(
    organizationId: string,
    filters?: {
      status?: ProjectStatus;
      client_id?: string;
    },
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{ rows: Project[]; count: number }> {
    const where: WhereOptions = { organization_id: organizationId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.client_id) {
      where.client_id = filters.client_id;
    }

    return await Project.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      limit: options?.limit,
      offset: options?.offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });
  }

  async findById(id: string, organizationId: string): Promise<Project | null> {
    return await Project.findOne({
      where: {
        id,
        organization_id: organizationId,
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'email', 'company'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<ProjectCreationAttributes>
  ): Promise<[number, Project[]]> {
    return await Project.update(data, {
      where: {
        id,
        organization_id: organizationId,
      },
      returning: true,
    });
  }

  async delete(id: string, organizationId: string): Promise<number> {
    return await Project.destroy({
      where: {
        id,
        organization_id: organizationId,
      },
    });
  }
}

export default new ProjectRepository();
