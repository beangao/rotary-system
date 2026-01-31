import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error-handler';
import { CreateNotificationInput, UpdateNotificationInput } from '../validators/notification.validator';

// お知らせ一覧取得
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string; userType: string };
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      clubId: user.clubId,
      // 会員の場合は公開済みのみ
      ...(user.userType === 'member' && { isPublished: true }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// お知らせ詳細取得
export const getNotificationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string; userType: string };
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        clubId: user.clubId,
        ...(user.userType === 'member' && { isPublished: true }),
      },
    });

    if (!notification) {
      throw new AppError('お知らせが見つかりません', 404);
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// お知らせ作成（管理者用）
export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string };
    const data = req.body as CreateNotificationInput;

    const notification = await prisma.notification.create({
      data: {
        clubId: user.clubId,
        title: data.title,
        content: data.content,
        category: data.category,
        isPublished: data.isPublished ?? false,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// お知らせ更新（管理者用）
export const updateNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string };
    const { id } = req.params;
    const data = req.body as UpdateNotificationInput;

    const existing = await prisma.notification.findFirst({
      where: { id, clubId: user.clubId },
    });

    if (!existing) {
      throw new AppError('お知らせが見つかりません', 404);
    }

    // 公開状態が変更された場合は公開日時を更新
    let publishedAt = existing.publishedAt;
    if (data.isPublished !== undefined) {
      if (data.isPublished && !existing.isPublished) {
        publishedAt = new Date();
      } else if (!data.isPublished) {
        publishedAt = null;
      }
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        ...data,
        publishedAt,
      },
    });

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// お知らせ削除（管理者用）
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string };
    const { id } = req.params;

    const existing = await prisma.notification.findFirst({
      where: { id, clubId: user.clubId },
    });

    if (!existing) {
      throw new AppError('お知らせが見つかりません', 404);
    }

    await prisma.notification.delete({ where: { id } });

    res.json({
      success: true,
      message: 'お知らせを削除しました',
    });
  } catch (error) {
    next(error);
  }
};
