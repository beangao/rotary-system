'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  HelpCircle,
  MinusCircle,
  Download,
  Bell,
  Search,
  Filter,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { eventsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  eventType: string;
  startAt: string;
  endAt: string | null;
  venue: string | null;
  status: string;
  responseDeadline: string | null;
}

interface Attendance {
  id: string | null;
  memberId: string;
  eventId: string;
  status: 'attending' | 'absent' | 'undecided' | 'none';
  comment: string | null;
  respondedAt: string | null;
  member: {
    id: string;
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    memberNumber: string | null;
    position: string | null;
    avatarUrl: string | null;
  };
}

// 50音インデックス
const KANA_INDEX = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];

const KANA_RANGES: Record<string, [string, string]> = {
  'あ': ['ア', 'オ'],
  'か': ['カ', 'コ'],
  'さ': ['サ', 'ソ'],
  'た': ['タ', 'ト'],
  'な': ['ナ', 'ノ'],
  'は': ['ハ', 'ホ'],
  'ま': ['マ', 'モ'],
  'や': ['ヤ', 'ヨ'],
  'ら': ['ラ', 'ロ'],
  'わ': ['ワ', 'ン'],
};

const STATUS_CONFIG = {
  attending: {
    label: '出席',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
  },
  absent: {
    label: '欠席',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
  undecided: {
    label: '未定',
    icon: HelpCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
  },
  none: {
    label: '未回答',
    icon: MinusCircle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  meeting: '定例会',
  service: '奉仕活動',
  social: '親睦活動',
  district: '地区行事',
  other: 'その他',
};

export default function AttendancesPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [kanaFilter, setKanaFilter] = useState<string | null>(null);
  const [statusFilters, setStatusFilters] = useState<string[]>(['attending', 'absent', 'undecided', 'none']);
  const [showFilters, setShowFilters] = useState(false);

  // 代理回答用
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingComment, setEditingComment] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // プッシュ通知モーダル
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushTarget, setPushTarget] = useState<'all' | 'none'>('none');
  const [pushMessage, setPushMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, attendancesRes] = await Promise.all([
          eventsApi.getById(id),
          eventsApi.getAttendances(id),
        ]);

        if (eventRes.data.success) {
          setEvent(eventRes.data.data);
        }
        if (attendancesRes.data.success) {
          setAttendances(attendancesRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  // カタカナをひらがなに変換する関数
  const toKatakana = (str: string): string => {
    return str.replace(/[\u3041-\u3096]/g, (match) =>
      String.fromCharCode(match.charCodeAt(0) + 0x60)
    );
  };

  // 50音フィルター
  const matchesKanaFilter = (kana: string, filterKey: string): boolean => {
    if (!kana) return false;
    const katakana = toKatakana(kana);
    const firstChar = katakana.charAt(0);
    const range = KANA_RANGES[filterKey];
    if (!range) return false;
    return firstChar >= range[0] && firstChar <= range[1] + '\uffff';
  };

  // フィルター適用
  const filteredAttendances = attendances.filter((a) => {
    // ステータスフィルター
    if (!statusFilters.includes(a.status)) return false;

    // 50音フィルター
    if (kanaFilter && !matchesKanaFilter(a.member.lastNameKana, kanaFilter)) return false;

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${a.member.lastName}${a.member.firstName}`.toLowerCase();
      const fullNameKana = `${a.member.lastNameKana}${a.member.firstNameKana}`.toLowerCase();
      if (!fullName.includes(query) && !fullNameKana.includes(query)) return false;
    }

    return true;
  });

  // 集計
  const summary = {
    attending: attendances.filter((a) => a.status === 'attending').length,
    absent: attendances.filter((a) => a.status === 'absent').length,
    undecided: attendances.filter((a) => a.status === 'undecided').length,
    none: attendances.filter((a) => a.status === 'none').length,
    total: attendances.length,
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // 代理回答の保存
  const handleSaveProxy = async () => {
    if (!editingMemberId || !editingStatus) return;

    setIsSaving(true);
    try {
      const response = await eventsApi.proxyAttendance(id, editingMemberId, {
        status: editingStatus,
        comment: editingComment || undefined,
      });

      if (response.data.success) {
        // リストを更新
        setAttendances((prev) =>
          prev.map((a) =>
            a.memberId === editingMemberId
              ? { ...a, status: editingStatus as Attendance['status'], comment: editingComment }
              : a
          )
        );
        setEditingMemberId(null);
      }
    } catch (error) {
      console.error('Failed to save proxy attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 代理回答の開始
  const startEditing = (attendance: Attendance) => {
    setEditingMemberId(attendance.memberId);
    setEditingStatus(attendance.status);
    setEditingComment(attendance.comment || '');
  };

  // 代理回答のキャンセル
  const cancelEditing = () => {
    setEditingMemberId(null);
    setEditingStatus('');
    setEditingComment('');
  };

  // CSV出力
  const exportCSV = () => {
    const headers = ['会員番号', '氏名', 'フリガナ', '役職', '出欠', '備考', '回答日時'];
    const rows = attendances.map((a) => [
      a.member.memberNumber || '',
      `${a.member.lastName} ${a.member.firstName}`,
      `${a.member.lastNameKana} ${a.member.firstNameKana}`,
      a.member.position || '',
      STATUS_CONFIG[a.status].label,
      a.comment || '',
      a.respondedAt ? new Date(a.respondedAt).toLocaleString('ja-JP') : '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `出欠一覧_${event?.title || 'event'}.csv`;
    link.click();
  };

  // プッシュ通知送信（モック）
  const handleSendPush = () => {
    const targetCount = pushTarget === 'none' ? summary.none : summary.total;
    alert(`${targetCount}名にプッシュ通知を送信しました（モック）\n\nメッセージ: ${pushMessage || '出欠の回答をお願いします'}`);
    setShowPushModal(false);
    setPushMessage('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">イベントが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-7 w-7 text-blue-600" />
              出欠確認
            </h1>
            <p className="text-gray-600 mt-1">{event.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPushModal(true)}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            リマインド通知
          </Button>
          <Link href={`/events/${id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              イベント編集
            </Button>
          </Link>
        </div>
      </div>

      {/* イベント情報 */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-lg text-gray-900">{event.title}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                </span>
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
                {event.responseDeadline && (
                  <span className="flex items-center gap-1 text-orange-600">
                    <Clock className="h-4 w-4" />
                    回答期限: {formatDate(event.responseDeadline)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 集計サマリー */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            statusFilters.length === 4 && 'ring-2 ring-blue-500'
          )}
          onClick={() => setStatusFilters(['attending', 'absent', 'undecided', 'none'])}
        >
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
            <p className="text-sm text-gray-500">全会員</p>
          </CardContent>
        </Card>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          const count = summary[key as keyof typeof summary];
          return (
            <Card
              key={key}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                statusFilters.includes(key) && statusFilters.length === 1 && `ring-2 ring-${key === 'attending' ? 'green' : key === 'absent' ? 'red' : key === 'undecided' ? 'yellow' : 'gray'}-500`
              )}
              onClick={() => setStatusFilters([key])}
            >
              <CardContent className="p-4 text-center">
                <Icon className={cn('h-8 w-8 mx-auto mb-2', config.color)} />
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500">{config.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* フィルター・検索エリア */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* 検索 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="会員名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 50音インデックス */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 lg:pb-0">
            <button
              onClick={() => setKanaFilter(null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                kanaFilter === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              全て
            </button>
            {KANA_INDEX.map((kana) => (
              <button
                key={kana}
                onClick={() => setKanaFilter(kana)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  kanaFilter === kana
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {kana}
              </button>
            ))}
          </div>

          {/* フィルターボタン */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            絞り込み
          </Button>
        </div>

        {/* 詳細フィルター */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">出欠ステータス</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <label
                  key={key}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                    statusFilters.includes(key)
                      ? `${config.bgColor} ${config.borderColor}`
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={statusFilters.includes(key)}
                    onChange={() => toggleStatusFilter(key)}
                    className="sr-only"
                  />
                  <config.icon className={cn('h-4 w-4', statusFilters.includes(key) ? config.color : 'text-gray-400')} />
                  <span className={cn('text-sm font-medium', statusFilters.includes(key) ? config.color : 'text-gray-500')}>
                    {config.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 出欠リスト */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            出欠一覧
            <span className="text-sm font-normal text-gray-500">
              ({filteredAttendances.length}名 / {summary.total}名)
            </span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV出力
          </Button>
        </CardHeader>
        <CardContent>
          {filteredAttendances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              該当する会員がいません
            </div>
          ) : (
            <div className="divide-y">
              {filteredAttendances.map((attendance) => {
                const config = STATUS_CONFIG[attendance.status];
                const Icon = config.icon;
                const isEditing = editingMemberId === attendance.memberId;

                return (
                  <div
                    key={attendance.memberId}
                    className={cn(
                      'py-4 flex flex-col lg:flex-row lg:items-center gap-4',
                      isEditing && 'bg-blue-50 -mx-4 px-4 rounded-lg'
                    )}
                  >
                    {/* 会員情報 */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                          config.bgColor
                        )}
                      >
                        <Icon className={cn('h-5 w-5', config.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {attendance.member.lastName} {attendance.member.firstName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="truncate">
                            {attendance.member.lastNameKana} {attendance.member.firstNameKana}
                          </span>
                          {attendance.member.memberNumber && (
                            <span className="text-gray-400">#{attendance.member.memberNumber}</span>
                          )}
                        </div>
                        {attendance.member.position && (
                          <p className="text-xs text-gray-400">{attendance.member.position}</p>
                        )}
                      </div>
                    </div>

                    {/* 代理回答編集モード */}
                    {isEditing ? (
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="flex gap-2">
                          {(['attending', 'absent', 'undecided'] as const).map((status) => {
                            const statusCfg = STATUS_CONFIG[status];
                            return (
                              <button
                                key={status}
                                onClick={() => setEditingStatus(status)}
                                className={cn(
                                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                  editingStatus === status
                                    ? `${statusCfg.bgColor} ${statusCfg.color} border-2 ${statusCfg.borderColor}`
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                )}
                              >
                                {statusCfg.label}
                              </button>
                            );
                          })}
                        </div>
                        <Input
                          placeholder="備考（任意）"
                          value={editingComment}
                          onChange={(e) => setEditingComment(e.target.value)}
                          className="w-40"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveProxy}
                            disabled={isSaving || !editingStatus}
                            className="flex items-center gap-1"
                          >
                            <Save className="h-4 w-4" />
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* 通常表示 */
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                              config.bgColor,
                              config.color
                            )}
                          >
                            {config.label}
                          </span>
                          {attendance.comment && (
                            <p className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                              {attendance.comment}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(attendance)}
                          title="代理回答"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* プッシュ通知モーダル */}
      {showPushModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                リマインド通知を送信
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  送信対象
                </label>
                <div className="flex gap-3">
                  <label
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors text-center',
                      pushTarget === 'none'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="pushTarget"
                      value="none"
                      checked={pushTarget === 'none'}
                      onChange={() => setPushTarget('none')}
                      className="sr-only"
                    />
                    <p className="font-semibold text-gray-900">未回答者のみ</p>
                    <p className="text-sm text-gray-500">{summary.none}名</p>
                  </label>
                  <label
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors text-center',
                      pushTarget === 'all'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="pushTarget"
                      value="all"
                      checked={pushTarget === 'all'}
                      onChange={() => setPushTarget('all')}
                      className="sr-only"
                    />
                    <p className="font-semibold text-gray-900">全会員</p>
                    <p className="text-sm text-gray-500">{summary.total}名</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  メッセージ（任意）
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="出欠の回答をお願いします"
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowPushModal(false)}>
                キャンセル
              </Button>
              <Button
                onClick={handleSendPush}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                送信する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
