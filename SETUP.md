# Rotary System - プロジェクトセットアップ手順書

## 前提条件

以下がインストールされていること：
- Node.js 20.x 以上
- pnpm 8.x 以上
- MySQL 8.x
- Git

## 1. 初期セットアップ

### 1.1 リポジトリ作成

```bash
# GitHubでリポジトリを作成後
mkdir rotary-system
cd rotary-system
git init
```

### 1.2 pnpm初期化

```bash
# pnpmインストール（未インストールの場合）
npm install -g pnpm

# ルートpackage.json作成
pnpm init
```

### 1.3 ルートpackage.json編集

```json
{
  "name": "rotary-system",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "db:migrate": "pnpm --filter backend db:migrate",
    "db:seed": "pnpm --filter backend db:seed",
    "db:studio": "pnpm --filter backend db:studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

### 1.4 pnpmワークスペース設定

`pnpm-workspace.yaml` を作成：

```yaml
packages:
  - "apps/*"
  - "backend"
  - "packages/*"
```

### 1.5 Turborepo設定

`turbo.json` を作成：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

### 1.6 .gitignore作成

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Turbo
.turbo/

# Testing
coverage/

# Uploads (keep directory structure)
public/uploads/*
!public/uploads/.gitkeep

# Mobile
apps/mobile/ios/
apps/mobile/android/
```

## 2. ディレクトリ構造作成

```bash
# ディレクトリ作成
mkdir -p apps/super-admin/src/{app,components,hooks,lib,types}
mkdir -p apps/club-admin/src/{app,components,hooks,lib,types}
mkdir -p apps/mobile/{app,src/{components,hooks,services,stores,types,utils},assets}
mkdir -p backend/{prisma,public/uploads/avatars,src/{config,controllers,middlewares,routes,services,utils,validators}}
mkdir -p packages/shared/src/{types,constants,utils}
```

## 3. Backend セットアップ

### 3.1 backend/package.json

```bash
cd backend
pnpm init
```

