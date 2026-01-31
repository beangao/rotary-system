import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAttendances,
  upsertAttendance,
} from '../controllers/event.controller';
import { validate } from '../middlewares/validation';
import { authenticateJWT, adminOnly, memberOnly } from '../middlewares/auth';
import {
  createEventSchema,
  updateEventSchema,
  attendanceSchema,
} from '../validators/event.validator';

const router = Router();

// 認証必須
router.use(authenticateJWT);

// イベント一覧・詳細（会員・管理者共通）
router.get('/', getEvents);
router.get('/:id', getEventById);

// 出欠登録（会員用）
router.post('/:id/attendance', memberOnly, validate(attendanceSchema), upsertAttendance);

// 出欠一覧（管理者用）
router.get('/:id/attendances', adminOnly, getAttendances);

// 管理者用CRUD
router.post('/', adminOnly, validate(createEventSchema), createEvent);
router.put('/:id', adminOnly, validate(updateEventSchema), updateEvent);
router.delete('/:id', adminOnly, deleteEvent);

export default router;
