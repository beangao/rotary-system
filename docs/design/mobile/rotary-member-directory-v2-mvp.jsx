import React, { useState, useEffect, useRef } from 'react';
import { User, Building2, Briefcase, Tag, Heart, FileText, Eye, Lock, AlertCircle, Clock, CheckCircle, Filter, SlidersHorizontal } from 'lucide-react';

// ボトムシート用アニメーションスタイル
const styles = `
  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;

// Supabase接続の想定（実際の環境では適切に初期化）
const supabase = {
  from: (table) => ({
    select: (fields) => ({
      eq: (field, value) => ({
        order: (field, options) => Promise.resolve({ data: [], error: null })
      }),
      order: (field, options) => Promise.resolve({ data: [], error: null }),
      then: (callback) => callback({ data: [], error: null })
    }),
    insert: (data) => Promise.resolve({ data: null, error: null }),
    update: (data) => ({
      eq: (field, value) => Promise.resolve({ data: null, error: null })
    })
  })
};

const MemberDirectoryApp = () => {
  const [activeTab, setActiveTab] = useState('own'); // 'own' のみ有効
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileViews, setProfileViews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOccupation, setSelectedOccupation] = useState('all'); // 職業分類フィルター
  const [selectedYear, setSelectedYear] = useState('all'); // 入会年度フィルター
  const [yearRangeStart, setYearRangeStart] = useState(''); // 入会年度範囲（開始）
  const [yearRangeEnd, setYearRangeEnd] = useState(''); // 入会年度範囲（終了）
  const [selectedPosition, setSelectedPosition] = useState('all'); // 役職フィルター
  const [showFilters, setShowFilters] = useState(false); // ボトムシート表示
  const [showBackToTop, setShowBackToTop] = useState(false); // 上に戻るボタン
  const listRef = useRef(null);

  // 五十音インデックス
  const kanaIndex = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];
  
  // 職業分類リスト
  const occupations = ['製造業', 'エンジニアリング', 'デザイン', '不動産', '会計', '商社', '医療', '法律', '建設業', '食品', '保険', '建築', '教育', '自動車', '印刷'];
  
  // 入会年度リスト（35年分）
  const joinYears = Array.from({ length: 35 }, (_, i) => String(2024 - i));
  
  // 役職リスト
  const positions = ['会長', '副会長', '幹事', '会員'];

  // モックデータ（実際はSupabaseから取得）
  useEffect(() => {
    loadMemberData();
    loadCurrentUser();
  }, []);

  // スクロール監視（上に戻るボタン）
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadCurrentUser = async () => {
    // 実際の実装: const { data } = await supabase.from('members').select('*').eq('id', userId).single();
    const user = {
      id: 'current-user-123',
      name: '山田太郎',
      last_name: '山田',
      first_name: '太郎',
      last_name_kana: 'やまだ',
      first_name_kana: 'たろう',
      club: '東京ロータリークラブ',
      occupation_category: 'エンジニアリング',
      hometown: '神奈川県横浜市',
      alma_mater: '東京工業大学',
      hobbies: 'ランニング、ゴルフ、読書',
      phone_number: '090-1234-5678',
      email: 'yamada.taro@rotary.jp',
      profile_public: true,
      last_enabled_at: null,
      last_disabled_at: null
    };
    setCurrentUser(user);
  };

  // フィルタリングされた会員リストを取得
  const getFilteredMembers = () => {
    return members.filter(m => {
      // フリーワード検索（氏名、かな、会社名、趣味、出身地、出身校）
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        m.name.toLowerCase().includes(searchLower) ||
        m.name_kana?.toLowerCase().includes(searchLower) ||
        m.company.toLowerCase().includes(searchLower) ||
        m.hobbies?.toLowerCase().includes(searchLower) ||
        m.hometown?.toLowerCase().includes(searchLower) ||
        m.alma_mater?.toLowerCase().includes(searchLower);
      
      // 職業分類フィルター
      const matchesOccupation = selectedOccupation === 'all' || m.occupation_category === selectedOccupation;
      
      // 入会年度フィルター（範囲対応）
      let matchesYear = true;
      if (selectedYear !== 'all') {
        matchesYear = m.join_year === selectedYear;
      } else if (yearRangeStart && yearRangeEnd) {
        const memberYear = parseInt(m.join_year);
        const startYear = parseInt(yearRangeStart);
        const endYear = parseInt(yearRangeEnd);
        matchesYear = memberYear >= startYear && memberYear <= endYear;
      } else if (yearRangeStart) {
        matchesYear = parseInt(m.join_year) >= parseInt(yearRangeStart);
      } else if (yearRangeEnd) {
        matchesYear = parseInt(m.join_year) <= parseInt(yearRangeEnd);
      }
      
      // 役職フィルター
      const matchesPosition = selectedPosition === 'all' || m.position === selectedPosition;
      
      return matchesSearch && matchesOccupation && matchesYear && matchesPosition;
    });
  };

  const loadMemberData = async () => {
    // 自クラブのみ（150名）
    const mockMembers = 
[
  {
    "id": "1",
    "name": "佐藤健太",
    "name_kana": "あおき健太",
    "photo_url": null,
    "position": "会員",
    "company": "佐藤製作所",
    "department": "部長",
    "member_number": "RC-2024-001",
    "club": "東京ロータリークラブ",
    "occupation_category": "製造業",
    "hometown": "東京都横浜市",
    "alma_mater": "東京大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "製造業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "佐藤",
    "first_name": "健太",
    "last_name_kana": "あおき",
    "first_name_kana": "健太",
    "phone_number": "090-1000-1000",
    "email": "member001@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "2",
    "name": "鈴木誠",
    "name_kana": "いとう誠",
    "photo_url": null,
    "position": "会員",
    "company": "鈴木株式会社",
    "department": "部長",
    "member_number": "RC-2023-002",
    "club": "東京ロータリークラブ",
    "occupation_category": "エンジニアリング",
    "hometown": "神奈川県大阪市",
    "alma_mater": "京都大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "エンジニアリングを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "鈴木",
    "first_name": "誠",
    "last_name_kana": "いと",
    "first_name_kana": "う誠",
    "phone_number": "090-1017-1023",
    "email": "member002@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "3",
    "name": "高橋隆",
    "name_kana": "うえだ隆",
    "photo_url": null,
    "position": "会員",
    "company": "高橋株式会社",
    "department": "部長",
    "member_number": "RC-2022-003",
    "club": "東京ロータリークラブ",
    "occupation_category": "デザイン",
    "hometown": "埼玉県京都市",
    "alma_mater": "早稲田大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "デザインを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "高橋",
    "first_name": "隆",
    "last_name_kana": "うえ",
    "first_name_kana": "だ隆",
    "phone_number": "090-1034-1046",
    "email": "member003@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "4",
    "name": "田中浩",
    "name_kana": "えぐち浩",
    "photo_url": null,
    "position": "会員",
    "company": "田中株式会社",
    "department": "部長",
    "member_number": "RC-2021-004",
    "club": "東京ロータリークラブ",
    "occupation_category": "不動産",
    "hometown": "千葉県名古屋市",
    "alma_mater": "慶應義塾大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "不動産を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "田中",
    "first_name": "浩",
    "last_name_kana": "えぐ",
    "first_name_kana": "ち浩",
    "phone_number": "090-1051-1069",
    "email": "member004@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "5",
    "name": "伊藤修",
    "name_kana": "おおの修",
    "photo_url": null,
    "position": "会員",
    "company": "伊藤会計事務所",
    "department": "公認会計士",
    "member_number": "RC-2020-005",
    "club": "東京ロータリークラブ",
    "occupation_category": "会計",
    "hometown": "大阪府福岡市",
    "alma_mater": "一橋大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "会計を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "伊藤",
    "first_name": "修",
    "last_name_kana": "おお",
    "first_name_kana": "の修",
    "phone_number": "090-1068-1092",
    "email": "member005@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "6",
    "name": "渡辺勇",
    "name_kana": "かとう勇",
    "photo_url": null,
    "position": "会員",
    "company": "渡辺株式会社",
    "department": "部長",
    "member_number": "RC-2019-006",
    "club": "東京ロータリークラブ",
    "occupation_category": "商社",
    "hometown": "京都府札幌市",
    "alma_mater": "東京工業大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "商社を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "渡辺",
    "first_name": "勇",
    "last_name_kana": "かと",
    "first_name_kana": "う勇",
    "phone_number": "090-1085-1115",
    "email": "member006@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "7",
    "name": "山本太郎",
    "name_kana": "きむら太郎",
    "photo_url": null,
    "position": "会長",
    "company": "山本クリニック",
    "department": "代表取締役",
    "member_number": "RC-2018-007",
    "club": "東京ロータリークラブ",
    "occupation_category": "医療",
    "hometown": "兵庫県仙台市",
    "alma_mater": "明治大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "医療を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "山本",
    "first_name": "太郎",
    "last_name_kana": "きむら",
    "first_name_kana": "太郎",
    "phone_number": "090-1102-1138",
    "email": "member007@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "8",
    "name": "中村次郎",
    "name_kana": "くぼた次郎",
    "photo_url": null,
    "position": "副会長",
    "company": "中村法律事務所",
    "department": "代表取締役",
    "member_number": "RC-2017-008",
    "club": "東京ロータリークラブ",
    "occupation_category": "法律",
    "hometown": "愛知県広島市",
    "alma_mater": "中央大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "法律を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "中村",
    "first_name": "次郎",
    "last_name_kana": "くぼた",
    "first_name_kana": "次郎",
    "phone_number": "090-1119-1161",
    "email": "member008@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "9",
    "name": "小林三郎",
    "name_kana": "こばやし三郎",
    "photo_url": null,
    "position": "幹事",
    "company": "小林株式会社",
    "department": "専務取締役",
    "member_number": "RC-2016-009",
    "club": "東京ロータリークラブ",
    "occupation_category": "建設業",
    "hometown": "福岡県静岡市",
    "alma_mater": "法政大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "建設業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "小林",
    "first_name": "三郎",
    "last_name_kana": "こばや",
    "first_name_kana": "し三郎",
    "phone_number": "090-1136-1184",
    "email": "member009@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "10",
    "name": "加藤一郎",
    "name_kana": "さいとう一郎",
    "photo_url": null,
    "position": "会員",
    "company": "加藤株式会社",
    "department": "部長",
    "member_number": "RC-2015-010",
    "club": "東京ロータリークラブ",
    "occupation_category": "食品",
    "hometown": "北海道水戸市",
    "alma_mater": "青山学院大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "食品を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "加藤",
    "first_name": "一郎",
    "last_name_kana": "さいと",
    "first_name_kana": "う一郎",
    "phone_number": "090-1153-1207",
    "email": "member010@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "11",
    "name": "吉田光男",
    "name_kana": "さとう光男",
    "photo_url": null,
    "position": "会員",
    "company": "吉田株式会社",
    "department": "部長",
    "member_number": "RC-2014-011",
    "club": "東京ロータリークラブ",
    "occupation_category": "保険",
    "hometown": "宮城県宇都宮市",
    "alma_mater": "立教大学",
    "hobbies": "映画鑑賞、音楽鑑賞、カラオケ",
    "self_introduction": "保険を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "吉田",
    "first_name": "光男",
    "last_name_kana": "さとう",
    "first_name_kana": "光男",
    "phone_number": "090-1170-1230",
    "email": "member011@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "12",
    "name": "山田正義",
    "name_kana": "しみず正義",
    "photo_url": null,
    "position": "会員",
    "company": "山田建築設計",
    "department": "建築士",
    "member_number": "RC-2013-012",
    "club": "東京ロータリークラブ",
    "occupation_category": "建築",
    "hometown": "広島県さいたま市",
    "alma_mater": "日本大学",
    "hobbies": "茶道、華道、書道",
    "self_introduction": "建築を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "山田",
    "first_name": "正義",
    "last_name_kana": "しみず",
    "first_name_kana": "正義",
    "phone_number": "090-1187-1253",
    "email": "member012@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "13",
    "name": "佐々木康夫",
    "name_kana": "すずき康夫",
    "photo_url": null,
    "position": "会員",
    "company": "佐々木学院",
    "department": "部長",
    "member_number": "RC-2024-013",
    "club": "東京ロータリークラブ",
    "occupation_category": "教育",
    "hometown": "静岡県千葉市",
    "alma_mater": "東北大学",
    "hobbies": "絵画、彫刻、陶芸",
    "self_introduction": "教育を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "佐々木",
    "first_name": "康夫",
    "last_name_kana": "すずき",
    "first_name_kana": "康夫",
    "phone_number": "090-1204-1276",
    "email": "member013@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "14",
    "name": "山口俊夫",
    "name_kana": "せきぐち俊夫",
    "photo_url": null,
    "position": "会員",
    "company": "山口モータース",
    "department": "部長",
    "member_number": "RC-2023-014",
    "club": "東京ロータリークラブ",
    "occupation_category": "自動車",
    "hometown": "茨城県川崎市",
    "alma_mater": "九州大学",
    "hobbies": "バスケ、野球、サッカー",
    "self_introduction": "自動車を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "山口",
    "first_name": "俊夫",
    "last_name_kana": "せきぐ",
    "first_name_kana": "ち俊夫",
    "phone_number": "090-1221-1299",
    "email": "member014@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "15",
    "name": "松本達也",
    "name_kana": "たかはし達也",
    "photo_url": null,
    "position": "会員",
    "company": "松本株式会社",
    "department": "部長",
    "member_number": "RC-2022-015",
    "club": "東京ロータリークラブ",
    "occupation_category": "印刷",
    "hometown": "栃木県前橋市",
    "alma_mater": "大阪大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "印刷を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "松本",
    "first_name": "達也",
    "last_name_kana": "たかは",
    "first_name_kana": "し達也",
    "phone_number": "090-1238-1322",
    "email": "member015@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "16",
    "name": "井上洋平",
    "name_kana": "たなか洋平",
    "photo_url": null,
    "position": "会長",
    "company": "井上製作所",
    "department": "代表取締役",
    "member_number": "RC-2021-016",
    "club": "東京ロータリークラブ",
    "occupation_category": "製造業",
    "hometown": "群馬県長野市",
    "alma_mater": "名古屋大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "製造業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "井上",
    "first_name": "洋平",
    "last_name_kana": "たなか",
    "first_name_kana": "洋平",
    "phone_number": "090-1255-1345",
    "email": "member016@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "17",
    "name": "木村直樹",
    "name_kana": "つちや直樹",
    "photo_url": null,
    "position": "副会長",
    "company": "木村株式会社",
    "department": "代表取締役",
    "member_number": "RC-2020-017",
    "club": "東京ロータリークラブ",
    "occupation_category": "エンジニアリング",
    "hometown": "長野県新潟市",
    "alma_mater": "北海道大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "エンジニアリングを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "木村",
    "first_name": "直樹",
    "last_name_kana": "つちや",
    "first_name_kana": "直樹",
    "phone_number": "090-1272-1368",
    "email": "member017@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "18",
    "name": "林拓也",
    "name_kana": "なかむら拓也",
    "photo_url": null,
    "position": "幹事",
    "company": "林株式会社",
    "department": "専務取締役",
    "member_number": "RC-2019-018",
    "club": "東京ロータリークラブ",
    "occupation_category": "デザイン",
    "hometown": "新潟県世田谷区",
    "alma_mater": "筑波大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "デザインを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "林拓",
    "first_name": "也",
    "last_name_kana": "なかむ",
    "first_name_kana": "ら拓也",
    "phone_number": "090-1289-1391",
    "email": "member018@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "19",
    "name": "清水健二",
    "name_kana": "にしむら健二",
    "photo_url": null,
    "position": "会員",
    "company": "清水株式会社",
    "department": "部長",
    "member_number": "RC-2018-019",
    "club": "東京ロータリークラブ",
    "occupation_category": "不動産",
    "hometown": "東京都渋谷区",
    "alma_mater": "神戸大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "不動産を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "清水",
    "first_name": "健二",
    "last_name_kana": "にしむ",
    "first_name_kana": "ら健二",
    "phone_number": "090-1306-1414",
    "email": "member019@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "20",
    "name": "山崎健一",
    "name_kana": "のむら健一",
    "photo_url": null,
    "position": "会員",
    "company": "山崎会計事務所",
    "department": "公認会計士",
    "member_number": "RC-2017-020",
    "club": "東京ロータリークラブ",
    "occupation_category": "会計",
    "hometown": "神奈川県港区",
    "alma_mater": "広島大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "会計を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "山崎",
    "first_name": "健一",
    "last_name_kana": "のむら",
    "first_name_kana": "健一",
    "phone_number": "090-1323-1437",
    "email": "member020@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "21",
    "name": "森さくら",
    "name_kana": "はしもとさくら",
    "photo_url": null,
    "position": "会員",
    "company": "森株式会社",
    "department": "部長",
    "member_number": "RC-2016-021",
    "club": "東京ロータリークラブ",
    "occupation_category": "商社",
    "hometown": "埼玉県新宿区",
    "alma_mater": "東京大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "商社を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "森さ",
    "first_name": "くら",
    "last_name_kana": "はしもと",
    "first_name_kana": "さくら",
    "phone_number": "090-1340-1460",
    "email": "member021@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "22",
    "name": "池田美咲",
    "name_kana": "はやし美咲",
    "photo_url": null,
    "position": "会員",
    "company": "池田クリニック",
    "department": "院長",
    "member_number": "RC-2015-022",
    "club": "東京ロータリークラブ",
    "occupation_category": "医療",
    "hometown": "千葉県品川区",
    "alma_mater": "京都大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "医療を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "池田",
    "first_name": "美咲",
    "last_name_kana": "はやし",
    "first_name_kana": "美咲",
    "phone_number": "090-1357-1483",
    "email": "member022@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "23",
    "name": "橋本恵子",
    "name_kana": "ひらの恵子",
    "photo_url": null,
    "position": "会員",
    "company": "橋本法律事務所",
    "department": "弁護士",
    "member_number": "RC-2014-023",
    "club": "東京ロータリークラブ",
    "occupation_category": "法律",
    "hometown": "大阪府横浜市",
    "alma_mater": "早稲田大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "法律を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "橋本",
    "first_name": "恵子",
    "last_name_kana": "ひらの",
    "first_name_kana": "恵子",
    "phone_number": "090-1374-1506",
    "email": "member023@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "24",
    "name": "阿部真理",
    "name_kana": "ふじた真理",
    "photo_url": null,
    "position": "会員",
    "company": "阿部株式会社",
    "department": "部長",
    "member_number": "RC-2013-024",
    "club": "東京ロータリークラブ",
    "occupation_category": "建設業",
    "hometown": "京都府大阪市",
    "alma_mater": "慶應義塾大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "建設業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "阿部",
    "first_name": "真理",
    "last_name_kana": "ふじた",
    "first_name_kana": "真理",
    "phone_number": "090-1391-1529",
    "email": "member024@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "25",
    "name": "石川花子",
    "name_kana": "まつもと花子",
    "photo_url": null,
    "position": "会長",
    "company": "石川株式会社",
    "department": "代表取締役",
    "member_number": "RC-2024-025",
    "club": "東京ロータリークラブ",
    "occupation_category": "食品",
    "hometown": "兵庫県京都市",
    "alma_mater": "一橋大学",
    "hobbies": "映画鑑賞、音楽鑑賞、カラオケ",
    "self_introduction": "食品を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "石川",
    "first_name": "花子",
    "last_name_kana": "まつも",
    "first_name_kana": "と花子",
    "phone_number": "090-1408-1552",
    "email": "member025@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "26",
    "name": "前田由美",
    "name_kana": "みうら由美",
    "photo_url": null,
    "position": "副会長",
    "company": "前田株式会社",
    "department": "代表取締役",
    "member_number": "RC-2023-026",
    "club": "東京ロータリークラブ",
    "occupation_category": "保険",
    "hometown": "愛知県名古屋市",
    "alma_mater": "東京工業大学",
    "hobbies": "茶道、華道、書道",
    "self_introduction": "保険を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "前田",
    "first_name": "由美",
    "last_name_kana": "みうら",
    "first_name_kana": "由美",
    "phone_number": "090-1425-1575",
    "email": "member026@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "27",
    "name": "藤田美香",
    "name_kana": "むらかみ美香",
    "photo_url": null,
    "position": "幹事",
    "company": "藤田建築設計",
    "department": "専務取締役",
    "member_number": "RC-2022-027",
    "club": "東京ロータリークラブ",
    "occupation_category": "建築",
    "hometown": "福岡県福岡市",
    "alma_mater": "明治大学",
    "hobbies": "絵画、彫刻、陶芸",
    "self_introduction": "建築を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "藤田",
    "first_name": "美香",
    "last_name_kana": "むらか",
    "first_name_kana": "み美香",
    "phone_number": "090-1442-1598",
    "email": "member027@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "28",
    "name": "後藤千春",
    "name_kana": "やまだ千春",
    "photo_url": null,
    "position": "会員",
    "company": "後藤学院",
    "department": "部長",
    "member_number": "RC-2021-028",
    "club": "東京ロータリークラブ",
    "occupation_category": "教育",
    "hometown": "北海道札幌市",
    "alma_mater": "中央大学",
    "hobbies": "バスケ、野球、サッカー",
    "self_introduction": "教育を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "後藤",
    "first_name": "千春",
    "last_name_kana": "やまだ",
    "first_name_kana": "千春",
    "phone_number": "090-1459-1621",
    "email": "member028@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "29",
    "name": "長谷川優子",
    "name_kana": "やまもと優子",
    "photo_url": null,
    "position": "会員",
    "company": "長谷川モータース",
    "department": "部長",
    "member_number": "RC-2020-029",
    "club": "東京ロータリークラブ",
    "occupation_category": "自動車",
    "hometown": "宮城県仙台市",
    "alma_mater": "法政大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "自動車を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "長谷川",
    "first_name": "優子",
    "last_name_kana": "やまも",
    "first_name_kana": "と優子",
    "phone_number": "090-1476-1644",
    "email": "member029@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "30",
    "name": "村上真由美",
    "name_kana": "よしだ真由美",
    "photo_url": null,
    "position": "会員",
    "company": "村上株式会社",
    "department": "部長",
    "member_number": "RC-2019-030",
    "club": "東京ロータリークラブ",
    "occupation_category": "印刷",
    "hometown": "広島県広島市",
    "alma_mater": "青山学院大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "印刷を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "村上",
    "first_name": "真由美",
    "last_name_kana": "よしだ",
    "first_name_kana": "真由美",
    "phone_number": "090-1493-1667",
    "email": "member030@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "31",
    "name": "近藤健太",
    "name_kana": "わたなべ健太",
    "photo_url": null,
    "position": "会員",
    "company": "近藤製作所",
    "department": "部長",
    "member_number": "RC-2018-031",
    "club": "東京ロータリークラブ",
    "occupation_category": "製造業",
    "hometown": "静岡県静岡市",
    "alma_mater": "立教大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "製造業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "近藤",
    "first_name": "健太",
    "last_name_kana": "わたな",
    "first_name_kana": "べ健太",
    "phone_number": "090-1510-1690",
    "email": "member031@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "32",
    "name": "斎藤誠",
    "name_kana": "いしかわ誠",
    "photo_url": null,
    "position": "会員",
    "company": "斎藤株式会社",
    "department": "部長",
    "member_number": "RC-2017-032",
    "club": "東京ロータリークラブ",
    "occupation_category": "エンジニアリング",
    "hometown": "茨城県水戸市",
    "alma_mater": "日本大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "エンジニアリングを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "斎藤",
    "first_name": "誠",
    "last_name_kana": "いしか",
    "first_name_kana": "わ誠",
    "phone_number": "090-1527-1713",
    "email": "member032@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "33",
    "name": "坂本隆",
    "name_kana": "いわさき隆",
    "photo_url": null,
    "position": "会員",
    "company": "坂本株式会社",
    "department": "部長",
    "member_number": "RC-2016-033",
    "club": "東京ロータリークラブ",
    "occupation_category": "デザイン",
    "hometown": "栃木県宇都宮市",
    "alma_mater": "東北大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "デザインを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "坂本",
    "first_name": "隆",
    "last_name_kana": "いわさ",
    "first_name_kana": "き隆",
    "phone_number": "090-1544-1736",
    "email": "member033@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "34",
    "name": "青木浩",
    "name_kana": "うちだ浩",
    "photo_url": null,
    "position": "会長",
    "company": "青木株式会社",
    "department": "代表取締役",
    "member_number": "RC-2015-034",
    "club": "東京ロータリークラブ",
    "occupation_category": "不動産",
    "hometown": "群馬県さいたま市",
    "alma_mater": "九州大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "不動産を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "青木",
    "first_name": "浩",
    "last_name_kana": "うち",
    "first_name_kana": "だ浩",
    "phone_number": "090-1561-1759",
    "email": "member034@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "35",
    "name": "藤井修",
    "name_kana": "おかだ修",
    "photo_url": null,
    "position": "副会長",
    "company": "藤井会計事務所",
    "department": "代表取締役",
    "member_number": "RC-2014-035",
    "club": "東京ロータリークラブ",
    "occupation_category": "会計",
    "hometown": "長野県千葉市",
    "alma_mater": "大阪大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "会計を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "藤井",
    "first_name": "修",
    "last_name_kana": "おか",
    "first_name_kana": "だ修",
    "phone_number": "090-1578-1782",
    "email": "member035@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "36",
    "name": "西村勇",
    "name_kana": "かわむら勇",
    "photo_url": null,
    "position": "幹事",
    "company": "西村株式会社",
    "department": "専務取締役",
    "member_number": "RC-2013-036",
    "club": "東京ロータリークラブ",
    "occupation_category": "商社",
    "hometown": "新潟県川崎市",
    "alma_mater": "名古屋大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "商社を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "西村",
    "first_name": "勇",
    "last_name_kana": "かわむ",
    "first_name_kana": "ら勇",
    "phone_number": "090-1595-1805",
    "email": "member036@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "37",
    "name": "福田太郎",
    "name_kana": "きくち太郎",
    "photo_url": null,
    "position": "会員",
    "company": "福田クリニック",
    "department": "院長",
    "member_number": "RC-2024-037",
    "club": "東京ロータリークラブ",
    "occupation_category": "医療",
    "hometown": "東京都前橋市",
    "alma_mater": "北海道大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "医療を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "福田",
    "first_name": "太郎",
    "last_name_kana": "きくち",
    "first_name_kana": "太郎",
    "phone_number": "090-1612-1828",
    "email": "member037@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "38",
    "name": "太田次郎",
    "name_kana": "くろだ次郎",
    "photo_url": null,
    "position": "会員",
    "company": "太田法律事務所",
    "department": "弁護士",
    "member_number": "RC-2023-038",
    "club": "東京ロータリークラブ",
    "occupation_category": "法律",
    "hometown": "神奈川県長野市",
    "alma_mater": "筑波大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "法律を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "太田",
    "first_name": "次郎",
    "last_name_kana": "くろだ",
    "first_name_kana": "次郎",
    "phone_number": "090-1629-1851",
    "email": "member038@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "39",
    "name": "岡田三郎",
    "name_kana": "こいずみ三郎",
    "photo_url": null,
    "position": "会員",
    "company": "岡田株式会社",
    "department": "部長",
    "member_number": "RC-2022-039",
    "club": "東京ロータリークラブ",
    "occupation_category": "建設業",
    "hometown": "埼玉県新潟市",
    "alma_mater": "神戸大学",
    "hobbies": "映画鑑賞、音楽鑑賞、カラオケ",
    "self_introduction": "建設業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "岡田",
    "first_name": "三郎",
    "last_name_kana": "こいず",
    "first_name_kana": "み三郎",
    "phone_number": "090-1646-1874",
    "email": "member039@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "40",
    "name": "中島一郎",
    "name_kana": "さかい一郎",
    "photo_url": null,
    "position": "会員",
    "company": "中島株式会社",
    "department": "部長",
    "member_number": "RC-2021-040",
    "club": "東京ロータリークラブ",
    "occupation_category": "食品",
    "hometown": "千葉県世田谷区",
    "alma_mater": "広島大学",
    "hobbies": "茶道、華道、書道",
    "self_introduction": "食品を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "中島",
    "first_name": "一郎",
    "last_name_kana": "さかい",
    "first_name_kana": "一郎",
    "phone_number": "090-1663-1897",
    "email": "member040@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "41",
    "name": "藤原光男",
    "name_kana": "ささき光男",
    "photo_url": null,
    "position": "会員",
    "company": "藤原株式会社",
    "department": "部長",
    "member_number": "RC-2020-041",
    "club": "東京ロータリークラブ",
    "occupation_category": "保険",
    "hometown": "大阪府渋谷区",
    "alma_mater": "東京大学",
    "hobbies": "絵画、彫刻、陶芸",
    "self_introduction": "保険を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "藤原",
    "first_name": "光男",
    "last_name_kana": "ささき",
    "first_name_kana": "光男",
    "phone_number": "090-1680-1920",
    "email": "member041@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "42",
    "name": "三浦正義",
    "name_kana": "しばた正義",
    "photo_url": null,
    "position": "会員",
    "company": "三浦建築設計",
    "department": "建築士",
    "member_number": "RC-2019-042",
    "club": "東京ロータリークラブ",
    "occupation_category": "建築",
    "hometown": "京都府港区",
    "alma_mater": "京都大学",
    "hobbies": "バスケ、野球、サッカー",
    "self_introduction": "建築を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "三浦",
    "first_name": "正義",
    "last_name_kana": "しばた",
    "first_name_kana": "正義",
    "phone_number": "090-1697-1943",
    "email": "member042@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "43",
    "name": "原田康夫",
    "name_kana": "すぎやま康夫",
    "photo_url": null,
    "position": "会長",
    "company": "原田学院",
    "department": "代表取締役",
    "member_number": "RC-2018-043",
    "club": "東京ロータリークラブ",
    "occupation_category": "教育",
    "hometown": "兵庫県新宿区",
    "alma_mater": "早稲田大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "教育を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "原田",
    "first_name": "康夫",
    "last_name_kana": "すぎや",
    "first_name_kana": "ま康夫",
    "phone_number": "090-1714-1966",
    "email": "member043@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "44",
    "name": "竹内俊夫",
    "name_kana": "たけうち俊夫",
    "photo_url": null,
    "position": "副会長",
    "company": "竹内モータース",
    "department": "代表取締役",
    "member_number": "RC-2017-044",
    "club": "東京ロータリークラブ",
    "occupation_category": "自動車",
    "hometown": "愛知県品川区",
    "alma_mater": "慶應義塾大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "自動車を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "竹内",
    "first_name": "俊夫",
    "last_name_kana": "たけう",
    "first_name_kana": "ち俊夫",
    "phone_number": "090-1731-1989",
    "email": "member044@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "45",
    "name": "岡本達也",
    "name_kana": "なかの達也",
    "photo_url": null,
    "position": "幹事",
    "company": "岡本株式会社",
    "department": "専務取締役",
    "member_number": "RC-2016-045",
    "club": "東京ロータリークラブ",
    "occupation_category": "印刷",
    "hometown": "福岡県横浜市",
    "alma_mater": "一橋大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "印刷を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "岡本",
    "first_name": "達也",
    "last_name_kana": "なかの",
    "first_name_kana": "達也",
    "phone_number": "090-1748-2012",
    "email": "member045@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "46",
    "name": "金子洋平",
    "name_kana": "はらだ洋平",
    "photo_url": null,
    "position": "会員",
    "company": "金子製作所",
    "department": "部長",
    "member_number": "RC-2015-046",
    "club": "東京ロータリークラブ",
    "occupation_category": "製造業",
    "hometown": "北海道大阪市",
    "alma_mater": "東京工業大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "製造業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "金子",
    "first_name": "洋平",
    "last_name_kana": "はらだ",
    "first_name_kana": "洋平",
    "phone_number": "090-1765-2035",
    "email": "member046@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "47",
    "name": "大野直樹",
    "name_kana": "ふくだ直樹",
    "photo_url": null,
    "position": "会員",
    "company": "大野株式会社",
    "department": "部長",
    "member_number": "RC-2014-047",
    "club": "東京ロータリークラブ",
    "occupation_category": "エンジニアリング",
    "hometown": "宮城県京都市",
    "alma_mater": "明治大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "エンジニアリングを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "大野",
    "first_name": "直樹",
    "last_name_kana": "ふくだ",
    "first_name_kana": "直樹",
    "phone_number": "090-1782-2058",
    "email": "member047@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "48",
    "name": "中野拓也",
    "name_kana": "まえだ拓也",
    "photo_url": null,
    "position": "会員",
    "company": "中野株式会社",
    "department": "部長",
    "member_number": "RC-2013-048",
    "club": "東京ロータリークラブ",
    "occupation_category": "デザイン",
    "hometown": "広島県名古屋市",
    "alma_mater": "中央大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "デザインを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "中野",
    "first_name": "拓也",
    "last_name_kana": "まえだ",
    "first_name_kana": "拓也",
    "phone_number": "090-1799-2081",
    "email": "member048@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "49",
    "name": "石井健二",
    "name_kana": "みやざき健二",
    "photo_url": null,
    "position": "会員",
    "company": "石井株式会社",
    "department": "部長",
    "member_number": "RC-2024-049",
    "club": "東京ロータリークラブ",
    "occupation_category": "不動産",
    "hometown": "静岡県福岡市",
    "alma_mater": "法政大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "不動産を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "石井",
    "first_name": "健二",
    "last_name_kana": "みやざ",
    "first_name_kana": "き健二",
    "phone_number": "090-1816-2104",
    "email": "member049@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "50",
    "name": "平野健一",
    "name_kana": "もりた健一",
    "photo_url": null,
    "position": "会員",
    "company": "平野会計事務所",
    "department": "公認会計士",
    "member_number": "RC-2023-050",
    "club": "東京ロータリークラブ",
    "occupation_category": "会計",
    "hometown": "茨城県札幌市",
    "alma_mater": "青山学院大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "会計を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "平野",
    "first_name": "健一",
    "last_name_kana": "もりた",
    "first_name_kana": "健一",
    "phone_number": "090-1833-2127",
    "email": "member050@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "51",
    "name": "佐藤さくら",
    "name_kana": "あおきさくら",
    "photo_url": null,
    "position": "会員",
    "company": "佐藤株式会社",
    "department": "部長",
    "member_number": "RC-2022-051",
    "club": "東京ロータリークラブ",
    "occupation_category": "商社",
    "hometown": "栃木県仙台市",
    "alma_mater": "立教大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "商社を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "佐藤",
    "first_name": "さくら",
    "last_name_kana": "あおき",
    "first_name_kana": "さくら",
    "phone_number": "090-1850-2150",
    "email": "member051@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "52",
    "name": "鈴木美咲",
    "name_kana": "いとう美咲",
    "photo_url": null,
    "position": "会長",
    "company": "鈴木クリニック",
    "department": "代表取締役",
    "member_number": "RC-2021-052",
    "club": "東京ロータリークラブ",
    "occupation_category": "医療",
    "hometown": "群馬県広島市",
    "alma_mater": "日本大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "医療を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "鈴木",
    "first_name": "美咲",
    "last_name_kana": "いとう",
    "first_name_kana": "美咲",
    "phone_number": "090-1867-2173",
    "email": "member052@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "53",
    "name": "高橋恵子",
    "name_kana": "うえだ恵子",
    "photo_url": null,
    "position": "副会長",
    "company": "高橋法律事務所",
    "department": "代表取締役",
    "member_number": "RC-2020-053",
    "club": "東京ロータリークラブ",
    "occupation_category": "法律",
    "hometown": "長野県静岡市",
    "alma_mater": "東北大学",
    "hobbies": "映画鑑賞、音楽鑑賞、カラオケ",
    "self_introduction": "法律を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "高橋",
    "first_name": "恵子",
    "last_name_kana": "うえだ",
    "first_name_kana": "恵子",
    "phone_number": "090-1884-2196",
    "email": "member053@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "54",
    "name": "田中真理",
    "name_kana": "えぐち真理",
    "photo_url": null,
    "position": "幹事",
    "company": "田中株式会社",
    "department": "専務取締役",
    "member_number": "RC-2019-054",
    "club": "東京ロータリークラブ",
    "occupation_category": "建設業",
    "hometown": "新潟県水戸市",
    "alma_mater": "九州大学",
    "hobbies": "茶道、華道、書道",
    "self_introduction": "建設業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "田中",
    "first_name": "真理",
    "last_name_kana": "えぐち",
    "first_name_kana": "真理",
    "phone_number": "090-1901-2219",
    "email": "member054@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "55",
    "name": "伊藤花子",
    "name_kana": "おおの花子",
    "photo_url": null,
    "position": "会員",
    "company": "伊藤株式会社",
    "department": "部長",
    "member_number": "RC-2018-055",
    "club": "東京ロータリークラブ",
    "occupation_category": "食品",
    "hometown": "東京都宇都宮市",
    "alma_mater": "大阪大学",
    "hobbies": "絵画、彫刻、陶芸",
    "self_introduction": "食品を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "伊藤",
    "first_name": "花子",
    "last_name_kana": "おおの",
    "first_name_kana": "花子",
    "phone_number": "090-1918-2242",
    "email": "member055@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "56",
    "name": "渡辺由美",
    "name_kana": "かとう由美",
    "photo_url": null,
    "position": "会員",
    "company": "渡辺株式会社",
    "department": "部長",
    "member_number": "RC-2017-056",
    "club": "東京ロータリークラブ",
    "occupation_category": "保険",
    "hometown": "神奈川県さいたま市",
    "alma_mater": "名古屋大学",
    "hobbies": "バスケ、野球、サッカー",
    "self_introduction": "保険を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "渡辺",
    "first_name": "由美",
    "last_name_kana": "かとう",
    "first_name_kana": "由美",
    "phone_number": "090-1935-2265",
    "email": "member056@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "57",
    "name": "山本美香",
    "name_kana": "きむら美香",
    "photo_url": null,
    "position": "会員",
    "company": "山本建築設計",
    "department": "建築士",
    "member_number": "RC-2016-057",
    "club": "東京ロータリークラブ",
    "occupation_category": "建築",
    "hometown": "埼玉県千葉市",
    "alma_mater": "北海道大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "建築を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "山本",
    "first_name": "美香",
    "last_name_kana": "きむら",
    "first_name_kana": "美香",
    "phone_number": "090-1952-2288",
    "email": "member057@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "58",
    "name": "中村千春",
    "name_kana": "くぼた千春",
    "photo_url": null,
    "position": "会員",
    "company": "中村学院",
    "department": "部長",
    "member_number": "RC-2015-058",
    "club": "東京ロータリークラブ",
    "occupation_category": "教育",
    "hometown": "千葉県川崎市",
    "alma_mater": "筑波大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "教育を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "中村",
    "first_name": "千春",
    "last_name_kana": "くぼた",
    "first_name_kana": "千春",
    "phone_number": "090-1969-2311",
    "email": "member058@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "59",
    "name": "小林優子",
    "name_kana": "こばやし優子",
    "photo_url": null,
    "position": "会員",
    "company": "小林モータース",
    "department": "部長",
    "member_number": "RC-2014-059",
    "club": "東京ロータリークラブ",
    "occupation_category": "自動車",
    "hometown": "大阪府前橋市",
    "alma_mater": "神戸大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "自動車を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "小林",
    "first_name": "優子",
    "last_name_kana": "こばや",
    "first_name_kana": "し優子",
    "phone_number": "090-1986-2334",
    "email": "member059@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "60",
    "name": "加藤真由美",
    "name_kana": "さいとう真由美",
    "photo_url": null,
    "position": "会員",
    "company": "加藤株式会社",
    "department": "部長",
    "member_number": "RC-2013-060",
    "club": "東京ロータリークラブ",
    "occupation_category": "印刷",
    "hometown": "京都府長野市",
    "alma_mater": "広島大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "印刷を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "加藤",
    "first_name": "真由美",
    "last_name_kana": "さいとう",
    "first_name_kana": "真由美",
    "phone_number": "090-2003-2357",
    "email": "member060@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "61",
    "name": "吉田健太",
    "name_kana": "さとう健太",
    "photo_url": null,
    "position": "会長",
    "company": "吉田製作所",
    "department": "代表取締役",
    "member_number": "RC-2024-061",
    "club": "東京ロータリークラブ",
    "occupation_category": "製造業",
    "hometown": "兵庫県新潟市",
    "alma_mater": "東京大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "製造業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "吉田",
    "first_name": "健太",
    "last_name_kana": "さとう",
    "first_name_kana": "健太",
    "phone_number": "090-2020-2380",
    "email": "member061@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "62",
    "name": "山田誠",
    "name_kana": "しみず誠",
    "photo_url": null,
    "position": "副会長",
    "company": "山田株式会社",
    "department": "代表取締役",
    "member_number": "RC-2023-062",
    "club": "東京ロータリークラブ",
    "occupation_category": "エンジニアリング",
    "hometown": "愛知県世田谷区",
    "alma_mater": "京都大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "エンジニアリングを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "山田",
    "first_name": "誠",
    "last_name_kana": "しみ",
    "first_name_kana": "ず誠",
    "phone_number": "090-2037-2403",
    "email": "member062@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "63",
    "name": "佐々木隆",
    "name_kana": "すずき隆",
    "photo_url": null,
    "position": "幹事",
    "company": "佐々木株式会社",
    "department": "専務取締役",
    "member_number": "RC-2022-063",
    "club": "東京ロータリークラブ",
    "occupation_category": "デザイン",
    "hometown": "福岡県渋谷区",
    "alma_mater": "早稲田大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "デザインを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "佐々木",
    "first_name": "隆",
    "last_name_kana": "すず",
    "first_name_kana": "き隆",
    "phone_number": "090-2054-2426",
    "email": "member063@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "64",
    "name": "山口浩",
    "name_kana": "せきぐち浩",
    "photo_url": null,
    "position": "会員",
    "company": "山口株式会社",
    "department": "部長",
    "member_number": "RC-2021-064",
    "club": "東京ロータリークラブ",
    "occupation_category": "不動産",
    "hometown": "北海道港区",
    "alma_mater": "慶應義塾大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "不動産を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "山口",
    "first_name": "浩",
    "last_name_kana": "せきぐ",
    "first_name_kana": "ち浩",
    "phone_number": "090-2071-2449",
    "email": "member064@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "65",
    "name": "松本修",
    "name_kana": "たかはし修",
    "photo_url": null,
    "position": "会員",
    "company": "松本会計事務所",
    "department": "公認会計士",
    "member_number": "RC-2020-065",
    "club": "東京ロータリークラブ",
    "occupation_category": "会計",
    "hometown": "宮城県新宿区",
    "alma_mater": "一橋大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "会計を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "松本",
    "first_name": "修",
    "last_name_kana": "たかは",
    "first_name_kana": "し修",
    "phone_number": "090-2088-2472",
    "email": "member065@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "66",
    "name": "井上勇",
    "name_kana": "たなか勇",
    "photo_url": null,
    "position": "会員",
    "company": "井上株式会社",
    "department": "部長",
    "member_number": "RC-2019-066",
    "club": "東京ロータリークラブ",
    "occupation_category": "商社",
    "hometown": "広島県品川区",
    "alma_mater": "東京工業大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "商社を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "井上",
    "first_name": "勇",
    "last_name_kana": "たな",
    "first_name_kana": "か勇",
    "phone_number": "090-2105-2495",
    "email": "member066@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "67",
    "name": "木村太郎",
    "name_kana": "つちや太郎",
    "photo_url": null,
    "position": "会員",
    "company": "木村クリニック",
    "department": "院長",
    "member_number": "RC-2018-067",
    "club": "東京ロータリークラブ",
    "occupation_category": "医療",
    "hometown": "静岡県横浜市",
    "alma_mater": "明治大学",
    "hobbies": "映画鑑賞、音楽鑑賞、カラオケ",
    "self_introduction": "医療を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "木村",
    "first_name": "太郎",
    "last_name_kana": "つちや",
    "first_name_kana": "太郎",
    "phone_number": "090-2122-2518",
    "email": "member067@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "68",
    "name": "林次郎",
    "name_kana": "なかむら次郎",
    "photo_url": null,
    "position": "会員",
    "company": "林法律事務所",
    "department": "弁護士",
    "member_number": "RC-2017-068",
    "club": "東京ロータリークラブ",
    "occupation_category": "法律",
    "hometown": "茨城県大阪市",
    "alma_mater": "中央大学",
    "hobbies": "茶道、華道、書道",
    "self_introduction": "法律を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "林次",
    "first_name": "郎",
    "last_name_kana": "なかむ",
    "first_name_kana": "ら次郎",
    "phone_number": "090-2139-2541",
    "email": "member068@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "69",
    "name": "清水三郎",
    "name_kana": "にしむら三郎",
    "photo_url": null,
    "position": "会員",
    "company": "清水株式会社",
    "department": "部長",
    "member_number": "RC-2016-069",
    "club": "東京ロータリークラブ",
    "occupation_category": "建設業",
    "hometown": "栃木県京都市",
    "alma_mater": "法政大学",
    "hobbies": "絵画、彫刻、陶芸",
    "self_introduction": "建設業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "清水",
    "first_name": "三郎",
    "last_name_kana": "にしむ",
    "first_name_kana": "ら三郎",
    "phone_number": "090-2156-2564",
    "email": "member069@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "70",
    "name": "山崎一郎",
    "name_kana": "のむら一郎",
    "photo_url": null,
    "position": "会長",
    "company": "山崎株式会社",
    "department": "代表取締役",
    "member_number": "RC-2015-070",
    "club": "東京ロータリークラブ",
    "occupation_category": "食品",
    "hometown": "群馬県名古屋市",
    "alma_mater": "青山学院大学",
    "hobbies": "バスケ、野球、サッカー",
    "self_introduction": "食品を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "山崎",
    "first_name": "一郎",
    "last_name_kana": "のむら",
    "first_name_kana": "一郎",
    "phone_number": "090-2173-2587",
    "email": "member070@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "71",
    "name": "森光男",
    "name_kana": "はしもと光男",
    "photo_url": null,
    "position": "副会長",
    "company": "森株式会社",
    "department": "代表取締役",
    "member_number": "RC-2014-071",
    "club": "東京ロータリークラブ",
    "occupation_category": "保険",
    "hometown": "長野県福岡市",
    "alma_mater": "立教大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "保険を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "森光",
    "first_name": "男",
    "last_name_kana": "はしも",
    "first_name_kana": "と光男",
    "phone_number": "090-2190-2610",
    "email": "member071@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "72",
    "name": "池田正義",
    "name_kana": "はやし正義",
    "photo_url": null,
    "position": "幹事",
    "company": "池田建築設計",
    "department": "専務取締役",
    "member_number": "RC-2013-072",
    "club": "東京ロータリークラブ",
    "occupation_category": "建築",
    "hometown": "新潟県札幌市",
    "alma_mater": "日本大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "建築を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "池田",
    "first_name": "正義",
    "last_name_kana": "はやし",
    "first_name_kana": "正義",
    "phone_number": "090-2207-2633",
    "email": "member072@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "73",
    "name": "橋本康夫",
    "name_kana": "ひらの康夫",
    "photo_url": null,
    "position": "会員",
    "company": "橋本学院",
    "department": "部長",
    "member_number": "RC-2024-073",
    "club": "東京ロータリークラブ",
    "occupation_category": "教育",
    "hometown": "東京都仙台市",
    "alma_mater": "東北大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "教育を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "橋本",
    "first_name": "康夫",
    "last_name_kana": "ひらの",
    "first_name_kana": "康夫",
    "phone_number": "090-2224-2656",
    "email": "member073@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "74",
    "name": "阿部俊夫",
    "name_kana": "ふじた俊夫",
    "photo_url": null,
    "position": "会員",
    "company": "阿部モータース",
    "department": "部長",
    "member_number": "RC-2023-074",
    "club": "東京ロータリークラブ",
    "occupation_category": "自動車",
    "hometown": "神奈川県広島市",
    "alma_mater": "九州大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "自動車を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "阿部",
    "first_name": "俊夫",
    "last_name_kana": "ふじた",
    "first_name_kana": "俊夫",
    "phone_number": "090-2241-2679",
    "email": "member074@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "75",
    "name": "石川達也",
    "name_kana": "まつもと達也",
    "photo_url": null,
    "position": "会員",
    "company": "石川株式会社",
    "department": "部長",
    "member_number": "RC-2022-075",
    "club": "東京ロータリークラブ",
    "occupation_category": "印刷",
    "hometown": "埼玉県静岡市",
    "alma_mater": "大阪大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "印刷を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "石川",
    "first_name": "達也",
    "last_name_kana": "まつも",
    "first_name_kana": "と達也",
    "phone_number": "090-2258-2702",
    "email": "member075@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "76",
    "name": "前田洋平",
    "name_kana": "みうら洋平",
    "photo_url": null,
    "position": "会員",
    "company": "前田製作所",
    "department": "部長",
    "member_number": "RC-2021-076",
    "club": "東京ロータリークラブ",
    "occupation_category": "製造業",
    "hometown": "千葉県水戸市",
    "alma_mater": "名古屋大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "製造業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "前田",
    "first_name": "洋平",
    "last_name_kana": "みうら",
    "first_name_kana": "洋平",
    "phone_number": "090-2275-2725",
    "email": "member076@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "77",
    "name": "藤田直樹",
    "name_kana": "むらかみ直樹",
    "photo_url": null,
    "position": "会員",
    "company": "藤田株式会社",
    "department": "部長",
    "member_number": "RC-2020-077",
    "club": "東京ロータリークラブ",
    "occupation_category": "エンジニアリング",
    "hometown": "大阪府宇都宮市",
    "alma_mater": "北海道大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "エンジニアリングを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "藤田",
    "first_name": "直樹",
    "last_name_kana": "むらか",
    "first_name_kana": "み直樹",
    "phone_number": "090-2292-2748",
    "email": "member077@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "78",
    "name": "後藤拓也",
    "name_kana": "やまだ拓也",
    "photo_url": null,
    "position": "会員",
    "company": "後藤株式会社",
    "department": "部長",
    "member_number": "RC-2019-078",
    "club": "東京ロータリークラブ",
    "occupation_category": "デザイン",
    "hometown": "京都府さいたま市",
    "alma_mater": "筑波大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "デザインを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "後藤",
    "first_name": "拓也",
    "last_name_kana": "やまだ",
    "first_name_kana": "拓也",
    "phone_number": "090-2309-2771",
    "email": "member078@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "79",
    "name": "長谷川健二",
    "name_kana": "やまもと健二",
    "photo_url": null,
    "position": "会長",
    "company": "長谷川株式会社",
    "department": "代表取締役",
    "member_number": "RC-2018-079",
    "club": "東京ロータリークラブ",
    "occupation_category": "不動産",
    "hometown": "兵庫県千葉市",
    "alma_mater": "神戸大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "不動産を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "長谷川",
    "first_name": "健二",
    "last_name_kana": "やまも",
    "first_name_kana": "と健二",
    "phone_number": "090-2326-2794",
    "email": "member079@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "80",
    "name": "村上健一",
    "name_kana": "よしだ健一",
    "photo_url": null,
    "position": "副会長",
    "company": "村上会計事務所",
    "department": "代表取締役",
    "member_number": "RC-2017-080",
    "club": "東京ロータリークラブ",
    "occupation_category": "会計",
    "hometown": "愛知県川崎市",
    "alma_mater": "広島大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "会計を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "村上",
    "first_name": "健一",
    "last_name_kana": "よしだ",
    "first_name_kana": "健一",
    "phone_number": "090-2343-2817",
    "email": "member080@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "81",
    "name": "近藤さくら",
    "name_kana": "わたなべさくら",
    "photo_url": null,
    "position": "幹事",
    "company": "近藤株式会社",
    "department": "専務取締役",
    "member_number": "RC-2016-081",
    "club": "東京ロータリークラブ",
    "occupation_category": "商社",
    "hometown": "福岡県前橋市",
    "alma_mater": "東京大学",
    "hobbies": "映画鑑賞、音楽鑑賞、カラオケ",
    "self_introduction": "商社を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "近藤",
    "first_name": "さくら",
    "last_name_kana": "わたなべ",
    "first_name_kana": "さくら",
    "phone_number": "090-2360-2840",
    "email": "member081@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "82",
    "name": "斎藤美咲",
    "name_kana": "いしかわ美咲",
    "photo_url": null,
    "position": "会員",
    "company": "斎藤クリニック",
    "department": "院長",
    "member_number": "RC-2015-082",
    "club": "東京ロータリークラブ",
    "occupation_category": "医療",
    "hometown": "北海道長野市",
    "alma_mater": "京都大学",
    "hobbies": "茶道、華道、書道",
    "self_introduction": "医療を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "斎藤",
    "first_name": "美咲",
    "last_name_kana": "いしか",
    "first_name_kana": "わ美咲",
    "phone_number": "090-2377-2863",
    "email": "member082@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "83",
    "name": "坂本恵子",
    "name_kana": "いわさき恵子",
    "photo_url": null,
    "position": "会員",
    "company": "坂本法律事務所",
    "department": "弁護士",
    "member_number": "RC-2014-083",
    "club": "東京ロータリークラブ",
    "occupation_category": "法律",
    "hometown": "宮城県新潟市",
    "alma_mater": "早稲田大学",
    "hobbies": "絵画、彫刻、陶芸",
    "self_introduction": "法律を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "坂本",
    "first_name": "恵子",
    "last_name_kana": "いわさ",
    "first_name_kana": "き恵子",
    "phone_number": "090-2394-2886",
    "email": "member083@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "84",
    "name": "青木真理",
    "name_kana": "うちだ真理",
    "photo_url": null,
    "position": "会員",
    "company": "青木株式会社",
    "department": "部長",
    "member_number": "RC-2013-084",
    "club": "東京ロータリークラブ",
    "occupation_category": "建設業",
    "hometown": "広島県世田谷区",
    "alma_mater": "慶應義塾大学",
    "hobbies": "バスケ、野球、サッカー",
    "self_introduction": "建設業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "青木",
    "first_name": "真理",
    "last_name_kana": "うちだ",
    "first_name_kana": "真理",
    "phone_number": "090-2411-2909",
    "email": "member084@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "85",
    "name": "藤井花子",
    "name_kana": "おかだ花子",
    "photo_url": null,
    "position": "会員",
    "company": "藤井株式会社",
    "department": "部長",
    "member_number": "RC-2024-085",
    "club": "東京ロータリークラブ",
    "occupation_category": "食品",
    "hometown": "静岡県渋谷区",
    "alma_mater": "一橋大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "食品を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "藤井",
    "first_name": "花子",
    "last_name_kana": "おかだ",
    "first_name_kana": "花子",
    "phone_number": "090-2428-2932",
    "email": "member085@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "86",
    "name": "西村由美",
    "name_kana": "かわむら由美",
    "photo_url": null,
    "position": "会員",
    "company": "西村株式会社",
    "department": "部長",
    "member_number": "RC-2023-086",
    "club": "東京ロータリークラブ",
    "occupation_category": "保険",
    "hometown": "茨城県港区",
    "alma_mater": "東京工業大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "保険を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "西村",
    "first_name": "由美",
    "last_name_kana": "かわむ",
    "first_name_kana": "ら由美",
    "phone_number": "090-2445-2955",
    "email": "member086@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "87",
    "name": "福田美香",
    "name_kana": "きくち美香",
    "photo_url": null,
    "position": "会員",
    "company": "福田建築設計",
    "department": "建築士",
    "member_number": "RC-2022-087",
    "club": "東京ロータリークラブ",
    "occupation_category": "建築",
    "hometown": "栃木県新宿区",
    "alma_mater": "明治大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "建築を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "福田",
    "first_name": "美香",
    "last_name_kana": "きくち",
    "first_name_kana": "美香",
    "phone_number": "090-2462-2978",
    "email": "member087@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "88",
    "name": "太田千春",
    "name_kana": "くろだ千春",
    "photo_url": null,
    "position": "会長",
    "company": "太田学院",
    "department": "代表取締役",
    "member_number": "RC-2021-088",
    "club": "東京ロータリークラブ",
    "occupation_category": "教育",
    "hometown": "群馬県品川区",
    "alma_mater": "中央大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "教育を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "太田",
    "first_name": "千春",
    "last_name_kana": "くろだ",
    "first_name_kana": "千春",
    "phone_number": "090-2479-3001",
    "email": "member088@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "89",
    "name": "岡田優子",
    "name_kana": "こいずみ優子",
    "photo_url": null,
    "position": "副会長",
    "company": "岡田モータース",
    "department": "代表取締役",
    "member_number": "RC-2020-089",
    "club": "東京ロータリークラブ",
    "occupation_category": "自動車",
    "hometown": "長野県横浜市",
    "alma_mater": "法政大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "自動車を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "岡田",
    "first_name": "優子",
    "last_name_kana": "こいず",
    "first_name_kana": "み優子",
    "phone_number": "090-2496-3024",
    "email": "member089@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "90",
    "name": "中島真由美",
    "name_kana": "さかい真由美",
    "photo_url": null,
    "position": "幹事",
    "company": "中島株式会社",
    "department": "専務取締役",
    "member_number": "RC-2019-090",
    "club": "東京ロータリークラブ",
    "occupation_category": "印刷",
    "hometown": "新潟県大阪市",
    "alma_mater": "青山学院大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "印刷を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "中島",
    "first_name": "真由美",
    "last_name_kana": "さかい",
    "first_name_kana": "真由美",
    "phone_number": "090-2513-3047",
    "email": "member090@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "91",
    "name": "藤原健太",
    "name_kana": "ささき健太",
    "photo_url": null,
    "position": "会員",
    "company": "藤原製作所",
    "department": "部長",
    "member_number": "RC-2018-091",
    "club": "東京ロータリークラブ",
    "occupation_category": "製造業",
    "hometown": "東京都京都市",
    "alma_mater": "立教大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "製造業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "藤原",
    "first_name": "健太",
    "last_name_kana": "ささき",
    "first_name_kana": "健太",
    "phone_number": "090-2530-3070",
    "email": "member091@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "92",
    "name": "三浦誠",
    "name_kana": "しばた誠",
    "photo_url": null,
    "position": "会員",
    "company": "三浦株式会社",
    "department": "部長",
    "member_number": "RC-2017-092",
    "club": "東京ロータリークラブ",
    "occupation_category": "エンジニアリング",
    "hometown": "神奈川県名古屋市",
    "alma_mater": "日本大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "エンジニアリングを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "三浦",
    "first_name": "誠",
    "last_name_kana": "しば",
    "first_name_kana": "た誠",
    "phone_number": "090-2547-3093",
    "email": "member092@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "93",
    "name": "原田隆",
    "name_kana": "すぎやま隆",
    "photo_url": null,
    "position": "会員",
    "company": "原田株式会社",
    "department": "部長",
    "member_number": "RC-2016-093",
    "club": "東京ロータリークラブ",
    "occupation_category": "デザイン",
    "hometown": "埼玉県福岡市",
    "alma_mater": "東北大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "デザインを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "原田",
    "first_name": "隆",
    "last_name_kana": "すぎや",
    "first_name_kana": "ま隆",
    "phone_number": "090-2564-3116",
    "email": "member093@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "94",
    "name": "竹内浩",
    "name_kana": "たけうち浩",
    "photo_url": null,
    "position": "会員",
    "company": "竹内株式会社",
    "department": "部長",
    "member_number": "RC-2015-094",
    "club": "東京ロータリークラブ",
    "occupation_category": "不動産",
    "hometown": "千葉県札幌市",
    "alma_mater": "九州大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "不動産を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "竹内",
    "first_name": "浩",
    "last_name_kana": "たけう",
    "first_name_kana": "ち浩",
    "phone_number": "090-2581-3139",
    "email": "member094@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "95",
    "name": "岡本修",
    "name_kana": "なかの修",
    "photo_url": null,
    "position": "会員",
    "company": "岡本会計事務所",
    "department": "公認会計士",
    "member_number": "RC-2014-095",
    "club": "東京ロータリークラブ",
    "occupation_category": "会計",
    "hometown": "大阪府仙台市",
    "alma_mater": "大阪大学",
    "hobbies": "映画鑑賞、音楽鑑賞、カラオケ",
    "self_introduction": "会計を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "岡本",
    "first_name": "修",
    "last_name_kana": "なか",
    "first_name_kana": "の修",
    "phone_number": "090-2598-3162",
    "email": "member095@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "96",
    "name": "金子勇",
    "name_kana": "はらだ勇",
    "photo_url": null,
    "position": "会員",
    "company": "金子株式会社",
    "department": "部長",
    "member_number": "RC-2013-096",
    "club": "東京ロータリークラブ",
    "occupation_category": "商社",
    "hometown": "京都府広島市",
    "alma_mater": "名古屋大学",
    "hobbies": "茶道、華道、書道",
    "self_introduction": "商社を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "金子",
    "first_name": "勇",
    "last_name_kana": "はら",
    "first_name_kana": "だ勇",
    "phone_number": "090-2615-3185",
    "email": "member096@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "97",
    "name": "大野太郎",
    "name_kana": "ふくだ太郎",
    "photo_url": null,
    "position": "会長",
    "company": "大野クリニック",
    "department": "代表取締役",
    "member_number": "RC-2024-097",
    "club": "東京ロータリークラブ",
    "occupation_category": "医療",
    "hometown": "兵庫県静岡市",
    "alma_mater": "北海道大学",
    "hobbies": "絵画、彫刻、陶芸",
    "self_introduction": "医療を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "大野",
    "first_name": "太郎",
    "last_name_kana": "ふくだ",
    "first_name_kana": "太郎",
    "phone_number": "090-2632-3208",
    "email": "member097@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "98",
    "name": "中野次郎",
    "name_kana": "まえだ次郎",
    "photo_url": null,
    "position": "副会長",
    "company": "中野法律事務所",
    "department": "代表取締役",
    "member_number": "RC-2023-098",
    "club": "東京ロータリークラブ",
    "occupation_category": "法律",
    "hometown": "愛知県水戸市",
    "alma_mater": "筑波大学",
    "hobbies": "バスケ、野球、サッカー",
    "self_introduction": "法律を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "中野",
    "first_name": "次郎",
    "last_name_kana": "まえだ",
    "first_name_kana": "次郎",
    "phone_number": "090-2649-3231",
    "email": "member098@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "99",
    "name": "石井三郎",
    "name_kana": "みやざき三郎",
    "photo_url": null,
    "position": "幹事",
    "company": "石井株式会社",
    "department": "専務取締役",
    "member_number": "RC-2022-099",
    "club": "東京ロータリークラブ",
    "occupation_category": "建設業",
    "hometown": "福岡県宇都宮市",
    "alma_mater": "神戸大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "建設業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "石井",
    "first_name": "三郎",
    "last_name_kana": "みやざ",
    "first_name_kana": "き三郎",
    "phone_number": "090-2666-3254",
    "email": "member099@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "100",
    "name": "平野一郎",
    "name_kana": "もりた一郎",
    "photo_url": null,
    "position": "会員",
    "company": "平野株式会社",
    "department": "部長",
    "member_number": "RC-2021-100",
    "club": "東京ロータリークラブ",
    "occupation_category": "食品",
    "hometown": "北海道さいたま市",
    "alma_mater": "広島大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "食品を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "平野",
    "first_name": "一郎",
    "last_name_kana": "もりた",
    "first_name_kana": "一郎",
    "phone_number": "090-2683-3277",
    "email": "member100@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "101",
    "name": "佐藤光男",
    "name_kana": "あおき光男",
    "photo_url": null,
    "position": "会員",
    "company": "佐藤株式会社",
    "department": "部長",
    "member_number": "RC-2020-101",
    "club": "東京ロータリークラブ",
    "occupation_category": "保険",
    "hometown": "宮城県千葉市",
    "alma_mater": "東京大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "保険を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "佐藤",
    "first_name": "光男",
    "last_name_kana": "あおき",
    "first_name_kana": "光男",
    "phone_number": "090-2700-3300",
    "email": "member101@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "102",
    "name": "鈴木正義",
    "name_kana": "いとう正義",
    "photo_url": null,
    "position": "会員",
    "company": "鈴木建築設計",
    "department": "建築士",
    "member_number": "RC-2019-102",
    "club": "東京ロータリークラブ",
    "occupation_category": "建築",
    "hometown": "広島県川崎市",
    "alma_mater": "京都大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "建築を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "鈴木",
    "first_name": "正義",
    "last_name_kana": "いとう",
    "first_name_kana": "正義",
    "phone_number": "090-2717-3323",
    "email": "member102@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "103",
    "name": "高橋康夫",
    "name_kana": "うえだ康夫",
    "photo_url": null,
    "position": "会員",
    "company": "高橋学院",
    "department": "部長",
    "member_number": "RC-2018-103",
    "club": "東京ロータリークラブ",
    "occupation_category": "教育",
    "hometown": "静岡県前橋市",
    "alma_mater": "早稲田大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "教育を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "高橋",
    "first_name": "康夫",
    "last_name_kana": "うえだ",
    "first_name_kana": "康夫",
    "phone_number": "090-2734-3346",
    "email": "member103@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "104",
    "name": "田中俊夫",
    "name_kana": "えぐち俊夫",
    "photo_url": null,
    "position": "会員",
    "company": "田中モータース",
    "department": "部長",
    "member_number": "RC-2017-104",
    "club": "東京ロータリークラブ",
    "occupation_category": "自動車",
    "hometown": "茨城県長野市",
    "alma_mater": "慶應義塾大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "自動車を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "田中",
    "first_name": "俊夫",
    "last_name_kana": "えぐち",
    "first_name_kana": "俊夫",
    "phone_number": "090-2751-3369",
    "email": "member104@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "105",
    "name": "伊藤達也",
    "name_kana": "おおの達也",
    "photo_url": null,
    "position": "会員",
    "company": "伊藤株式会社",
    "department": "部長",
    "member_number": "RC-2016-105",
    "club": "東京ロータリークラブ",
    "occupation_category": "印刷",
    "hometown": "栃木県新潟市",
    "alma_mater": "一橋大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "印刷を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "伊藤",
    "first_name": "達也",
    "last_name_kana": "おおの",
    "first_name_kana": "達也",
    "phone_number": "090-2768-3392",
    "email": "member105@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "106",
    "name": "渡辺洋平",
    "name_kana": "かとう洋平",
    "photo_url": null,
    "position": "会長",
    "company": "渡辺製作所",
    "department": "代表取締役",
    "member_number": "RC-2015-106",
    "club": "東京ロータリークラブ",
    "occupation_category": "製造業",
    "hometown": "群馬県世田谷区",
    "alma_mater": "東京工業大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "製造業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "渡辺",
    "first_name": "洋平",
    "last_name_kana": "かとう",
    "first_name_kana": "洋平",
    "phone_number": "090-2785-3415",
    "email": "member106@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "107",
    "name": "山本直樹",
    "name_kana": "きむら直樹",
    "photo_url": null,
    "position": "副会長",
    "company": "山本株式会社",
    "department": "代表取締役",
    "member_number": "RC-2014-107",
    "club": "東京ロータリークラブ",
    "occupation_category": "エンジニアリング",
    "hometown": "長野県渋谷区",
    "alma_mater": "明治大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "エンジニアリングを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "山本",
    "first_name": "直樹",
    "last_name_kana": "きむら",
    "first_name_kana": "直樹",
    "phone_number": "090-2802-3438",
    "email": "member107@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "108",
    "name": "中村拓也",
    "name_kana": "くぼた拓也",
    "photo_url": null,
    "position": "幹事",
    "company": "中村株式会社",
    "department": "専務取締役",
    "member_number": "RC-2013-108",
    "club": "東京ロータリークラブ",
    "occupation_category": "デザイン",
    "hometown": "新潟県港区",
    "alma_mater": "中央大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "デザインを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "中村",
    "first_name": "拓也",
    "last_name_kana": "くぼた",
    "first_name_kana": "拓也",
    "phone_number": "090-2819-3461",
    "email": "member108@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "109",
    "name": "小林健二",
    "name_kana": "こばやし健二",
    "photo_url": null,
    "position": "会員",
    "company": "小林株式会社",
    "department": "部長",
    "member_number": "RC-2024-109",
    "club": "東京ロータリークラブ",
    "occupation_category": "不動産",
    "hometown": "東京都新宿区",
    "alma_mater": "法政大学",
    "hobbies": "映画鑑賞、音楽鑑賞、カラオケ",
    "self_introduction": "不動産を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "小林",
    "first_name": "健二",
    "last_name_kana": "こばや",
    "first_name_kana": "し健二",
    "phone_number": "090-2836-3484",
    "email": "member109@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "110",
    "name": "加藤健一",
    "name_kana": "さいとう健一",
    "photo_url": null,
    "position": "会員",
    "company": "加藤会計事務所",
    "department": "公認会計士",
    "member_number": "RC-2023-110",
    "club": "東京ロータリークラブ",
    "occupation_category": "会計",
    "hometown": "神奈川県品川区",
    "alma_mater": "青山学院大学",
    "hobbies": "茶道、華道、書道",
    "self_introduction": "会計を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "加藤",
    "first_name": "健一",
    "last_name_kana": "さいと",
    "first_name_kana": "う健一",
    "phone_number": "090-2853-3507",
    "email": "member110@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "111",
    "name": "吉田さくら",
    "name_kana": "さとうさくら",
    "photo_url": null,
    "position": "会員",
    "company": "吉田株式会社",
    "department": "部長",
    "member_number": "RC-2022-111",
    "club": "東京ロータリークラブ",
    "occupation_category": "商社",
    "hometown": "埼玉県横浜市",
    "alma_mater": "立教大学",
    "hobbies": "絵画、彫刻、陶芸",
    "self_introduction": "商社を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "吉田",
    "first_name": "さくら",
    "last_name_kana": "さとう",
    "first_name_kana": "さくら",
    "phone_number": "090-2870-3530",
    "email": "member111@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "112",
    "name": "山田美咲",
    "name_kana": "しみず美咲",
    "photo_url": null,
    "position": "会員",
    "company": "山田クリニック",
    "department": "院長",
    "member_number": "RC-2021-112",
    "club": "東京ロータリークラブ",
    "occupation_category": "医療",
    "hometown": "千葉県大阪市",
    "alma_mater": "日本大学",
    "hobbies": "バスケ、野球、サッカー",
    "self_introduction": "医療を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "山田",
    "first_name": "美咲",
    "last_name_kana": "しみず",
    "first_name_kana": "美咲",
    "phone_number": "090-2887-3553",
    "email": "member112@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "113",
    "name": "佐々木恵子",
    "name_kana": "すずき恵子",
    "photo_url": null,
    "position": "会員",
    "company": "佐々木法律事務所",
    "department": "弁護士",
    "member_number": "RC-2020-113",
    "club": "東京ロータリークラブ",
    "occupation_category": "法律",
    "hometown": "大阪府京都市",
    "alma_mater": "東北大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "法律を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "佐々木",
    "first_name": "恵子",
    "last_name_kana": "すずき",
    "first_name_kana": "恵子",
    "phone_number": "090-2904-3576",
    "email": "member113@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "114",
    "name": "山口真理",
    "name_kana": "せきぐち真理",
    "photo_url": null,
    "position": "会員",
    "company": "山口株式会社",
    "department": "部長",
    "member_number": "RC-2019-114",
    "club": "東京ロータリークラブ",
    "occupation_category": "建設業",
    "hometown": "京都府名古屋市",
    "alma_mater": "九州大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "建設業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "山口",
    "first_name": "真理",
    "last_name_kana": "せきぐ",
    "first_name_kana": "ち真理",
    "phone_number": "090-2921-3599",
    "email": "member114@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "115",
    "name": "松本花子",
    "name_kana": "たかはし花子",
    "photo_url": null,
    "position": "会長",
    "company": "松本株式会社",
    "department": "代表取締役",
    "member_number": "RC-2018-115",
    "club": "東京ロータリークラブ",
    "occupation_category": "食品",
    "hometown": "兵庫県福岡市",
    "alma_mater": "大阪大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "食品を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "松本",
    "first_name": "花子",
    "last_name_kana": "たかは",
    "first_name_kana": "し花子",
    "phone_number": "090-2938-3622",
    "email": "member115@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "116",
    "name": "井上由美",
    "name_kana": "たなか由美",
    "photo_url": null,
    "position": "副会長",
    "company": "井上株式会社",
    "department": "代表取締役",
    "member_number": "RC-2017-116",
    "club": "東京ロータリークラブ",
    "occupation_category": "保険",
    "hometown": "愛知県札幌市",
    "alma_mater": "名古屋大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "保険を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "井上",
    "first_name": "由美",
    "last_name_kana": "たなか",
    "first_name_kana": "由美",
    "phone_number": "090-2955-3645",
    "email": "member116@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "117",
    "name": "木村美香",
    "name_kana": "つちや美香",
    "photo_url": null,
    "position": "幹事",
    "company": "木村建築設計",
    "department": "専務取締役",
    "member_number": "RC-2016-117",
    "club": "東京ロータリークラブ",
    "occupation_category": "建築",
    "hometown": "福岡県仙台市",
    "alma_mater": "北海道大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "建築を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "木村",
    "first_name": "美香",
    "last_name_kana": "つちや",
    "first_name_kana": "美香",
    "phone_number": "090-2972-3668",
    "email": "member117@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "118",
    "name": "林千春",
    "name_kana": "なかむら千春",
    "photo_url": null,
    "position": "会員",
    "company": "林学院",
    "department": "部長",
    "member_number": "RC-2015-118",
    "club": "東京ロータリークラブ",
    "occupation_category": "教育",
    "hometown": "北海道広島市",
    "alma_mater": "筑波大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "教育を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "林千",
    "first_name": "春",
    "last_name_kana": "なかむ",
    "first_name_kana": "ら千春",
    "phone_number": "090-2989-3691",
    "email": "member118@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "119",
    "name": "清水優子",
    "name_kana": "にしむら優子",
    "photo_url": null,
    "position": "会員",
    "company": "清水モータース",
    "department": "部長",
    "member_number": "RC-2014-119",
    "club": "東京ロータリークラブ",
    "occupation_category": "自動車",
    "hometown": "宮城県静岡市",
    "alma_mater": "神戸大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "自動車を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "清水",
    "first_name": "優子",
    "last_name_kana": "にしむ",
    "first_name_kana": "ら優子",
    "phone_number": "090-3006-3714",
    "email": "member119@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "120",
    "name": "山崎真由美",
    "name_kana": "のむら真由美",
    "photo_url": null,
    "position": "会員",
    "company": "山崎株式会社",
    "department": "部長",
    "member_number": "RC-2013-120",
    "club": "東京ロータリークラブ",
    "occupation_category": "印刷",
    "hometown": "広島県水戸市",
    "alma_mater": "広島大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "印刷を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "山崎",
    "first_name": "真由美",
    "last_name_kana": "のむら",
    "first_name_kana": "真由美",
    "phone_number": "090-3023-3737",
    "email": "member120@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "121",
    "name": "森健太",
    "name_kana": "はしもと健太",
    "photo_url": null,
    "position": "会員",
    "company": "森製作所",
    "department": "部長",
    "member_number": "RC-2024-121",
    "club": "東京ロータリークラブ",
    "occupation_category": "製造業",
    "hometown": "静岡県宇都宮市",
    "alma_mater": "東京大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "製造業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "森健",
    "first_name": "太",
    "last_name_kana": "はしも",
    "first_name_kana": "と健太",
    "phone_number": "090-3040-3760",
    "email": "member121@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "122",
    "name": "池田誠",
    "name_kana": "はやし誠",
    "photo_url": null,
    "position": "会員",
    "company": "池田株式会社",
    "department": "部長",
    "member_number": "RC-2023-122",
    "club": "東京ロータリークラブ",
    "occupation_category": "エンジニアリング",
    "hometown": "茨城県さいたま市",
    "alma_mater": "京都大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "エンジニアリングを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "池田",
    "first_name": "誠",
    "last_name_kana": "はや",
    "first_name_kana": "し誠",
    "phone_number": "090-3057-3783",
    "email": "member122@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "123",
    "name": "橋本隆",
    "name_kana": "ひらの隆",
    "photo_url": null,
    "position": "会員",
    "company": "橋本株式会社",
    "department": "部長",
    "member_number": "RC-2022-123",
    "club": "東京ロータリークラブ",
    "occupation_category": "デザイン",
    "hometown": "栃木県千葉市",
    "alma_mater": "早稲田大学",
    "hobbies": "映画鑑賞、音楽鑑賞、カラオケ",
    "self_introduction": "デザインを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "橋本",
    "first_name": "隆",
    "last_name_kana": "ひら",
    "first_name_kana": "の隆",
    "phone_number": "090-3074-3806",
    "email": "member123@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "124",
    "name": "阿部浩",
    "name_kana": "ふじた浩",
    "photo_url": null,
    "position": "会長",
    "company": "阿部株式会社",
    "department": "代表取締役",
    "member_number": "RC-2021-124",
    "club": "東京ロータリークラブ",
    "occupation_category": "不動産",
    "hometown": "群馬県川崎市",
    "alma_mater": "慶應義塾大学",
    "hobbies": "茶道、華道、書道",
    "self_introduction": "不動産を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "阿部",
    "first_name": "浩",
    "last_name_kana": "ふじ",
    "first_name_kana": "た浩",
    "phone_number": "090-3091-3829",
    "email": "member124@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "125",
    "name": "石川修",
    "name_kana": "まつもと修",
    "photo_url": null,
    "position": "副会長",
    "company": "石川会計事務所",
    "department": "代表取締役",
    "member_number": "RC-2020-125",
    "club": "東京ロータリークラブ",
    "occupation_category": "会計",
    "hometown": "長野県前橋市",
    "alma_mater": "一橋大学",
    "hobbies": "絵画、彫刻、陶芸",
    "self_introduction": "会計を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "石川",
    "first_name": "修",
    "last_name_kana": "まつも",
    "first_name_kana": "と修",
    "phone_number": "090-3108-3852",
    "email": "member125@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "126",
    "name": "前田勇",
    "name_kana": "みうら勇",
    "photo_url": null,
    "position": "幹事",
    "company": "前田株式会社",
    "department": "専務取締役",
    "member_number": "RC-2019-126",
    "club": "東京ロータリークラブ",
    "occupation_category": "商社",
    "hometown": "新潟県長野市",
    "alma_mater": "東京工業大学",
    "hobbies": "バスケ、野球、サッカー",
    "self_introduction": "商社を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "前田",
    "first_name": "勇",
    "last_name_kana": "みう",
    "first_name_kana": "ら勇",
    "phone_number": "090-3125-3875",
    "email": "member126@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "127",
    "name": "藤田太郎",
    "name_kana": "むらかみ太郎",
    "photo_url": null,
    "position": "会員",
    "company": "藤田クリニック",
    "department": "院長",
    "member_number": "RC-2018-127",
    "club": "東京ロータリークラブ",
    "occupation_category": "医療",
    "hometown": "東京都新潟市",
    "alma_mater": "明治大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "医療を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "藤田",
    "first_name": "太郎",
    "last_name_kana": "むらか",
    "first_name_kana": "み太郎",
    "phone_number": "090-3142-3898",
    "email": "member127@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "128",
    "name": "後藤次郎",
    "name_kana": "やまだ次郎",
    "photo_url": null,
    "position": "会員",
    "company": "後藤法律事務所",
    "department": "弁護士",
    "member_number": "RC-2017-128",
    "club": "東京ロータリークラブ",
    "occupation_category": "法律",
    "hometown": "神奈川県世田谷区",
    "alma_mater": "中央大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "法律を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "後藤",
    "first_name": "次郎",
    "last_name_kana": "やまだ",
    "first_name_kana": "次郎",
    "phone_number": "090-3159-3921",
    "email": "member128@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "129",
    "name": "長谷川三郎",
    "name_kana": "やまもと三郎",
    "photo_url": null,
    "position": "会員",
    "company": "長谷川株式会社",
    "department": "部長",
    "member_number": "RC-2016-129",
    "club": "東京ロータリークラブ",
    "occupation_category": "建設業",
    "hometown": "埼玉県渋谷区",
    "alma_mater": "法政大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "建設業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "長谷川",
    "first_name": "三郎",
    "last_name_kana": "やまも",
    "first_name_kana": "と三郎",
    "phone_number": "090-3176-3944",
    "email": "member129@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "130",
    "name": "村上一郎",
    "name_kana": "よしだ一郎",
    "photo_url": null,
    "position": "会員",
    "company": "村上株式会社",
    "department": "部長",
    "member_number": "RC-2015-130",
    "club": "東京ロータリークラブ",
    "occupation_category": "食品",
    "hometown": "千葉県港区",
    "alma_mater": "青山学院大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "食品を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "村上",
    "first_name": "一郎",
    "last_name_kana": "よしだ",
    "first_name_kana": "一郎",
    "phone_number": "090-3193-3967",
    "email": "member130@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "131",
    "name": "近藤光男",
    "name_kana": "わたなべ光男",
    "photo_url": null,
    "position": "会員",
    "company": "近藤株式会社",
    "department": "部長",
    "member_number": "RC-2014-131",
    "club": "東京ロータリークラブ",
    "occupation_category": "保険",
    "hometown": "大阪府新宿区",
    "alma_mater": "立教大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "保険を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "近藤",
    "first_name": "光男",
    "last_name_kana": "わたな",
    "first_name_kana": "べ光男",
    "phone_number": "090-3210-3990",
    "email": "member131@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "132",
    "name": "斎藤正義",
    "name_kana": "いしかわ正義",
    "photo_url": null,
    "position": "会員",
    "company": "斎藤建築設計",
    "department": "建築士",
    "member_number": "RC-2013-132",
    "club": "東京ロータリークラブ",
    "occupation_category": "建築",
    "hometown": "京都府品川区",
    "alma_mater": "日本大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "建築を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "斎藤",
    "first_name": "正義",
    "last_name_kana": "いしか",
    "first_name_kana": "わ正義",
    "phone_number": "090-3227-4013",
    "email": "member132@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "133",
    "name": "坂本康夫",
    "name_kana": "いわさき康夫",
    "photo_url": null,
    "position": "会長",
    "company": "坂本学院",
    "department": "代表取締役",
    "member_number": "RC-2024-133",
    "club": "東京ロータリークラブ",
    "occupation_category": "教育",
    "hometown": "兵庫県横浜市",
    "alma_mater": "東北大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "教育を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "坂本",
    "first_name": "康夫",
    "last_name_kana": "いわさ",
    "first_name_kana": "き康夫",
    "phone_number": "090-3244-4036",
    "email": "member133@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "134",
    "name": "青木俊夫",
    "name_kana": "うちだ俊夫",
    "photo_url": null,
    "position": "副会長",
    "company": "青木モータース",
    "department": "代表取締役",
    "member_number": "RC-2023-134",
    "club": "東京ロータリークラブ",
    "occupation_category": "自動車",
    "hometown": "愛知県大阪市",
    "alma_mater": "九州大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "自動車を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "青木",
    "first_name": "俊夫",
    "last_name_kana": "うちだ",
    "first_name_kana": "俊夫",
    "phone_number": "090-3261-4059",
    "email": "member134@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "135",
    "name": "藤井達也",
    "name_kana": "おかだ達也",
    "photo_url": null,
    "position": "幹事",
    "company": "藤井株式会社",
    "department": "専務取締役",
    "member_number": "RC-2022-135",
    "club": "東京ロータリークラブ",
    "occupation_category": "印刷",
    "hometown": "福岡県京都市",
    "alma_mater": "大阪大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "印刷を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "藤井",
    "first_name": "達也",
    "last_name_kana": "おかだ",
    "first_name_kana": "達也",
    "phone_number": "090-3278-4082",
    "email": "member135@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "136",
    "name": "西村洋平",
    "name_kana": "かわむら洋平",
    "photo_url": null,
    "position": "会員",
    "company": "西村製作所",
    "department": "部長",
    "member_number": "RC-2021-136",
    "club": "東京ロータリークラブ",
    "occupation_category": "製造業",
    "hometown": "北海道名古屋市",
    "alma_mater": "名古屋大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "製造業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "西村",
    "first_name": "洋平",
    "last_name_kana": "かわむ",
    "first_name_kana": "ら洋平",
    "phone_number": "090-3295-4105",
    "email": "member136@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "137",
    "name": "福田直樹",
    "name_kana": "きくち直樹",
    "photo_url": null,
    "position": "会員",
    "company": "福田株式会社",
    "department": "部長",
    "member_number": "RC-2020-137",
    "club": "東京ロータリークラブ",
    "occupation_category": "エンジニアリング",
    "hometown": "宮城県福岡市",
    "alma_mater": "北海道大学",
    "hobbies": "映画鑑賞、音楽鑑賞、カラオケ",
    "self_introduction": "エンジニアリングを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "福田",
    "first_name": "直樹",
    "last_name_kana": "きくち",
    "first_name_kana": "直樹",
    "phone_number": "090-3312-4128",
    "email": "member137@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "138",
    "name": "太田拓也",
    "name_kana": "くろだ拓也",
    "photo_url": null,
    "position": "会員",
    "company": "太田株式会社",
    "department": "部長",
    "member_number": "RC-2019-138",
    "club": "東京ロータリークラブ",
    "occupation_category": "デザイン",
    "hometown": "広島県札幌市",
    "alma_mater": "筑波大学",
    "hobbies": "茶道、華道、書道",
    "self_introduction": "デザインを通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "太田",
    "first_name": "拓也",
    "last_name_kana": "くろだ",
    "first_name_kana": "拓也",
    "phone_number": "090-3329-4151",
    "email": "member138@club.rotary.jp",
    "join_date": "2019-06-08"
  },
  {
    "id": "139",
    "name": "岡田健二",
    "name_kana": "こいずみ健二",
    "photo_url": null,
    "position": "会員",
    "company": "岡田株式会社",
    "department": "部長",
    "member_number": "RC-2018-139",
    "club": "東京ロータリークラブ",
    "occupation_category": "不動産",
    "hometown": "静岡県仙台市",
    "alma_mater": "神戸大学",
    "hobbies": "絵画、彫刻、陶芸",
    "self_introduction": "不動産を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2018",
    "last_name": "岡田",
    "first_name": "健二",
    "last_name_kana": "こいず",
    "first_name_kana": "み健二",
    "phone_number": "090-3346-4174",
    "email": "member139@rotary.jp",
    "join_date": "2018-07-15"
  },
  {
    "id": "140",
    "name": "中島健一",
    "name_kana": "さかい健一",
    "photo_url": null,
    "position": "会員",
    "company": "中島会計事務所",
    "department": "公認会計士",
    "member_number": "RC-2017-140",
    "club": "東京ロータリークラブ",
    "occupation_category": "会計",
    "hometown": "茨城県広島市",
    "alma_mater": "広島大学",
    "hobbies": "バスケ、野球、サッカー",
    "self_introduction": "会計を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2017",
    "last_name": "中島",
    "first_name": "健一",
    "last_name_kana": "さかい",
    "first_name_kana": "健一",
    "phone_number": "090-3363-4197",
    "email": "member140@example.com",
    "join_date": "2017-08-22"
  },
  {
    "id": "141",
    "name": "藤原さくら",
    "name_kana": "ささきさくら",
    "photo_url": null,
    "position": "会員",
    "company": "藤原株式会社",
    "department": "部長",
    "member_number": "RC-2016-141",
    "club": "東京ロータリークラブ",
    "occupation_category": "商社",
    "hometown": "栃木県静岡市",
    "alma_mater": "東京大学",
    "hobbies": "ゴルフ、ランニング、読書",
    "self_introduction": "商社を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2016",
    "last_name": "藤原",
    "first_name": "さくら",
    "last_name_kana": "ささき",
    "first_name_kana": "さくら",
    "phone_number": "090-3380-4220",
    "email": "member141@club.rotary.jp",
    "join_date": "2016-09-01"
  },
  {
    "id": "142",
    "name": "三浦美咲",
    "name_kana": "しばた美咲",
    "photo_url": null,
    "position": "会長",
    "company": "三浦クリニック",
    "department": "代表取締役",
    "member_number": "RC-2015-142",
    "club": "東京ロータリークラブ",
    "occupation_category": "医療",
    "hometown": "群馬県水戸市",
    "alma_mater": "京都大学",
    "hobbies": "テニス、ヨガ、料理",
    "self_introduction": "医療を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2015",
    "last_name": "三浦",
    "first_name": "美咲",
    "last_name_kana": "しばた",
    "first_name_kana": "美咲",
    "phone_number": "090-3397-4243",
    "email": "member142@rotary.jp",
    "join_date": "2015-10-08"
  },
  {
    "id": "143",
    "name": "原田恵子",
    "name_kana": "すぎやま恵子",
    "photo_url": null,
    "position": "副会長",
    "company": "原田法律事務所",
    "department": "代表取締役",
    "member_number": "RC-2014-143",
    "club": "東京ロータリークラブ",
    "occupation_category": "法律",
    "hometown": "長野県宇都宮市",
    "alma_mater": "早稲田大学",
    "hobbies": "写真、旅行、カメラ",
    "self_introduction": "法律を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2014",
    "last_name": "原田",
    "first_name": "恵子",
    "last_name_kana": "すぎや",
    "first_name_kana": "ま恵子",
    "phone_number": "090-3414-4266",
    "email": "member143@example.com",
    "join_date": "2014-11-15"
  },
  {
    "id": "144",
    "name": "竹内真理",
    "name_kana": "たけうち真理",
    "photo_url": null,
    "position": "幹事",
    "company": "竹内株式会社",
    "department": "専務取締役",
    "member_number": "RC-2013-144",
    "club": "東京ロータリークラブ",
    "occupation_category": "建設業",
    "hometown": "新潟県さいたま市",
    "alma_mater": "慶應義塾大学",
    "hobbies": "登山、スキー、温泉",
    "self_introduction": "建設業を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2013",
    "last_name": "竹内",
    "first_name": "真理",
    "last_name_kana": "たけう",
    "first_name_kana": "ち真理",
    "phone_number": "090-3431-4289",
    "email": "member144@club.rotary.jp",
    "join_date": "2013-12-22"
  },
  {
    "id": "145",
    "name": "岡本花子",
    "name_kana": "なかの花子",
    "photo_url": null,
    "position": "会員",
    "company": "岡本株式会社",
    "department": "部長",
    "member_number": "RC-2024-145",
    "club": "東京ロータリークラブ",
    "occupation_category": "食品",
    "hometown": "東京都千葉市",
    "alma_mater": "一橋大学",
    "hobbies": "釣り、ワイン、囲碁",
    "self_introduction": "食品を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2024",
    "last_name": "岡本",
    "first_name": "花子",
    "last_name_kana": "なかの",
    "first_name_kana": "花子",
    "phone_number": "090-3448-4312",
    "email": "member145@rotary.jp",
    "join_date": "2024-01-01"
  },
  {
    "id": "146",
    "name": "金子由美",
    "name_kana": "はらだ由美",
    "photo_url": null,
    "position": "会員",
    "company": "金子株式会社",
    "department": "部長",
    "member_number": "RC-2023-146",
    "club": "東京ロータリークラブ",
    "occupation_category": "保険",
    "hometown": "神奈川県川崎市",
    "alma_mater": "東京工業大学",
    "hobbies": "プログラミング、読書、将棋",
    "self_introduction": "保険を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2023",
    "last_name": "金子",
    "first_name": "由美",
    "last_name_kana": "はらだ",
    "first_name_kana": "由美",
    "phone_number": "090-3465-4335",
    "email": "member146@example.com",
    "join_date": "2023-02-08"
  },
  {
    "id": "147",
    "name": "大野美香",
    "name_kana": "ふくだ美香",
    "photo_url": null,
    "position": "会員",
    "company": "大野建築設計",
    "department": "建築士",
    "member_number": "RC-2022-147",
    "club": "東京ロータリークラブ",
    "occupation_category": "建築",
    "hometown": "埼玉県前橋市",
    "alma_mater": "明治大学",
    "hobbies": "美術館巡り、カフェ巡り、ピアノ",
    "self_introduction": "建築を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2022",
    "last_name": "大野",
    "first_name": "美香",
    "last_name_kana": "ふくだ",
    "first_name_kana": "美香",
    "phone_number": "090-3482-4358",
    "email": "member147@club.rotary.jp",
    "join_date": "2022-03-15"
  },
  {
    "id": "148",
    "name": "中野千春",
    "name_kana": "まえだ千春",
    "photo_url": null,
    "position": "会員",
    "company": "中野学院",
    "department": "部長",
    "member_number": "RC-2021-148",
    "club": "東京ロータリークラブ",
    "occupation_category": "教育",
    "hometown": "千葉県長野市",
    "alma_mater": "中央大学",
    "hobbies": "ジョギング、マラソン、水泳",
    "self_introduction": "教育を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2021",
    "last_name": "中野",
    "first_name": "千春",
    "last_name_kana": "まえだ",
    "first_name_kana": "千春",
    "phone_number": "090-3499-4381",
    "email": "member148@rotary.jp",
    "join_date": "2021-04-22"
  },
  {
    "id": "149",
    "name": "石井優子",
    "name_kana": "みやざき優子",
    "photo_url": null,
    "position": "会員",
    "company": "石井モータース",
    "department": "部長",
    "member_number": "RC-2020-149",
    "club": "東京ロータリークラブ",
    "occupation_category": "自動車",
    "hometown": "大阪府新潟市",
    "alma_mater": "法政大学",
    "hobbies": "ガーデニング、料理教室、アート鑑賞",
    "self_introduction": "自動車を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2020",
    "last_name": "石井",
    "first_name": "優子",
    "last_name_kana": "みやざ",
    "first_name_kana": "き優子",
    "phone_number": "090-3516-4404",
    "email": "member149@example.com",
    "join_date": "2020-05-01"
  },
  {
    "id": "150",
    "name": "平野真由美",
    "name_kana": "もりた真由美",
    "photo_url": null,
    "position": "会員",
    "company": "平野株式会社",
    "department": "部長",
    "member_number": "RC-2019-150",
    "club": "東京ロータリークラブ",
    "occupation_category": "印刷",
    "hometown": "京都府世田谷区",
    "alma_mater": "青山学院大学",
    "hobbies": "サーフィン、ドライブ、キャンプ",
    "self_introduction": "印刷を通じて社会に貢献したいと考えています。",
    "profile_public": true,
    "join_year": "2019",
    "last_name": "平野",
    "first_name": "真由美",
    "last_name_kana": "もりた",
    "first_name_kana": "真由美",
    "phone_number": "090-3533-4427",
    "email": "member150@club.rotary.jp",
    "join_date": "2019-06-08"
  }
]
;
    mockMembers.sort((a, b) => {
      const kanaA = a.name_kana || '';
      const kanaB = b.name_kana || '';
      return kanaA.localeCompare(kanaB, 'ja');
    });
    
    setMembers(mockMembers);
  };

  const openMemberDetail = (member) => {
    setSelectedMember(member);
  };

  const closeMemberDetail = () => {
    setSelectedMember(null);
  };

  const jumpToKana = (kana) => {
    const filteredMembers = getFilteredMembers();
    const targetMember = filteredMembers.find(m => {
      const firstChar = m.name_kana?.charAt(0) || '';
      return firstChar >= kana && firstChar < String.fromCharCode(kana.charCodeAt(0) + 1);
    });
    
    if (targetMember) {
      const element = document.getElementById(`member-${targetMember.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // トップにスクロール
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 共通点を見つける関数
  const findCommonPoints = (member) => {
    if (!currentUser) return [];
    const commonPoints = [];

    // 職業分類が同じ
    if (member.occupation_category === currentUser.occupation_category) {
      commonPoints.push({ type: 'occupation', label: '同じ職業分類' });
    }

    // 出身地が同じ
    if (member.hometown === currentUser.hometown) {
      commonPoints.push({ type: 'hometown', label: '同郷' });
    }

    // 出身校が同じ
    if (member.alma_mater === currentUser.alma_mater) {
      commonPoints.push({ type: 'alma_mater', label: '同窓生' });
    }

    // 趣味が共通
    if (member.hobbies && currentUser.hobbies) {
      const memberHobbies = member.hobbies.split(/[、,]/).map(h => h.trim().toLowerCase());
      const userHobbies = currentUser.hobbies.split(/[、,]/).map(h => h.trim().toLowerCase());
      const commonHobbies = memberHobbies.filter(h => userHobbies.includes(h));
      if (commonHobbies.length > 0) {
        commonPoints.push({ type: 'hobby', label: '共通の趣味', details: commonHobbies });
      }
    }

    return commonPoints;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20 relative">
      <style>{styles}</style>
      
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-4 mb-6">
          <User className="w-12 h-12" />
          <h1 className="text-3xl font-bold leading-tight">会員名簿</h1>
        </div>

        {/* タブ */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('own')}
            className={`flex-1 py-4 rounded-xl text-xl font-bold transition-all shadow-md ${
              activeTab === 'own'
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900'
                : 'bg-blue-800 text-white hover:bg-blue-700'
            }`}
          >
            自クラブ
          </button>
          <button
            disabled
            className="flex-1 py-4 rounded-xl text-xl font-bold transition-all shadow-md bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
          >
            他クラブ（開発中）
          </button>
        </div>
      </div>

      {/* 検索バー */}
      <div className="bg-white shadow-md p-4 sticky top-[168px] z-30">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="氏名、会社、趣味、出身地、出身校で検索"
              className="w-full px-5 py-4 pr-12 rounded-xl border-2 border-gray-300 focus:border-yellow-400 focus:outline-none text-xl leading-relaxed shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 p-4 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center w-14 h-14"
          >
            <SlidersHorizontal className="w-7 h-7" />
          </button>
        </div>

        {/* フィルターチップとクリアボタン */}
        {(selectedOccupation !== 'all' || selectedYear !== 'all' || selectedPosition !== 'all' || yearRangeStart || yearRangeEnd) && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedOccupation !== 'all' && (
              <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg border border-blue-300">
                <span className="text-sm font-bold text-blue-800">💼 {selectedOccupation}</span>
                <button
                  onClick={() => setSelectedOccupation('all')}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  ✕
                </button>
              </div>
            )}
            
            {selectedYear !== 'all' && (
              <div className="inline-flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg border border-green-300">
                <span className="text-sm font-bold text-green-800">📅 {selectedYear}年</span>
                <button
                  onClick={() => setSelectedYear('all')}
                  className="text-green-600 hover:text-green-800 font-bold"
                >
                  ✕
                </button>
              </div>
            )}
            
            {(yearRangeStart || yearRangeEnd) && (
              <div className="inline-flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg border border-green-300">
                <span className="text-sm font-bold text-green-800">
                  📅 {yearRangeStart || '~'}年 〜 {yearRangeEnd || '~'}年
                </span>
                <button
                  onClick={() => {
                    setYearRangeStart('');
                    setYearRangeEnd('');
                  }}
                  className="text-green-600 hover:text-green-800 font-bold"
                >
                  ✕
                </button>
              </div>
            )}
            
            {selectedPosition !== 'all' && (
              <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-2 rounded-lg border border-purple-300">
                <span className="text-sm font-bold text-purple-800">🎯 {selectedPosition}</span>
                <button
                  onClick={() => setSelectedPosition('all')}
                  className="text-purple-600 hover:text-purple-800 font-bold"
                >
                  ✕
                </button>
              </div>
            )}
            
            {/* すべてクリアボタン */}
            <button
              onClick={() => {
                setSelectedOccupation('all');
                setSelectedYear('all');
                setSelectedPosition('all');
                setYearRangeStart('');
                setYearRangeEnd('');
              }}
              className="inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg text-sm font-bold text-gray-700 transition-colors"
            >
              すべてクリア
            </button>
          </div>
        )}
      </div>

      {/* 会員詳細モーダル */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 animate-fade-in">
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl">
            {/* ヘッダー */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-t-3xl shadow-lg z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold leading-tight">会員詳細</h2>
                <button
                  onClick={closeMemberDetail}
                  className="text-white hover:text-yellow-400 text-4xl leading-none transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 詳細内容 */}
            <div className="p-6 space-y-6">
              {/* プロフィール写真 */}
              <div className="flex justify-center pb-6 border-b-2 border-gray-200">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg ring-4 ring-yellow-400 ring-offset-2">
                  {selectedMember.photo_url ? (
                    <img src={selectedMember.photo_url} alt={selectedMember.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-blue-700" />
                  )}
                </div>
              </div>

              {/* 1. ロータリー基本情報 */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-900 pb-2 border-b-2 border-blue-200">
                  📋 ロータリー基本情報
                </h3>
                <InfoRow label="会員番号" value={selectedMember.member_number} />
                {selectedMember.join_date && (
                  <InfoRow label="入会年月日" value={selectedMember.join_date} />
                )}
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-base text-gray-600 mb-2 leading-relaxed">姓名</p>
                  <p className="text-2xl font-bold text-gray-900 leading-relaxed">
                    {selectedMember.last_name} {selectedMember.first_name}
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-base text-gray-600 mb-2 leading-relaxed">ふりがな</p>
                  <p className="text-xl font-bold text-gray-700 leading-relaxed">
                    {selectedMember.last_name_kana} {selectedMember.first_name_kana}
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-base text-gray-600 mb-2 leading-relaxed">役職（クラブ内での役割）</p>
                  <p className="text-xl font-bold text-blue-700 leading-relaxed">{selectedMember.position}</p>
                </div>
              </div>

              {/* 2. 職業・事業所情報 */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-900 pb-2 border-b-2 border-blue-200">
                  💼 職業・事業所情報
                </h3>
                <InfoRow label="職業分類" value={selectedMember.occupation_category} />
                <InfoRow label="会社名・屋号・団体名" value={selectedMember.company} />
                <InfoRow label="所属部署 / 役職" value={selectedMember.department} />
              </div>

              {/* 3. 連絡先 */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-900 pb-2 border-b-2 border-blue-200">
                  📞 連絡先
                </h3>
                {selectedMember.phone_number && (
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-base text-gray-600 mb-2 leading-relaxed">電話番号</p>
                    <a 
                      href={`tel:${selectedMember.phone_number}`}
                      className="text-xl font-bold text-blue-600 leading-relaxed hover:text-blue-800 underline"
                    >
                      {selectedMember.phone_number}
                    </a>
                  </div>
                )}
                {selectedMember.email && (
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-base text-gray-600 mb-2 leading-relaxed">メールアドレス</p>
                    <a 
                      href={`mailto:${selectedMember.email}`}
                      className="text-lg font-bold text-blue-600 leading-relaxed hover:text-blue-800 underline break-all"
                    >
                      {selectedMember.email}
                    </a>
                  </div>
                )}
              </div>

              {/* 4. パーソナル・親睦 */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-900 pb-2 border-b-2 border-blue-200">
                  🤝 パーソナル・親睦
                </h3>
                
                {selectedMember.hometown && (
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-base text-gray-600 mb-2 leading-relaxed">🏠 出身地</p>
                    <p className="text-xl font-bold text-gray-900 leading-relaxed">{selectedMember.hometown}</p>
                  </div>
                )}
                
                {selectedMember.alma_mater && (
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-base text-gray-600 mb-2 leading-relaxed">🎓 出身校</p>
                    <p className="text-xl font-bold text-gray-900 leading-relaxed">{selectedMember.alma_mater}</p>
                  </div>
                )}
                
                {selectedMember.hobbies && (
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-base text-gray-600 mb-3 leading-relaxed">
                      ❤️ 趣味・特技
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.hobbies.split(/[、,]/).map((hobby, index) => (
                        <span key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-2 rounded-full text-base font-semibold text-yellow-800 border border-yellow-300 shadow-sm">
                          {hobby.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedMember.self_introduction && (
                  <div className="pb-4">
                    <p className="text-base text-gray-600 mb-3 leading-relaxed">
                      📝 自己紹介
                    </p>
                    <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                      {selectedMember.self_introduction}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 安全領域（iPhone対応） */}
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* フィルターボトムシート */}
      {showFilters && (
        <>
          {/* 背景オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowFilters(false)}
          />
          
          {/* ボトムシート */}
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 animate-slide-up max-h-[85vh] overflow-y-auto">
            {/* ヘッダー */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-t-3xl shadow-lg z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold leading-tight flex items-center gap-3">
                  <Filter className="w-8 h-8" />
                  絞り込み
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-white hover:text-yellow-400 text-4xl leading-none transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* フィルター内容 */}
            <div className="p-6 space-y-8">
              {/* 職業分類 - チップ選択 */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3 leading-tight flex items-center gap-2">
                  💼 職業分類
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedOccupation('all')}
                    className={`py-4 px-3 rounded-xl text-base font-bold transition-all min-h-[56px] ${
                      selectedOccupation === 'all'
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 shadow-md'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-400'
                    }`}
                  >
                    すべて
                  </button>
                  {occupations.map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setSelectedOccupation(occ)}
                      className={`py-4 px-3 rounded-xl text-base font-bold transition-all min-h-[56px] ${
                        selectedOccupation === occ
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 shadow-md'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-400'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* 入会年度 */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3 leading-tight flex items-center gap-2">
                  📅 入会年度
                </label>
                
                {/* 年度選択 */}
                <div className="mb-4">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      if (e.target.value !== 'all') {
                        setYearRangeStart('');
                        setYearRangeEnd('');
                      }
                    }}
                    className="w-full px-3 py-3 rounded-lg text-base font-bold border-2 border-gray-300 focus:border-yellow-400 bg-white"
                  >
                    <option value="all">すべて</option>
                    {joinYears.map((year) => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                  </select>
                </div>

                {/* 範囲指定 */}
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                  <p className="text-base font-bold text-gray-700 mb-3 leading-tight">期間で絞り込み</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2 leading-tight">開始年</label>
                      <select
                        value={yearRangeStart}
                        onChange={(e) => {
                          setYearRangeStart(e.target.value);
                          if (e.target.value || yearRangeEnd) {
                            setSelectedYear('all');
                          }
                        }}
                        className="w-full px-3 py-3 rounded-lg text-base font-bold border-2 border-gray-300 focus:border-yellow-400 bg-white"
                      >
                        <option value="">--</option>
                        {joinYears.map((year) => (
                          <option key={year} value={year}>{year}年</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2 leading-tight">終了年</label>
                      <select
                        value={yearRangeEnd}
                        onChange={(e) => {
                          setYearRangeEnd(e.target.value);
                          if (yearRangeStart || e.target.value) {
                            setSelectedYear('all');
                          }
                        }}
                        className="w-full px-3 py-3 rounded-lg text-base font-bold border-2 border-gray-300 focus:border-yellow-400 bg-white"
                      >
                        <option value="">--</option>
                        {joinYears.map((year) => (
                          <option key={year} value={year}>{year}年</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 役職 - チップ選択 */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3 leading-tight flex items-center gap-2">
                  🎯 役職
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedPosition('all')}
                    className={`py-4 px-3 rounded-xl text-base font-bold transition-all min-h-[56px] ${
                      selectedPosition === 'all'
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 shadow-md'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-400'
                    }`}
                  >
                    すべて
                  </button>
                  {positions.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSelectedPosition(pos)}
                      className={`py-4 px-3 rounded-xl text-base font-bold transition-all min-h-[56px] ${
                        selectedPosition === pos
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 shadow-md'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-400'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedOccupation('all');
                    setSelectedYear('all');
                    setSelectedPosition('all');
                    setYearRangeStart('');
                    setYearRangeEnd('');
                  }}
                  className="py-4 bg-gray-200 text-gray-700 rounded-xl text-lg font-bold shadow-md hover:bg-gray-300 active:scale-95 transition-all"
                >
                  クリア
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-xl text-lg font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  適用
                </button>
              </div>
            </div>

            {/* 安全領域（iPhone対応） */}
            <div className="h-safe-area-inset-bottom" />
          </div>
        </>
      )}

      <div className="relative">
        {/* 会員リスト */}
        <div ref={listRef} className="p-4 pb-24 pr-24">
          {/* 検索結果件数表示 */}
          {(searchTerm || selectedOccupation !== 'all' || selectedYear !== 'all' || selectedPosition !== 'all') && (
            <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 shadow-md border-2 border-blue-200">
              <p className="text-2xl text-blue-900 font-bold leading-relaxed flex items-center gap-3">
                <span className="text-3xl">🔍</span>
                検索結果: {getFilteredMembers().length}件
              </p>
              {searchTerm && (
                <p className="text-lg text-gray-700 mt-2 leading-relaxed">
                  キーワード: <span className="font-bold text-blue-700">「{searchTerm}」</span>
                </p>
              )}
            </div>
          )}

          {getFilteredMembers().length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500 leading-loose">
                条件に一致する会員が見つかりませんでした
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedOccupation('all');
                  setSelectedYear('all');
                  setSelectedPosition('all');
                }}
                className="mt-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-8 py-4 rounded-xl text-xl font-bold shadow-md hover:shadow-lg active:scale-98 transition-all"
              >
                検索条件をクリア
              </button>
            </div>
          ) : (
            getFilteredMembers().map((member) => {
              const firstHobby = member.hobbies?.split('、')[0] || member.hobbies?.split(',')[0];
              const hasViewed = Math.random() > 0.5; // 実際はDBから取得
              const commonPoints = findCommonPoints(member);
              
              return (
                <div
                  key={member.id}
                  id={`member-${member.id}`}
                  onClick={() => openMemberDetail(member)}
                  className="bg-white rounded-2xl p-6 mb-5 shadow-md hover:shadow-xl active:shadow-lg active:scale-98 transition-all cursor-pointer border border-gray-100"
                >
                  <div className="flex items-start gap-5">
                    {/* プロフィール写真 */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-yellow-400 ring-offset-2">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-14 h-14 text-blue-700" />
                      )}
                    </div>
                    
                    {/* メイン情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">{member.name}</h3>
                        {hasViewed && (
                          <div className="flex-shrink-0" title="閲覧済み">
                            <Eye className="w-7 h-7 text-yellow-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-lg text-blue-700 font-bold mb-2 leading-relaxed">{member.position}</p>
                      <p className="text-lg text-gray-700 truncate mb-3 leading-relaxed">{member.company}</p>
                      
                      {/* 出身地・出身校 */}
                      <div className="space-y-2 mb-3">
                        {member.hometown && (
                          <div className="flex items-center gap-2 text-base text-gray-600">
                            <span className="text-lg">🏠</span>
                            <span className="leading-relaxed">{member.hometown}</span>
                            {commonPoints.some(cp => cp.type === 'hometown') && (
                              <span className="ml-2 inline-flex items-center gap-1 bg-gradient-to-r from-pink-100 to-pink-200 px-3 py-1 rounded-full text-sm font-bold text-pink-700 border border-pink-300 shadow-sm">
                                🤝 同郷
                              </span>
                            )}
                          </div>
                        )}
                        {member.alma_mater && (
                          <div className="flex items-center gap-2 text-base text-gray-600">
                            <span className="text-lg">🎓</span>
                            <span className="leading-relaxed">{member.alma_mater}</span>
                            {commonPoints.some(cp => cp.type === 'alma_mater') && (
                              <span className="ml-2 inline-flex items-center gap-1 bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-1 rounded-full text-sm font-bold text-purple-700 border border-purple-300 shadow-sm">
                                🤝 同窓生
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* 趣味タグと共通点 */}
                      <div className="flex flex-wrap items-center gap-2">
                        {firstHobby && (
                          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-2 rounded-full border border-yellow-300 shadow-sm">
                            <Tag className="w-5 h-5 text-yellow-700" />
                            <span className="text-base font-semibold text-yellow-800 leading-relaxed">
                              {firstHobby}
                            </span>
                          </div>
                        )}
                        {commonPoints.some(cp => cp.type === 'hobby') && (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-100 to-green-200 px-3 py-1 rounded-full text-sm font-bold text-green-700 border border-green-300 shadow-sm">
                            🤝 共通の趣味
                          </span>
                        )}
                        {commonPoints.some(cp => cp.type === 'occupation') && (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1 rounded-full text-sm font-bold text-blue-700 border border-blue-300 shadow-sm">
                            🤝 同じ職業分類
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 五十音インデックス */}
        <div className="fixed right-1 flex flex-col gap-2 z-30 bg-gray-200 rounded-2xl p-2 shadow-lg" style={{ top: '320px', maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
          {kanaIndex.map((kana) => (
            <button
              key={kana}
              onClick={() => jumpToKana(kana)}
              className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg active:bg-yellow-500 active:text-blue-900 transition-all font-bold flex items-center justify-center flex-shrink-0"
              style={{ fontSize: '20px' }}
            >
              {kana}
            </button>
          ))}
        </div>

        {/* 上に戻るボタン */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed left-4 bottom-8 z-30 w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
            aria-label="トップに戻る"
          >
            <svg 
              className="w-7 h-7" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// 情報行コンポーネント
const InfoRow = ({ label, value }) => (
  <div className="border-b border-gray-200 pb-4 last:border-0">
    <p className="text-lg text-gray-600 mb-2 leading-relaxed">{label}</p>
    <p className="text-xl font-bold text-gray-900 leading-relaxed">{value}</p>
  </div>
);

export default MemberDirectoryApp;
