# Rotary Club Management System

## プロジェクト概要

ロータリークラブ向けの会員管理・コミュニティシステム。複数クラブに対応したマルチテナント構成。

## 技術スタック

### Backend
| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| Runtime | Node.js | 20.x LTS |
| Framework | Express.js | 4.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| Database | MySQL | 8.0 |
| Validation | Zod | 3.x |
| Auth | Passport.js + JWT | - |

### Web Apps (super-admin / club-admin)
| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| Framework | Next.js | 14.x (App Router) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Form | React Hook Form + Zod | - |
| HTTP Client | Axios | - |

### Mobile App (iOS/Android)
| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| Framework | React Native + Expo | SDK 54 |
| Language | TypeScript | 5.x |
| Routing | Expo Router | v3 |
| State | Zustand | 4.x |
| Styling | StyleSheet | - |
| HTTP Client | Axios | - |
| Storage | expo-secure-store | - |

### インフラ・ツール
| カテゴリ | 技術 |
|---------|------|
| インフラ | AWS |
| パッケージ管理 | pnpm + Turborepo |
| コード管理 | GitHub |

## ディレクトリ構成

```
rotary-system/
├── apps/
│   ├── super-admin/          # 全体管理（サービス運営）
│   │   ├── src/
│   │   │   ├── app/          # Next.js App Router
│   │   │   ├── components/   # UIコンポーネント
│   │   │   ├── hooks/        # カスタムフック
│   │   │   ├── lib/          # ユーティリティ
│   │   │   └── types/        # 型定義
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── club-admin/           # クラブ管理（事務局）
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/               # 会員向けアプリ (Expo + Expo Router)
│       ├── app/              # Expo Router (ファイルベースルーティング)
│       │   ├── (auth)/       # 認証フロー
│       │   ├── (tabs)/       # メインタブ
│       │   ├── _layout.tsx   # ルートレイアウト
│       │   └── index.tsx     # エントリーポイント
│       ├── src/
│       │   ├── components/   # 共通コンポーネント
│       │   ├── hooks/        # カスタムフック
│       │   ├── services/     # API通信
│       │   ├── stores/       # Zustand状態管理
│       │   ├── types/        # 型定義
│       │   └── utils/        # ユーティリティ
│       ├── assets/           # 画像・フォント
│       ├── app.json          # Expo設定
│       ├── package.json
│       └── tsconfig.json
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # DBスキーマ
│   │   ├── migrations/       # マイグレーションファイル
│   │   └── seed.ts           # シードデータ
│   ├── public/
│   │   └── uploads/          # アップロードファイル
│   │       └── avatars/
│   ├── src/
│   │   ├── config/           # 設定ファイル
│   │   │   ├── database.ts
│   │   │   ├── passport.ts   # Passport.js設定
│   │   │   └── env.ts
│   │   ├── controllers/      # コントローラー
│   │   ├── middlewares/      # ミドルウェア
│   │   │   ├── auth.ts       # 認証ミドルウェア
│   │   │   ├── validation.ts # Zodバリデーション
│   │   │   └── errorHandler.ts
│   │   ├── routes/           # ルーティング
│   │   ├── services/         # ビジネスロジック
│   │   ├── utils/            # ユーティリティ
│   │   ├── validators/       # Zodスキーマ
│   │   └── index.ts          # エントリーポイント
│   ├── package.json
│   └── tsconfig.json
│
├── packages/
│   └── shared/               # 共通パッケージ
│       ├── src/
│       │   ├── types/        # 共通型定義
│       │   ├── constants/    # 定数
│       │   └── utils/        # 共通ユーティリティ
│       ├── package.json
│       └── tsconfig.json
│
├── .gitignore
├── package.json              # ルートpackage.json
├── pnpm-workspace.yaml       # pnpmワークスペース設定
├── turbo.json                # Turborepo設定
└── README.md
```

## ユーザー種別

| 種別 | 説明 | アクセス先 |
|------|------|-----------|
| SuperAdmin | サービス運営者（御社） | super-admin |
| ClubAdmin | クラブ事務局・幹事 | club-admin |
| Member | 一般会員 | mobile |

## 主要機能

### Super Admin（全体管理）
- クラブ管理（追加・編集・停止）
- スーパーユーザー管理
- 全体統計・ダッシュボード
- システム設定

