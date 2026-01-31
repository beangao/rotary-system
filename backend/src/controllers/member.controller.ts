import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error-handler';
import { sendInvitationEmail } from '../services/email.service';
import { CreateMemberInput, UpdateMemberInput, UpdateProfileInput } from '../validators/member.validator';

// 会員一覧取得
export const getMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string; userType: string };
    const { search, status, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      clubId: user.clubId,
      ...(status && { status: status as string }),
      ...(search && {
        OR: [
          { lastName: { contains: search as string } },
          { firstName: { contains: search as string } },
          { lastNameKana: { contains: search as string } },
          { firstNameKana: { contains: search as string } },
          { email: { contains: search as string } },
          { memberNumber: { contains: search as string } },
        ],
      }),
    };

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        select: {
          id: true,
          email: true,
          memberNumber: true,
          lastName: true,
          firstName: true,
          lastNameKana: true,
          firstNameKana: true,
          gender: true,
          position: true,
          status: true,
          avatarUrl: true,
          companyName: true,
          profileCompleted: true,
          lastLoginAt: true,
        },
        orderBy: [{ lastNameKana: 'asc' }, { firstNameKana: 'asc' }],
        skip,
        take: limitNum,
      }),
      prisma.member.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        members,
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

// 会員詳細取得
export const getMemberById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string; userType: string; id: string };
    const { id } = req.params;

    const member = await prisma.member.findFirst({
      where: {
        id,
        clubId: user.clubId,
      },
      include: {
        club: { select: { id: true, name: true } },
      },
    });

    if (!member) {
      throw new AppError('会員が見つかりません', 404);
    }

    // プライバシー設定の適用（他の会員から見る場合）
    const privacySettings = member.privacySettings
      ? JSON.parse(member.privacySettings)
      : { showEmail: true, showPhone: true, showBirthDate: true, showCompany: true };

    const isOwner = user.userType === 'member' && user.id === member.id;
    const isAdmin = user.userType === 'clubAdmin';

    // 管理者または本人の場合は全ての情報を返す
    if (isAdmin || isOwner) {
      res.json({
        success: true,
        data: {
          ...member,
          hobbies: member.hobbies ? JSON.parse(member.hobbies) : [],
          privacySettings,
        },
      });
      return;
    }

    // 他の会員から見る場合はプライバシー設定に従う
    res.json({
      success: true,
      data: {
        id: member.id,
        lastName: member.lastName,
        firstName: member.firstName,
        lastNameKana: member.lastNameKana,
        firstNameKana: member.firstNameKana,
        memberNumber: member.memberNumber,
        position: member.position,
        avatarUrl: member.avatarUrl,
        hobbies: member.hobbies ? JSON.parse(member.hobbies) : [],
        introduction: member.introduction,
        email: privacySettings.showEmail ? member.email : null,
        phoneNumber: privacySettings.showPhone ? member.phoneNumber : null,
        birthDate: privacySettings.showBirthDate ? member.birthDate : null,
        companyName: privacySettings.showCompany ? member.companyName : null,
        department: privacySettings.showCompany ? member.department : null,
        industryClassification: privacySettings.showCompany ? member.industryClassification : null,
        club: member.club,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 会員作成（管理者用）
export const createMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string; club: { name: string } };
    const data = req.body as CreateMemberInput;

    // 重複チェック
    const existing = await prisma.member.findFirst({
      where: {
        clubId: user.clubId,
        email: data.email.toLowerCase(),
      },
    });

    if (existing) {
      throw new AppError('このメールアドレスは既に登録されています', 400);
    }

    const member = await prisma.member.create({
      data: {
        clubId: user.clubId,
        email: data.email.toLowerCase(),
        lastName: data.lastName,
        firstName: data.firstName,
        lastNameKana: data.lastNameKana,
        firstNameKana: data.firstNameKana,
        memberNumber: data.memberNumber,
        gender: data.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        position: data.position,
        joinDate: data.joinDate ? new Date(data.joinDate) : null,
        status: 'invited',
      },
    });

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// 会員更新（管理者用）
export const updateMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string };
    const { id } = req.params;
    const data = req.body as UpdateMemberInput;

    const existing = await prisma.member.findFirst({
      where: { id, clubId: user.clubId },
    });

    if (!existing) {
      throw new AppError('会員が見つかりません', 404);
    }

    // メールアドレス変更時の重複チェック
    if (data.email && data.email !== existing.email) {
      const duplicate = await prisma.member.findFirst({
        where: {
          clubId: user.clubId,
          email: data.email.toLowerCase(),
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new AppError('このメールアドレスは既に登録されています', 400);
      }
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        ...data,
        email: data.email?.toLowerCase(),
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
      },
    });

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// 会員削除（管理者用 - 論理削除）
export const deleteMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string };
    const { id } = req.params;

    const existing = await prisma.member.findFirst({
      where: { id, clubId: user.clubId },
    });

    if (!existing) {
      throw new AppError('会員が見つかりません', 404);
    }

    await prisma.member.update({
      where: { id },
      data: { status: 'withdrawn' },
    });

    res.json({
      success: true,
      message: '会員を削除しました',
    });
  } catch (error) {
    next(error);
  }
};

// プロフィール更新（会員用）
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { id: string };
    const data = req.body as UpdateProfileInput;

    const member = await prisma.member.update({
      where: { id: user.id },
      data: {
        industryClassification: data.industryClassification,
        companyName: data.companyName,
        department: data.department,
        phoneNumber: data.phoneNumber,
        hobbies: data.hobbies ? JSON.stringify(data.hobbies) : undefined,
        introduction: data.introduction,
        privacySettings: data.privacySettings ? JSON.stringify(data.privacySettings) : undefined,
        profileCompleted: true,
      },
    });

    res.json({
      success: true,
      data: {
        ...member,
        hobbies: member.hobbies ? JSON.parse(member.hobbies) : [],
        privacySettings: member.privacySettings ? JSON.parse(member.privacySettings) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 招待メール送信
export const sendInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { clubId: string; club: { name: string } };
    const { id } = req.params;

    const member = await prisma.member.findFirst({
      where: { id, clubId: user.clubId },
      include: { club: true },
    });

    if (!member) {
      throw new AppError('会員が見つかりません', 404);
    }

    if (member.status !== 'invited') {
      throw new AppError('この会員は既に登録済みです', 400);
    }

    await sendInvitationEmail(
      member.email,
      member.club.name,
      `${member.lastName} ${member.firstName}`
    );

    res.json({
      success: true,
      message: '招待メールを送信しました',
    });
  } catch (error) {
    next(error);
  }
};
