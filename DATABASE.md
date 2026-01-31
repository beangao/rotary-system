# Rotary System - データベース設計書

## ER図

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌──────────────────┐                                                          │
│  │   SuperAdmin     │  サービス全体管理者                                        │
│  ├──────────────────┤                                                          │
│  │ id (PK)          │                                                          │
│  │ email            │                                                          │
│  │ password         │                                                          │
│  │ name             │                                                          │
│  │ isActive         │                                                          │
│  └──────────────────┘                                                          │
│                                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐                             │
│  │      Club        │────────<│    ClubAdmin     │  クラブ事務局                 │
│  ├──────────────────┤   1:N   ├──────────────────┤                             │
│  │ id (PK)          │         │ id (PK)          │                             │
│  │ name             │         │ clubId (FK)      │                             │
│  │ nameKana         │         │ email            │                             │
│  │ description      │         │ password         │                             │
│  │ logoUrl          │         │ name             │                             │
│  │ isActive         │         │ role             │                             │
│  └────────┬─────────┘         │ isActive         │                             │
│           │                   └──────────────────┘                             │
│           │                                                                    │
│     ┌─────┴─────┬────────────────┐                                             │
│     │           │                │                                             │
│     │1:N        │1:N             │1:N                                          │
│     ▼           ▼                ▼                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐             │
│  │     Member       │  │      Event       │  │   Notification   │             │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤             │
│  │ id (PK)          │  │ id (PK)          │  │ id (PK)          │             │
│  │ clubId (FK)      │  │ clubId (FK)      │  │ clubId (FK)      │             │
│  │ email            │  │ title            │  │ title            │             │
│  │ password         │  │ description      │  │ content          │             │
│  │ memberNumber     │  │ eventType        │  │ category         │             │
│  │ lastName         │  │ startAt          │  │ isPublished      │             │
│  │ firstName        │  │ endAt            │  │ publishedAt      │             │
│  │ ...              │  │ venue            │  └──────────────────┘             │
│  │ status           │  │ responseDeadline │                                    │
│  │ profileCompleted │  │ isPublished      │                                    │
│  └────────┬─────────┘  └────────┬─────────┘                                    │
│           │                     │                                              │
│           │                     │                                              │
│           │      ┌──────────────┘                                              │
│           │      │                                                             │
│           │1:N   │1:N                                                          │
│           ▼      ▼                                                             │
│        ┌──────────────────┐                                                    │
│        │    Attendance    │  出欠                                              │
│        ├──────────────────┤                                                    │
│        │ id (PK)          │                                                    │
│        │ eventId (FK)     │                                                    │
│        │ memberId (FK)    │                                                    │
│        │ status           │                                                    │
│        │ comment          │                                                    │
│        └──────────────────┘                                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## テーブル定義

### 1. clubs（クラブ）

マルチテナントの核となるテーブル。各ロータリークラブを表す。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | VARCHAR(36) | NO | UUID | 主キー |
| name | VARCHAR(100) | NO | - | クラブ名（例：尼崎西ロータリークラブ） |
| name_kana | VARCHAR(100) | YES | - | クラブ名（ふりがな） |
| description | TEXT | YES | - | クラブ説明 |
| logo_url | VARCHAR(500) | YES | - | ロゴ画像URL |
| is_active | BOOLEAN | NO | true | 有効フラグ |
| created_at | DATETIME | NO | NOW() | 作成日時 |
| updated_at | DATETIME | NO | NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)

---

### 2. super_admins（スーパー管理者）

サービス全体を管理する管理者。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | VARCHAR(36) | NO | UUID | 主キー |
| email | VARCHAR(255) | NO | - | メールアドレス |
| password | VARCHAR(255) | NO | - | パスワード（ハッシュ） |
| name | VARCHAR(100) | NO | - | 名前 |
| is_active | BOOLEAN | NO | true | 有効フラグ |
| created_at | DATETIME | NO | NOW() | 作成日時 |
| updated_at | DATETIME | NO | NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE (email)

---

### 3. club_admins（クラブ管理者）

各クラブの事務局・幹事。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | VARCHAR(36) | NO | UUID | 主キー |
| club_id | VARCHAR(36) | NO | - | クラブID（FK） |
| email | VARCHAR(255) | NO | - | メールアドレス |
| password | VARCHAR(255) | NO | - | パスワード（ハッシュ） |
| name | VARCHAR(100) | NO | - | 名前 |
| role | VARCHAR(50) | NO | admin | 権限（admin/editor/viewer） |
| is_active | BOOLEAN | NO | true | 有効フラグ |
| created_at | DATETIME | NO | NOW() | 作成日時 |
| updated_at | DATETIME | NO | NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE (club_id, email)
- FOREIGN KEY (club_id) REFERENCES clubs(id)

