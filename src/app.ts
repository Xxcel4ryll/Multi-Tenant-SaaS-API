import express, { Application } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import config from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import healthController from './modules/health/health.controller';
import userController from './modules/users/user.controller';
import organizationController from './modules/organizations/organization.controller';
import clientController from './modules/clients/client.controller';
import projectController from './modules/projects/project.controller';

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

app.use(rateLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(compression());

const morganFormat = config.node_env === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

app.use('/', healthController);

app.use(`${config.api_prefix}/auth`, userController);
app.use(`${config.api_prefix}/organizations`, organizationController);
app.use(`${config.api_prefix}/clients`, clientController);
app.use(`${config.api_prefix}/projects`, projectController);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
