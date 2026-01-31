import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';
import { Event } from '../../src/types';

const EVENT_TYPE_LABELS: Record<string, string> = {
  meeting: '例会',
  service: '奉仕活動',
  social: '親睦会',
  district: '地区行事',
  other: 'その他',
};

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return { month, day, weekday };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const { month, day, weekday } = formatDate(item.startAt);
    const attendance = item.myAttendance?.status;

    return (
      <TouchableOpacity style={styles.eventCard}>
        <View style={styles.eventDate}>
          <Text style={styles.eventMonth}>{month}月</Text>
          <Text style={styles.eventDay}>{day}</Text>
          <Text style={styles.eventWeekday}>{weekday}</Text>
        </View>
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventType}>
              {EVENT_TYPE_LABELS[item.eventType] || item.eventType}
            </Text>
            {attendance && (
              <View
                style={[
                  styles.attendanceBadge,
                  attendance === 'attending' && styles.attendingBadge,
                  attendance === 'absent' && styles.absentBadge,
                ]}
              >
                <Text style={styles.attendanceText}>
                  {attendance === 'attending'
                    ? '出席'
                    : attendance === 'absent'
                    ? '欠席'
                    : '未回答'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventInfo}>
            {formatTime(item.startAt)}
            {item.endAt && ` 〜 ${formatTime(item.endAt)}`}
          </Text>
          {item.venue && <Text style={styles.eventInfo}>{item.venue}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
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
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventDate: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 16,
    minWidth: 64,
  },
  eventMonth: {
    color: '#93c5fd',
    fontSize: 11,
  },
  eventDay: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  eventWeekday: {
    color: '#93c5fd',
    fontSize: 11,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  attendanceBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#fef3c7',
  },
  attendingBadge: {
    backgroundColor: '#d1fae5',
  },
  absentBadge: {
    backgroundColor: '#fee2e2',
  },
  attendanceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventInfo: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
});
