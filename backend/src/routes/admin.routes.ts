import { Router } from 'express';
import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/admin.controller';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// すべてのルートで認証必須
router.use(authenticateJWT);

// GET /api/admins - 管理者一覧取得
router.get('/', getAdmins);

// GET /api/admins/:id - 管理者詳細取得
router.get('/:id', getAdminById);

// POST /api/admins - 管理者追加
router.post('/', createAdmin);

// PUT /api/admins/:id - 管理者更新
router.put('/:id', updateAdmin);

// DELETE /api/admins/:id - 管理者削除
router.delete('/:id', deleteAdmin);

export default router;
