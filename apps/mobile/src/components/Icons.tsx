import React from 'react';
import {
  Home,
  Users,
  Calendar,
  Bell,
  User,
  UserPlus,
  LogIn,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Mail,
  Lock,
  AlertTriangle,
  MapPin,
  MessageSquare,
  Settings,
  Eye,
  EyeOff,
  Search,
  Filter,
  Phone,
  Building,
  Briefcase,
  GraduationCap,
  Heart,
  FileText,
} from 'lucide-react-native';

// アイコンのデフォルトprops
interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// 共通のアイコンエクスポート
export const Icons = {
  Home,
  Users,
  Calendar,
  Bell,
  User,
  UserPlus,
  LogIn,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Mail,
  Lock,
  AlertTriangle,
  MapPin,
  MessageSquare,
  Settings,
  Eye,
  EyeOff,
  Search,
  Filter,
  Phone,
  Building,
  Briefcase,
  GraduationCap,
  Heart,
  FileText,
};

// 便利なアイコンコンポーネント
export const BackArrow = ({ size = 24, color = '#374151' }: IconProps) => (
  <ChevronLeft size={size} color={color} strokeWidth={2} />
);

export const ForwardArrow = ({ size = 24, color = '#374151' }: IconProps) => (
  <ChevronRight size={size} color={color} strokeWidth={2} />
);

export const CheckIcon = ({ size = 20, color = '#16a34a' }: IconProps) => (
  <Check size={size} color={color} strokeWidth={2.5} />
);

export const WarningIcon = ({ size = 16, color = '#dc2626' }: IconProps) => (
  <AlertTriangle size={size} color={color} strokeWidth={2} />
);

export const MailIcon = ({ size = 24, color = '#1e3a8a' }: IconProps) => (
  <Mail size={size} color={color} strokeWidth={2} />
);

export const LockIcon = ({ size = 24, color = '#1e3a8a' }: IconProps) => (
  <Lock size={size} color={color} strokeWidth={2} />
);

export const CalendarIcon = ({ size = 20, color = '#1e3a8a' }: IconProps) => (
  <Calendar size={size} color={color} strokeWidth={2} />
);

export const LocationIcon = ({ size = 20, color = '#1e3a8a' }: IconProps) => (
  <MapPin size={size} color={color} strokeWidth={2} />
);

export const BellIcon = ({ size = 20, color = '#1e3a8a' }: IconProps) => (
  <Bell size={size} color={color} strokeWidth={2} />
);

export const UsersIcon = ({ size = 20, color = '#1e3a8a' }: IconProps) => (
  <Users size={size} color={color} strokeWidth={2} />
);

export const SettingsIcon = ({ size = 20, color = '#6b7280' }: IconProps) => (
  <Settings size={size} color={color} strokeWidth={2} />
);

export const HomeIcon = ({ size = 20, color = '#1e3a8a' }: IconProps) => (
  <Home size={size} color={color} strokeWidth={2} />
);

export default Icons;
