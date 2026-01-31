# 技術スタック

## フロントエンド

### Mobile App (iOS/Android)

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| Framework | React Native + Expo | SDK 54 |
| Language | TypeScript | 5.x |
| Routing | Expo Router | v3 |
| State | Zustand | 4.x |
| Styling | StyleSheet | - |


### Web Apps 

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| Framework | Next.js | 14.x (App Router) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | - |
| Forms | react-hook-form + Zod | - |

---

## バックエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| Runtime | Node.js | 20.x LTS |
| Framework | Express.js | 4.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| Database | MySQL | 8.0 |
| Validation | Zod | 3.x |
| Auth | Passport.js + JWT | - |

---

## インフラ・ツール

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| Monorepo | pnpm + Turborepo | パッケージ管理 |
| Mobile Build | EAS Build | iOS/Android配布 |

---

## API設計

- **形式**: RESTful API
- **認証**: JWT Bearer Token
- **レスポンス形式**:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

詳細は [api-design.md](./api-design.md) を参照。

---

## データベース設計

- **ORM**: Prisma
- **スキーマ**: `backend/prisma/schema.prisma`

