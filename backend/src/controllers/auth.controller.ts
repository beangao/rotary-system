import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { prisma } from '../config/database';
import { generateAccessToken, generateRefreshToken, generateVerificationCode, verifyToken } from '../utils/jwt';
import { sendVerificationCode } from '../services/email.service';
import { AppError } from '../middlewares/error-handler';
import {
  SendCodeInput,
  VerifyCodeInput,
  SetPasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validator';

// 認証コード送信（会員向け）
export const sendCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as SendCodeInput;

    // 会員の存在確認
    const member = await prisma.member.findFirst({
      where: {
        email: email.toLowerCase(),
        status: { in: ['invited', 'active'] },
      },
    });

    if (!member) {
      throw new AppError('このアドレスは登録されていません。招待メールをご確認ください。', 400);
    }

    // 認証コード生成
    const code = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10分後

    // 認証コードを保存
    await prisma.member.update({
      where: { id: member.id },
      data: {
        verificationCode: code,
        verificationCodeExpiry: expiry,
      },
    });

    // メール送信
    await sendVerificationCode(email, code);

    res.json({
      success: true,
      message: '認証コードを送信しました',
    });
  } catch (error) {
    next(error);
  }
};

// 認証コード検証
export const verifyCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body as VerifyCodeInput;

    const member = await prisma.member.findFirst({
      where: {
        email: email.toLowerCase(),
        verificationCode: code,
        verificationCodeExpiry: { gt: new Date() },
      },
      include: { club: true },
    });

    if (!member) {
      throw new AppError('認証コードが正しくありません', 400);
    }

    // 認証コードをクリア
    await prisma.member.update({
      where: { id: member.id },
      data: {
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });

    // 一時トークン発行（パスワード設定用）
    const tempToken = generateAccessToken({
      userId: member.id,
      userType: 'member',
      clubId: member.clubId,
    });

    res.json({
      success: true,
      data: {
        token: tempToken,
        memberId: member.id,
        hasPassword: !!member.password,
      },
    });
  } catch (error) {
    next(error);
  }
};

// パスワード設定
export const setPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, password } = req.body as SetPasswordInput;

    // email + code で会員を特定（認証コード検証後の短時間内に呼ばれる想定）
    const member = await prisma.member.findFirst({
      where: {
        email: email.toLowerCase(),
        status: { in: ['invited', 'active'] },
      },
    });

    if (!member) {
      throw new AppError('会員が見つかりません', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: {
        password: hashedPassword,
        status: 'active',
      },
      include: { club: true },
    });

    // 正式なトークン発行
    const accessToken = generateAccessToken({
      userId: updatedMember.id,
      userType: 'member',
      clubId: updatedMember.clubId,
    });

    const refreshToken = generateRefreshToken({
      userId: updatedMember.id,
      userType: 'member',
      clubId: updatedMember.clubId,
    });

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken,
        },
        user: {
          id: updatedMember.id,
          email: updatedMember.email,
          lastName: updatedMember.lastName,
          firstName: updatedMember.firstName,
          profileCompleted: updatedMember.profileCompleted,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ログイン（会員向け）
export const memberLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'member-local',
    { session: false },
    (err: Error, user: Express.User & { id: string; clubId: string; profileCompleted: boolean; lastName: string; firstName: string; email: string }, info: { message: string }) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: info?.message || 'ログインに失敗しました',
        });
      }

      // 最終ログイン時刻更新
      prisma.member.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }).catch(console.error);

      const accessToken = generateAccessToken({
        userId: user.id,
        userType: 'member',
        clubId: user.clubId,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        userType: 'member',
        clubId: user.clubId,
      });

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            lastName: user.lastName,
            firstName: user.firstName,
            profileCompleted: user.profileCompleted,
          },
        },
      });
    }
  )(req, res, next);
};

// ログイン（クラブ管理者向け）
export const clubAdminLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'club-admin-local',
    { session: false },
    (err: Error, user: Express.User & { id: string; clubId: string; name: string; email: string; role: string }, info: { message: string }) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: info?.message || 'ログインに失敗しました',
        });
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        userType: 'clubAdmin',
        clubId: user.clubId,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        userType: 'clubAdmin',
        clubId: user.clubId,
      });

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
      });
    }
  )(req, res, next);
};

// トークンリフレッシュ
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('リフレッシュトークンが必要です', 400);
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new AppError('無効なトークンです', 401);
    }

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      userType: payload.userType,
      clubId: payload.clubId,
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// パスワードリセット用コード送信
export const sendResetCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as SendCodeInput;

    const member = await prisma.member.findFirst({
      where: {
        email: email.toLowerCase(),
        status: 'active',
      },
    });

    if (!member) {
      throw new AppError('このアドレスは登録されていません', 400);
    }

    const code = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.member.update({
      where: { id: member.id },
      data: {
        verificationCode: code,
        verificationCodeExpiry: expiry,
      },
    });

    await sendVerificationCode(email, code);

    res.json({
      success: true,
      message: '認証コードを送信しました',
    });
  } catch (error) {
    next(error);
  }
};

// パスワードリセット
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, newPassword } = req.body as ResetPasswordInput;

    const member = await prisma.member.findFirst({
      where: {
        email: email.toLowerCase(),
        verificationCode: code,
        verificationCodeExpiry: { gt: new Date() },
      },
    });

    if (!member) {
      throw new AppError('認証コードが正しくありません', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.member.update({
      where: { id: member.id },
      data: {
        password: hashedPassword,
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });

    // 自動ログイン用トークン発行
    const accessToken = generateAccessToken({
      userId: member.id,
      userType: 'member',
      clubId: member.clubId,
    });

    const refreshToken = generateRefreshToken({
      userId: member.id,
      userType: 'member',
      clubId: member.clubId,
    });

    res.json({
      success: true,
      message: 'パスワードを更新しました',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: member.id,
          email: member.email,
          lastName: member.lastName,
          firstName: member.firstName,
          profileCompleted: member.profileCompleted,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 現在のユーザー情報取得
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as Express.User & { id: string; userType: string };

    if (user.userType === 'member') {
      const member = await prisma.member.findUnique({
        where: { id: user.id },
        include: { club: { select: { id: true, name: true } } },
      });

      if (!member) {
        throw new AppError('ユーザーが見つかりません', 404);
      }

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
          avatarUrl: member.avatarUrl,
          profileCompleted: member.profileCompleted,
          club: member.club,
          userType: 'member',
        },
      });
    } else {
      res.json({
        success: true,
        data: { ...user },
      });
    }
  } catch (error) {
    next(error);
  }
};
