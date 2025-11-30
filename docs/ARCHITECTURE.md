# アーキテクチャ

## 概要

本アプリケーションは、消防法施行令に基づく消防用設備の設置義務を自動判定するWebアプリケーションです。Vue 3 + TypeScript + Vite で構築されています。

## コンポーネント構成

```
App.vue
├── BuildingInputStepper.vue    # 入力フロー制御
│   ├── BuildingInfoStep.vue    # 基本情報入力
│   ├── FloorInfoStep.vue       # 階別情報入力
│   ├── Annex16InfoStep.vue     # 別表第1(16)項の追加情報
│   └── AdditionalInfoStep.vue  # 追加情報入力
└── ResultsPanel.vue            # 判定結果表示
```

## データフロー

```
ユーザー入力
    ↓
BuildingInputStepper（入力収集）
    ↓
BuildingInfo + FloorInfo[] + AdditionalInfo
    ↓
各条文ロジック（article*Logic.ts）
    ↓
JudgementResult[]
    ↓
ResultsPanel（結果表示）
```

## 型システム

### 主要な型定義（src/types/index.ts）

```typescript
// 建物情報
interface BuildingInfo {
  selectedUseCode: string;
  totalFloors: number;
  undergroundFloors: number;
  totalArea: number;
  // ...
}

// 階情報
interface FloorInfo {
  floorNumber: number;
  floorArea: number;
  hasSprinkler?: boolean;
  // ...
}

// 判定コンテキスト
interface JudgementContext {
  baseUseCode: string;
  floors: FloorInfo[];
  buildingTotalArea: number;
  buildingTotalFloors: number;
  // ...
}

// 判定結果
interface JudgementResult {
  article: string;
  required: boolean;
  reason: string;
  details?: string;
}
```

## 条文ロジック

### ファイル構成

```
src/composables/articles/
├── article10Logic.ts   # 消火器
├── article11Logic.ts   # 屋内消火栓設備
├── article12Logic.ts   # スプリンクラー設備
├── article13Logic.ts   # 水噴霧消火設備等
├── article19Logic.ts   # 屋外消火栓設備
├── article21Logic.ts   # 自動火災報知設備
├── article21-2Logic.ts # ガス漏れ火災警報設備
├── article22Logic.ts   # 漏電火災警報器
├── article23Logic.ts   # 消防機関へ通報する火災報知設備
├── article24Logic.ts   # 非常警報器具・設備
├── article25Logic.ts   # 避難器具
├── article26Logic.ts   # 誘導灯・誘導標識
├── article27Logic.ts   # 消防用水
├── article28Logic.ts   # 排煙設備
├── article28-2Logic.ts # 連結散水設備
├── article29Logic.ts   # 連結送水管
├── article29-2Logic.ts # 非常コンセント設備
└── article29-3Logic.ts # 無線通信補助設備
```

### 関数シグネチャ

各条文ロジックは以下の形式の関数をエクスポートします：

```typescript
export function article〇〇Logic(context: JudgementContext): JudgementResult {
  // 判定ロジック
  return {
    article: '令第〇〇条',
    required: true/false,
    reason: '判定理由',
  };
}
```

## ユーティリティ関数

### useCodeMatches（src/composables/utils.ts）

用途コードが指定されたパターンリストにマッチするかを判定します。

```typescript
function useCodeMatches(code: string, patterns: string[]): boolean
```

**マッチングルール：**
- 完全一致: `'1イ'` は `'1イ'` にマッチ
- プレフィックス一致: `'16イ(1)ロ'` は `'16イ'` にマッチ
- 親コード一致: `'2ニ'` を含む複合用途は `'2'` にマッチ

## 令第九条対応

### 概要

令第九条は、複合用途防火対象物（16項イ/ロ）について、各構成用途を単独の防火対象物とみなして設置義務を判定する規定です。

### 実装方法

```typescript
// App.vue での実装例
if (use.parentCode === '16イ' || use.parentCode === '16ロ') {
  // 当該用途の階情報のみを抽出
  const relevantFloors = floors.filter(f => f.useCode === use.code);
  
  // JudgementContext を生成
  const context: JudgementContext = {
    baseUseCode: use.code,
    floors: relevantFloors,
    buildingTotalArea: totalArea,
    buildingTotalFloors: totalFloors,
    // ...
  };
  
  // 条文ロジックで判定
  const result = articleLogic(context);
}
```

## テスト戦略

### テストファイル配置

各条文ロジックに対応するテストファイルを配置：

```
src/tests/
├── article10Logic.spec.ts
├── article11Logic.spec.ts
└── ...
```

### テストパターン

1. **基本ケース**: 用途コード別の設置義務判定
2. **面積閾値**: 境界値付近での判定
3. **階数条件**: 地階・無窓階・11階以上等
4. **複合条件**: 複数条件の組み合わせ
5. **令第九条**: 複合用途での各用途ごとの判定

### 実行コマンド

```bash
npm test                    # 全テスト
npm test -- article10Logic  # 特定条文のテスト
npm test -- --coverage      # カバレッジ付き
```
