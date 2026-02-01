import { z } from 'zod';

// 会員作成スキーマ（管理者用）- Prismaフィールド名を使用
export const createMemberSchema = z.object({
  body: z.object({
    // 1. ロータリー基本情報（必須）
    memberNumber: z.string({ required_error: '会員番号を入力してください' }).min(1, '会員番号を入力してください'),
    joinDate: z.string({ required_error: '入会年月日を入力してください' }).min(1, '入会年月日を入力してください'),
    lastName: z.string({ required_error: '姓を入力してください' }).min(1, '姓を入力してください'),
    firstName: z.string({ required_error: '名を入力してください' }).min(1, '名を入力してください'),
    lastNameKana: z.string({ required_error: '姓（ふりがな）を入力してください' }).min(1, '姓（ふりがな）を入力してください'),
    firstNameKana: z.string({ required_error: '名（ふりがな）を入力してください' }).min(1, '名（ふりがな）を入力してください'),
    position: z.string({ required_error: '役職を選択してください' }).min(1, '役職を選択してください'),

    // 2. 職業・事業所情報（任意）- Prismaフィールド名
    industryClassification: z.string().optional().nullable(),
    companyName: z.string().optional().nullable(),
    department: z.string().optional().nullable(),

    // 3. 連絡先（必須）- Prismaフィールド名
    phoneNumber: z.string({ required_error: '電話番号を入力してください' }).min(1, '電話番号を入力してください'),
    email: z
      .string({ required_error: 'メールアドレスを入力してください' })
      .email('正しいメールアドレスを入力してください'),
  }),
});

// 会員更新スキーマ（管理者用）- Prismaフィールド名を使用
export const updateMemberSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    // 1. ロータリー基本情報
    memberNumber: z.string().min(1, '会員番号を入力してください').optional(),
    joinDate: z.string().optional().nullable(),
    lastName: z.string().min(1, '姓を入力してください').optional(),
    firstName: z.string().min(1, '名を入力してください').optional(),
    lastNameKana: z.string().optional().nullable(),
    firstNameKana: z.string().optional().nullable(),
    position: z.string().optional().nullable(),

    // 2. 職業・事業所情報 - Prismaフィールド名
    industryClassification: z.string().optional().nullable(),
    companyName: z.string().optional().nullable(),
    department: z.string().optional().nullable(),

    // 3. 連絡先 - Prismaフィールド名
    phoneNumber: z.string().optional().nullable(),
    email: z.string().email('正しいメールアドレスを入力してください').optional(),

    // ステータス
    status: z.enum(['invited', 'active', 'inactive', 'withdrawn']).optional(),
  }),
});

// プロフィール更新スキーマ（会員用）- Prismaフィールド名を使用
export const updateProfileSchema = z.object({
  body: z.object({
    // 職業・事業所情報
    industryClassification: z.string().optional().nullable(),
    companyName: z.string().optional().nullable(),
    department: z.string().optional().nullable(),

    // 連絡先
    phoneNumber: z.string().optional().nullable(),

    // パーソナル情報
    hometown: z.string().optional().nullable(),
    school: z.string().optional().nullable(),
    hobbies: z.string().optional().nullable(),
    introduction: z.string().optional().nullable(),

    // プライバシー設定
    privacySettings: z.object({
      showEmail: z.boolean().optional(),
      showPhone: z.boolean().optional(),
      showBirthDate: z.boolean().optional(),
      showCompany: z.boolean().optional(),
    }).optional(),
  }),
});

// 会員一覧取得スキーマ
export const getMembersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['invited', 'active', 'inactive', 'withdrawn']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>['body'];
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
