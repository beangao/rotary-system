import { Router } from 'express';
import {
  sendCode,
  verifyCode,
  setPassword,
  memberLogin,
  clubAdminLogin,
  refreshToken,
  sendResetCode,
  resetPassword,
  getMe,
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validation';
import { authenticateJWT } from '../middlewares/auth';
import {
  sendCodeSchema,
  verifyCodeSchema,
  setPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// 会員向け認証
router.post('/send-code', validate(sendCodeSchema), sendCode);
router.post('/verify-code', validate(verifyCodeSchema), verifyCode);
router.post('/set-password', authenticateJWT, validate(setPasswordSchema), setPassword);
router.post('/login', validate(loginSchema), memberLogin);

// パスワードリセット
router.post('/reset/send-code', validate(sendCodeSchema), sendResetCode);
router.post('/reset/password', validate(resetPasswordSchema), resetPassword);

// クラブ管理者ログイン
router.post('/admin/login', validate(loginSchema), clubAdminLogin);

// トークン
router.post('/refresh', refreshToken);

// 現在のユーザー
router.get('/me', authenticateJWT, getMe);

export default router;
