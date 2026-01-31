'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { notificationsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  content: string;
  category: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  general: { label: '一般', color: 'text-blue-700', bg: 'bg-blue-100' },
  important: { label: '重要', color: 'text-red-700', bg: 'bg-red-100' },
  event: { label: 'イベント', color: 'text-green-700', bg: 'bg-green-100' },
  other: { label: 'その他', color: 'text-gray-700', bg: 'bg-gray-100' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationsApi.getAll({ limit: 50 });
        if (response.data.success) {
          setNotifications(response.data.data.notifications);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">お知らせ管理</h1>
          <p className="text-gray-600 mt-1">お知らせの作成・編集・公開管理</p>
        </div>
        <Link href="/notifications/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新規お知らせ作成
          </Button>
        </Link>
      </div>

      {/* お知らせリスト */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Bell className="h-12 w-12 mb-4" />
          <p>お知らせがありません</p>
          <Link href="/notifications/new" className="mt-4">
            <Button>最初のお知らせを作成</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className="p-4 lg:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      'p-3 rounded-lg flex-shrink-0',
                      notification.isPublished ? 'bg-blue-100' : 'bg-gray-100'
                    )}
                  >
                    <FileText
                      className={cn(
                        'h-6 w-6',
                        notification.isPublished ? 'text-blue-600' : 'text-gray-500'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {notification.title}
                      </h3>
                      {notification.category && CATEGORY_LABELS[notification.category] && (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            CATEGORY_LABELS[notification.category].bg,
                            CATEGORY_LABELS[notification.category].color
                          )}
                        >
                          {CATEGORY_LABELS[notification.category].label}
                        </span>
                      )}
                      {notification.isPublished ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <Eye className="h-3 w-3" />
                          公開中
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <EyeOff className="h-3 w-3" />
                          下書き
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {notification.publishedAt
                        ? `公開日: ${formatDate(notification.publishedAt)}`
                        : `作成日: ${formatDate(notification.createdAt)}`}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.content}
                    </p>
                  </div>
                </div>
                <Link href={`/notifications/${notification.id}`}>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
