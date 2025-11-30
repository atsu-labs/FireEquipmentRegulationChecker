import { computed } from "vue";
import { useCodeMatches } from "@/composables/utils";
import type { JudgementResult, Article25UserInput, Floor } from "@/types";

// ========================================
// 定数定義
// ========================================

// 1号: (6)項
const ITEM1_USE_CODES = ["annex06"];

// 2号: (5)項
const ITEM2_USE_CODES = ["annex05"];

// 3号: (1)~(4), (7)~(11)項
const ITEM3_USE_CODES = [
  "annex01",
  "annex02",
  "annex03",
  "annex04",
  "annex07",
  "annex08",
  "annex09",
  "annex10",
  "annex11",
];

// 4号: (12), (15)項
const ITEM4_USE_CODES = ["annex12", "annex15"];

// 5号 特例: 2階以上から対象の用途
const ITEM5_SPECIAL_CODES = ["annex02", "annex03"];

// ========================================
// 型定義
// ========================================

interface JudgementContext {
  use: string;
  basisSuffix: string;
  messagePrefix: string;
}

interface FloorCheckResult {
  result: JudgementResult | null;
}

// ========================================
// 判定関数
// ========================================

/**
 * 第1号: (6)項 - 福祉施設等
 */
function checkItem1(
  ctx: JudgementContext,
  floor: Floor,
  floorIdentifier: string
): JudgementResult | null {
  if (!useCodeMatches(ctx.use, ITEM1_USE_CODES)) return null;

  const capacity = floor.capacity || 0;

  if (floor.level >= 2 || floor.type === "basement") {
    if (capacity >= 20) {
      return {
        required: "warning",
        message: `${ctx.messagePrefix}(6)項の${floorIdentifier}は、収容人員が20人以上です。下階に特定用途がない場合でも避難器具が必要です。下階の用途を確認してください。`,
        basis: `令第25条第1項第1号${ctx.basisSuffix}`,
      };
    }
    if (capacity >= 10) {
      return {
        required: "warning",
        message: `${ctx.messagePrefix}(6)項の${floorIdentifier}は、収容人員が10人以上です。下階に特定用途（(1)～(4)項など）がある場合、避難器具が必要です。下階の用途を確認してください。`,
        basis: `令第25条第1項第1号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第2号: (5)項 - 旅館・ホテル等
 */
function checkItem2(
  ctx: JudgementContext,
  floor: Floor,
  floorIdentifier: string
): JudgementResult | null {
  if (!useCodeMatches(ctx.use, ITEM2_USE_CODES)) return null;

  const capacity = floor.capacity || 0;

  if (floor.level >= 2 || floor.type === "basement") {
    if (capacity >= 30) {
      return {
        required: "warning",
        message: `${ctx.messagePrefix}(5)項の${floorIdentifier}は、収容人員が30人以上です。下階に特定用途がない場合でも避難器具が必要です。下階の用途を確認してください。`,
        basis: `令第25条第1項第2号${ctx.basisSuffix}`,
      };
    }
    if (capacity >= 10) {
      return {
        required: "warning",
        message: `${ctx.messagePrefix}(5)項の${floorIdentifier}は、収容人員が10人以上です。下階に特定用途（(1)～(4)項など）がある場合、避難器具が必要です。下階の用途を確認してください。`,
        basis: `令第25条第1項第2号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第3号: (1)~(4), (7)~(11)項 - 劇場、飲食店、店舗等
 */
function checkItem3(
  ctx: JudgementContext,
  floor: Floor,
  floorIdentifier: string
): JudgementResult | null {
  if (!useCodeMatches(ctx.use, ITEM3_USE_CODES)) return null;

  const capacity = floor.capacity || 0;

  if ((floor.level >= 2 || floor.type === "basement") && capacity >= 50) {
    return {
      required: "warning",
      message: `${ctx.messagePrefix}(1)～(4)項、(7)～(11)項の${floorIdentifier}は、収容人員が50人以上です。2階が耐火構造でない場合、避難器具が必要です。建物の構造を確認してください。`,
      basis: `令第25条第1項第3号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第4号: (12), (15)項 - 工場、事務所等
 */
function checkItem4(
  ctx: JudgementContext,
  floor: Floor,
  floorIdentifier: string
): JudgementResult | null {
  if (!useCodeMatches(ctx.use, ITEM4_USE_CODES)) return null;

  const capacity = floor.capacity || 0;

  if (floor.level >= 3 || floor.type === "basement") {
    if (capacity >= 150) {
      return {
        required: "warning",
        message: `${ctx.messagePrefix}(12)項、(15)項の${floorIdentifier}は、収容人員が150人以上です。無窓階でない場合でも避難器具が必要です。無窓階かどうか確認してください。`,
        basis: `令第25条第1項第4号${ctx.basisSuffix}`,
      };
    }
    if (capacity >= 100) {
      return {
        required: "warning",
        message: `${ctx.messagePrefix}(12)項、(15)項の${floorIdentifier}は、収容人員が100人以上です。この階が無窓階の場合、避難器具が必要です。無窓階かどうか確認してください。`,
        basis: `令第25条第1項第4号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第5号: その他すべて
 */
function checkItem5(
  ctx: JudgementContext,
  floor: Floor,
  floorIdentifier: string
): JudgementResult | null {
  const capacity = floor.capacity || 0;
  const item5SpecialCases =
    useCodeMatches(ctx.use, ITEM5_SPECIAL_CODES) ||
    (ctx.use?.startsWith("annex16_i") && false); // TODO: 16項イの下階判定

  if (
    (floor.level >= 3 || (item5SpecialCases && floor.level >= 2)) &&
    capacity >= 10
  ) {
    return {
      required: "warning",
      message: `${ctx.messagePrefix}${floorIdentifier}は、収容人員が10人以上です。地上への直通階段が1つ以下の場合、避難器具が必要です。階段の数を確認してください。`,
      basis: `令第25条第1項第5号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 1フロアに対する判定を行う
 */
function judgeFloor(ctx: JudgementContext, floor: Floor): FloorCheckResult {
  const floorIdentifier =
    floor.type === "basement" ? "地階" : `${floor.level}階`;

  // 1号: (6)項
  const item1 = checkItem1(ctx, floor, floorIdentifier);
  if (item1) return { result: item1 };

  // 2号: (5)項
  const item2 = checkItem2(ctx, floor, floorIdentifier);
  if (item2) return { result: item2 };

  // 3号: (1)~(4), (7)~(11)項
  const item3 = checkItem3(ctx, floor, floorIdentifier);
  if (item3) return { result: item3 };

  // 4号: (12), (15)項
  const item4 = checkItem4(ctx, floor, floorIdentifier);
  if (item4) return { result: item4 };

  // 5号: その他
  const item5 = checkItem5(ctx, floor, floorIdentifier);
  if (item5) return { result: item5 };

  return { result: null };
}

/**
 * 令第25条の判定を行う
 */
function judgeArticle25(
  ctx: JudgementContext,
  floors: Floor[]
): JudgementResult {
  // 避難階及び11階以上の階は判定対象外
  // 避難階の判定は未実装
  const targetFloors = floors.filter((f) => f.level < 11);

  for (const floor of targetFloors) {
    const checkResult = judgeFloor(ctx, floor);
    if (checkResult.result) {
      return checkResult.result;
    }
  }

  return {
    required: false,
    message: "避難器具の設置義務の条件に該当しません。",
    basis: "",
  };
}

// ========================================
// メインロジック
// ========================================

export function useArticle25Logic(userInput: Article25UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, floors } = userInput;

    const use = buildingUse.value;

    if (!use) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    // 複合用途（16項イ/ロ）の場合、令第九条適用で各用途部分ごとに判定
    if (useCodeMatches(use, ["annex16_i", "annex16_ro"])) {
      for (const floor of floors.value) {
        const componentUses = floor.componentUses ?? [];

        for (const comp of componentUses) {
          const ctx: JudgementContext = {
            use: comp.useCode,
            basisSuffix: "（令第九条適用）",
            messagePrefix: "複合用途内の特定用途部分について、",
          };

          // その用途での階判定（その階のみ対象）
          const virtualFloor: Floor = {
            ...floor,
            capacity: comp.capacity ?? 0,
          };

          const checkResult = judgeFloor(ctx, virtualFloor);
          if (checkResult.result) {
            return checkResult.result;
          }
        }
      }

      // 複合用途全体としての判定
      const ctx: JudgementContext = {
        use,
        basisSuffix: "",
        messagePrefix: "",
      };
      return judgeArticle25(ctx, floors.value);
    }

    // 通常の単一用途の判定
    const ctx: JudgementContext = {
      use,
      basisSuffix: "",
      messagePrefix: "",
    };

    return judgeArticle25(ctx, floors.value);
  });

  return {
    regulationResult,
  };
}
