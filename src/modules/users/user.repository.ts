import User, { UserCreationAttributes } from './user.model';

export class UserRepository {
  async create(data: UserCreationAttributes): Promise<User> {
    return await User.create(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  async update(id: string, data: Partial<UserCreationAttributes>): Promise<[number, User[]]> {
    return await User.update(data, {
      where: { id },
      returning: true,
    });
  }

  async delete(id: string): Promise<number> {
    return await User.destroy({ where: { id } });
  }
}

export default new UserRepository();
