import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

// JWT認証ミドルウェア
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: Express.User, info: { message: string }) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'サーバーエラーが発生しました' });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: info?.message || '認証が必要です',
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

// 会員専用ミドルウェア
export const memberOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as Express.User & { userType: string };
  if (user?.userType !== 'member') {
    return res.status(403).json({ success: false, error: 'アクセス権限がありません' });
  }
  next();
};

// クラブ管理者専用ミドルウェア
export const clubAdminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as Express.User & { userType: string };
  if (user?.userType !== 'clubAdmin') {
    return res.status(403).json({ success: false, error: 'アクセス権限がありません' });
  }
  next();
};

// スーパー管理者専用ミドルウェア
export const superAdminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as Express.User & { userType: string };
  if (user?.userType !== 'superAdmin') {
    return res.status(403).json({ success: false, error: 'アクセス権限がありません' });
  }
  next();
};

// クラブ管理者またはスーパー管理者
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as Express.User & { userType: string };
  if (user?.userType !== 'clubAdmin' && user?.userType !== 'superAdmin') {
    return res.status(403).json({ success: false, error: 'アクセス権限がありません' });
  }
  next();
};
