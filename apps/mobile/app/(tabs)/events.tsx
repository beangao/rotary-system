import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';
import { Event } from '../../src/types';
import { Calendar, MapPin, Check } from 'lucide-react-native';

const EVENT_TYPE_LABELS: Record<string, string> = {
  meeting: '定例会',
  service: '奉仕活動',
  social: '親睦活動',
  district: '地区行事',
  other: 'その他',
};

// デザイン仕様に合わせたカテゴリスタイル
const getCategoryStyle = (eventType: string) => {
  switch (eventType) {
    case 'meeting':
      return {
        badgeColor: '#dbeafe', // bg-blue-100
        textColor: '#1e40af', // text-blue-800
        cardBg: '#eff6ff', // bg-blue-50
        borderColor: '#bfdbfe', // border-blue-200
      };
    case 'service':
      return {
        badgeColor: '#dcfce7', // bg-green-100
        textColor: '#166534', // text-green-800
        cardBg: '#f0fdf4', // bg-green-50
        borderColor: '#bbf7d0', // border-green-200
      };
    case 'social':
      return {
        badgeColor: '#f3e8ff', // bg-purple-100
        textColor: '#6b21a8', // text-purple-800
        cardBg: '#faf5ff', // bg-purple-50
        borderColor: '#e9d5ff', // border-purple-200
      };
    case 'district':
      return {
        badgeColor: '#fef3c7', // bg-amber-100
        textColor: '#92400e', // text-amber-800
        cardBg: '#fffbeb', // bg-amber-50
        borderColor: '#fde68a', // border-amber-200
      };
    default:
      return {
        badgeColor: '#f3f4f6', // bg-gray-100
        textColor: '#1f2937', // text-gray-800
        cardBg: '#f9fafb', // bg-gray-50
        borderColor: '#e5e7eb', // border-gray-200
      };
  }
};

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await api.getEvents({ status: 'published' });
      if (response.success && response.data) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日（${weekday}）`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatTimeRange = (startAt: string, endAt?: string) => {
    const startTime = formatTime(startAt);
    if (endAt) {
      return `${startTime}〜${formatTime(endAt)}`;
    }
    return `${startTime}〜`;
  };

  const formatDeadline = (deadlineString?: string) => {
    if (!deadlineString) return null;
    const date = new Date(deadlineString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日（${weekday}）${hour}:${minute}`;
  };

  const isDeadlinePassed = (deadlineString?: string) => {
    if (!deadlineString) return false;
    return new Date() > new Date(deadlineString);
  };

  const handleAttendance = async (eventId: string, status: 'attending' | 'absent' | 'undecided') => {
    setIsSubmitting(true);
    try {
      const response = await api.submitAttendance(eventId, status);
      if (response.success) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, myAttendance: { ...e.myAttendance, status } }
              : e
          )
        );
      } else {
        Alert.alert('エラー', response.error || '出欠の登録に失敗しました');
      }
    } catch (error: any) {
      console.error('Failed to submit attendance:', error);
      const message = error?.response?.data?.error || error?.message || '出欠の登録に失敗しました';
      Alert.alert('エラー', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // イベントステータスのラベル
  const EVENT_STATUS_LABELS: Record<string, { text: string; bgColor: string; textColor: string }> = {
    cancelled: { text: '中止', bgColor: '#dc2626', textColor: '#ffffff' }, // bg-red-600
    postponed: { text: '延期', bgColor: '#f59e0b', textColor: '#ffffff' }, // bg-amber-500
    closed: { text: '締切', bgColor: '#6b7280', textColor: '#ffffff' }, // bg-gray-500
  };

  // デザイン仕様に合わせたステータスバッジ
  const getStatusBadge = (event: Event) => {
    // イベントが中止/延期/締切の場合はそれを表示
    if (event.status !== 'published') {
      const statusInfo = EVENT_STATUS_LABELS[event.status];
      if (statusInfo) {
        return { ...statusInfo, showCheck: false };
      }
    }

    const attendance = event.myAttendance?.status;
    const deadlinePassed = isDeadlinePassed(event.responseDeadline);

    if (attendance === 'attending') {
      return { text: '出席', bgColor: '#22c55e', textColor: '#ffffff', showCheck: true }; // bg-green-500
    }
    if (attendance === 'absent') {
      return { text: '欠席', bgColor: '#ef4444', textColor: '#ffffff', showCheck: false }; // bg-red-500
    }
    if (attendance === 'undecided') {
      return { text: '未定', bgColor: '#eab308', textColor: '#ffffff', showCheck: false }; // bg-yellow-500
    }
    if (deadlinePassed) {
      return { text: '期限切れ', bgColor: '#d1d5db', textColor: '#4b5563', showCheck: false }; // bg-gray-300 text-gray-600
    }
    return { text: '未回答', bgColor: '#9ca3af', textColor: '#ffffff', showCheck: false }; // bg-gray-400
  };

  // 出欠回答が可能かどうか
  const canSubmitAttendance = (event: Event) => {
    // 公開中のイベントのみ回答可能
    if (event.status !== 'published') return false;
    // 期限切れの場合は回答不可
    if (isDeadlinePassed(event.responseDeadline)) return false;
    return true;
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const categoryStyle = getCategoryStyle(item.eventType);
    const statusBadge = getStatusBadge(item);
    const deadlinePassed = isDeadlinePassed(item.responseDeadline);
    const userResponse = item.myAttendance?.status;
    const canRespond = canSubmitAttendance(item);

    return (
      <View
        style={[
          styles.eventCard,
          { backgroundColor: categoryStyle.cardBg, borderColor: categoryStyle.borderColor },
        ]}
      >
        {/* ヘッダー: カテゴリとステータス */}
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.badgeColor }]}>
            <Text style={[styles.categoryText, { color: categoryStyle.textColor }]}>
              {EVENT_TYPE_LABELS[item.eventType] || item.eventType}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
            {statusBadge.showCheck && (
              <Check size={14} color="#ffffff" strokeWidth={3} style={styles.statusCheckIcon} />
            )}
            <Text style={[styles.statusText, { color: statusBadge.textColor }]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>

        {/* タイトル */}
        <Text style={styles.eventTitle}>{item.title}</Text>

        {/* 日時・時間・場所 */}
        <View style={styles.eventInfoSection}>
          <View style={styles.eventInfoRow}>
            <Calendar size={20} color="#1e3a8a" strokeWidth={2} />
            <Text style={styles.infoTextBold}>{formatDate(item.startAt)}</Text>
          </View>
          <View style={styles.eventInfoRow}>
            <Calendar size={20} color="#1e3a8a" strokeWidth={2} />
            <Text style={styles.infoText}>{formatTimeRange(item.startAt, item.endAt)}</Text>
          </View>
          {item.venue && (
            <View style={styles.eventInfoRow}>
              <MapPin size={20} color="#1e3a8a" strokeWidth={2} />
              <Text style={styles.infoText}>{item.venue}</Text>
            </View>
          )}
        </View>

        {/* 説明 */}
        {item.description && (
          <Text style={styles.eventDescription}>
            {item.description}
          </Text>
        )}

        {/* 回答期限 */}
        {item.responseDeadline && (
          <Text style={[styles.deadlineText, deadlinePassed && styles.deadlineTextPassed]}>
            回答期限：{formatDeadline(item.responseDeadline)}
            {deadlinePassed && <Text style={styles.deadlineExpiredText}>（期限切れ）</Text>}
          </Text>
        )}

        {/* 出欠ボタン（公開中かつ期限内のみ） */}
        {canRespond && (
          <View style={styles.attendanceSection}>
            <Text style={styles.attendanceLabel}>出欠のご回答</Text>
            <View style={styles.attendanceButtons}>
              <TouchableOpacity
                style={[
                  styles.attendanceButton,
                  userResponse === 'attending' && styles.attendingButtonActive,
                ]}
                onPress={() => handleAttendance(item.id, 'attending')}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.attendanceButtonText,
                    userResponse === 'attending' && styles.attendingButtonTextActive,
                  ]}
                >
                  出席
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.attendanceButton,
                  userResponse === 'absent' && styles.absentButtonActive,
                ]}
                onPress={() => handleAttendance(item.id, 'absent')}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.attendanceButtonText,
                    userResponse === 'absent' && styles.absentButtonTextActive,
                  ]}
                >
                  欠席
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.attendanceButton,
                  userResponse === 'undecided' && styles.undecidedButtonActive,
                ]}
                onPress={() => handleAttendance(item.id, 'undecided')}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.attendanceButtonText,
                    userResponse === 'undecided' && styles.undecidedButtonTextActive,
                  ]}
                >
                  未定
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ステータスメッセージ */}
        {!canRespond && item.status === 'published' && deadlinePassed && !userResponse && (
          <View style={styles.expiredNotice}>
            <Text style={styles.expiredNoticeText}>回答期限が過ぎています</Text>
          </View>
        )}
        {item.status === 'cancelled' && (
          <View style={styles.expiredNotice}>
            <Text style={styles.cancelledNoticeText}>このイベントは中止になりました</Text>
          </View>
        )}
        {item.status === 'postponed' && (
          <View style={styles.expiredNotice}>
            <Text style={styles.postponedNoticeText}>このイベントは延期になりました</Text>
          </View>
        )}
        {item.status === 'closed' && (
          <View style={styles.expiredNotice}>
            <Text style={styles.expiredNoticeText}>出欠回答は締め切られました</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1e3a8a']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={64} color="#9ca3af" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>イベントがありません</Text>
            <Text style={styles.emptyText}>予定されているイベントはありません</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // bg-gray-50
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // イベントカード
  eventCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // カテゴリバッジ
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // ステータスバッジ
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusCheckIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // タイトル
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 8,
  },
  // イベント情報
  eventInfoSection: {
    marginBottom: 12,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTextBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151', // text-gray-700
    marginLeft: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  // 説明
  eventDescription: {
    fontSize: 16,
    color: '#4b5563', // text-gray-600
    lineHeight: 24,
    marginBottom: 12,
  },
  // 回答期限
  deadlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a', // text-blue-900
    marginBottom: 12,
  },
  deadlineTextPassed: {
    color: '#6b7280', // text-gray-500
  },
  deadlineExpiredText: {
    color: '#dc2626', // text-red-600
    marginLeft: 8,
  },
  // 出欠セクション
  attendanceSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // border-gray-200
    paddingTop: 16,
  },
  attendanceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  // 出欠ボタン
  attendanceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db', // border-gray-300
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  attendanceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  // 出席ボタン（アクティブ）
  attendingButtonActive: {
    backgroundColor: '#16a34a', // bg-green-600
    borderColor: '#15803d', // border-green-700
  },
  attendingButtonTextActive: {
    color: '#ffffff',
  },
  // 欠席ボタン（アクティブ）
  absentButtonActive: {
    backgroundColor: '#dc2626', // bg-red-600
    borderColor: '#b91c1c', // border-red-700
  },
  absentButtonTextActive: {
    color: '#ffffff',
  },
  // 未定ボタン（アクティブ）
  undecidedButtonActive: {
    backgroundColor: '#eab308', // bg-yellow-500
    borderColor: '#ca8a04', // border-yellow-600
  },
  undecidedButtonTextActive: {
    color: '#ffffff',
  },
  // 期限切れ通知
  expiredNotice: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  expiredNoticeText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  cancelledNoticeText: {
    textAlign: 'center',
    color: '#dc2626', // text-red-600
    fontSize: 14,
    fontWeight: '600',
  },
  postponedNoticeText: {
    textAlign: 'center',
    color: '#d97706', // text-amber-600
    fontSize: 14,
    fontWeight: '600',
  },
  // 空状態
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
});
