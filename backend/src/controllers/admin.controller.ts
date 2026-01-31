import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 管理者一覧取得
export const getAdmins = async (req: Request, res: Response) => {
  try {
    const clubId = req.user?.clubId;
    if (!clubId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }

    const admins = await prisma.clubAdmin.findMany({
      where: { clubId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: admins });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ success: false, error: '管理者一覧の取得に失敗しました' });
  }
};

// 管理者詳細取得
export const getAdminById = async (req: Request, res: Response) => {
  try {
    const clubId = req.user?.clubId;
    const { id } = req.params;

    if (!clubId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }

    const admin = await prisma.clubAdmin.findFirst({
      where: { id, clubId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ success: false, error: '管理者が見つかりません' });
    }

    res.json({ success: true, data: admin });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ success: false, error: '管理者情報の取得に失敗しました' });
  }
};

// 管理者追加
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const clubId = req.user?.clubId;
    if (!clubId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }

    const { email, password, name, role } = req.body;

    // 重複チェック
    const existing = await prisma.clubAdmin.findFirst({
      where: { clubId, email },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'このメールアドレスは既に登録されています' });
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.clubAdmin.create({
      data: {
        clubId,
        email,
        password: hashedPassword,
        name,
        role: role || 'admin',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({ success: true, data: admin });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, error: '管理者の追加に失敗しました' });
  }
};

// 管理者更新
export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const clubId = req.user?.clubId;
    const { id } = req.params;

    if (!clubId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }

    const { email, password, name, role, isActive } = req.body;

    // 存在チェック
    const existing = await prisma.clubAdmin.findFirst({
      where: { id, clubId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: '管理者が見つかりません' });
    }

    // 更新データ準備
    const updateData: Record<string, unknown> = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const admin = await prisma.clubAdmin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: admin });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ success: false, error: '管理者情報の更新に失敗しました' });
  }
};

// 管理者削除
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const clubId = req.user?.clubId;
    const currentUserId = req.user?.id;
    const { id } = req.params;

    if (!clubId) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }

    // 自分自身は削除不可
    if (id === currentUserId) {
      return res.status(400).json({ success: false, error: '自分自身は削除できません' });
    }

    // 存在チェック
    const existing = await prisma.clubAdmin.findFirst({
      where: { id, clubId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: '管理者が見つかりません' });
    }

    await prisma.clubAdmin.delete({
      where: { id },
    });

    res.json({ success: true, message: '管理者を削除しました' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ success: false, error: '管理者の削除に失敗しました' });
  }
};
