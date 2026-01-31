'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  AlertCircle,
  ChevronRight,
  Clock,
  UserCheck,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { membersApi, eventsApi, notificationsApi } from '@/lib/api';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  invitedMembers: number;
}

interface Event {
  id: string;
  title: string;
  startAt: string;
}

interface Notification {
  id: string;
  title: string;
  publishedAt: string;
  category: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    invitedMembers: 0,
  });
  const [upcomingEvent, setUpcomingEvent] = useState<Event | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, eventsRes, notificationsRes] = await Promise.all([
          membersApi.getAll({ limit: 100 }),
          eventsApi.getAll({ upcoming: true, limit: 1 }),
          notificationsApi.getAll({ limit: 3 }),
        ]);

        if (membersRes.data.success) {
          const members = membersRes.data.data.members;
          setStats({
            totalMembers: members.length,
            activeMembers: members.filter((m: { status: string }) => m.status === 'active').length,
            invitedMembers: members.filter((m: { status: string }) => m.status === 'invited').length,
          });
        }

        if (eventsRes.data.success && eventsRes.data.data.events.length > 0) {
          setUpcomingEvent(eventsRes.data.data.events[0]);
        }

        if (notificationsRes.data.success) {
          setRecentNotifications(notificationsRes.data.data.notifications);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ウェルカムバナー */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full -mr-32 -mt-32 hidden lg:block" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 opacity-10 rounded-full -ml-24 -mb-24 hidden lg:block" />
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">おかえりなさい、管理者様</h1>
          <p className="text-blue-200 text-base lg:text-lg">
            本日も会員の皆様のサポートをよろしくお願いいたします
          </p>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-5 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
            <span className="text-xs lg:text-sm font-semibold text-green-600 bg-green-50 px-2 lg:px-3 py-1 rounded-full">
              アクティブ {stats.activeMembers}名
            </span>
          </div>
          <h3 className="text-gray-600 text-sm lg:text-base font-medium mb-1">総会員数</h3>
          <p className="text-3xl lg:text-4xl font-bold text-gray-900">{stats.totalMembers}</p>
          <Link href="/members" className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center">
            会員一覧を見る <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
          </Link>
        </Card>

        <Card className="p-5 lg:p-6 border-yellow-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
            </div>
            <span className="text-xs lg:text-sm font-semibold text-yellow-700">要確認</span>
          </div>
          <h3 className="text-gray-600 text-sm lg:text-base font-medium mb-1">
            アプリ未登録会員（招待中）
          </h3>
          <p className="text-3xl lg:text-4xl font-bold text-yellow-600">{stats.invitedMembers}</p>
          <Link href="/members?status=invited" className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center">
            招待メール再送 <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
          </Link>
        </Card>
      </div>

      {/* 次回例会情報 */}
      {upcomingEvent && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-start space-x-3 lg:space-x-4">
              <div className="p-2 lg:p-3 bg-blue-600 rounded-lg flex-shrink-0">
                <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">次回例会</h3>
                <p className="text-base lg:text-lg text-gray-700 mb-2">
                  {formatDate(upcomingEvent.startAt)} - {upcomingEvent.title}
                </p>
                <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-gray-600">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    {formatTime(upcomingEvent.startAt)}開始
                  </span>
                  <span className="flex items-center">
                    <UserCheck className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    出席予定: 確認中
                  </span>
                </div>
              </div>
            </div>
            <Link href={`/events/${upcomingEvent.id}`}>
              <Button className="w-full lg:w-auto">詳細を確認</Button>
            </Link>
          </div>
        </div>
      )}

      {/* 最近のお知らせ */}
      <Card className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h3 className="text-lg lg:text-xl font-bold text-gray-900">最近のお知らせ</h3>
          <Link href="/notifications" className="text-blue-600 hover:text-blue-700 font-medium text-sm lg:text-base flex items-center">
            すべて見る
            <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5 ml-1" />
          </Link>
        </div>
        <div className="space-y-2 lg:space-y-3">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/notifications/${notification.id}`}
                className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                  <div className="p-1.5 lg:p-2 rounded-lg bg-blue-100 flex-shrink-0">
                    <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                      {notification.title}
                    </h4>
                    <p className="text-xs lg:text-sm text-gray-500">
                      {notification.publishedAt ? formatDate(notification.publishedAt) : '下書き'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0 ml-2" />
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">お知らせはありません</p>
          )}
        </div>
      </Card>
    </div>
  );
}
