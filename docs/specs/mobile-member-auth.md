# モバイル会員認証フロー仕様書

## 概要

モバイルアプリにおける会員の認証フローを、ユーザーステータスごとに定義します。

---

## 会員ステータス定義

| ステータス | 説明 | DB値 |
|-----------|------|------|
| 招待中 | 管理者が登録し、招待メール送信済み。パスワード未設定 | `invited` |
| アクティブ | パスワード設定済み、通常利用可能 | `active` |
| 休会中 | 一時的に利用停止 | `inactive` |
| 退会 | 退会済み（論理削除） | `withdrawn` |

---

## ステータス別フロー

### 1. 招待中（invited）ユーザーの新規登録フロー

管理者に招待された会員が初めてアプリを利用する場合。

```
[招待メール受信]
    ↓
[アプリインストール・起動]
    ↓
[初回起動画面] → 「初めての方（新規登録）」を選択
    ↓
[メールアドレス入力画面] register.tsx
    ↓ POST /api/auth/send-code
    │
    ├─ 成功 → [認証コード入力画面] verify-code.tsx
    │           ↓ POST /api/auth/verify-code
    │           ↓
    │         [パスワード設定画面] set-password.tsx
    │           ↓ POST /api/auth/set-password
    │           ↓
    │         [プロフィール設定画面] profile-setup.tsx
    │           ↓
    │         [メイン画面（タブ）]
    │
    └─ エラー
        ├─ 「このアドレスは登録されていません」 → 招待メール確認を促す
        └─ 「このアドレスはすでに登録済みです」 → ログインを促す
```

#### API仕様

**1. 認証コード送信 (新規登録用)**
```
POST /api/auth/send-code
Request:
{
  "email": "member@example.com"
}

Response (成功):
{
  "success": true,
  "message": "認証コードを送信しました"
}

Response (エラー - 未登録):
{
  "success": false,
  "error": "このアドレスは登録されていません"
}

Response (エラー - 登録済み):
{
  "success": false,
  "error": "このアドレスはすでに登録済みです"
}
```

**2. 認証コード検証**
```
POST /api/auth/verify-code
Request:
{
  "email": "member@example.com",
  "code": "123456"
}

Response (成功):
{
  "success": true,
  "data": {
    "token": "...",
    "memberId": "...",
    "hasPassword": false
  }
}
```

**3. パスワード設定**
```
POST /api/auth/set-password
Request:
{
  "email": "member@example.com",
  "code": "123456",
  "password": "SecurePass123"
}

Response (成功):
{
  "success": true,
  "data": {
    "tokens": { "accessToken": "...", "refreshToken": "..." },
    "user": { ... }
  }
}
```

---

### 2. アクティブ（active）ユーザーのログインフロー

パスワード設定済みの会員が再度ログインする場合。

```
[アプリ起動]
    ↓
[初回起動画面] → 「アカウントをお持ちの方」を選択
    ↓
[ログイン画面] login.tsx
    ↓ POST /api/auth/login
    │
    ├─ 成功 → GET /api/auth/me
    │           ↓
    │         [メイン画面（タブ）]
    │
    └─ エラー → 「メールアドレスまたはパスワードが正しくありません」
```

#### API仕様

**ログイン**
```
POST /api/auth/login
Request:
{
  "email": "member@example.com",
  "password": "SecurePass123"
}

Response (成功):
{
  "success": true,
  "data": {
    "tokens": { "accessToken": "...", "refreshToken": "..." },
    "user": {
      "id": "...",
      "email": "...",
      "lastName": "...",
      "firstName": "...",
      "profileCompleted": true
    }
  }
}

Response (エラー):
{
  "success": false,
  "error": "メールアドレスまたはパスワードが正しくありません"
}
```

