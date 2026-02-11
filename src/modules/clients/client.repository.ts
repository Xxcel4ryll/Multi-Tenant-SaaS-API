import Client, { ClientCreationAttributes } from './client.model';
import User from '../users/user.model';

export class ClientRepository {
  async create(data: ClientCreationAttributes): Promise<Client> {
    return await Client.create(data);
  }

  async findByOrganization(
    organizationId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{ rows: Client[]; count: number }> {
    return await Client.findAndCountAll({
      where: { organization_id: organizationId },
      include: [
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

  async findById(id: string, organizationId: string): Promise<Client | null> {
    return await Client.findOne({
      where: {
        id,
        organization_id: organizationId,
      },
      include: [
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
    data: Partial<ClientCreationAttributes>
  ): Promise<[number, Client[]]> {
    return await Client.update(data, {
      where: {
        id,
        organization_id: organizationId,
      },
      returning: true,
    });
  }

  async delete(id: string, organizationId: string): Promise<number> {
    return await Client.destroy({
      where: {
        id,
        organization_id: organizationId,
      },
    });
  }
}

export default new ClientRepository();
