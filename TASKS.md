# Rotary System - 開発タスクリスト

## Phase 1: MVP（最優先）

### 1. プロジェクトセットアップ ✅
- [x] ディレクトリ構造作成
- [x] pnpm + Turborepo設定
- [x] TypeScript設定
- [x] .gitignore設定
- [ ] GitHubリポジトリ作成
- [ ] ESLint + Prettier設定

### 2. Backend API ✅

#### 2.1 基盤構築 ✅
- [x] Express + TypeScript セットアップ
- [x] Prisma設定・スキーマ作成
- [x] MySQLデータベース作成
- [x] 初回マイグレーション実行
- [x] シードデータ作成
- [x] 環境変数設定（.env）
- [x] エラーハンドリング共通処理
- [ ] ロギング設定

#### 2.2 認証API (Passport.js + JWT) ✅
- [x] Passport.js設定（passport-local, passport-jwt）
- [x] POST /api/auth/send-code（認証コード送信）
- [x] POST /api/auth/verify-code（認証コード検証）
- [x] POST /api/auth/set-password（パスワード設定）
- [x] POST /api/auth/login（ログイン - Passport Local）
- [x] POST /api/auth/refresh（トークンリフレッシュ）
- [x] POST /api/auth/reset/send-code（パスワードリセット用コード送信）
- [x] POST /api/auth/reset/password（パスワードリセット）
- [x] GET /api/auth/me（現在のユーザー取得）
- [x] JWTストラテジー作成
- [x] 認証ミドルウェア作成
- [x] メール送信サービス作成

#### 2.3 会員API ✅
- [x] GET /api/members（一覧取得）
- [x] GET /api/members/:id（詳細取得）
- [x] POST /api/members（作成）
- [x] PUT /api/members/:id（更新）
- [x] DELETE /api/members/:id（削除）
- [x] PUT /api/members/profile（プロフィール更新 - 会員用）
- [x] POST /api/members/:id/invite（招待メール送信）
- [x] 検索・フィルタ機能
- [x] ページネーション
- [ ] POST /api/members/import（CSV一括登録）
- [ ] GET /api/members/export（CSVエクスポート）

#### 2.4 イベントAPI ✅
- [x] GET /api/events（一覧取得）
- [x] GET /api/events/:id（詳細取得）
- [x] POST /api/events（作成）
- [x] PUT /api/events/:id（更新）
- [x] DELETE /api/events/:id（削除）
- [x] isPublished フラグで公開/非公開管理

#### 2.5 出欠API ✅
- [x] GET /api/events/:id/attendances（出欠一覧）
- [x] POST /api/events/:id/attendance（出欠登録・更新 - Upsert）
- [ ] GET /api/events/:id/attendances/summary（集計）

#### 2.6 お知らせAPI ✅
- [x] GET /api/notifications（一覧取得）
- [x] GET /api/notifications/:id（詳細取得）
- [x] POST /api/notifications（作成）
- [x] PUT /api/notifications/:id（更新）
- [x] DELETE /api/notifications/:id（削除）
- [x] isPublished フラグで公開/非公開管理

#### 2.7 ファイルアップロード ⬜
- [ ] POST /api/upload/avatar（アバター画像）
- [ ] 画像リサイズ処理
- [ ] ファイルサイズ制限

---

### 3. Club Admin Web ✅

#### 3.1 基盤構築 ✅
- [x] Next.js + TypeScript セットアップ
- [x] Tailwind CSS設定
- [x] 共通レイアウト作成（Header, Sidebar, MainLayout）
- [x] 認証コンテキスト作成
- [x] APIクライアント作成
- [x] 共通コンポーネント作成（Button, Input, Card）

#### 3.2 認証画面 ✅
- [x] ログイン画面
- [x] 認証ガード（ProtectedRoute）
- [ ] パスワードリセット画面

#### 3.3 ダッシュボード ✅
- [x] ダッシュボード画面
- [x] 統計カード（会員数、招待中会員数）
- [x] 次回例会情報
- [x] 最近のお知らせ

#### 3.4 会員管理 ✅
- [x] 会員一覧画面（ステータスフィルター付き）
- [x] 会員詳細・編集画面
- [x] 会員新規登録画面
- [x] 検索・フィルタ機能
- [x] ステータス変更機能
- [x] 招待メール送信機能
- [ ] CSV一括登録画面
- [ ] CSVエクスポート機能

#### 3.5 イベント管理 ✅
- [x] イベント一覧画面
- [x] イベント詳細画面
- [x] イベント作成・編集画面
- [x] 出欠一覧画面
- [x] 出欠集計表示

#### 3.6 お知らせ管理 ✅
- [x] お知らせ一覧画面
- [x] お知らせ作成・編集画面
- [x] プレビュー機能

#### 3.7 設定 ✅
- [x] 設定画面（基本レイアウト）
- [x] クラブ情報設定
- [x] 管理者管理（追加・編集・削除）

---

### 4. Mobile App (Expo + Expo Router) ✅

#### 4.1 基盤構築 ✅
- [x] Expo + TypeScript セットアップ
- [x] Expo Router設定（v3）
- [x] Zustand状態管理設定
- [x] APIクライアント作成（Axios）
- [x] expo-secure-store設定（トークン保存）
- [x] 共通コンポーネント作成
- [x] lucide-react-native アイコン導入（絵文字→SVGアイコン）