**ログイン後のユーザー情報取得**
```
GET /api/auth/me
Headers: Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "email": "...",
    "memberNumber": "RC2024001",
    "lastName": "...",
    "firstName": "...",
    "joinDate": "2024-01-15",
    "position": "会員",
    "industryClassification": "IT・メディア",
    "companyName": "株式会社〇〇",
    "department": "営業部",
    "phoneNumber": "090-1234-5678",
    "hometown": "東京都",
    "school": "〇〇大学",
    "hobbies": "ゴルフ、読書",
    "introduction": "よろしくお願いします",
    "avatarUrl": "...",
    "profileCompleted": true,
    "userType": "member",
    "club": { "id": "...", "name": "〇〇ロータリークラブ" }
  }
}
```

---

### 3. パスワードを忘れた場合のリセットフロー

パスワードを忘れた会員が再設定する場合。

```
[ログイン画面] → 「パスワードを忘れた方」リンク
    ↓
[パスワード再設定画面] forgot-password.tsx
    ↓ POST /api/auth/reset/send-code
    │
    ├─ 成功 → [認証コード入力画面] verify-code.tsx (mode=reset)
    │           ↓ POST /api/auth/verify-code
    │           ↓
    │         [新パスワード設定画面] reset-password.tsx
    │           ↓ POST /api/auth/reset/password
    │           ↓
    │         [成功画面] → ログイン画面へ
    │
    └─ エラー → 「このアドレスは登録されていません」
```

#### API仕様

**1. リセットコード送信**
```
POST /api/auth/reset/send-code
Request:
{
  "email": "member@example.com"
}

Response (成功):
{
  "success": true,
  "message": "認証コードを送信しました"
}

Response (エラー - 未登録):
{
  "success": false,
  "error": "このアドレスは登録されていません"
}
```

**2. パスワードリセット**
```
POST /api/auth/reset/password
Request:
{
  "email": "member@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}

Response (成功):
{
  "success": true,
  "message": "パスワードを再設定しました"
}

Response (エラー):
{
  "success": false,
  "error": "認証コードが正しくありません"
}
```

---

### 4. 休会中（inactive）ユーザー

休会中のユーザーはログインできない。

```
[ログイン試行]
    ↓
[エラー] → 「アカウントが無効になっています。管理者にお問い合わせください」
```

---

### 5. 退会（withdrawn）ユーザー

退会済みユーザーはログインできない。

```
[ログイン試行]
    ↓
[エラー] → 「アカウントが見つかりません」
```

---

## 認証コードの仕様

| 項目 | 値 |
|------|-----|
| 桁数 | 6桁（数字のみ） |
| 有効期限 | 10分 |
| 再送クールダウン | 60秒 |
| 用途 | 新規登録 / パスワードリセット 共通 |

### 認証コードの管理

1. **送信時**: `verificationCode` と `verificationCodeExpiry` をDBに保存
2. **検証時**: コードと有効期限をチェック（クリアしない）
3. **パスワード設定/リセット時**: コードを再検証し、成功後にクリア

---

## パスワード要件

| 項目 | 要件 |
|------|------|
| 最小文字数 | 8文字以上 |
| 大文字 | 1文字以上含む |
| 小文字 | 1文字以上含む |
| 数字 | 1文字以上含む |

---

## 画面遷移図

```
                    ┌─────────────────────────────────────┐
                    │           初回起動画面              │
                    │     index.tsx (auth check)         │
                    └──────────────┬──────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
    ┌─────────────────┐                      ┌─────────────────┐
    │   新規登録       │                      │    ログイン      │
    │   register.tsx  │                      │   login.tsx     │
    └────────┬────────┘                      └────────┬────────┘
             │                                        │
             ▼                                        │
    ┌─────────────────┐                               │
    │  認証コード入力  │◄──────────────────────────────┤
    │  verify-code.tsx│                               │
    │  (mode=register)│                               │
    └────────┬────────┘                               │
             │                                        │
             ▼                                        │
    ┌─────────────────┐                               │
    │  パスワード設定  │                               │
    │  set-password   │                               │
    └────────┬────────┘                               │
             │                                        │
             ▼                                        │
    ┌─────────────────┐                               │
    │ プロフィール設定 │                               │
    │ profile-setup   │                               │
    └────────┬────────┘                               │
             │                                        │
             ▼                                        ▼
    ┌─────────────────────────────────────────────────────┐
    │                    メイン画面（タブ）                │
    │                    (tabs)/_layout                   │
    └─────────────────────────────────────────────────────┘


    [パスワードリセットフロー]

    ┌─────────────────┐
    │  ログイン画面    │
    │   login.tsx     │
    └────────┬────────┘
             │ 「パスワードを忘れた方」
             ▼
    ┌─────────────────┐
    │パスワード再設定  │
    │forgot-password  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  認証コード入力  │
    │  verify-code    │
    │  (mode=reset)   │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │新パスワード設定  │
    │ reset-password  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   成功画面       │
    │ → ログイン画面へ │
    └─────────────────┘
```

