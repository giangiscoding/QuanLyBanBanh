import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

// Middleware kiem tra body/query/params bang schema Zod
// Dung: router.post('/', validate(createSchema), controller.create)
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Gan lai gia tri da chuan hoa
    if (parsed.body) req.body = parsed.body;
    next();
  };
}
