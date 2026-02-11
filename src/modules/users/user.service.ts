import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../types';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken, generateRefreshToken } from '../../utils/jwt';
import userRepository from './user.repository';

export class UserService {
  async register(data: { email: string; password: string; first_name: string; last_name: string }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already registered', StatusCodes.CONFLICT);
    }

    const password_hash = await hashPassword(data.password);

    const user = await userRepository.create({
      email: data.email,
      password_hash,
      first_name: data.first_name,
      last_name: data.last_name,
    });

    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }

    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    return user;
  }
}

export default new UserService();
