import { StatusCodes } from 'http-status-codes';
import { AppError, ProjectStatus } from '../../types';
import projectRepository from './project.repository';
import clientRepository from '../clients/client.repository';
import {
  createPaginatedResponse,
  getPaginationParams,
  PaginationParams,
} from '../../utils/pagination';

export class ProjectService {
  async create(data: {
    organization_id: string;
    name: string;
    description?: string;
    client_id?: string;
    status?: ProjectStatus;
    start_date?: Date;
    end_date?: Date;
    created_by: string;
  }) {
    if (data.client_id) {
      const client = await clientRepository.findById(data.client_id, data.organization_id);
      if (!client) {
        throw new AppError('Client not found in this organization', StatusCodes.BAD_REQUEST);
      }
    }

    return await projectRepository.create(data);
  }

  async getAll(
    organizationId: string,
    filters?: {
      status?: ProjectStatus;
      client_id?: string;
    },
    pagination?: PaginationParams
  ) {
    const { limit, offset, page } = getPaginationParams(pagination || {});

    const { rows, count } = await projectRepository.findByOrganization(organizationId, filters, {
      limit,
      offset,
    });

    return createPaginatedResponse(rows, count, page, limit);
  }

  async getById(id: string, organizationId: string) {
    const project = await projectRepository.findById(id, organizationId);

    if (!project) {
      throw new AppError('Project not found', StatusCodes.NOT_FOUND);
    }

    return project;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      description?: string;
      client_id?: string;
      status?: ProjectStatus;
      start_date?: Date;
      end_date?: Date;
    }
  ) {
    if (data.client_id) {
      const client = await clientRepository.findById(data.client_id, organizationId);
      if (!client) {
        throw new AppError('Client not found in this organization', StatusCodes.BAD_REQUEST);
      }
    }

    const [affectedCount, projects] = await projectRepository.update(id, organizationId, data);

    if (affectedCount === 0) {
      throw new AppError('Project not found', StatusCodes.NOT_FOUND);
    }

    return projects[0];
  }

  async delete(id: string, organizationId: string) {
    const deleted = await projectRepository.delete(id, organizationId);

    if (deleted === 0) {
      throw new AppError('Project not found', StatusCodes.NOT_FOUND);
    }

    return { deleted: true };
  }
}

export default new ProjectService();