### Club Admin（クラブ管理）
- 会員管理（CRUD、CSV一括登録）
- イベント・例会管理
- お知らせ管理
- 出欠管理
- プッシュ通知送信
- クラブ設定

### Mobile（会員向け）
- 会員登録・ログイン（6桁コード認証）
- 会員名簿閲覧・検索
- イベント確認・出欠回答
- お知らせ閲覧
- マイページ・プロフィール編集

## 開発コマンド

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動（全て）
pnpm dev

# 個別起動
pnpm dev --filter=backend
pnpm dev --filter=club-admin
pnpm dev --filter=super-admin
pnpm dev --filter=mobile

# ビルド
pnpm build

# Lint
pnpm lint

# 型チェック
pnpm type-check

# DBマイグレーション
pnpm db:migrate

# DBシード
pnpm db:seed
```

## 環境変数

### backend/.env
```
DATABASE_URL="mysql://user:password@localhost:3306/rotary_db"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="password"
```

### apps/club-admin/.env.local
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### apps/super-admin/.env.local
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### apps/mobile/.env
```
API_URL="http://localhost:3001"
```

## コーディング規約

### 命名規則
- ファイル名: kebab-case（例: `member-list.tsx`）
- コンポーネント: PascalCase（例: `MemberList`）
- 関数・変数: camelCase（例: `getMemberById`）
- 定数: UPPER_SNAKE_CASE（例: `MAX_FILE_SIZE`）
- 型・インターフェース: PascalCase（例: `Member`, `IMemberService`）

### ディレクトリ配置
- 画面固有のコンポーネントは `app/[page]/components/` に配置
- 共通コンポーネントは `components/` に配置
- APIリクエストは `services/` または `lib/api/` に集約

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: その他
```

## API設計

### 認証
- POST `/api/auth/send-code` - 認証コード送信
- POST `/api/auth/verify-code` - 認証コード検証
- POST `/api/auth/set-password` - パスワード設定
- POST `/api/auth/login` - ログイン
- POST `/api/auth/refresh` - トークンリフレッシュ
- POST `/api/auth/logout` - ログアウト

### 会員（Member）
- GET `/api/members` - 一覧取得
- GET `/api/members/:id` - 詳細取得
- POST `/api/members` - 作成
- PUT `/api/members/:id` - 更新
- DELETE `/api/members/:id` - 削除
- POST `/api/members/import` - CSV一括登録

### イベント（Event）
- GET `/api/events` - 一覧取得
- GET `/api/events/:id` - 詳細取得
- POST `/api/events` - 作成
- PUT `/api/events/:id` - 更新
- DELETE `/api/events/:id` - 削除

### 出欠（Attendance）
- GET `/api/events/:id/attendances` - 出欠一覧
- POST `/api/events/:id/attendances` - 出欠登録
- PUT `/api/events/:id/attendances/:memberId` - 出欠更新

### お知らせ（Notification）
- GET `/api/notifications` - 一覧取得
- GET `/api/notifications/:id` - 詳細取得
- POST `/api/notifications` - 作成
- PUT `/api/notifications/:id` - 更新
- DELETE `/api/notifications/:id` - 削除

### クラブ（Club）- SuperAdmin用
- GET `/api/clubs` - 一覧取得
- GET `/api/clubs/:id` - 詳細取得
- POST `/api/clubs` - 作成
- PUT `/api/clubs/:id` - 更新
- DELETE `/api/clubs/:id` - 削除（論理削除）

## 注意事項

- すべてのAPIレスポンスは `{ success: boolean, data?: T, error?: string }` 形式
- 日時はすべてUTCで保存し、フロントで変換
- ファイルアップロードは5MB制限
- 画像は自動リサイズ（アバター: 200x200）

## 開発ルール

開発する際は必ず [CONTRIBUTING.md](./CONTRIBUTING.md) を参照し、以下のルールを遵守すること：

- コーディング規約（命名規則、ファイル構成）
- UIアイコン（絵文字禁止、SVGアイコン使用）
- データベース操作（禁止コマンド、スキーマ変更手順）
- Git運用（コミットメッセージ、force push禁止）
- 実装前の確認（案を提示し同意を得てから実装）