```json
{
  "name": "backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.11.0",
    "@types/nodemailer": "^6.4.14",
    "@types/passport": "^1.0.16",
    "@types/passport-jwt": "^4.0.1",
    "@types/passport-local": "^1.0.38",
    "prisma": "^5.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

### 3.2 backend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "prisma/seed.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.3 Prismaスキーマ（backend/prisma/schema.prisma）

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ========================================
// クラブ（マルチテナント）
// ========================================
model Club {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(100)
  nameKana    String?  @map("name_kana") @db.VarChar(100)
  description String?  @db.Text
  logoUrl     String?  @map("logo_url") @db.VarChar(500)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  members       Member[]
  events        Event[]
  notifications Notification[]
  clubAdmins    ClubAdmin[]

  @@map("clubs")
}

// ========================================
// スーパー管理者（サービス運営）
// ========================================
model SuperAdmin {
  id        String   @id @default(uuid())
  email     String   @unique @db.VarChar(255)
  password  String   @db.VarChar(255)
  name      String   @db.VarChar(100)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("super_admins")
}

// ========================================
// クラブ管理者（事務局）
// ========================================
model ClubAdmin {
  id        String   @id @default(uuid())
  clubId    String   @map("club_id")
  email     String   @db.VarChar(255)
  password  String   @db.VarChar(255)
  name      String   @db.VarChar(100)
  role      String   @default("admin") @db.VarChar(50) // admin, editor, viewer
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  club Club @relation(fields: [clubId], references: [id])

  @@unique([clubId, email])
  @@map("club_admins")
}

// ========================================
// 会員
// ========================================
model Member {
  id                     String    @id @default(uuid())
  clubId                 String    @map("club_id")
  
  // 認証情報
  email                  String    @db.VarChar(255)
  password               String?   @db.VarChar(255)
  verificationCode       String?   @map("verification_code") @db.VarChar(6)
  verificationCodeExpiry DateTime? @map("verification_code_expiry")
  
  // 基本情報（事務局管理 - ReadOnly）
  memberNumber           String?   @map("member_number") @db.VarChar(50)
  lastName               String    @map("last_name") @db.VarChar(50)
  firstName              String    @map("first_name") @db.VarChar(50)
  lastNameKana           String?   @map("last_name_kana") @db.VarChar(50)
  firstNameKana          String?   @map("first_name_kana") @db.VarChar(50)
  gender                 String?   @db.VarChar(10) // male, female, other
  birthDate              DateTime? @map("birth_date") @db.Date
  position               String?   @db.VarChar(100) // 役職
  joinDate               DateTime? @map("join_date") @db.Date
  
  // プロフィール情報（会員編集可能 - Writable）
  industryClassification String?   @map("industry_classification") @db.VarChar(100)
  companyName            String?   @map("company_name") @db.VarChar(200)
  department             String?   @db.VarChar(100)
  phoneNumber            String?   @map("phone_number") @db.VarChar(20)
  avatarUrl              String?   @map("avatar_url") @db.VarChar(500)
  hobbies                String?   @db.Text // JSON array
  introduction           String?   @db.Text
  
  // プライバシー設定
  privacySettings        String?   @map("privacy_settings") @db.Text // JSON
  
  // ステータス
  status                 String    @default("invited") @db.VarChar(20) // invited, active, inactive, withdrawn
  profileCompleted       Boolean   @default(false) @map("profile_completed")
  lastLoginAt            DateTime? @map("last_login_at")
  
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")

  // Relations
  club        Club         @relation(fields: [clubId], references: [id])
  attendances Attendance[]

  @@unique([clubId, email])
  @@unique([clubId, memberNumber])
  @@index([clubId, status])
  @@index([clubId, lastName, firstName])
  @@map("members")
}

// ========================================
// イベント・例会
// ========================================
model Event {
  id               String    @id @default(uuid())
  clubId           String    @map("club_id")
  
  title            String    @db.VarChar(200)
  description      String?   @db.Text
  eventType        String    @map("event_type") @db.VarChar(50) // regular_meeting, special_event, etc.
  
  startAt          DateTime  @map("start_at")
  endAt            DateTime? @map("end_at")
  
  venue            String?   @db.VarChar(200)
  venueAddress     String?   @map("venue_address") @db.Text
  onlineUrl        String?   @map("online_url") @db.VarChar(500)
  
  responseDeadline DateTime? @map("response_deadline")
  
  isPublished      Boolean   @default(false) @map("is_published")
  
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  // Relations
  club        Club         @relation(fields: [clubId], references: [id])
  attendances Attendance[]

  @@index([clubId, startAt])
  @@index([clubId, isPublished])
  @@map("events")
}

// ========================================
// 出欠
// ========================================
model Attendance {
  id        String   @id @default(uuid())
  eventId   String   @map("event_id")
  memberId  String   @map("member_id")
  
  status    String   @db.VarChar(20) // attending, absent, undecided
  comment   String?  @db.Text
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  event  Event  @relation(fields: [eventId], references: [id])
  member Member @relation(fields: [memberId], references: [id])

  @@unique([eventId, memberId])
  @@map("attendances")
}

// ========================================
// お知らせ
// ========================================
model Notification {
  id          String    @id @default(uuid())
  clubId      String    @map("club_id")
  
  title       String    @db.VarChar(200)
  content     String    @db.Text
  category    String?   @db.VarChar(50) // general, important, event, etc.
  
  isPublished Boolean   @default(false) @map("is_published")
  publishedAt DateTime? @map("published_at")
  
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  club Club @relation(fields: [clubId], references: [id])

  @@index([clubId, isPublished, publishedAt])
  @@map("notifications")
}
```

### 3.4 backend/.env（テンプレート）

```env
# Database
DATABASE_URL="mysql://root@localhost:3306/rotary_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=3001
NODE_ENV=development

# SMTP (メール送信)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Rotary Club <noreply@rotary-app.com>"

# Upload
UPLOAD_DIR="public/uploads"
MAX_FILE_SIZE=5242880
```

## 4. Club Admin セットアップ

### 4.1 Next.js作成

