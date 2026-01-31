import { Router } from 'express';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
} from '../controllers/notification.controller';
import { validate } from '../middlewares/validation';
import { authenticateJWT, adminOnly } from '../middlewares/auth';
import {
  createNotificationSchema,
  updateNotificationSchema,
} from '../validators/notification.validator';

const router = Router();

// 認証必須
router.use(authenticateJWT);

// お知らせ一覧・詳細（会員・管理者共通）
router.get('/', getNotifications);
router.get('/:id', getNotificationById);

// 管理者用CRUD
router.post('/', adminOnly, validate(createNotificationSchema), createNotification);
router.put('/:id', adminOnly, validate(updateNotificationSchema), updateNotification);
router.delete('/:id', adminOnly, deleteNotification);

export default router;