#### 4.2 認証フロー (app/(auth)/) ✅
- [x] 初回起動画面（分岐選択）- index.tsx
- [x] メールアドレス入力画面 - register.tsx
- [x] 認証コード入力画面（6桁）- verify-code.tsx
- [x] パスワード設定画面 - set-password.tsx
- [x] プロフィール設定画面（最小限）- profile-setup.tsx
- [x] ログイン画面 - login.tsx
- [x] パスワードリセットフロー - forgot-password.tsx
- [x] SafeAreaView + useSafeAreaInsets 対応

#### 4.3 メイン画面 (app/(tabs)/) ✅
- [x] タブレイアウト - _layout.tsx（Lucide SVGアイコン）
- [x] ホーム画面（お知らせ、次回例会）- index.tsx

#### 4.4 会員名簿 ✅
- [x] 会員一覧画面 - members.tsx
- [x] 会員詳細モーダル
- [x] 検索・フィルタ機能
- [x] 50音順インデックス
- [ ] 会員詳細画面 - member/[id].tsx（別画面として）

#### 4.5 イベント ✅
- [x] イベント一覧画面 - events.tsx
- [x] イベント詳細・出欠回答機能
- [ ] イベント詳細画面 - event/[id].tsx（別画面として）

#### 4.6 お知らせ ✅
- [x] お知らせ一覧画面 - notifications.tsx
- [x] お知らせ詳細モーダル
- [ ] お知らせ詳細画面 - notification/[id].tsx（別画面として）

#### 4.7 マイページ ✅
- [x] マイページ画面 - mypage.tsx
- [x] プロフィール編集モーダル
- [x] パスワード変更モーダル
- [x] ログアウト機能
- [ ] プライバシー設定画面（UI配置済み、機能未実装）
- [ ] 通知設定画面（UI配置済み、機能未実装）

---

## Phase 2: 機能拡張

### 5. Super Admin Web ⬜
- [ ] 基盤構築（Next.js）
- [ ] ログイン画面
- [ ] ダッシュボード（全体統計）
- [ ] クラブ一覧画面
- [ ] クラブ詳細・編集画面
- [ ] クラブ新規作成画面
- [ ] スーパー管理者管理
- [ ] システム設定

### 6. プッシュ通知 ⬜
- [ ] Firebase Cloud Messaging設定
- [ ] プッシュ通知トークン保存API
- [ ] プッシュ通知送信API
- [ ] Club Admin: 通知送信画面
- [ ] Mobile: プッシュ通知受信

### 7. 高度な出欠管理 ⬜
- [ ] 出欠履歴
- [ ] 出席率統計
- [ ] 出欠リマインダー

---

## Phase 3: 本番運用準備

### 8. AWS環境構築 ⬜
- [ ] VPC設定
- [ ] RDS（MySQL）作成
- [ ] EC2 or ECS設定
- [ ] S3（ファイルストレージ）
- [ ] CloudFront（CDN）
- [ ] Route53（ドメイン）
- [ ] ACM（SSL証明書）
- [ ] CI/CD（GitHub Actions）

### 9. セキュリティ・監視 ⬜
- [ ] WAF設定
- [ ] CloudWatch監視
- [ ] エラー通知（Slack等）
- [ ] バックアップ自動化

### 10. テスト ⬜
- [ ] Backend: ユニットテスト
- [ ] Backend: 統合テスト
- [ ] Frontend: コンポーネントテスト
- [ ] E2Eテスト

---

## 進捗管理

### 凡例
- ⬜ 未着手
- 🔄 進行中
- ✅ 完了

### 現在の状況
| Phase | 進捗 | 備考 |
|-------|------|------|
| Phase 1 | ✅ 約98% | Backend完了、Club Admin完了、Mobile基本機能完了 |
| Phase 2 | ⬜ | Phase 1完了後 |
| Phase 3 | ⬜ | Phase 2完了後 |

### 完了済み
- ✅ プロジェクトセットアップ
- ✅ Backend API（認証・会員・イベント・出欠・お知らせ・クラブ・管理者）
- ✅ Club Admin 基本機能（ログイン・ダッシュボード・会員管理）
- ✅ Club Admin イベント管理（作成・編集・出欠一覧）
- ✅ Club Admin お知らせ管理（作成・編集・プレビュー）
- ✅ Club Admin 設定（クラブ情報・管理者管理）
- ✅ Mobile App 基盤構築（Expo Router v3、Zustand、Axios、lucide-react-native）
- ✅ Mobile App 認証フロー（登録・ログイン・パスワード設定・リセット）
- ✅ Mobile App タブ画面（ホーム・会員名簿・イベント・お知らせ・マイページ）
- ✅ Mobile App UI改善（絵文字→SVGアイコン、SafeAreaView対応）

### 次のステップ
1. Mobile App 詳細画面（会員詳細・イベント詳細・お知らせ詳細を別画面として実装）
2. Mobile App 設定機能（プライバシー設定・通知設定の実装）
3. ファイルアップロード機能（アバター画像）
4. CSV一括登録・エクスポート機能

---

## 開発環境

### 起動コマンド
```bash
cd /Users/bingao/project/rotary/ratary-system

# 全サービス起動
pnpm dev

# 個別起動
pnpm --filter backend dev      # API: http://localhost:3001
pnpm --filter club-admin dev   # Club Admin: http://localhost:3000
pnpm --filter mobile dev       # Mobile: Expo (iOS/Android)

# Mobile iOS起動
cd apps/mobile && npx expo start --ios --clear
```

### テストアカウント
| ユーザー種別 | メールアドレス | パスワード |
|------------|--------------|-----------|
| 会員 | tanaka@example.com | Test1234 |
| クラブ管理者 | jimukyoku@amagasaki-nishi-rc.jp | Admin123! |
| スーパー管理者 | admin@rotary-system.com | Admin123! |
