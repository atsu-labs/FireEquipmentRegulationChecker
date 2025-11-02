# Technology Stack

## Architecture

**Single-Page Application (SPA)**: クライアントサイドで完結するブラウザアプリケーション（サーバー不要）

## Core Technologies

- **Language**: TypeScript 5.8+（strict mode）
- **Framework**: Vue 3（Composition API）
- **UI Library**: Vuetify 3（Material Design）
- **Build Tool**: Vite 7
- **Testing**: Vitest + @vue/test-utils + happy-dom

## Key Libraries

- **@mdi/font**: Material Design Icons（Vuetify と連携）
- **vite-plugin-vuetify**: Vuetify の自動インポート対応

## Development Standards

### Type Safety

- TypeScript strict mode 有効
- すべての入力は `Ref<T>` で型定義（`types/index.ts` 参照）
- 判定ロジックは純粋関数として型安全に実装

### Code Quality

- **ESLint**: `eslint-plugin-vue`, `typescript-eslint` による静的解析
- **Linting**: `npm run lint` / `npm run lint:fix`
- **Testing**: 213+ テストケース（各条文ロジックを網羅）

### Testing

- **Unit Tests**: Vitest + happy-dom で判定ロジックを検証
- **Coverage**: 条文ごとにケースを分割（`article*Logic.spec.ts`）
- **Run**: `npm test`

## Development Environment

### Required Tools

- Node.js 20+（推奨）
- npm（パッケージ管理）

### Common Commands

```bash
# Dev: ローカル開発サーバー起動
npm run dev

# Build: 本番用ビルド
npm run build

# Test: ユニットテスト実行
npm test

# Lint: コード品質チェック
npm run lint
```

## Key Technical Decisions

- **Vue Composition API**: 判定ロジックを再利用可能な composable として分離（`useArticle*Logic`）
- **型定義の集中管理**: `types/index.ts` で全入力型・結果型を一元定義
- **ロジック・UI の分離**: `composables/articles/` にビジネスロジック、`components/` に UI コンポーネント
- **テストファースト**: 条文追加時は必ずテストケースとセットで実装

---

_Focus: TypeScript strict + Vue Composition API による型安全で保守性の高い SPA_
