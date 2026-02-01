# モバイルイベント一覧画面仕様書

## 概要

モバイルアプリのイベント一覧画面の仕様を定義します。
※ 詳細画面（モーダル）は廃止し、一覧画面のみで出欠回答を行います。

---

## 画面構成

### イベント一覧画面

```
┌─────────────────────────────────────┐
│  イベント一覧（リスト形式）          │
│  ├─ カテゴリバッジ + ステータスバッジ │
│  ├─ イベントタイトル                │
│  ├─ 日時・時間                      │
│  ├─ 会場（あれば）                  │
│  ├─ 説明                           │
│  ├─ 回答期限（あれば）              │
│  └─ 出欠回答ボタン（公開中かつ期限内）│
└─────────────────────────────────────┘
```

---

## 1. イベント一覧

### 表示条件

| 条件 | 説明 |
|------|------|
| クラブ | ログインユーザーが所属するクラブのイベントのみ |
| 公開状態 | **下書き（draft）以外すべて表示**（published, closed, cancelled, postponed） |
| ソート | `startAt` **降順（最新順）** |

### 表示データ

```typescript
interface EventDisplay {
  id: string;
  title: string;                // イベント名
  description: string | null;   // 説明
  eventType: EventType;         // カテゴリ
  startAt: string;              // 開始日時
  endAt: string | null;         // 終了日時
  venue: string | null;         // 会場名
  responseDeadline: string | null; // 回答期限
  status: EventStatus;          // ステータス
  myAttendance: {               // 自分の出欠回答
    id: string;
    status: 'attending' | 'absent' | 'undecided';
    comment: string | null;
  } | null;
}
```

### UI仕様

#### カテゴリ別カラー

| カテゴリ | 表示名 | バッジ背景 | バッジ文字 | カード背景 | ボーダー |
|---------|-------|-----------|-----------|-----------|---------|
| meeting | 定例会 | #dbeafe | #1e40af | #eff6ff | #bfdbfe |
| service | 奉仕活動 | #dcfce7 | #166534 | #f0fdf4 | #bbf7d0 |
| social | 親睦活動 | #f3e8ff | #6b21a8 | #faf5ff | #e9d5ff |
| district | 地区行事 | #fef3c7 | #92400e | #fffbeb | #fde68a |
| other | その他 | #f3f4f6 | #1f2937 | #f9fafb | #e5e7eb |

#### ステータスバッジ

**出欠回答状態（published イベント）**

| 状態 | テキスト | 背景色 | 文字色 | アイコン |
|------|---------|--------|--------|---------|
| 出席 | 出席 | #22c55e | #ffffff | ✓ チェックマーク |
| 欠席 | 欠席 | #ef4444 | #ffffff | - |
| 未定 | 未定 | #eab308 | #ffffff | - |
| 期限切れ | 期限切れ | #d1d5db | #4b5563 | - |
| 未回答 | 未回答 | #9ca3af | #ffffff | - |

**イベントステータス（published 以外）**

| 状態 | テキスト | 背景色 | 文字色 |
|------|---------|--------|--------|
| cancelled | 中止 | #dc2626 | #ffffff |
| postponed | 延期 | #f59e0b | #ffffff |
| closed | 締切 | #6b7280 | #ffffff |

---

## 2. 出欠回答

### 回答条件

出欠回答は以下の条件を**すべて**満たす場合のみ可能：

| 条件 | 説明 |
|------|------|
| **公開中** | イベントステータスが `published` であること |
| **期限内** | `responseDeadline` が設定されている場合、現在日時が期限前であること |

### 回答可否の判定ロジック

```typescript
const isDeadlinePassed = (deadlineString?: string | null) => {
  if (!deadlineString) return false; // 期限未設定の場合は期限切れではない
  return new Date() > new Date(deadlineString);
};

const canSubmitAttendance = (event: Event) => {
  // 公開中のイベントのみ回答可能
  if (event.status !== 'published') return false;
  // 期限切れの場合は回答不可
  if (isDeadlinePassed(event.responseDeadline)) return false;
  return true;
};
```

