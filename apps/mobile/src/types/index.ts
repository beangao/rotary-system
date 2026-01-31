// ユーザー情報
export interface User {
  id: string;
  email: string;
  memberNumber: string | null;
  lastName: string;
  firstName: string;
  lastNameKana: string | null;
  firstNameKana: string | null;
  position: string | null;
  joinDate: string | null;
  avatarUrl: string | null;
  status: 'invited' | 'active' | 'inactive' | 'withdrawn';
  profileCompleted: boolean;
  club: {
    id: string;
    name: string;
  };
}

// 会員情報
export interface Member {
  id: string;
  email: string;
  memberNumber: string | null;
  lastName: string;
  firstName: string;
  lastNameKana: string | null;
  firstNameKana: string | null;
  position: string | null;
  joinDate: string | null;
  classification: string | null;
  companyName: string | null;
  department: string | null;
  phone: string | null;
  avatarUrl: string | null;
  hobbies: string[];
  introduction: string | null;
  status: string;
}

// イベント
export interface Event {
  id: string;
  title: string;
  description: string | null;
  eventType: 'meeting' | 'service' | 'social' | 'district' | 'other';
  startAt: string;
  endAt: string | null;
  venue: string | null;
  venueAddress: string | null;
  onlineUrl: string | null;
  responseDeadline: string | null;
  status: 'draft' | 'published' | 'closed' | 'cancelled' | 'postponed';
  myAttendance?: Attendance;
}

// 出欠
export interface Attendance {
  id: string;
  status: 'attending' | 'absent' | 'undecided';
  comment: string | null;
}

// お知らせ
export interface Notification {
  id: string;
  title: string;
  content: string;
  category: string | null;
  publishedAt: string | null;
  createdAt: string;
}

// API レスポンス
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 認証
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}
