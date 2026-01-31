import { Router } from 'express';
import authRoutes from './auth.routes';
import memberRoutes from './member.routes';
import eventRoutes from './event.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// ヘルスチェック
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// 認証
router.use('/auth', authRoutes);

// 会員
router.use('/members', memberRoutes);

// イベント
router.use('/events', eventRoutes);

// お知らせ
router.use('/notifications', notificationRoutes);

export default router;
