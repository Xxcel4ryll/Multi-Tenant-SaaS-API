import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../../types';

const router = Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (_req: Request, res: Response<ApiResponse>) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Server is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

/**
 * @route   GET /ready
 * @desc    Readiness check endpoint
 * @access  Public
 */
router.get('/ready', (_req: Request, res: Response<ApiResponse>) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Server is ready',
    data: {
      status: 'ready',
    },
  });
});

export default router;
