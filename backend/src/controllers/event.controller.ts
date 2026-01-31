import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error-handler';
import { CreateEventInput, UpdateEventInput, AttendanceInput } from '../validators/event.validator';

// イベント一覧取得
export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string; userType: string };
    const { upcoming, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      clubId: user.clubId,
      // 会員の場合は公開済みのみ
      ...(user.userType === 'member' && { isPublished: true }),
      // upcoming=true の場合は今後のイベントのみ
      ...(upcoming === 'true' && { startAt: { gte: new Date() } }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startAt: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        events,
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

// イベント詳細取得
export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string; userType: string; id: string };
    const { id } = req.params;

    const event = await prisma.event.findFirst({
      where: {
        id,
        clubId: user.clubId,
        ...(user.userType === 'member' && { isPublished: true }),
      },
    });

    if (!event) {
      throw new AppError('イベントが見つかりません', 404);
    }

    // 出欠情報を取得（会員の場合は自分の出欠のみ）
    let myAttendance = null;
    let attendanceSummary = null;

    if (user.userType === 'member') {
      myAttendance = await prisma.attendance.findFirst({
        where: { eventId: id, memberId: user.id },
      });
    }

    if (user.userType === 'clubAdmin') {
      const attendances = await prisma.attendance.groupBy({
        by: ['status'],
        where: { eventId: id },
        _count: { status: true },
      });

      attendanceSummary = {
        attending: attendances.find(a => a.status === 'attending')?._count.status || 0,
        absent: attendances.find(a => a.status === 'absent')?._count.status || 0,
        undecided: attendances.find(a => a.status === 'undecided')?._count.status || 0,
      };
    }

    res.json({
      success: true,
      data: {
        ...event,
        myAttendance,
        attendanceSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// イベント作成（管理者用）
export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string };
    const data = req.body as CreateEventInput;

    const event = await prisma.event.create({
      data: {
        clubId: user.clubId,
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        startAt: new Date(data.startAt),
        endAt: data.endAt ? new Date(data.endAt) : null,
        venue: data.venue,
        venueAddress: data.venueAddress,
        onlineUrl: data.onlineUrl || null,
        responseDeadline: data.responseDeadline ? new Date(data.responseDeadline) : null,
        isPublished: data.isPublished ?? false,
      },
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// イベント更新（管理者用）
export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string };
    const { id } = req.params;
    const data = req.body as UpdateEventInput;

    const existing = await prisma.event.findFirst({
      where: { id, clubId: user.clubId },
    });

    if (!existing) {
      throw new AppError('イベントが見つかりません', 404);
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        startAt: data.startAt ? new Date(data.startAt) : undefined,
        endAt: data.endAt ? new Date(data.endAt) : undefined,
        responseDeadline: data.responseDeadline ? new Date(data.responseDeadline) : undefined,
        onlineUrl: data.onlineUrl || null,
      },
    });

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// イベント削除（管理者用）
export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string };
    const { id } = req.params;

    const existing = await prisma.event.findFirst({
      where: { id, clubId: user.clubId },
    });

    if (!existing) {
      throw new AppError('イベントが見つかりません', 404);
    }

    // 関連する出欠データも削除
    await prisma.attendance.deleteMany({ where: { eventId: id } });
    await prisma.event.delete({ where: { id } });

    res.json({
      success: true,
      message: 'イベントを削除しました',
    });
  } catch (error) {
    next(error);
  }
};

// 出欠一覧取得（管理者用）
export const getAttendances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string };
    const { id } = req.params;

    const event = await prisma.event.findFirst({
      where: { id, clubId: user.clubId },
    });

    if (!event) {
      throw new AppError('イベントが見つかりません', 404);
    }

    const attendances = await prisma.attendance.findMany({
      where: { eventId: id },
      include: {
        member: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            memberNumber: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: attendances,
    });
  } catch (error) {
    next(error);
  }
};

// 出欠登録・更新（会員用）
export const upsertAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { id: string; clubId: string };
    const { id: eventId } = req.params;
    const data = req.body as AttendanceInput;

    const event = await prisma.event.findFirst({
      where: { id: eventId, clubId: user.clubId, isPublished: true },
    });

    if (!event) {
      throw new AppError('イベントが見つかりません', 404);
    }

    // 回答期限チェック
    if (event.responseDeadline && new Date() > event.responseDeadline) {
      throw new AppError('回答期限を過ぎています', 400);
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        eventId_memberId: {
          eventId,
          memberId: user.id,
        },
      },
      update: {
        status: data.status,
        comment: data.comment,
      },
      create: {
        eventId,
        memberId: user.id,
        status: data.status,
        comment: data.comment,
      },
    });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};