**権限レベル:**
| role | 説明 |
|------|------|
| admin | 全機能利用可、他の管理者管理可 |
| editor | 会員・イベント・お知らせの編集可 |
| viewer | 閲覧のみ |

---

### 4. members（会員）

ロータリークラブの会員。モバイルアプリユーザー。

| カラム名 | 型 | NULL | デフォルト | 説明 | 編集権限 |
|---------|-----|------|-----------|------|---------|
| id | VARCHAR(36) | NO | UUID | 主キー | - |
| club_id | VARCHAR(36) | NO | - | クラブID（FK） | - |
| **認証情報** |||||
| email | VARCHAR(255) | NO | - | メールアドレス | Admin |
| password | VARCHAR(255) | YES | - | パスワード（ハッシュ） | Member |
| verification_code | VARCHAR(6) | YES | - | 認証コード（6桁） | System |
| verification_code_expiry | DATETIME | YES | - | 認証コード有効期限 | System |
| **基本情報（ReadOnly）** |||||
| member_number | VARCHAR(50) | YES | - | 会員番号 | Admin |
| last_name | VARCHAR(50) | NO | - | 姓 | Admin |
| first_name | VARCHAR(50) | NO | - | 名 | Admin |
| last_name_kana | VARCHAR(50) | YES | - | 姓（ふりがな） | Admin |
| first_name_kana | VARCHAR(50) | YES | - | 名（ふりがな） | Admin |
| gender | VARCHAR(10) | YES | - | 性別 | Admin |
| birth_date | DATE | YES | - | 生年月日 | Admin |
| position | VARCHAR(100) | YES | - | 役職 | Admin |
| join_date | DATE | YES | - | 入会日 | Admin |
| **プロフィール（Writable）** |||||
| industry_classification | VARCHAR(100) | YES | - | 職業分類 | Member |
| company_name | VARCHAR(200) | YES | - | 会社名 | Member |
| department | VARCHAR(100) | YES | - | 部署 | Member |
| phone_number | VARCHAR(20) | YES | - | 電話番号 | Member |
| avatar_url | VARCHAR(500) | YES | - | プロフィール画像URL | Member |
| hobbies | TEXT | YES | - | 趣味（JSON配列） | Member |
| introduction | TEXT | YES | - | 自己紹介 | Member |
| privacy_settings | TEXT | YES | - | プライバシー設定（JSON） | Member |
| **ステータス** |||||
| status | VARCHAR(20) | NO | invited | ステータス | Admin |
| profile_completed | BOOLEAN | NO | false | プロフィール設定完了 | System |
| last_login_at | DATETIME | YES | - | 最終ログイン | System |
| created_at | DATETIME | NO | NOW() | 作成日時 | - |
| updated_at | DATETIME | NO | NOW() | 更新日時 | - |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE (club_id, email)
- UNIQUE (club_id, member_number)
- INDEX (club_id, status)
- INDEX (club_id, last_name, first_name)
- FOREIGN KEY (club_id) REFERENCES clubs(id)

**ステータス:**
| status | 説明 |
|--------|------|
| invited | 招待済み（未登録） |
| active | アクティブ |
| inactive | 休会中 |
| withdrawn | 退会 |

**プライバシー設定（privacy_settings）:**
```json
{
  "showEmail": true,
  "showPhone": false,
  "showBirthDate": false,
  "showCompany": true
}
```

---

### 5. events（イベント・例会）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | VARCHAR(36) | NO | UUID | 主キー |
| club_id | VARCHAR(36) | NO | - | クラブID（FK） |
| title | VARCHAR(200) | NO | - | イベント名 |
| description | TEXT | YES | - | 説明 |
| event_type | VARCHAR(50) | NO | - | イベント種別 |
| start_at | DATETIME | NO | - | 開始日時 |
| end_at | DATETIME | YES | - | 終了日時 |
| venue | VARCHAR(200) | YES | - | 会場名 |
| venue_address | TEXT | YES | - | 会場住所 |
| online_url | VARCHAR(500) | YES | - | オンラインURL |
| response_deadline | DATETIME | YES | - | 回答期限 |
| is_published | BOOLEAN | NO | false | 公開フラグ |
| created_at | DATETIME | NO | NOW() | 作成日時 |
| updated_at | DATETIME | NO | NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (club_id, start_at)
- INDEX (club_id, is_published)
- FOREIGN KEY (club_id) REFERENCES clubs(id)