```bash
cd apps/club-admin
pnpm create next-app . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 4.2 追加パッケージ

```bash
pnpm add axios react-hook-form @hookform/resolvers zod lucide-react
pnpm add @tanstack/react-query  # データフェッチング
pnpm add -D @types/node
```

### 4.3 apps/club-admin/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 5. Super Admin セットアップ

```bash
cd apps/super-admin
pnpm create next-app . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
pnpm add axios react-hook-form @hookform/resolvers zod lucide-react
pnpm add @tanstack/react-query
```

### 5.1 apps/super-admin/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 6. Mobile セットアップ (Expo + Expo Router)

### 6.1 Expoプロジェクト作成

```bash
cd apps/mobile
npx create-expo-app@latest . --template tabs
```

### 6.2 追加パッケージ

```bash
# Expo Router（テンプレートに含まれている場合はスキップ）
npx expo install expo-router expo-linking expo-constants expo-status-bar

# 状態管理
npx expo install zustand

# HTTP通信
npx expo install axios

# フォーム
pnpm add react-hook-form @hookform/resolvers zod

# セキュアストレージ（トークン保存用）
npx expo install expo-secure-store

# その他
npx expo install expo-image-picker expo-font
```

### 6.3 apps/mobile/app.json

```json
{
  "expo": {
    "name": "Rotary Club",
    "slug": "rotary-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "rotary",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1e3a8a"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.rotary.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1e3a8a"
      },
      "package": "com.rotary.mobile"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### 6.4 apps/mobile/.env

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 6.5 ディレクトリ構成

```
apps/mobile/
├── app/                      # Expo Router
│   ├── (auth)/               # 認証グループ
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # 初回起動画面
│   │   ├── login.tsx         # ログイン
│   │   ├── register.tsx      # 新規登録
│   │   ├── verify-code.tsx   # 認証コード
│   │   ├── set-password.tsx  # パスワード設定
│   │   └── profile-setup.tsx # プロフィール設定
│   ├── (tabs)/               # メインタブ
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # ホーム
│   │   ├── members.tsx       # 会員名簿
│   │   ├── events.tsx        # イベント
│   │   └── mypage.tsx        # マイページ
│   ├── member/[id].tsx       # 会員詳細
│   ├── event/[id].tsx        # イベント詳細
│   ├── notification/[id].tsx # お知らせ詳細
│   ├── _layout.tsx           # ルートレイアウト
│   └── +not-found.tsx
├── src/
│   ├── components/           # 共通コンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── ...
│   ├── services/
│   │   ├── api.ts            # Axiosインスタンス
│   │   ├── auth.ts
│   │   ├── members.ts
│   │   └── events.ts
│   ├── stores/
│   │   ├── authStore.ts      # Zustand認証ストア
│   │   └── ...
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── ...
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

## 7. 共通パッケージ セットアップ

### 7.1 packages/shared/package.json

```json
{
  "name": "@rotary/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

### 7.2 packages/shared/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 7.3 packages/shared/src/index.ts

```typescript
export * from './types';
export * from './constants';
export * from './utils';
```

## 8. 依存関係インストール

```bash
# ルートに戻る
cd /path/to/rotary-system

# 全パッケージの依存関係をインストール
pnpm install
```

## 9. データベースセットアップ

### 9.1 MySQLデータベース作成

```sql
CREATE DATABASE rotary_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 9.2 マイグレーション実行

```bash
pnpm db:migrate
```

### 9.3 シードデータ投入

```bash
pnpm db:seed
```

## 10. 開発開始

```bash
# 全サービス起動
pnpm dev

# 個別起動
pnpm dev --filter=backend        # API: http://localhost:3001
pnpm dev --filter=club-admin     # Club Admin: http://localhost:3000
pnpm dev --filter=super-admin    # Super Admin: http://localhost:3002
pnpm dev --filter=mobile         # Metro bundler
```

## 開発優先順位

### Phase 1（MVP）
1. ✅ プロジェクトセットアップ
2. Backend API（認証、会員、イベント、お知らせ）
3. Club Admin（会員管理、イベント管理、お知らせ管理）
4. Mobile（認証、会員名簿、イベント、お知らせ、マイページ）

### Phase 2
5. Super Admin（クラブ管理、統計）
6. プッシュ通知
7. 出欠管理の詳細機能

### Phase 3
8. 他クラブ検索・交流機能
9. 高度な統計・レポート
10. AWS本番環境構築
