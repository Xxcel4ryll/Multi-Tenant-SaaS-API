import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../types';
import clientRepository from './client.repository';
import {
  createPaginatedResponse,
  getPaginationParams,
  PaginationParams,
} from '../../utils/pagination';

export class ClientService {
  async create(data: {
    organization_id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
    created_by: string;
  }) {
    return await clientRepository.create(data);
  }

  async getAll(organizationId: string, pagination?: PaginationParams) {
    const { limit, offset, page } = getPaginationParams(pagination || {});

    const { rows, count } = await clientRepository.findByOrganization(organizationId, {
      limit,
      offset,
    });

    return createPaginatedResponse(rows, count, page, limit);
  }

  async getById(id: string, organizationId: string) {
    const client = await clientRepository.findById(id, organizationId);

    if (!client) {
      throw new AppError('Client not found', StatusCodes.NOT_FOUND);
    }

    return client;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
      notes?: string;
    }
  ) {
    const [affectedCount, clients] = await clientRepository.update(id, organizationId, data);

    if (affectedCount === 0) {
      throw new AppError('Client not found', StatusCodes.NOT_FOUND);
    }

    return clients[0];
  }

  async delete(id: string, organizationId: string) {
    const deleted = await clientRepository.delete(id, organizationId);

    if (deleted === 0) {
      throw new AppError('Client not found', StatusCodes.NOT_FOUND);
    }

    return { deleted: true };
  }
}

export default new ClientService();
