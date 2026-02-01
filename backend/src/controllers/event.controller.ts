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
      // upcoming=true の場合は公開中かつ今後のイベントのみ（ホーム画面用）
      ...(upcoming === 'true'
        ? { status: 'published', startAt: { gte: new Date() } }
        // 会員の場合は下書き以外すべて表示（イベント一覧画面用）
        : user.userType === 'member' && { status: { not: 'draft' } }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        // upcoming=true: 直近順（昇順）、それ以外: 最新順（降順）
        orderBy: { startAt: upcoming === 'true' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.event.count({ where }),
    ]);

    // 会員の場合は自分の出欠情報を取得
    let eventsWithAttendance: any[] = events;
    if (user.userType === 'member') {
      const eventIds = events.map(e => e.id);
      const myAttendances = await prisma.attendance.findMany({
        where: {
          eventId: { in: eventIds },
          memberId: (user as any).id,
        },
      });

      const attendanceMap = new Map(myAttendances.map(a => [a.eventId, a]));

      eventsWithAttendance = events.map(event => ({
        ...event,
        myAttendance: attendanceMap.get(event.id) || null,
      }));
    }

    // 管理者の場合は出欠サマリーも取得
    if (user.userType === 'clubAdmin') {
      // 全会員数を取得
      const totalMembers = await prisma.member.count({
        where: {
          clubId: user.clubId,
          status: { in: ['active', 'invited'] },
        },
      });

      // 各イベントの出欠サマリーを取得
      const eventIds = events.map(e => e.id);
      const attendanceCounts = await prisma.attendance.groupBy({
        by: ['eventId', 'status'],
        where: { eventId: { in: eventIds } },
        _count: { status: true },
      });

      // イベントごとにサマリーをマップ
      const summaryMap = new Map<string, { attending: number; absent: number; undecided: number }>();
      for (const event of events) {
        summaryMap.set(event.id, { attending: 0, absent: 0, undecided: 0 });
      }
      for (const count of attendanceCounts) {
        const summary = summaryMap.get(count.eventId);
        if (summary) {
          if (count.status === 'attending') summary.attending = count._count.status;
          else if (count.status === 'absent') summary.absent = count._count.status;
          else if (count.status === 'undecided') summary.undecided = count._count.status;
        }
      }

      eventsWithAttendance = events.map(event => ({
        ...event,
        attendanceSummary: {
          ...summaryMap.get(event.id)!,
          total: totalMembers,
        },
      }));
    }

    res.json({
      success: true,
      data: {
        events: eventsWithAttendance,
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
        // 会員の場合は下書き以外すべて表示
        ...(user.userType === 'member' && { status: { not: 'draft' } }),
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

    // statusに応じてisPublishedを設定
    const isPublished = data.status === 'published';

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
        status: data.status || 'draft',
        isPublished,
        originalDate: data.originalDate ? new Date(data.originalDate) : null,
        postponedDate: data.postponedDate ? new Date(data.postponedDate) : null,
        attachmentUrl: data.attachmentUrl || null,
        attachmentName: data.attachmentName || null,
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

    // statusに応じてisPublishedを設定
    const isPublished = data.status === 'published' ? true : data.status ? false : undefined;

    // responseDeadlineが明示的にnullとして渡された場合はクリアする
    const responseDeadline = data.responseDeadline === null
      ? null
      : data.responseDeadline
        ? new Date(data.responseDeadline)
        : undefined;

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        startAt: data.startAt ? new Date(data.startAt) : undefined,
        endAt: data.endAt ? new Date(data.endAt) : undefined,
        venue: data.venue,
        venueAddress: data.venueAddress,
        onlineUrl: data.onlineUrl || null,
        responseDeadline,
        status: data.status,
        isPublished,
        originalDate: data.originalDate ? new Date(data.originalDate) : undefined,
        postponedDate: data.postponedDate ? new Date(data.postponedDate) : undefined,
        attachmentUrl: data.attachmentUrl,
        attachmentName: data.attachmentName,
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

    // クラブの全会員を取得（出欠回答の有無に関わらず）
    const members = await prisma.member.findMany({
      where: {
        clubId: user.clubId,
        status: { in: ['active', 'invited'] },
      },
      select: {
        id: true,
        lastName: true,
        firstName: true,
        lastNameKana: true,
        firstNameKana: true,
        memberNumber: true,
        position: true,
        avatarUrl: true,
      },
      orderBy: [
        { lastNameKana: 'asc' },
        { firstNameKana: 'asc' },
      ],
    });

    // 出欠回答を取得
    const attendances = await prisma.attendance.findMany({
      where: { eventId: id },
    });

    // 会員リストに出欠情報をマージ
    const attendanceMap = new Map(attendances.map(a => [a.memberId, a]));

    const membersWithAttendance = members.map(member => {
      const attendance = attendanceMap.get(member.id);
      return {
        id: attendance?.id || null,
        memberId: member.id,
        eventId: id,
        status: attendance?.status || 'none', // none = 未回答
        comment: attendance?.comment || null,
        respondedAt: attendance?.updatedAt || null,
        member: {
          id: member.id,
          lastName: member.lastName,
          firstName: member.firstName,
          lastNameKana: member.lastNameKana,
          firstNameKana: member.firstNameKana,
          memberNumber: member.memberNumber,
          position: member.position,
          avatarUrl: member.avatarUrl,
        },
      };
    });

    res.json({
      success: true,
      data: membersWithAttendance,
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
      where: { id: eventId, clubId: user.clubId, status: { not: 'draft' } },
    });

    if (!event) {
      throw new AppError('イベントが見つかりません', 404);
    }

    // 公開中のイベントのみ回答可能
    if (event.status !== 'published') {
      throw new AppError('このイベントは出欠回答を受け付けていません', 400);
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

// 代理回答（管理者用）
export const proxyAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string };
    const { id: eventId, memberId } = req.params;
    const { status, comment } = req.body;

    const event = await prisma.event.findFirst({
      where: { id: eventId, clubId: user.clubId },
    });

    if (!event) {
      throw new AppError('イベントが見つかりません', 404);
    }

    // 対象会員が同じクラブに所属しているか確認
    const member = await prisma.member.findFirst({
      where: { id: memberId, clubId: user.clubId },
    });

    if (!member) {
      throw new AppError('会員が見つかりません', 404);
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        eventId_memberId: {
          eventId,
          memberId,
        },
      },
      update: {
        status,
        comment,
      },
      create: {
        eventId,
        memberId,
        status,
        comment,
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
