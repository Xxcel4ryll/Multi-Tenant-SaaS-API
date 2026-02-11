import { Router, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import projectService from './project.service';
import { authenticate, requireOrganization, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { AuthRequest, ApiResponse, ProjectStatus } from '../../types';
import { projectValidation } from './project.validation';

const router = Router();

router.use(authenticate, requireOrganization);

router.post(
  '/',
  requireRole(['owner', 'admin']),
  validateRequest({ body: projectValidation.create }),
  async (req: AuthRequest, res: Response<ApiResponse>) => {
    const project = await projectService.create({
      ...req.body,
      organization_id: req.organizationId!,
      created_by: req.user!.userId,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  }
);

router.get('/', async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { status, client_id, page, limit } = req.query;

  const result = await projectService.getAll(
    req.organizationId!,
    {
      status: status as ProjectStatus | undefined,
      client_id: client_id as string,
    },
    {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Projects retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

router.get('/:id', async (req: AuthRequest, res: Response<ApiResponse>) => {
  const project = await projectService.getById(req.params.id, req.organizationId!);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Project retrieved successfully',
    data: project,
  });
});

router.put(
  '/:id',
  requireRole(['owner', 'admin']),
  validateRequest({ body: projectValidation.update }),
  async (req: AuthRequest, res: Response<ApiResponse>) => {
    const project = await projectService.update(req.params.id, req.organizationId!, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  }
);

router.delete(
  '/:id',
  requireRole(['owner']),
  async (req: AuthRequest, res: Response<ApiResponse>) => {
    await projectService.delete(req.params.id, req.organizationId!);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Project deleted successfully',
    });
  }
);

export default router;