### 回答オプション

| 値 | 表示名 | 説明 |
|----|--------|------|
| `attending` | 出席 | 出席予定 |
| `absent` | 欠席 | 欠席予定 |
| `undecided` | 未定 | 未決定 |

### UI表示パターン

#### 公開中（published）・期限内・未回答の場合
- 3つのボタン（出席/欠席/未定）を表示
- ボタンをタップで即座に回答送信

#### 公開中（published）・期限内・回答済みの場合
- 選択中のボタンをハイライト表示
- 他のボタンをタップで回答変更可能

#### 公開中（published）・期限切れの場合
- 「回答期限が過ぎています」メッセージを表示
- 回答ボタンは非表示

#### 中止（cancelled）の場合
- 「このイベントは中止になりました」メッセージを表示（赤色）
- 回答ボタンは非表示

#### 延期（postponed）の場合
- 「このイベントは延期になりました」メッセージを表示（オレンジ色）
- 回答ボタンは非表示

#### 締切（closed）の場合
- 「出欠回答は締め切られました」メッセージを表示
- 回答ボタンは非表示

---

## 3. API

### イベント一覧取得

```
GET /api/events

Response:
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "...",
        "title": "第123回例会",
        "description": "内容の説明...",
        "eventType": "meeting",
        "startAt": "2024-01-20T12:00:00Z",
        "endAt": "2024-01-20T14:00:00Z",
        "venue": "〇〇ホテル",
        "venueAddress": "東京都...",
        "responseDeadline": "2024-01-18T23:59:59Z",
        "status": "published",
        "isPublished": true,
        "myAttendance": {
          "id": "...",
          "status": "attending",
          "comment": null
        }
      }
    ],
    "pagination": { ... }
  }
}
```

### 出欠回答登録

```
POST /api/events/{eventId}/attendance

Request:
{
  "status": "attending" | "absent" | "undecided",
  "comment": "任意コメント"
}

Response（成功）:
{
  "success": true,
  "data": {
    "id": "...",
    "eventId": "...",
    "memberId": "...",
    "status": "attending",
    "comment": null
  }
}

Response（エラー - 公開中以外）:
{
  "success": false,
  "error": "このイベントは出欠回答を受け付けていません"
}

Response（エラー - 期限切れ）:
{
  "success": false,
  "error": "回答期限を過ぎています"
}
```

---

## 4. データ更新タイミング

### タブフォーカス時の自動更新

`useFocusEffect` を使用し、タブに切り替えた際に自動でデータを再取得します。

```typescript
import { useFocusEffect } from 'expo-router';

useFocusEffect(
  useCallback(() => {
    fetchEvents();
  }, [])
);
```

### Pull-to-Refresh

スワイプダウンで画面全体を更新：
1. `refreshing` 状態を true に
2. イベント一覧を再取得
3. `refreshing` 状態を false に

---

## 5. エラーハンドリング

| シチュエーション | 対応 |
|-----------------|------|
| API取得失敗 | コンソールエラー出力、ローディング終了 |
| データなし | 「イベントがありません」表示 |
| 出欠回答失敗 | **Alert でエラーメッセージを表示**、UI状態は変更しない |

---

## 6. ファイル構成

```
apps/mobile/
├── app/
│   └── (tabs)/
│       └── events.tsx        # イベント一覧画面
│
└── src/
    ├── services/
    │   └── api.ts            # API通信
    │       ├── getEvents()
    │       └── submitAttendance()
    │
    └── types/
        └── index.ts          # 型定義
            ├── Event
            └── Attendance
```

---

## 7. 関連ドキュメント

- [モバイルホーム画面仕様書](./mobile-home.md)
- [モバイル会員認証フロー](./mobile-member-auth.md)

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-01 | 初版作成 |
| 2026-02-01 | 詳細画面（モーダル）廃止、表示条件・出欠回答条件を修正 |
