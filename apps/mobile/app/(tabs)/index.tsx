import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/stores/auth.store';
import { api } from '../../src/services/api';
import { Event, Notification } from '../../src/types';
import {
  Bell,
  Calendar,
  MapPin,
  Check,
  Users,
  ChevronRight,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  const fetchData = async () => {
    try {
      // イベントを取得（将来の公開中イベントのみ、開始日時順）
      const eventsResponse = await api.getEvents({ upcoming: 'true' });
      if (eventsResponse.success && eventsResponse.data?.events?.length > 0) {
        const upcomingEvent = eventsResponse.data.events[0];
        setNextEvent(upcomingEvent);
        setAttendanceStatus(upcomingEvent.myAttendance?.status || null);
      } else {
        setNextEvent(null);
        setAttendanceStatus(null);
      }

      // お知らせを取得
      const notificationsResponse = await api.getNotifications({ status: 'published' });
      if (notificationsResponse.success && notificationsResponse.data?.notifications?.length > 0) {
        setLatestNotification(notificationsResponse.data.notifications[0]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleAttendance = async (status: string) => {
    if (!nextEvent || isSubmittingAttendance) return;

    setIsSubmittingAttendance(true);
    try {
      const response = await api.submitAttendance(nextEvent.id, status);
      if (response.success) {
        setAttendanceStatus(status);
      } else {
        Alert.alert('エラー', response.error || '出欠の登録に失敗しました');
      }
    } catch (error: any) {
      console.error('Failed to submit attendance:', error);
      const message = error?.response?.data?.error || error?.message || '出欠の登録に失敗しました';
      Alert.alert('エラー', message);
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return { year, month, day, weekday };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const isDeadlinePassed = (deadlineString?: string | null) => {
    if (!deadlineString) return false;
    return new Date() > new Date(deadlineString);
  };

  // 回答可能かどうかの判定（公開中かつ期限内のみ）
  const canSubmitAttendance = nextEvent &&
    nextEvent.status === 'published' &&
    !isDeadlinePassed(nextEvent.responseDeadline);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ヘッダー */}
        <LinearGradient
          colors={['#1e3a8a', '#1d4ed8']}
          style={styles.header}
        >
          <Text style={styles.clubName}>{user?.club?.name || 'ロータリークラブ'}</Text>
          <Text style={styles.greeting}>こんにちは、{user?.lastName} {user?.firstName}様</Text>
        </LinearGradient>

        {/* 事務局からのお知らせ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>事務局からのお知らせ</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/notifications')}
              style={styles.seeAllButton}
            >
              <View style={styles.seeAllContent}>
                <Text style={styles.seeAllText}>一覧を見る</Text>
                <ChevronRight size={18} color="#1e3a8a" strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>

          {latestNotification ? (
            <TouchableOpacity
              style={styles.notificationCard}
              onPress={() => router.push('/(tabs)/notifications')}
              activeOpacity={0.8}
            >
              <View style={styles.notificationIconContainer}>
                <Bell size={20} color="#ffffff" strokeWidth={2} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{latestNotification.title}</Text>
                <Text style={styles.notificationPreview} numberOfLines={2}>
                  {latestNotification.content}
                </Text>
                <Text style={styles.notificationDate}>
                  {new Date(latestNotification.publishedAt || latestNotification.createdAt).toLocaleDateString('ja-JP')}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyNotification}>
              <Text style={styles.emptyText}>新しいお知らせはありません</Text>
            </View>
          )}
        </View>

        {/* 次回のイベント・例会 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Calendar size={20} color="#1e3a8a" strokeWidth={2} style={styles.sectionIconStyle} />
              <Text style={styles.sectionTitle}>次回のイベント・例会</Text>
            </View>
          </View>

          {nextEvent ? (
            <View style={styles.eventCard}>

              {/* イベント詳細 */}
              <LinearGradient
                colors={['#1e3a8a', '#1d4ed8']}
                style={styles.eventHeader}
              >
                <View style={styles.eventDateRow}>
                  <Calendar size={18} color="#ffffff" strokeWidth={2} style={styles.eventIconStyle} />
                  <Text style={styles.eventDateTime}>
                    {formatDate(nextEvent.startAt).year}年
                    {formatDate(nextEvent.startAt).month}月
                    {formatDate(nextEvent.startAt).day}日
                    （{formatDate(nextEvent.startAt).weekday}）
                    {formatTime(nextEvent.startAt)}
                    {nextEvent.endAt && `〜${formatTime(nextEvent.endAt)}`}
                  </Text>
                </View>
                {nextEvent.venue && (
                  <View style={styles.eventDateRow}>
                    <MapPin size={18} color="#ffffff" strokeWidth={2} style={styles.eventIconStyle} />
                    <Text style={styles.eventVenue}>{nextEvent.venue}</Text>
                  </View>
                )}
                {nextEvent.responseDeadline && (
                  <View style={styles.deadlineBadge}>
                    <Text style={styles.deadlineText}>
                      回答期限：{new Date(nextEvent.responseDeadline).toLocaleDateString('ja-JP')}
                    </Text>
                  </View>
                )}
              </LinearGradient>

              {/* イベント詳細（あれば） */}
              {nextEvent.description && (
                <View style={styles.descriptionSection}>
                  <Text style={styles.descriptionText}>{nextEvent.description}</Text>
                </View>
              )}

              {/* 出欠回答エリア */}
              <View style={styles.attendanceSection}>
                <Text style={styles.attendanceTitle}>出欠のご回答</Text>

                {attendanceStatus ? (
                  <View style={styles.answeredContainer}>
                    <View style={styles.answeredBadge}>
                      <Check size={20} color="#1e3a8a" strokeWidth={2.5} />
                      <Text style={styles.answeredText}>
                        回答済み: {attendanceStatus === 'attending' ? '出席' : attendanceStatus === 'absent' ? '欠席' : '未定'}
                      </Text>
                    </View>
                    {canSubmitAttendance && (
                      <TouchableOpacity
                        onPress={() => setAttendanceStatus(null)}
                        disabled={isSubmittingAttendance}
                      >
                        <Text style={styles.changeButton}>回答を変更する</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={styles.thankYouText}>ご回答ありがとうございます</Text>
                  </View>
                ) : canSubmitAttendance ? (
                  <View style={styles.attendanceButtons}>
                    <TouchableOpacity
                      style={[styles.attendanceButton, styles.attendButton]}
                      onPress={() => handleAttendance('attending')}
                      disabled={isSubmittingAttendance}
                      activeOpacity={0.8}
                    >
                      {isSubmittingAttendance ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text style={styles.attendButtonText}>出席</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.attendanceButton, styles.absentButton]}
                      onPress={() => handleAttendance('absent')}
                      disabled={isSubmittingAttendance}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.absentButtonText}>欠席</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.attendanceButton, styles.undecidedButton]}
                      onPress={() => handleAttendance('undecided')}
                      disabled={isSubmittingAttendance}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.undecidedButtonText}>未定</Text>
                    </TouchableOpacity>
                  </View>
                ) : nextEvent.status === 'cancelled' ? (
                  <View style={styles.expiredNotice}>
                    <Text style={styles.cancelledNoticeText}>このイベントは中止になりました</Text>
                  </View>
                ) : nextEvent.status === 'postponed' ? (
                  <View style={styles.expiredNotice}>
                    <Text style={styles.postponedNoticeText}>このイベントは延期になりました</Text>
                  </View>
                ) : nextEvent.status === 'closed' ? (
                  <View style={styles.expiredNotice}>
                    <Text style={styles.expiredNoticeText}>出欠回答は締め切られました</Text>
                  </View>
                ) : (
                  <View style={styles.expiredNotice}>
                    <Text style={styles.expiredNoticeText}>回答期限が過ぎています</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.emptyEvent}>
              <Calendar size={40} color="#9ca3af" strokeWidth={1.5} />
              <Text style={styles.emptyText}>予定されているイベント・例会はありません</Text>
            </View>
          )}
        </View>

        {/* クイックアクセス */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クイックアクセス</Text>

          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={() => router.push('/(tabs)/members')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1e3a8a', '#1d4ed8']}
              style={styles.quickAccessGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.quickAccessContent}>
                <Users size={28} color="#ffffff" strokeWidth={2} />
                <Text style={styles.quickAccessText}>会員名簿を開く</Text>
              </View>
              <ChevronRight size={24} color="#ffffff" strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 今後のスケジュール */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今後のスケジュール</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/events')}
              style={styles.seeAllButton}
            >
              <View style={styles.seeAllContent}>
                <Text style={styles.seeAllText}>一覧を見る</Text>
                <ChevronRight size={18} color="#1e3a8a" strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.scheduleCard}>
            <TouchableOpacity
              style={styles.scheduleItem}
              onPress={() => router.push('/(tabs)/events')}
            >
              <View style={styles.scheduleItemContent}>
                <Text style={styles.scheduleItemTitle}>イベント一覧</Text>
                <Text style={styles.scheduleItemSubtitle}>すべてのイベントを確認</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 18,
    color: '#93c5fd',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  lastSection: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconStyle: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllButton: {
    padding: 4,
  },
  seeAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginRight: 4,
  },
  // Notification
  notificationCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 2,
    borderColor: '#fbbf24',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  notificationPreview: {
    fontSize: 16,
    color: '#78350f',
    lineHeight: 24,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 14,
    color: '#a16207',
  },
  emptyNotification: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  emptyEvent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  // Event Card
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1e3a8a',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  eventHeader: {
    padding: 16,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventIconStyle: {
    marginRight: 8,
  },
  eventDateTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  eventVenue: {
    fontSize: 16,
    color: '#ffffff',
  },
  deadlineBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  deadlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  descriptionSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  // Attendance
  attendanceSection: {
    padding: 20,
  },
  attendanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  attendanceButtons: {
    gap: 12,
  },
  attendanceButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  attendButton: {
    backgroundColor: '#16a34a',
    borderColor: '#15803d',
  },
  attendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  absentButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  absentButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  undecidedButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  undecidedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  answeredContainer: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  answeredText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  changeButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
  thankYouText: {
    fontSize: 14,
    color: '#6b7280',
  },
  expiredNotice: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  expiredNoticeText: {
    color: '#6b7280',
    fontSize: 16,
  },
  cancelledNoticeText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  postponedNoticeText: {
    color: '#d97706',
    fontSize: 16,
    fontWeight: '600',
  },
  // Quick Access
  quickAccessButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  quickAccessGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  quickAccessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quickAccessText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  // Schedule
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  scheduleItemContent: {
    flex: 1,
  },
  scheduleItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  scheduleItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});
