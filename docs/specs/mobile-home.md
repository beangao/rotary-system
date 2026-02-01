# モバイルホーム画面仕様書

## 概要

モバイルアプリのホーム画面は、会員にとって最も重要な情報を一目で確認できるダッシュボードです。

---

## 画面構成

```
┌─────────────────────────────────────┐
│  ヘッダー（クラブ名・挨拶）          │
├─────────────────────────────────────┤
│  事務局からのお知らせ               │
│  ├─ 最新1件表示                    │
│  └─ 「一覧を見る」リンク            │
├─────────────────────────────────────┤
│  次回例会                          │
│  ├─ 日時・会場                     │
│  ├─ 卓話・内容（あれば）            │
│  └─ 出欠回答ボタン                 │
├─────────────────────────────────────┤
│  クイックアクセス                   │
│  └─ 会員名簿を開く                 │
├─────────────────────────────────────┤
│  今後のスケジュール                 │
│  └─ 「一覧を見る」リンク            │
└─────────────────────────────────────┘
```

---

## 1. 事務局からのお知らせ

### 表示条件

| 条件 | 説明 |
|------|------|
| クラブ | ログインユーザーが所属するクラブのお知らせのみ |
| 公開状態 | `isPublished = true` のみ表示 |
| 表示件数 | 最新1件のみ |
| ソート | `publishedAt` 降順（新しい順） |

### 表示データ

```typescript
interface NotificationDisplay {
  id: string;
  title: string;         // タイトル
  content: string;       // 本文（2行まで表示、以降は省略）
  publishedAt: string;   // 公開日時（日付のみ表示）
}
```

### UI仕様

#### お知らせがある場合
- 黄色の背景カード（#fffbeb）
- ベルアイコン（黄色丸背景）
- タイトル（太字、茶色 #92400e）
- 本文プレビュー（2行まで、#78350f）
- 公開日（#a16207）
- タップでお知らせ一覧画面へ遷移

#### お知らせがない場合
- 白背景カード
- 「新しいお知らせはありません」テキスト（グレー）

### API

```
GET /api/notifications?status=published

Response:
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "...",
        "title": "〇〇のご案内",
        "content": "お知らせ本文...",
        "category": "general",
        "isPublished": true,
        "publishedAt": "2024-01-15T10:00:00Z",
        "createdAt": "2024-01-14T09:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## 2. 次回例会

### 表示条件

| 条件 | 説明 |
|------|------|
| クラブ | ログインユーザーが所属するクラブのイベントのみ |
| 公開状態 | `isPublished = true` のみ表示 |
| 日時 | 現在日時以降のイベント（`startAt >= now`） |
| 表示件数 | 最も近い1件のみ |
| ソート | `startAt` 昇順（近い順） |

### 表示データ

```typescript
interface NextEventDisplay {
  id: string;
  title: string;              // イベント名
  startAt: string;            // 開始日時
  endAt: string | null;       // 終了日時
  venue: string | null;       // 会場名
  description: string | null; // 卓話・内容
  responseDeadline: string | null; // 回答期限
  myAttendance: {             // 自分の出欠回答
    status: 'attending' | 'absent' | 'undecided' | null;
  } | null;
}
```

### UI仕様

#### イベントがある場合

**ヘッダー部分（青グラデーション背景）**
- カレンダーアイコン + 日時（YYYY年M月D日（曜）HH:MM〜HH:MM）
- 地図ピンアイコン + 会場名（ある場合）
- 回答期限バッジ（ある場合）

**卓話セクション（水色背景、description がある場合のみ）**
- メッセージアイコン + 「卓話・内容」ラベル
- 詳細テキスト

**出欠回答セクション（白背景）**
- 「出欠のご回答」タイトル
- 未回答時：出席/欠席/未定 ボタン
- 回答済み時：回答状態表示 + 「回答を変更する」リンク

#### イベントがない場合
- 白背景カード
- カレンダーアイコン（グレー）
- 「予定されている例会はありません」テキスト

### 出欠回答の状態遷移

```
[未回答]
    │
    ├─ 「出席」ボタン押下 → POST /api/events/{id}/attendance
    │   └─ 成功 → [回答済み: 出席]
    │
    ├─ 「欠席」ボタン押下 → POST /api/events/{id}/attendance
    │   └─ 成功 → [回答済み: 欠席]
    │
    └─ 「未定」ボタン押下 → POST /api/events/{id}/attendance
        └─ 成功 → [回答済み: 未定]

[回答済み]
    │
    └─ 「回答を変更する」押下 → [未回答状態に戻す（UI上のみ）]
```

### API

**イベント一覧取得**
```
GET /api/events?status=published

Response:
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "...",
        "title": "第123回例会",
        "description": "卓話：〇〇について",
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

**出欠回答登録**
```
POST /api/events/{eventId}/attendance
Request:
{
  "status": "attending" | "absent" | "undecided",
  "comment": "任意コメント"
}

Response:
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
```

---

## 3. クイックアクセス

### 表示内容

- 「会員名簿を開く」ボタン
- タップで会員名簿タブへ遷移

### UI仕様

- 青グラデーション背景
- ユーザーアイコン + テキスト
- 右矢印アイコン

---

## 4. 今後のスケジュール

### 表示内容

- 「イベント一覧」リンク
- タップでイベントタブへ遷移

---

## データ取得フロー

```
[ホーム画面表示]
    │
    ├─ GET /api/events?status=published
    │   └─ events[0] → 次回例会に表示
    │   └─ events[0].myAttendance → 出欠状態
    │
    └─ GET /api/notifications?status=published
        └─ notifications[0] → お知らせに表示
```

---

## Pull-to-Refresh

スワイプダウンで画面全体を更新：
1. `refreshing` 状態を true に
2. イベントとお知らせを再取得
3. `refreshing` 状態を false に

---

## イベントタイプ

| 値 | 表示名 | 説明 |
|----|--------|------|
| `meeting` | 例会 | 通常の例会 |
| `service` | 奉仕活動 | 奉仕活動 |
| `social` | 親睦会 | 懇親会等 |
| `district` | 地区行事 | 地区主催イベント |
| `other` | その他 | その他 |

---

## イベントステータス

| 値 | 説明 | 会員表示 |
|----|------|----------|
| `draft` | 下書き | 非表示 |
| `published` | 公開中 | 表示 |
| `closed` | 締切 | 表示（回答不可） |
| `cancelled` | 中止 | 表示 |
| `postponed` | 延期 | 表示 |

---

## お知らせカテゴリ

| 値 | 説明 |
|----|------|
| `general` | 一般 |
| `event` | イベント関連 |
| `important` | 重要 |
| `other` | その他 |

---

## エラーハンドリング

| シチュエーション | 対応 |
|-----------------|------|
| API取得失敗 | コンソールエラー出力、ローディング終了 |
| データなし（イベント） | 「予定されている例会はありません」表示 |
| データなし（お知らせ） | 「新しいお知らせはありません」表示 |
| 出欠回答失敗 | コンソールエラー出力、UI状態は変更しない |

---

## ファイル構成

```
apps/mobile/
├── app/
│   └── (tabs)/
│       └── index.tsx          # ホーム画面
│
└── src/
    ├── services/
    │   └── api.ts             # API通信
    │       ├── getEvents()
    │       ├── getNotifications()
    │       └── submitAttendance()
    │
    └── types/
        └── index.ts           # 型定義
            ├── Event
            ├── Notification
            └── Attendance
```

---

## 関連ドキュメント

- [モバイル会員認証フロー](./mobile-member-auth.md)

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-01 | 初版作成 |
