import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import userService from './user.service';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { ApiResponse } from '../../types';
import { userValidation } from './user.validation';

const router = Router();

router.post(
  '/register',
  validateRequest({ body: userValidation.register }),
  async (req: Request, res: Response<ApiResponse>) => {
    const result = await userService.register(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  }
);

router.post(
  '/login',
  validateRequest({ body: userValidation.login }),
  async (req: Request, res: Response<ApiResponse>) => {
    const { email, password } = req.body;
    const result = await userService.login(email, password);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }
);

router.get('/me', authenticate, async (req: Request, res: Response<ApiResponse>) => {
  const authReq = req as Request & { user?: { userId: string } };
  const user = await userService.getProfile(authReq.user!.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});

export default router;
