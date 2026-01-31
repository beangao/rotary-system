'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Filter,
  X,
  Edit,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { eventsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startAt: string;
  endAt: string | null;
  venue: string | null;
  status: string;
  isPublished: boolean;
  originalDate: string | null;
  postponedDate: string | null;
  responseDeadline: string | null;
  _count?: {
    attendances: number;
  };
  attendanceSummary?: {
    attending: number;
    absent: number;
    undecided: number;
    total: number;
  };
}

// イベント種別の設定
const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; badgeColor: string }> = {
  meeting: { label: '定例会', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', badgeColor: 'bg-blue-600' },
  service: { label: '奉仕活動', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', badgeColor: 'bg-green-600' },
  social: { label: '親睦活動', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', badgeColor: 'bg-purple-600' },
  district: { label: '地区行事', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', badgeColor: 'bg-amber-600' },
  other: { label: 'その他', color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200', badgeColor: 'bg-gray-600' },
};

// ステータスの設定
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: '下書き', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  published: { label: '公開中', color: 'bg-green-100 text-green-700 border-green-300' },
  closed: { label: '終了', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  cancelled: { label: '中止', color: 'bg-red-100 text-red-700 border-red-300' },
  postponed: { label: '延期', color: 'bg-orange-100 text-orange-700 border-orange-300' },
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll({ limit: 100 });
        if (response.data.success) {
          setEvents(response.data.data.events);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // フィルター適用
  const filteredEvents = events.filter((event) => {
    if (filterStatus !== 'all' && event.status !== filterStatus) return false;
    if (filterCategory !== 'all' && event.eventType !== filterCategory) return false;
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      if (new Date(event.startAt) < fromDate) return false;
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(event.startAt) > toDate) return false;
    }
    return true;
  });

  const hasFilters = filterStatus !== 'all' || filterCategory !== 'all' || filterDateFrom || filterDateTo;

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterCategory('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-blue-600" />
            イベント・例会管理
          </h1>
          <p className="text-gray-600 mt-1">イベントの登録・編集・出欠管理</p>
        </div>
        <Link href="/events/new">
          <Button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900">
            <Plus className="h-4 w-4" />
            新規作成
          </Button>
        </Link>
      </div>

      {/* フィルター */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">フィルター</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ステータス</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">すべて</option>
              <option value="draft">下書き</option>
              <option value="published">公開中</option>
              <option value="closed">終了</option>
              <option value="cancelled">中止</option>
              <option value="postponed">延期</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">種別</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">すべて</option>
              <option value="meeting">定例会</option>
              <option value="service">奉仕活動</option>
              <option value="social">親睦活動</option>
              <option value="district">地区行事</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">開催日（開始）</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">開催日（終了）</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-blue-600">{filteredEvents.length}件</span>のイベント
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              フィルターをクリア
            </button>
          )}
        </div>
      </Card>

      {/* イベントリスト */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Calendar className="h-12 w-12 mb-4" />
          <p>該当するイベントがありません</p>
          <Link href="/events/new" className="mt-4">
            <Button>最初のイベントを作成</Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* PC: テーブル表示 */}
          <div className="hidden lg:block">
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">開催日</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">種別</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">タイトル</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">場所</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ステータス</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">回答状況</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEvents.map((event) => {
                    const typeConfig = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.other;
                    const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;

                    return (
                      <tr key={event.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p>{formatDate(event.startAt)}</p>
                              <p className="text-gray-500">{formatTime(event.startAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={cn('w-3 h-3 rounded-full', typeConfig.badgeColor)} />
                            <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', typeConfig.bgColor, typeConfig.color)}>
                              {typeConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {event.title}
                            {event.status === 'postponed' && event.originalDate && event.postponedDate && (
                              <span className="text-xs text-orange-600 ml-2">
                                (延期)
                              </span>
                            )}
                            {event.status === 'cancelled' && (
                              <span className="text-xs text-red-600 ml-2">【中止】</span>
                            )}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {event.venue || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', statusConfig.color)}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/events/${event.id}/attendances`}>
                            {event.attendanceSummary ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <span className="text-green-600 font-semibold">{event.attendanceSummary.attending}</span>
                                  <span className="text-gray-400">/</span>
                                  <span className="text-red-600 font-semibold">{event.attendanceSummary.absent}</span>
                                  <span className="text-gray-400">/</span>
                                  <span className="text-yellow-600 font-semibold">{event.attendanceSummary.undecided}</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  ({event.attendanceSummary.total}名)
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                確認
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/events/${event.id}/attendances`}>
                              <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors" title="出欠確認">
                                <Users className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                              </button>
                            </Link>
                            <Link href={`/events/${event.id}`}>
                              <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors" title="編集">
                                <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>

          {/* モバイル: カード表示 */}
          <div className="lg:hidden space-y-4">
            {filteredEvents.map((event) => {
              const typeConfig = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.other;
              const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;

              return (
                <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn('w-2 h-2 rounded-full', typeConfig.badgeColor)} />
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', typeConfig.bgColor, typeConfig.color)}>
                          {typeConfig.label}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold border', statusConfig.color)}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        {event.title}
                        {event.status === 'cancelled' && (
                          <span className="text-xs text-red-600 ml-2">【中止】</span>
                        )}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatDate(event.startAt)} {formatTime(event.startAt)}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {event.venue}
                          </div>
                        )}
                        {event.attendanceSummary && (
                          <div className="flex items-center gap-2 mt-2">
                            <Users className="h-4 w-4" />
                            <span className="text-green-600 font-semibold">{event.attendanceSummary.attending}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-red-600 font-semibold">{event.attendanceSummary.absent}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-yellow-600 font-semibold">{event.attendanceSummary.undecided}</span>
                            <span className="text-xs text-gray-500">({event.attendanceSummary.total}名)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/events/${event.id}/attendances`}>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/events/${event.id}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
