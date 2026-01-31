import { Router } from 'express';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  updateProfile,
  sendInvitation,
} from '../controllers/member.controller';
import { validate } from '../middlewares/validation';
import { authenticateJWT, adminOnly, memberOnly } from '../middlewares/auth';
import {
  createMemberSchema,
  updateMemberSchema,
  updateProfileSchema,
  getMembersSchema,
} from '../validators/member.validator';

const router = Router();

// 認証必須
router.use(authenticateJWT);

// 会員一覧・詳細（会員・管理者共通）
router.get('/', validate(getMembersSchema), getMembers);
router.get('/:id', getMemberById);

// プロフィール更新（会員用）
router.put('/profile', memberOnly, validate(updateProfileSchema), updateProfile);

// 管理者用CRUD
router.post('/', adminOnly, validate(createMemberSchema), createMember);
router.put('/:id', adminOnly, validate(updateMemberSchema), updateMember);
router.delete('/:id', adminOnly, deleteMember);

// 招待メール送信（管理者用）
router.post('/:id/invite', adminOnly, sendInvitation);

export default router;
