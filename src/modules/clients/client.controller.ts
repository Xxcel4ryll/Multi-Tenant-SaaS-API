import { Router, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import clientService from './client.service';
import { authenticate, requireOrganization, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { AuthRequest, ApiResponse } from '../../types';
import { clientValidation } from './client.validation';

const router = Router();

router.use(authenticate, requireOrganization);

router.post(
  '/',
  requireRole(['owner', 'admin']),
  validateRequest({ body: clientValidation.create }),
  async (req: AuthRequest, res: Response<ApiResponse>) => {
    const client = await clientService.create({
      ...req.body,
      organization_id: req.organizationId!,
      created_by: req.user!.userId,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Client created successfully',
      data: client,
    });
  }
);

router.get('/', async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { page, limit } = req.query;

  const result = await clientService.getAll(req.organizationId!, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Clients retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

router.get('/:id', async (req: AuthRequest, res: Response<ApiResponse>) => {
  const client = await clientService.getById(req.params.id, req.organizationId!);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Client retrieved successfully',
    data: client,
  });
});

router.put(
  '/:id',
  requireRole(['owner', 'admin']),
  validateRequest({ body: clientValidation.update }),
  async (req: AuthRequest, res: Response<ApiResponse>) => {
    const client = await clientService.update(req.params.id, req.organizationId!, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Client updated successfully',
      data: client,
    });
  }
);

router.delete(
  '/:id',
  requireRole(['owner', 'admin']),
  async (req: AuthRequest, res: Response<ApiResponse>) => {
    await clientService.delete(req.params.id, req.organizationId!);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Client deleted successfully',
    });
  }
);

export default router;