**イベント種別（event_type）:**
| event_type | 説明 |
|------------|------|
| regular_meeting | 例会 |
| special_event | 特別イベント |
| board_meeting | 理事会 |
| social | 親睦会 |
| other | その他 |

---

### 6. attendances（出欠）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | VARCHAR(36) | NO | UUID | 主キー |
| event_id | VARCHAR(36) | NO | - | イベントID（FK） |
| member_id | VARCHAR(36) | NO | - | 会員ID（FK） |
| status | VARCHAR(20) | NO | - | 出欠ステータス |
| comment | TEXT | YES | - | コメント |
| created_at | DATETIME | NO | NOW() | 作成日時 |
| updated_at | DATETIME | NO | NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE (event_id, member_id)
- FOREIGN KEY (event_id) REFERENCES events(id)
- FOREIGN KEY (member_id) REFERENCES members(id)

**出欠ステータス:**
| status | 説明 |
|--------|------|
| attending | 出席 |
| absent | 欠席 |
| undecided | 未定 |

---

### 7. notifications（お知らせ）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | VARCHAR(36) | NO | UUID | 主キー |
| club_id | VARCHAR(36) | NO | - | クラブID（FK） |
| title | VARCHAR(200) | NO | - | タイトル |
| content | TEXT | NO | - | 本文 |
| category | VARCHAR(50) | YES | - | カテゴリ |
| is_published | BOOLEAN | NO | false | 公開フラグ |
| published_at | DATETIME | YES | - | 公開日時 |
| created_at | DATETIME | NO | NOW() | 作成日時 |
| updated_at | DATETIME | NO | NOW() | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (club_id, is_published, published_at)
- FOREIGN KEY (club_id) REFERENCES clubs(id)

**カテゴリ:**
| category | 説明 |
|----------|------|
| general | 一般 |
| important | 重要 |
| event | イベント関連 |
| other | その他 |

---

## 将来の拡張テーブル（Phase 2以降）

### push_notification_tokens（プッシュ通知トークン）
```sql
CREATE TABLE push_notification_tokens (
  id VARCHAR(36) PRIMARY KEY,
  member_id VARCHAR(36) NOT NULL,
  token VARCHAR(500) NOT NULL,
  platform VARCHAR(10) NOT NULL, -- ios, android
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

### push_notification_logs（プッシュ通知履歴）
```sql
CREATE TABLE push_notification_logs (
  id VARCHAR(36) PRIMARY KEY,
  club_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  sent_at DATETIME NOT NULL,
  sent_count INT DEFAULT 0,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (club_id) REFERENCES clubs(id)
);
```

---

## データ移行・初期データ

### シードデータ例

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // スーパー管理者
  const superAdmin = await prisma.superAdmin.create({
    data: {
      email: 'admin@rotary-system.com',
      password: await bcrypt.hash('Admin123!', 10),
      name: 'システム管理者',
    },
  });

  // テストクラブ
  const club = await prisma.club.create({
    data: {
      name: '尼崎西ロータリークラブ',
      nameKana: 'アマガサキニシロータリークラブ',
      description: 'テスト用クラブ',
    },
  });

  // クラブ管理者
  const clubAdmin = await prisma.clubAdmin.create({
    data: {
      clubId: club.id,
      email: 'jimukyoku@amagasaki-nishi-rc.jp',
      password: await bcrypt.hash('Admin123!', 10),
      name: '事務局 太郎',
      role: 'admin',
    },
  });

  // テスト会員
  const member = await prisma.member.create({
    data: {
      clubId: club.id,
      email: 'tanaka@example.com',
      password: await bcrypt.hash('Test1234', 10),
      lastName: '田中',
      firstName: '一郎',
      lastNameKana: 'タナカ',
      firstNameKana: 'イチロウ',
      memberNumber: '0001',
      status: 'active',
      profileCompleted: true,
    },
  });

  console.log({ superAdmin, club, clubAdmin, member });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## バックアップ・リストア

### バックアップ
```bash
mysqldump -u root -p rotary_db > backup_$(date +%Y%m%d).sql
```

### リストア
```bash
mysql -u root -p rotary_db < backup_20260129.sql
```
