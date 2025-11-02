# Project Structure

## Organization Philosophy

**Domain-driven + Layer separation**:

- 消防法の条文（Article）をドメインの単位とし、条文ごとにロジック・テストを分離
- UI（components）とビジネスロジック（composables）を明確に分離

## Directory Patterns

### `/src/composables/articles/`

**Purpose**: 条文判定ロジックの集約  
**Pattern**: `article{条文番号}Logic.ts`（例: `article10Logic.ts` = 令第 10 条）  
**Example**:

```typescript
// article10Logic.ts
export function useArticle10Logic(userInput: Article10UserInput) {
  const regulationResult = computed((): JudgementResult => {
    // 条文の判定ロジック
  });
  return { regulationResult };
}
```

### `/src/components/`

**Purpose**: Vue コンポーネント（UI）  
**Pattern**: 役割ごとに PascalCase（例: `BuildingInputStepper.vue`, `ResultsPanel.vue`）  
**Example**:

- `BuildingInputStepper.vue`: 入力フォーム全体（ステップ形式）
- `ResultsPanel.vue`: 判定結果の表示パネル

### `/src/tests/`

**Purpose**: ユニットテスト  
**Pattern**: `article{条文番号}Logic.spec.ts`（判定ロジックに対応）  
**Example**:

```typescript
// article10Logic.spec.ts
describe("useArticle10Logic", () => {
  it("should require extinguisher for item01_i", () => {
    // テストケース
  });
});
```

### `/src/types/`

**Purpose**: 型定義の一元管理  
**Pattern**: `index.ts` にすべての入力型・結果型を集約  
**Example**:

```typescript
export interface Article10UserInput {
  buildingUse: Ref<string | null>;
  totalFloorAreaInput: Ref<number | null>;
  // ...
}
export interface JudgementResult {
  required: boolean | "warning" | "info";
  message: string;
  basis: string;
}
```

### `/src/data/`

**Purpose**: マスターデータ（防火対象物の用途リスト等）  
**Pattern**: `buildingUses.ts` に用途コード・名称のリスト

## Naming Conventions

- **Files (Logic)**: `article{条文番号}Logic.ts`（例: `article10Logic.ts`, `article21-2Logic.ts`）
- **Files (Components)**: `PascalCase.vue`（例: `BuildingInputStepper.vue`）
- **Files (Tests)**: `article{条文番号}Logic.spec.ts`（ロジックと 1 対 1 対応）
- **Functions (Composables)**: `useArticle{条文番号}Logic`
- **Types**: `Article{条文番号}UserInput`, `JudgementResult`

## Import Organization

```typescript
// 絶対インポート（@/ = src/）
import type { Article10UserInput, JudgementResult } from "@/types";
import { getUseDisplayName, useCodeMatches } from "@/composables/utils";
import { buildingUses } from "@/data/buildingUses";

// 相対インポート（同階層）
import { something } from "./local";
```

**Path Aliases**:

- `@/`: `/src/` へのエイリアス（`vite.config.ts` で定義）

## Code Organization Principles

- **条文単位の疎結合**: 各条文のロジックは独立して実装・テスト可能
- **型定義ファースト**: すべての入力は `types/index.ts` で定義してから実装
- **Pure Functions**: composables はリアクティブな計算のみ行い、副作用を持たない
- **テストの網羅性**: 条文の各号・項ごとに最低 1 ケースを記述

## Example Flow

1. **型定義**: `types/index.ts` に `Article10UserInput` 追加
2. **ロジック実装**: `composables/articles/article10Logic.ts` に判定ロジック
3. **テスト作成**: `tests/article10Logic.spec.ts` にユニットテスト
4. **UI 統合**: `App.vue` や `ResultsPanel.vue` で呼び出し

---

_Focus: 条文ドメイン単位で分割し、型安全・テスト容易性を優先した構造_
