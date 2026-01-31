import React, { useState } from 'react';
import { Home, Users, User, Bell, Calendar, MapPin, MessageSquare, ChevronRight, Check } from 'lucide-react';

// ホーム画面コンポーネント
const HomeScreen = ({ setActiveTab, eventResponses, setEventResponses }) => {
  const [attendanceStatus, setAttendanceStatus] = useState(null); // null, 'attend', 'absent', 'undecided'
  const [showChangeLink, setShowChangeLink] = useState(false);

  const handleAttendanceClick = (status) => {
    setAttendanceStatus(status);
    setShowChangeLink(true);
  };

  const resetAttendance = () => {
    setAttendanceStatus(null);
    setShowChangeLink(false);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-5 py-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">神戸西ロータリークラブ</h1>
        <p className="text-blue-100 text-lg">こんにちは、田中 太郎様</p>
      </div>

      {/* 重要なお知らせエリア */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">事務局からのお知らせ</h2>
          <button
            onClick={() => setActiveTab('notifications')}
            className="text-blue-900 font-semibold text-base hover:underline flex items-center space-x-1"
          >
            <span>一覧を見る</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-amber-400 rounded-full p-2 flex-shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-1">会場変更のお知らせ</h3>
              <p className="text-amber-800 text-base leading-relaxed">
                2月例会の会場が「ホテルオークラ神戸」に変更となりました。お間違えのないようご注意ください。
              </p>
              <p className="text-amber-700 text-sm mt-2">2025年1月25日</p>
            </div>
          </div>
        </div>
      </div>

      {/* 次回例会・イベントカード */}
      <div className="px-4 py-2">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-blue-900" />
          次回例会
        </h2>
        
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-900 overflow-hidden">
          {/* イベント詳細 */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-5 py-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5" />
              <p className="text-xl font-bold">2025年2月1日（土）12:30〜14:00</p>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5" />
              <p className="text-lg">ホテルオークラ神戸 34階 メイファ</p>
            </div>
            <div className="bg-blue-800 bg-opacity-50 rounded-lg px-3 py-2 mt-3 inline-block">
              <p className="text-sm font-semibold">回答期限：1月30日（木）17:00</p>
            </div>
          </div>

          {/* 卓話情報 */}
          <div className="px-5 py-4 bg-blue-50 border-b-2 border-blue-100">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-semibold mb-1">卓話</p>
                <p className="text-lg font-bold text-blue-900 mb-1">山田 花子 様</p>
                <p className="text-base text-gray-700">「地域社会とロータリーの未来」</p>
              </div>
            </div>
          </div>

          {/* 出欠回答エリア */}
          <div className="px-5 py-5">
            <p className="text-lg font-bold text-gray-900 mb-4">出欠のご回答</p>
            
            {!showChangeLink ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleAttendanceClick('attend')}
                  className={`w-full py-5 px-6 rounded-xl text-lg font-bold transition-all shadow-md ${
                    attendanceStatus === 'attend'
                      ? 'bg-green-600 text-white border-2 border-green-700'
                      : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {attendanceStatus === 'attend' && <Check className="w-6 h-6" />}
                    <span>出席</span>
                  </div>
                </button>

                <button
                  onClick={() => handleAttendanceClick('absent')}
                  className={`w-full py-5 px-6 rounded-xl text-lg font-bold transition-all shadow-md ${
                    attendanceStatus === 'absent'
                      ? 'bg-red-600 text-white border-2 border-red-700'
                      : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {attendanceStatus === 'absent' && <Check className="w-6 h-6" />}
                    <span>欠席</span>
                  </div>
                </button>

                <button
                  onClick={() => handleAttendanceClick('undecided')}
                  className={`w-full py-5 px-6 rounded-xl text-lg font-bold transition-all shadow-md ${
                    attendanceStatus === 'undecided'
                      ? 'bg-yellow-500 text-white border-2 border-yellow-600'
                      : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-yellow-500 hover:bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {attendanceStatus === 'undecided' && <Check className="w-6 h-6" />}
                    <span>未定</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Check className="w-6 h-6 text-blue-900" />
                  <p className="text-lg font-bold text-blue-900">
                    回答済み: {
                      attendanceStatus === 'attend' ? '出席' :
                      attendanceStatus === 'absent' ? '欠席' : '未定'
                    }
                  </p>
                </div>
                <button
                  onClick={resetAttendance}
                  className="text-blue-900 font-semibold text-base hover:underline"
                >
                  回答を変更する
                </button>
              </div>
            )}

            {attendanceStatus && showChangeLink && (
              <p className="text-center text-gray-500 text-sm mt-3">
                ご回答ありがとうございます
              </p>
            )}
          </div>
        </div>
      </div>

      {/* クイックリンク */}
      <div className="px-4 py-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3">クイックアクセス</h2>
        <button className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-5 px-6 rounded-xl shadow-lg hover:from-blue-800 hover:to-blue-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-7 h-7" />
              <span className="text-xl font-bold">会員名簿を開く</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* その他の情報 */}
      <div className="px-4 py-2 pb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">今後のスケジュール</h3>
            <button
              onClick={() => setActiveTab('events')}
              className="text-blue-900 font-semibold text-base hover:underline flex items-center space-x-1"
            >
              <span>一覧を見る</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-base">奉仕活動</p>
                <p className="text-gray-600 text-sm">地域清掃ボランティア</p>
              </div>
              <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-500">2月15日</p>
                {eventResponses[3] === 'attend' && (
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">出席</span>
                )}
                {eventResponses[3] === 'absent' && (
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">欠席</span>
                )}
                {!eventResponses[3] && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">未回答</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-base">親睦活動</p>
                <p className="text-gray-600 text-sm">ゴルフコンペ</p>
              </div>
              <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-500">2月22日</p>
                {eventResponses[4] === 'attend' && (
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">出席</span>
                )}
                {eventResponses[4] === 'absent' && (
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">欠席</span>
                )}
                {!eventResponses[4] && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">未回答</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// イベント一覧画面
const EventsScreen = ({ setActiveTab, eventResponses, setEventResponses }) => {
  // サンプルイベントデータ
  const events = [
    {
      id: 1,
      title: '定例会',
      date: '2025年2月1日（土）',
      time: '12:30〜14:00',
      location: 'ホテルオークラ神戸 34階 メイファ',
      category: 'meeting',
      description: '卓話：山田 花子 様「地域社会とロータリーの未来」',
      responseDeadline: '2025年1月30日 17:00',
      responseDeadlineDate: new Date('2025-01-30T17:00:00')
    },
    {
      id: 2,
      title: '新会員歓迎会',
      date: '2025年2月8日（土）',
      time: '18:00〜20:00',
      location: '神戸ポートタワーホテル',
      category: 'social',
      description: '新会員の佐藤様をお迎えする歓迎会です。会費：5,000円',
      responseDeadline: '2025年2月5日 17:00',
      responseDeadlineDate: new Date('2025-02-05T17:00:00')
    },
    {
      id: 3,
      title: '地域清掃ボランティア',
      date: '2025年2月15日（土）',
      time: '9:00〜11:00',
      location: '神戸市役所前集合',
      category: 'service',
      description: '地域の清掃活動を行います。軍手、飲み物をご持参ください。',
      responseDeadline: '2025年2月12日 17:00',
      responseDeadlineDate: new Date('2025-02-12T17:00:00')
    },
    {
      id: 4,
      title: 'ゴルフコンペ',
      date: '2025年2月22日（土）',
      time: '8:00〜',
      location: '六甲国際ゴルフ倶楽部',
      category: 'social',
      description: '親睦ゴルフコンペを開催します。参加費：15,000円',
      responseDeadline: '2025年2月19日 17:00',
      responseDeadlineDate: new Date('2025-02-19T17:00:00')
    },
    {
      id: 5,
      title: '定例会',
      date: '2025年3月1日（土）',
      time: '12:30〜14:00',
      location: 'ホテルオークラ神戸 34階 メイファ',
      category: 'meeting',
      description: '卓話：詳細は後日お知らせいたします',
      responseDeadline: '2025年2月26日 17:00',
      responseDeadlineDate: new Date('2025-02-26T17:00:00')
    },
    {
      id: 6,
      title: '地区大会',
      date: '2025年3月15日（土）',
      time: '10:00〜17:00',
      location: '神戸国際会議場',
      category: 'district',
      description: '地区内の合同イベントです。全会員の参加を推奨いたします。',
      responseDeadline: '2025年3月10日 17:00',
      responseDeadlineDate: new Date('2025-03-10T17:00:00')
    }
  ];

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'meeting':
        return { label: '定例会', color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-50 border-blue-200' };
      case 'service':
        return { label: '奉仕活動', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50 border-green-200' };
      case 'social':
        return { label: '親睦活動', color: 'bg-purple-100 text-purple-800', bgColor: 'bg-purple-50 border-purple-200' };
      case 'district':
        return { label: '地区行事', color: 'bg-amber-100 text-amber-800', bgColor: 'bg-amber-50 border-amber-200' };
      default:
        return { label: 'イベント', color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50 border-gray-200' };
    }
  };

  const isDeadlinePassed = (deadlineDate) => {
    const now = new Date('2025-01-28T12:00:00'); // 現在日時（デモ用）
    return now > deadlineDate;
  };

  const handleResponse = (eventId, response) => {
    setEventResponses({
      ...eventResponses,
      [eventId]: response
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => setActiveTab('home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 rotate-180" />
          </button>
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">イベント一覧</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="space-y-4">
          {events.map((event) => {
            const categoryInfo = getCategoryInfo(event.category);
            const deadlinePassed = isDeadlinePassed(event.responseDeadlineDate);
            const userResponse = eventResponses[event.id];
            
            return (
              <div
                key={event.id}
                className={`bg-white rounded-2xl shadow-sm border-2 p-5 ${categoryInfo.bgColor}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryInfo.color}`}>
                    {categoryInfo.label}
                  </span>
                  {userResponse === 'attend' && (
                    <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>出席</span>
                    </span>
                  )}
                  {userResponse === 'absent' && (
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      欠席
                    </span>
                  )}
                  {!userResponse && !deadlinePassed && (
                    <span className="bg-gray-400 text-white text-sm font-bold px-3 py-1 rounded-full">
                      未回答
                    </span>
                  )}
                  {!userResponse && deadlinePassed && (
                    <span className="bg-gray-300 text-gray-600 text-sm font-bold px-3 py-1 rounded-full">
                      期限切れ
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-blue-900" />
                    <span className="text-base font-semibold">{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-blue-900" />
                    <span className="text-base">{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-blue-900" />
                    <span className="text-base">{event.location}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-base leading-relaxed mb-3">
                  {event.description}
                </p>

                {/* 回答期限 */}
                <div className={`text-sm font-semibold mb-3 ${deadlinePassed ? 'text-gray-500' : 'text-blue-900'}`}>
                  回答期限：{event.responseDeadline}
                  {deadlinePassed && <span className="ml-2 text-red-600">（期限切れ）</span>}
                </div>

                {/* 出欠回答ボタン */}
                {!deadlinePassed && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-bold text-gray-900 mb-2">出欠のご回答</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleResponse(event.id, 'attend')}
                        className={`flex-1 py-3 px-4 rounded-lg text-base font-bold transition-all ${
                          userResponse === 'attend'
                            ? 'bg-green-600 text-white border-2 border-green-700'
                            : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50'
                        }`}
                      >
                        出席
                      </button>
                      <button
                        onClick={() => handleResponse(event.id, 'absent')}
                        className={`flex-1 py-3 px-4 rounded-lg text-base font-bold transition-all ${
                          userResponse === 'absent'
                            ? 'bg-red-600 text-white border-2 border-red-700'
                            : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50'
                        }`}
                      >
                        欠席
                      </button>
                    </div>
                  </div>
                )}

                {deadlinePassed && !userResponse && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500 text-center">
                      回答期限が過ぎています
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// お知らせ詳細画面
const NotificationDetailScreen = ({ notification, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 rotate-180" />
          </button>
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">お知らせ詳細</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              {notification.category === 'important' && (
                <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                  重要
                </span>
              )}
              {notification.category === 'event' && (
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  イベント
                </span>
              )}
              {notification.category === 'general' && (
                <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                  お知らせ
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{notification.title}</h2>
            <p className="text-gray-500 text-base">{notification.date}</p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
              {notification.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// お知らせ一覧画面
const NotificationsScreen = ({ setActiveTab }) => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readNotifications, setReadNotifications] = useState(new Set());

  // サンプルお知らせデータ
  const notifications = [
    {
      id: 1,
      title: '会場変更のお知らせ',
      date: '2025年1月25日',
      category: 'important',
      content: '2月例会の会場が「ホテルオークラ神戸 34階 メイファ」に変更となりました。\n\n従来の会場から変更となっておりますので、お間違えのないようご注意ください。\n\n当日のアクセス方法については、別途ご案内いたします。'
    },
    {
      id: 2,
      title: '新会員歓迎会のご案内',
      date: '2025年1月20日',
      category: 'event',
      content: '来月、新会員の佐藤様をお迎えすることとなりました。\n\n歓迎会を下記の日程で開催いたしますので、ぜひご参加ください。\n\n日時：2月8日（土）18:00〜\n場所：神戸ポートタワーホテル\n会費：5,000円'
    },
    {
      id: 3,
      title: '年会費のお支払いについて',
      date: '2025年1月15日',
      category: 'general',
      content: '2025年度の年会費のお支払い期限が近づいております。\n\n未納の方は、1月31日までに事務局までお振込みをお願いいたします。\n\nご不明な点がございましたら、事務局までお問い合わせください。'
    },
    {
      id: 4,
      title: '地域清掃ボランティア参加者募集',
      date: '2025年1月10日',
      category: 'event',
      content: '2月15日に開催される地域清掃ボランティアの参加者を募集しております。\n\n集合時間：9:00\n集合場所：神戸市役所前\n持ち物：軍手、飲み物\n\n参加ご希望の方は、1月末までに事務局までご連絡ください。'
    },
    {
      id: 5,
      title: '1月例会の卓話について',
      date: '2025年1月5日',
      category: 'general',
      content: '1月の例会では、山田花子様に「地域社会とロータリーの未来」というテーマでご講演いただきました。\n\n多くの会員の皆様にご参加いただき、誠にありがとうございました。'
    }
  ];

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setReadNotifications(new Set([...readNotifications, notification.id]));
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'important':
        return 'bg-red-50 border-red-200';
      case 'event':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (selectedNotification) {
    return (
      <NotificationDetailScreen
        notification={selectedNotification}
        onBack={() => setSelectedNotification(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => setActiveTab('home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 rotate-180" />
          </button>
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">お知らせ一覧</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="space-y-3">
          {notifications.map((notification) => {
            const isUnread = !readNotifications.has(notification.id);
            
            return (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left bg-white rounded-2xl shadow-sm border-2 p-5 hover:shadow-md transition-all ${
                  getCategoryColor(notification.category)
                }`}
              >
                <div className="flex items-start space-x-3">
                  {isUnread && (
                    <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                  {!isUnread && (
                    <div className="w-3 h-3 flex-shrink-0 mt-2"></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {notification.category === 'important' && (
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                          重要
                        </span>
                      )}
                      {notification.category === 'event' && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                          イベント
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg mb-1 ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-500">{notification.date}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 会員名簿画面（プレースホルダー）
const MembersScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-5 py-6 shadow-lg">
        <h1 className="text-2xl font-bold">会員名簿</h1>
      </div>
      <div className="px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">会員名簿機能は開発中です</p>
        </div>
      </div>
    </div>
  );
};

// マイページ画面（プレースホルダー）
const MyPageScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-5 py-6 shadow-lg">
        <h1 className="text-2xl font-bold">マイページ</h1>
      </div>
      <div className="px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">マイページ機能は開発中です</p>
        </div>
      </div>
    </div>
  );
};

// ボトムナビゲーション
const BottomNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'ホーム', icon: Home },
    { id: 'members', label: '会員名簿', icon: Users },
    { id: 'mypage', label: 'マイページ', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-6 rounded-xl transition-all ${
                isActive 
                  ? 'text-blue-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-7 h-7 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// メインアプリ
export default function RotaryClubApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [eventResponses, setEventResponses] = useState({
    // イベントIDをキー、回答（'attend' or 'absent'）を値として管理
    // 例: { 1: 'attend', 2: 'absent', 3: null }
  });

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {activeTab === 'home' && (
        <HomeScreen 
          setActiveTab={setActiveTab} 
          eventResponses={eventResponses}
          setEventResponses={setEventResponses}
        />
      )}
      {activeTab === 'notifications' && <NotificationsScreen setActiveTab={setActiveTab} />}
      {activeTab === 'events' && (
        <EventsScreen 
          setActiveTab={setActiveTab}
          eventResponses={eventResponses}
          setEventResponses={setEventResponses}
        />
      )}
      {activeTab === 'members' && <MembersScreen />}
      {activeTab === 'mypage' && <MyPageScreen />}
      
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
