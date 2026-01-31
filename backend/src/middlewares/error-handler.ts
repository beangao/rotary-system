import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Prismaエラーの処理
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: 'データベースエラーが発生しました',
    });
  }

  // 開発環境ではエラー詳細を表示
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }

  // 本番環境では一般的なエラーメッセージ
  return res.status(500).json({
    success: false,
    error: 'サーバーエラーが発生しました',
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'リソースが見つかりません',
  });
};