---

## ファイル構成

```
apps/mobile/
├── app/
│   ├── (auth)/                    # 認証フロー
│   │   ├── _layout.tsx            # 認証レイアウト
│   │   ├── login.tsx              # ログイン画面
│   │   ├── register.tsx           # メールアドレス入力（新規登録）
│   │   ├── verify-code.tsx        # 認証コード入力（共通）
│   │   ├── set-password.tsx       # パスワード設定（新規登録）
│   │   ├── profile-setup.tsx      # プロフィール設定
│   │   ├── forgot-password.tsx    # パスワード忘れ（メール入力）
│   │   └── reset-password.tsx     # 新パスワード設定
│   │
│   └── (tabs)/                    # メイン画面
│       ├── _layout.tsx            # タブレイアウト
│       ├── index.tsx              # ホーム
│       ├── events.tsx             # イベント
│       ├── members.tsx            # 会員名簿
│       ├── notifications.tsx      # お知らせ
│       └── mypage.tsx             # マイページ
│
└── src/
    ├── services/
    │   └── api.ts                 # API通信
    ├── stores/
    │   └── auth.store.ts          # 認証状態管理
    └── types/
        └── index.ts               # 型定義
```

---

## バックエンドエンドポイント一覧

| メソッド | エンドポイント | 用途 | 対象ステータス |
|---------|---------------|------|--------------|
| POST | `/api/auth/send-code` | 認証コード送信（新規登録） | invited |
| POST | `/api/auth/verify-code` | 認証コード検証 | invited, active |
| POST | `/api/auth/set-password` | パスワード設定（新規） | invited |
| POST | `/api/auth/login` | ログイン | active |
| POST | `/api/auth/reset/send-code` | リセットコード送信 | active |
| POST | `/api/auth/reset/password` | パスワードリセット | active |
| GET | `/api/auth/me` | ユーザー情報取得 | active |
| POST | `/api/auth/refresh` | トークンリフレッシュ | active |
| POST | `/api/auth/logout` | ログアウト | active |

---

## エラーメッセージ一覧

| シチュエーション | エラーメッセージ |
|-----------------|-----------------|
| 未登録メール（新規登録時） | このアドレスは登録されていません |
| 登録済みメール（新規登録時） | このアドレスはすでに登録済みです |
| 未登録メール（リセット時） | このアドレスは登録されていません |
| 認証コード不一致 | 認証コードが正しくありません |
| 認証コード期限切れ | 認証コードが正しくありません |
| ログイン失敗 | メールアドレスまたはパスワードが正しくありません |
| 休会中ユーザー | アカウントが無効になっています |
| パスワード要件未満 | パスワードは8文字以上で、大文字・小文字・数字を含む必要があります |

---

## セキュリティ考慮事項

1. **認証コード**
   - 6桁のランダム数字
   - 有効期限10分
   - 検証後、パスワード設定/リセット完了時にクリア

2. **パスワード**
   - bcryptでハッシュ化（ソルトラウンド: 10）
   - 平文での保存禁止

3. **トークン**
   - アクセストークン: 有効期限1時間
   - リフレッシュトークン: 有効期限7日
   - expo-secure-storeで安全に保存

4. **レート制限**
   - 認証コード再送: 60秒のクールダウン
   - ログイン試行: 5回失敗で一時ロック（推奨）

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-01 | 初版作成 |
