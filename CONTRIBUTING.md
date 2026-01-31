## 開発ルール

### コーディング規約

- コンポーネント名: `PascalCase`
- ファイル名: `kebab-case`
- 日本語コメント推奨

### UIアイコン

- **絵文字（Emoji）をUIアイコンとして使用しない**
- 代わりにSVGアイコンライブラリを使用すること
  - Mobile (React Native): `lucide-react-native`
  - Web (Next.js): `lucide-react` または Heroicons
- 例: `📝` → `<FileText />`, `🔔` → `<Bell />`, `👁️` → `<Eye />`

### API設計

- RESTful API
- エンドポイント命名: `kebab-case`
- レスポンス形式: `{ success: boolean, data: T, error?: string }`

### enum値の大文字・小文字

- 全アプリで**大文字**に統一

### データベース

- DBテーブル変更する前に必ず確認
- DB強制的にデータをリセットしない
- DBカラム追加は「DB変更 → スキーマ更新 → generate」の順序で行う

### スキーマ・型定義の同期

- `prisma/schema.prisma` 変更時は `npx prisma generate` を実行（必須）
- `packages/shared-types/` の型変更時は全アプリへの影響を確認
- バックエンドAPIレスポンス変更時はフロントエンドの型も更新
- Prismaエラー発生時のみキャッシュクリア: `rm -rf node_modules/.prisma && npx prisma generate`

### 禁止コマンド

以下のコマンドは**使用禁止**（データ消失・履歴破壊のリスク）

#### Prisma
- `prisma db pull` スキーマ上書き、`@@map()`や`@default(uuid())`消失
- `prisma migrate reset` DB完全リセット、全データ消失
- `prisma db push --force-reset` DB強制リセット

詳細: [docs/troubleshooting/prisma-model-naming.md](./docs/troubleshooting/prisma-model-naming.md)

#### Git
- `git push --force` (main) 履歴破壊、他の作業消失
- `git reset --hard` ローカル変更消失
- `git clean -fd` 未追跡ファイル消失

### Git運用

- 機能単位でコミット（1コミット = 1機能/1修正）
- コミットメッセージは日本語可、プレフィックス使用（feat:, fix:, docs:, refactor:）
- main/masterへのforce pushは禁止

### 環境変数

- 新しい環境変数追加時は `.env.example` も更新
- 機密情報（APIキー等）はコミットしない

### エラーハンドリング

- APIエラーは適切なHTTPステータスコードを返す
- フロントエンドでユーザーにわかりやすいエラーメッセージを表示

### 開発フロー

- 機能追加/修正完了後に `docs/specs/` に最新仕様を更新
- backend, apps/* 修正時に他サイトへの影響を検討し、修正するか確認

### 実装前の確認

- 「検討」「方針」「案」などのキーワードがある場合は、**すぐに実装しない**
- まず案を提示し、ユーザーの同意を得てから実装を開始する
- 複数の実装方法がある場合は選択肢を提示して確認する

### 会話履歴

- `/export` コマンドで会話履歴を保存
- 保存先: `.conversation/yyyy-mm-dd-HHmm.txt`

