import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';
import { Event } from '../../src/types';
import { Calendar, MapPin, ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react-native';

const EVENT_TYPE_LABELS: Record<string, string> = {
  meeting: '定例会',
  service: '奉仕活動',
  social: '親睦活動',
  district: '地区行事',
  other: 'その他',
};

const getCategoryStyle = (eventType: string) => {
  switch (eventType) {
    case 'meeting':
      return {
        badgeColor: '#dbeafe',
        textColor: '#1e40af',
        cardBg: '#eff6ff',
        borderColor: '#bfdbfe',
      };
    case 'service':
      return {
        badgeColor: '#dcfce7',
        textColor: '#166534',
        cardBg: '#f0fdf4',
        borderColor: '#bbf7d0',
      };
    case 'social':
      return {
        badgeColor: '#f3e8ff',
        textColor: '#7c3aed',
        cardBg: '#faf5ff',
        borderColor: '#e9d5ff',
      };
    case 'district':
      return {
        badgeColor: '#fef3c7',
        textColor: '#92400e',
        cardBg: '#fffbeb',
        borderColor: '#fde68a',
      };
    default:
      return {
        badgeColor: '#f3f4f6',
        textColor: '#4b5563',
        cardBg: '#ffffff',
        borderColor: '#e5e7eb',
      };
  }
};

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
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

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const handleAttendance = async (eventId: string, status: 'attending' | 'absent') => {
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
        if (selectedEvent?.id === eventId) {
          setSelectedEvent((prev) =>
            prev ? { ...prev, myAttendance: { ...prev.myAttendance, status } } : null
          );
        }
      }
    } catch (error) {
      console.error('Failed to submit attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (event: Event) => {
    const attendance = event.myAttendance?.status;
    const deadlinePassed = isDeadlinePassed(event.responseDeadline);

    if (attendance === 'attending') {
      return { text: '出席', bgColor: '#22c55e', textColor: '#ffffff' };
    }
    if (attendance === 'absent') {
      return { text: '欠席', bgColor: '#ef4444', textColor: '#ffffff' };
    }
    if (deadlinePassed) {
      return { text: '期限切れ', bgColor: '#d1d5db', textColor: '#6b7280' };
    }
    return { text: '未回答', bgColor: '#9ca3af', textColor: '#ffffff' };
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const categoryStyle = getCategoryStyle(item.eventType);
    const statusBadge = getStatusBadge(item);
    const deadlinePassed = isDeadlinePassed(item.responseDeadline);

    return (
      <TouchableOpacity
        style={[
          styles.eventCard,
          { backgroundColor: categoryStyle.cardBg, borderColor: categoryStyle.borderColor },
        ]}
        onPress={() => setSelectedEvent(item)}
        activeOpacity={0.7}
      >
        {/* ヘッダー: カテゴリとステータス */}
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.badgeColor }]}>
            <Text style={[styles.categoryText, { color: categoryStyle.textColor }]}>
              {EVENT_TYPE_LABELS[item.eventType] || item.eventType}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
            <Text style={[styles.statusText, { color: statusBadge.textColor }]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>

        {/* タイトル */}
        <Text style={styles.eventTitle}>{item.title}</Text>

        {/* 日時・場所 */}
        <View style={styles.eventInfoRow}>
          <Calendar size={16} color="#6b7280" strokeWidth={2} />
          <Text style={styles.infoText}>{formatDate(item.startAt)}</Text>
        </View>
        <View style={styles.eventInfoRow}>
          <Clock size={16} color="#6b7280" strokeWidth={2} />
          <Text style={styles.infoText}>{formatTimeRange(item.startAt, item.endAt)}</Text>
        </View>
        {item.venue && (
          <View style={styles.eventInfoRow}>
            <MapPin size={16} color="#6b7280" strokeWidth={2} />
            <Text style={styles.infoText}>{item.venue}</Text>
          </View>
        )}

        {/* 説明 */}
        {item.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* 回答期限 */}
        {item.responseDeadline && (
          <View style={styles.deadlineContainer}>
            <Text style={[styles.deadlineText, deadlinePassed && styles.deadlinePassed]}>
              回答期限：{formatDeadline(item.responseDeadline)}
              {deadlinePassed && '（期限切れ）'}
            </Text>
          </View>
        )}

        {/* 出欠ボタン（期限内のみ） */}
        {!deadlinePassed && (
          <View style={styles.attendanceSection}>
            <Text style={styles.attendanceLabel}>出欠のご回答</Text>
            <View style={styles.attendanceButtons}>
              <TouchableOpacity
                style={[
                  styles.attendanceButton,
                  item.myAttendance?.status === 'attending' && styles.attendingButton,
                ]}
                onPress={() => handleAttendance(item.id, 'attending')}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.attendanceButtonText,
                    item.myAttendance?.status === 'attending' && styles.attendingButtonText,
                  ]}
                >
                  出席
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.attendanceButton,
                  item.myAttendance?.status === 'absent' && styles.absentButton,
                ]}
                onPress={() => handleAttendance(item.id, 'absent')}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.attendanceButtonText,
                    item.myAttendance?.status === 'absent' && styles.absentButtonText,
                  ]}
                >
                  欠席
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {deadlinePassed && !item.myAttendance?.status && (
          <View style={styles.expiredNotice}>
            <Text style={styles.expiredNoticeText}>回答期限が過ぎています</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 詳細モーダル
  const renderDetailModal = () => {
    if (!selectedEvent) return null;

    const categoryStyle = getCategoryStyle(selectedEvent.eventType);
    const statusBadge = getStatusBadge(selectedEvent);
    const deadlinePassed = isDeadlinePassed(selectedEvent.responseDeadline);

    return (
      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* ヘッダー */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setSelectedEvent(null)}
            >
              <ChevronLeft size={24} color="#374151" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>イベント詳細</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* カテゴリとステータス */}
            <View style={styles.cardHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.badgeColor }]}>
                <Text style={[styles.categoryText, { color: categoryStyle.textColor }]}>
                  {EVENT_TYPE_LABELS[selectedEvent.eventType] || selectedEvent.eventType}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
                <Text style={[styles.statusText, { color: statusBadge.textColor }]}>
                  {statusBadge.text}
                </Text>
              </View>
            </View>

            {/* タイトル */}
            <Text style={styles.modalEventTitle}>{selectedEvent.title}</Text>

            {/* イベント情報カード */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardRow}>
                <Calendar size={18} color="#1e3a8a" strokeWidth={2} />
                <View>
                  <Text style={styles.infoCardLabel}>日時</Text>
                  <Text style={styles.infoCardValue}>{formatDate(selectedEvent.startAt)}</Text>
                  <Text style={styles.infoCardValue}>
                    {formatTimeRange(selectedEvent.startAt, selectedEvent.endAt)}
                  </Text>
                </View>
              </View>

              {selectedEvent.venue && (
                <View style={styles.infoCardRow}>
                  <MapPin size={18} color="#1e3a8a" strokeWidth={2} />
                  <View>
                    <Text style={styles.infoCardLabel}>場所</Text>
                    <Text style={styles.infoCardValue}>{selectedEvent.venue}</Text>
                  </View>
                </View>
              )}

              {selectedEvent.responseDeadline && (
                <View style={styles.infoCardRow}>
                  <Clock size={18} color="#1e3a8a" strokeWidth={2} style={styles.infoCardIconStyle} />
                  <View>
                    <Text style={styles.infoCardLabel}>回答期限</Text>
                    <Text
                      style={[
                        styles.infoCardValue,
                        deadlinePassed && styles.infoCardValueExpired,
                      ]}
                    >
                      {formatDeadline(selectedEvent.responseDeadline)}
                      {deadlinePassed && '（期限切れ）'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* 説明 */}
            {selectedEvent.description && (
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionTitle}>詳細</Text>
                <Text style={styles.descriptionText}>{selectedEvent.description}</Text>
              </View>
            )}

            {/* 出欠ボタン */}
            {!deadlinePassed && (
              <View style={styles.modalAttendanceSection}>
                <Text style={styles.modalAttendanceLabel}>出欠のご回答</Text>
                <TouchableOpacity
                  style={[
                    styles.modalAttendanceButton,
                    selectedEvent.myAttendance?.status === 'attending'
                      ? styles.modalAttendingButtonActive
                      : styles.modalAttendingButton,
                  ]}
                  onPress={() => handleAttendance(selectedEvent.id, 'attending')}
                  disabled={isSubmitting}
                >
                  {selectedEvent.myAttendance?.status === 'attending' && (
                    <Check size={18} color="#ffffff" strokeWidth={2.5} />
                  )}
                  <Text
                    style={[
                      styles.modalAttendanceButtonText,
                      selectedEvent.myAttendance?.status === 'attending' &&
                        styles.modalAttendingButtonTextActive,
                    ]}
                  >
                    出席
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalAttendanceButton,
                    selectedEvent.myAttendance?.status === 'absent'
                      ? styles.modalAbsentButtonActive
                      : styles.modalAbsentButton,
                  ]}
                  onPress={() => handleAttendance(selectedEvent.id, 'absent')}
                  disabled={isSubmitting}
                >
                  {selectedEvent.myAttendance?.status === 'absent' && (
                    <Check size={18} color="#ffffff" strokeWidth={2.5} />
                  )}
                  <Text
                    style={[
                      styles.modalAttendanceButtonText,
                      selectedEvent.myAttendance?.status === 'absent' &&
                        styles.modalAbsentButtonTextActive,
                    ]}
                  >
                    欠席
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {deadlinePassed && !selectedEvent.myAttendance?.status && (
              <View style={styles.modalExpiredNotice}>
                <Text style={styles.modalExpiredNoticeText}>回答期限が過ぎています</Text>
              </View>
            )}

            {selectedEvent.myAttendance?.status && (
              <View style={styles.thankYouMessage}>
                <Check size={24} color="#1e3a8a" strokeWidth={2.5} />
                <Text style={styles.thankYouText}>ご回答ありがとうございます</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
      {renderDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
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
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 8,
  },
  deadlineContainer: {
    marginTop: 12,
  },
  deadlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  deadlinePassed: {
    color: '#6b7280',
  },
  attendanceSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 16,
    paddingTop: 16,
  },
  attendanceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  attendanceButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  attendanceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  attendingButton: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
  },
  attendingButtonText: {
    color: '#ffffff',
  },
  absentButton: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  absentButtonText: {
    color: '#ffffff',
  },
  expiredNotice: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 16,
    paddingTop: 16,
  },
  expiredNoticeText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalBackButton: {
    padding: 8,
  },
  modalBackText: {
    fontSize: 24,
    color: '#374151',
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalEventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoCardIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoCardIconStyle: {
    marginRight: 12,
    marginTop: 2,
  },
  infoCardLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoCardValueExpired: {
    color: '#ef4444',
  },
  descriptionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  modalAttendanceSection: {
    marginBottom: 20,
  },
  modalAttendanceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  modalAttendanceButton: {
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  modalAttendingButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  modalAttendingButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
  },
  modalAbsentButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  modalAbsentButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  modalAttendanceButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalAttendingButtonTextActive: {
    color: '#ffffff',
  },
  modalAbsentButtonTextActive: {
    color: '#ffffff',
  },
  modalButtonCheck: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  modalExpiredNotice: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalExpiredNoticeText: {
    color: '#6b7280',
    fontSize: 16,
  },
  thankYouMessage: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  thankYouIcon: {
    color: '#1e3a8a',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  thankYouText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
  },
});
