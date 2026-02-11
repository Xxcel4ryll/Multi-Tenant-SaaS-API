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

    const userData = user.toJSON();
    const token = generateToken({ userId: userData.id, email: userData.email });
    const refreshToken = generateRefreshToken({ userId: userData.id, email: userData.email });

    return {
      user: {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
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

    if (!password || !user.password_hash) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }

    const userData = user.toJSON();
    const token = generateToken({ userId: userData.id, email: userData.email });
    const refreshToken = generateRefreshToken({ userId: userData.id, email: userData.email });

    return {
      user: {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
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
