// Member Status Labels
export const MEMBER_STATUS_LABELS = {
  invited: '招待中',
  active: 'アクティブ',
  inactive: '休会中',
  withdrawn: '退会',
} as const;

// Event Type Labels
export const EVENT_TYPE_LABELS = {
  regular_meeting: '例会',
  special_event: '特別イベント',
  board_meeting: '理事会',
  social: '親睦会',
  other: 'その他',
} as const;

// Attendance Status Labels
export const ATTENDANCE_STATUS_LABELS = {
  attending: '出席',
  absent: '欠席',
  undecided: '未定',
} as const;

// Notification Category Labels
export const NOTIFICATION_CATEGORY_LABELS = {
  general: '一般',
  important: '重要',
  event: 'イベント',
  other: 'その他',
} as const;

// Club Admin Role Labels
export const CLUB_ADMIN_ROLE_LABELS = {
  admin: '管理者',
  editor: '編集者',
  viewer: '閲覧者',
} as const;

// Gender Labels
export const GENDER_LABELS = {
  male: '男性',
  female: '女性',
  other: 'その他',
} as const;

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
} as const;

// Verification Code
export const VERIFICATION_CODE = {
  length: 6,
  expiryMinutes: 10,
} as const;

// File Upload
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  avatarSize: { width: 200, height: 200 },
} as const;
