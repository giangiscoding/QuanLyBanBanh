import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { sendSuccess } from './common/utils/response';
import { errorHandler, notFoundHandler } from './common/middlewares/error.middleware';
import { apiRouter } from './routes';

export function createApp(): Application {
  const app = express();

  // Middleware co ban
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  if (env.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  // Health check
  app.get('/health', (_req, res) => {
    sendSuccess(res, { data: { status: 'ok', time: new Date().toISOString() } });
  });

  // Tat ca API duoi tien to /api/v1
  app.use('/api/v1', apiRouter);

  // Xu ly route khong ton tai + loi
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
