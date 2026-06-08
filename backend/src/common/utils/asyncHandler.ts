import { NextFunction, Request, Response } from 'express';

// Bao boc controller async de tu dong bat loi va day sang error middleware
// Tranh phai viet try/catch o moi controller
type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncFn) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
