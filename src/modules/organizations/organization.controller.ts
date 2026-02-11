import { Router, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import organizationService from './organization.service';
import { authenticate, requireOrganization, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { AuthRequest, ApiResponse } from '../../types';
import { organizationValidation } from './organization.validation';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validateRequest({ body: organizationValidation.create }),
  async (req: AuthRequest, res: Response<ApiResponse>) => {
    const organization = await organizationService.create(req.body, req.user!.userId);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Organization created successfully',
      data: organization,
    });
  }
);

router.get('/', async (req: AuthRequest, res: Response<ApiResponse>) => {
  const organizations = await organizationService.getMyOrganizations(req.user!.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Organizations retrieved successfully',
    data: organizations,
  });
});

router.get('/:id', async (req: AuthRequest, res: Response<ApiResponse>) => {
  const organization = await organizationService.getById(req.params.id, req.user!.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Organization retrieved successfully',
    data: organization,
  });
});

router.get(
  '/:id/members',
  requireOrganization,
  async (req: AuthRequest, res: Response<ApiResponse>) => {
    const members = await organizationService.getMembers(req.organizationId!);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Organization members retrieved successfully',
      data: members,
    });
  }
);

router.post(
  '/:id/members',
  requireOrganization,
  requireRole(['owner', 'admin']),
  validateRequest({ body: organizationValidation.addMember }),
  async (req: AuthRequest, res: Response<ApiResponse>) => {
    const { user_id, role } = req.body;
    const member = await organizationService.addMember(req.organizationId!, user_id, role);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Member added successfully',
      data: member,
    });
  }
);

export default router;
