# 開発ガイドライン

このドキュメントはAIエージェントおよび開発者向けの開発ガイドラインです。

## プロジェクト構成

```
src/
├── components/          # Vueコンポーネント
├── composables/
│   ├── articles/        # 条文ロジック（条文ごとに1ファイル）
│   └── utils.ts         # 共通ユーティリティ
├── data/                # マスターデータ（用途コード等）
├── tests/               # テストファイル
└── types/               # 型定義
```

## 実装状況

### 実装済み条文

#### 消火設備（5条文）
- [x] 令第10条 - 消火器
- [x] 令第11条 - 屋内消火栓設備
- [x] 令第12条 - スプリンクラー設備
- [x] 令第13条 - 水噴霧消火設備等
- [x] 令第19条 - 屋外消火栓設備

#### 警報設備（5条文）
- [x] 令第21条 - 自動火災報知設備
- [x] 令第21条の2 - ガス漏れ火災警報設備
- [x] 令第22条 - 漏電火災警報器
- [x] 令第23条 - 消防機関へ通報する火災報知設備
- [x] 令第24条 - 非常警報器具・設備

#### 避難設備（2条文）
- [x] 令第25条 - 避難器具
- [x] 令第26条 - 誘導灯・誘導標識

#### 消防用水（1条文）
- [x] 令第27条 - 消防用水

#### 消火活動上必要な施設（5条文）
- [x] 令第28条 - 排煙設備
- [x] 令第28条の2 - 連結散水設備
- [x] 令第29条 - 連結送水管
- [x] 令第29条の2 - 非常コンセント設備
- [x] 令第29条の3 - 無線通信補助設備

## アーキテクチャパターン

### JudgementContext パターン

各条文ロジックは `JudgementContext` 型を引数として受け取ります。

```typescript
interface JudgementContext {
  baseUseCode: string;          // 判定対象の用途コード
  floors: FloorInfo[];          // 階情報（該当用途のみ）
  buildingTotalArea: number;    // 建物全体の延べ面積
  buildingTotalFloors: number;  // 建物全体の階数
  // その他のプロパティ...
}
```

### 令第九条対応

複合用途防火対象物（16項イ/ロ）では、令第九条に基づき各構成用途を単独の防火対象物とみなして判定します。

```typescript
// 複合用途の場合
if (use.parentCode === '16イ' || use.parentCode === '16ロ') {
  // 各用途ごとにJudgementContextを生成
  const context = createJudgementContext(use, floors, building);
  const result = articleLogic(context);
}
```

### useCodeMatches ユーティリティ

用途コードのマッチング判定には `useCodeMatches` 関数を使用します。

```typescript
import { useCodeMatches } from '../utils';

// 用途コードが指定パターンにマッチするか判定
if (useCodeMatches(code, ['1イ', '1ロ', '2イ', '2ロ', '2ハ', '2ニ'])) {
  // 特定用途として処理
}
```

## テストガイドライン

### テストファイルの配置

```
src/tests/
├── article10Logic.spec.ts
├── article11Logic.spec.ts
└── ...
```

### テスト実行

```bash
# 全テスト実行
npm test

# 特定ファイルのテスト
npm test -- article10Logic

# ウォッチモード
npm test -- --watch
```

## 変更履歴

### 2024年 - JudgementContext リファクタリング

- すべての条文ロジックを JudgementContext パターンに統一
- 令第九条（複合用途のみなし判定）対応を追加
- article11Logic, article22Logic に floors パラメータを追加
