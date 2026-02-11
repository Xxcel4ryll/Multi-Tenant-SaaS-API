import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest, AppError, UserRole } from '../types';
import { verifyToken } from '../utils/jwt';
import OrganizationUser from '../modules/organizations/organization-user.model';

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', StatusCodes.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED));
    }
  }
};

export const requireOrganization = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = req.headers['x-organization-id'] as string;

    if (!organizationId) {
      throw new AppError('Organization ID is required', StatusCodes.BAD_REQUEST);
    }

    if (!req.user) {
      throw new AppError('User not authenticated', StatusCodes.UNAUTHORIZED);
    }

    // Verify user belongs to organization and get their role
    const membership = await OrganizationUser.findOne({
      where: {
        organization_id: organizationId,
        user_id: req.user.userId,
      },
    });

    if (!membership) {
      throw new AppError('User does not belong to this organization', StatusCodes.FORBIDDEN);
    }

    req.organizationId = organizationId;
    req.userRole = membership.role as UserRole;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Organization validation failed', StatusCodes.INTERNAL_SERVER_ERROR));
    }
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      throw new AppError('User role not found', StatusCodes.FORBIDDEN);
    }

    if (!allowedRoles.includes(req.userRole)) {
      throw new AppError('Insufficient permissions for this action', StatusCodes.FORBIDDEN);
    }

    next();
  };
};
