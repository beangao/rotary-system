import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// クラブ情報取得
export const getClub = async (req: Request, res: Response) => {
  try {
    const clubId = req.user?.clubId;
    if (!clubId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        nameKana: true,
        description: true,
        logoUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!club) {
      return res.status(404).json({ success: false, error: 'クラブが見つかりません' });
    }

    res.json({ success: true, data: club });
  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({ success: false, error: 'クラブ情報の取得に失敗しました' });
  }
};

// クラブ情報更新
export const updateClub = async (req: Request, res: Response) => {
  try {
    const clubId = req.user?.clubId;
    if (!clubId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }

    const { name, nameKana, description, logoUrl } = req.body;

    const club = await prisma.club.update({
      where: { id: clubId },
      data: {
        name,
        nameKana,
        description,
        logoUrl,
      },
      select: {
        id: true,
        name: true,
        nameKana: true,
        description: true,
        logoUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: club });
  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({ success: false, error: 'クラブ情報の更新に失敗しました' });
  }
};
