import { Router } from 'express';
import { getClub, updateClub } from '../controllers/club.controller';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// すべてのルートで認証必須
router.use(authenticateJWT);

// GET /api/club - クラブ情報取得
router.get('/', getClub);

// PUT /api/club - クラブ情報更新
router.put('/', updateClub);

export default router;
