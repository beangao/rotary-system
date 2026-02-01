import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error-handler';
import { sendInvitationEmail } from '../services/email.service';
import { CreateMemberInput, UpdateMemberInput, UpdateProfileInput } from '../validators/member.validator';

// DBからUIへのフィールド名変換
const mapMemberToResponse = (member: any) => ({
  id: member.id,
  email: member.email,
  memberNumber: member.memberNumber,
  lastName: member.lastName,
  firstName: member.firstName,
  lastNameKana: member.lastNameKana,
  firstNameKana: member.firstNameKana,
  position: member.position,
  joinDate: member.joinDate,
  // UIフィールド名にマッピング
  classification: member.industryClassification,
  companyName: member.companyName,
  jobTitle: member.department, // DB: department → UI: jobTitle
  phone: member.phoneNumber,
  hometown: member.hometown,
  school: member.school,
  hobbies: member.hobbies,
  bio: member.introduction, // DB: introduction → UI: bio
  // その他
  status: member.status,
  avatarUrl: member.avatarUrl,
  profileCompleted: member.profileCompleted,
  lastLoginAt: member.lastLoginAt,
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
});

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
          { companyName: { contains: search as string } },
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
          position: true,
          joinDate: true,
          industryClassification: true,
          companyName: true,
          department: true,
          phoneNumber: true,
          status: true,
          avatarUrl: true,
          profileCompleted: true,
          lastLoginAt: true,
        },
        orderBy: [{ lastNameKana: 'asc' }, { firstNameKana: 'asc' }],
        skip,
        take: limitNum,
      }),
      prisma.member.count({ where }),
    ]);

    // UIフィールド名にマッピング
    const mappedMembers = members.map((member) => ({
      id: member.id,
      email: member.email,
      memberNumber: member.memberNumber,
      lastName: member.lastName,
      firstName: member.firstName,
      lastNameKana: member.lastNameKana,
      firstNameKana: member.firstNameKana,
      position: member.position,
      joinDate: member.joinDate,
      classification: member.industryClassification,
      companyName: member.companyName,
      department: member.department,
      phone: member.phoneNumber,
      status: member.status,
      avatarUrl: member.avatarUrl,
      profileCompleted: member.profileCompleted,
      lastLoginAt: member.lastLoginAt,
    }));

    res.json({
      success: true,
      data: {
        members: mappedMembers,
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
          id: member.id,
          email: member.email,
          memberNumber: member.memberNumber,
          lastName: member.lastName,
          firstName: member.firstName,
          lastNameKana: member.lastNameKana,
          firstNameKana: member.firstNameKana,
          position: member.position,
          joinDate: member.joinDate,
          gender: member.gender,
          birthDate: member.birthDate,
          // UIフィールド名にマッピング
          classification: member.industryClassification,
          companyName: member.companyName,
          department: member.department,
          phone: member.phoneNumber,
          // その他
          avatarUrl: member.avatarUrl,
          hobbies: member.hobbies ? JSON.parse(member.hobbies) : [],
          introduction: member.introduction,
          privacySettings,
          status: member.status,
          profileCompleted: member.profileCompleted,
          lastLoginAt: member.lastLoginAt,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
          club: member.club,
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
        phone: privacySettings.showPhone ? member.phoneNumber : null,
        birthDate: privacySettings.showBirthDate ? member.birthDate : null,
        companyName: privacySettings.showCompany ? member.companyName : null,
        department: privacySettings.showCompany ? member.department : null,
        classification: privacySettings.showCompany ? member.industryClassification : null,
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

    // 重複チェック（メールアドレス）
    const existingEmail = await prisma.member.findFirst({
      where: {
        clubId: user.clubId,
        email: data.email.toLowerCase(),
      },
    });

    if (existingEmail) {
      throw new AppError('このメールアドレスは既に登録されています', 400);
    }

    // 重複チェック（会員番号）
    const existingNumber = await prisma.member.findFirst({
      where: {
        clubId: user.clubId,
        memberNumber: data.memberNumber,
      },
    });

    if (existingNumber) {
      throw new AppError('この会員番号は既に登録されています', 400);
    }

    // クラブ情報を取得
    const club = await prisma.club.findUnique({
      where: { id: user.clubId },
      select: { name: true },
    });

    const member = await prisma.member.create({
      data: {
        clubId: user.clubId,
        email: data.email.toLowerCase(),
        memberNumber: data.memberNumber,
        lastName: data.lastName,
        firstName: data.firstName,
        lastNameKana: data.lastNameKana,
        firstNameKana: data.firstNameKana,
        position: data.position,
        joinDate: data.joinDate ? new Date(data.joinDate) : null,
        // UIフィールド名からDBフィールド名にマッピング
        industryClassification: data.classification || null,
        companyName: data.companyName || null,
        department: data.department || null,
        phoneNumber: data.phone,
        status: 'invited',
      },
    });

    // 招待メールを自動送信
    const clubName = club?.name || 'ロータリークラブ';
    const memberName = `${data.lastName} ${data.firstName}`;

    try {
      await sendInvitationEmail(data.email.toLowerCase(), clubName, memberName);
      console.log(`招待メール送信完了: ${data.email}`);
    } catch (emailError) {
      console.error('招待メール送信エラー:', emailError);
      // メール送信失敗しても会員作成は成功とする
    }

    res.status(201).json({
      success: true,
      data: mapMemberToResponse(member),
      message: '会員を登録し、招待メールを送信しました',
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
    if (data.email && data.email.toLowerCase() !== existing.email) {
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

    // 会員番号変更時の重複チェック
    if (data.memberNumber && data.memberNumber !== existing.memberNumber) {
      const duplicate = await prisma.member.findFirst({
        where: {
          clubId: user.clubId,
          memberNumber: data.memberNumber,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new AppError('この会員番号は既に登録されています', 400);
      }
    }

    // 更新データの構築（UIフィールド名からDBフィールド名にマッピング）
    const updateData: any = {};

    if (data.email !== undefined) updateData.email = data.email.toLowerCase();
    if (data.memberNumber !== undefined) updateData.memberNumber = data.memberNumber;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastNameKana !== undefined) updateData.lastNameKana = data.lastNameKana;
    if (data.firstNameKana !== undefined) updateData.firstNameKana = data.firstNameKana;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.joinDate !== undefined) updateData.joinDate = data.joinDate ? new Date(data.joinDate) : null;
    if (data.classification !== undefined) updateData.industryClassification = data.classification;
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.phone !== undefined) updateData.phoneNumber = data.phone;
    if (data.status !== undefined) updateData.status = data.status;

    const member = await prisma.member.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: mapMemberToResponse(member),
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
        // UIフィールド名からDBフィールド名にマッピング
        industryClassification: data.classification,
        companyName: data.companyName,
        department: data.jobTitle, // UI: jobTitle → DB: department
        phoneNumber: data.phone,
        hometown: data.hometown,
        school: data.school,
        hobbies: data.hobbies || undefined, // 文字列として保存
        introduction: data.bio, // UI: bio → DB: introduction
        privacySettings: data.privacySettings ? JSON.stringify(data.privacySettings) : undefined,
        profileCompleted: true,
      },
      include: { club: { select: { id: true, name: true } } },
    });

    res.json({
      success: true,
      data: {
        id: member.id,
        email: member.email,
        lastName: member.lastName,
        firstName: member.firstName,
        lastNameKana: member.lastNameKana,
        firstNameKana: member.firstNameKana,
        memberNumber: member.memberNumber,
        position: member.position,
        joinDate: member.joinDate,
        avatarUrl: member.avatarUrl,
        profileCompleted: member.profileCompleted,
        // 編集可能フィールド（UIフィールド名にマッピング）
        classification: member.industryClassification,
        companyName: member.companyName,
        jobTitle: member.department,
        phone: member.phoneNumber,
        hometown: member.hometown,
        school: member.school,
        hobbies: member.hobbies,
        bio: member.introduction,
        club: member.club,
        userType: 'member',
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
