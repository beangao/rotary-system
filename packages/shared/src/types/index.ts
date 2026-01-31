// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Types
export type UserType = 'member' | 'clubAdmin' | 'superAdmin';

export type MemberStatus = 'invited' | 'active' | 'inactive' | 'withdrawn';

export type EventType = 'regular_meeting' | 'special_event' | 'board_meeting' | 'social' | 'other';

export type AttendanceStatus = 'attending' | 'absent' | 'undecided';

export type NotificationCategory = 'general' | 'important' | 'event' | 'other';

export type ClubAdminRole = 'admin' | 'editor' | 'viewer';

// Member
export interface Member {
  id: string;
  clubId: string;
  email: string;
  memberNumber: string | null;
  lastName: string;
  firstName: string;
  lastNameKana: string | null;
  firstNameKana: string | null;
  gender: string | null;
  birthDate: string | null;
  position: string | null;
  joinDate: string | null;
  industryClassification: string | null;
  companyName: string | null;
  department: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  hobbies: string[];
  introduction: string | null;
  status: MemberStatus;
  profileCompleted: boolean;
}

// Event
export interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string | null;
  eventType: EventType;
  startAt: string;
  endAt: string | null;
  venue: string | null;
  venueAddress: string | null;
  onlineUrl: string | null;
  responseDeadline: string | null;
  isPublished: boolean;
}

// Attendance
export interface Attendance {
  id: string;
  eventId: string;
  memberId: string;
  status: AttendanceStatus;
  comment: string | null;
}

// Notification
export interface Notification {
  id: string;
  clubId: string;
  title: string;
  content: string;
  category: NotificationCategory | null;
  isPublished: boolean;
  publishedAt: string | null;
}

// Club
export interface Club {
  id: string;
  name: string;
  nameKana: string | null;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
}

// Auth
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    lastName?: string;
    firstName?: string;
    name?: string;
    profileCompleted?: boolean;
  };
}

// Privacy Settings
export interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showBirthDate: boolean;
  showCompany: boolean;
}
