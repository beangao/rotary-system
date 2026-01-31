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
  Eye,
  EyeOff,
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
  isPublished: boolean;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  regular_meeting: '例会',
  special_event: '特別イベント',
  board_meeting: '理事会',
  social: '親睦会',
  other: 'その他',
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll({ limit: 50 });
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

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">例会・イベント管理</h1>
          <p className="text-gray-600 mt-1">イベントの作成・編集・出欠管理</p>
        </div>
        <Link href="/events/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新規イベント作成
          </Button>
        </Link>
      </div>

      {/* イベントリスト */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : events.length === 0 ? (
        <Card className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Calendar className="h-12 w-12 mb-4" />
          <p>イベントがありません</p>
          <Link href="/events/new" className="mt-4">
            <Button>最初のイベントを作成</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-4 lg:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={cn(
                      'p-3 rounded-lg flex-shrink-0',
                      event.isPublished ? 'bg-blue-100' : 'bg-gray-100'
                    )}
                  >
                    <Calendar
                      className={cn(
                        'h-6 w-6',
                        event.isPublished ? 'text-blue-600' : 'text-gray-500'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                      </span>
                      {event.isPublished ? (
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
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(event.startAt)} {formatTime(event.startAt)}
                      </span>
                      {event.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.venue}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/events/${event.id}/attendances`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      出欠確認
                    </Button>
                  </Link>
                  <Link href={`/events/${event.id}`}>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
