// Loi nghiep vu co the doan truoc (vd: khong tim thay, khong du quyen...)
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Khong tim thay du lieu') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Chua xac thuc') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Khong co quyen truy cap') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Du lieu da ton tai') {
    super(message, 409);
  }
}
