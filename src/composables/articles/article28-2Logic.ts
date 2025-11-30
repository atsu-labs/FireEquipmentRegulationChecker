import { computed } from "vue";
import type { Article28_2UserInput, JudgementResult, Floor } from "@/types";
import { useCodeMatches, getUseDisplayName } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
  basementFloorArea: number;
};

// 令第28条の2の対象となる用途コードのリスト
const TARGET_USE_CODES = [
  "annex01", // (1)項
  "annex02", // (2)項
  "annex03", // (3)項
  "annex04", // (4)項
  "annex05", // (5)項
  "annex06", // (6)項
  "annex07", // (7)項
  "annex08", // (8)項
  "annex09", // (9)項
  "annex10", // (10)項
  "annex11", // (11)項
  "annex12", // (12)項
  "annex13", // (13)項
  "annex14", // (14)項
  "annex15", // (15)項
  "annex16_2", // (16の2)項
  "annex17", // (17)項
];

/**
 * 対象用途かどうかをチェック
 */
function checkTargetUse(ctx: JudgementContext): JudgementResult | null {
  if (!useCodeMatches(ctx.useCode, TARGET_USE_CODES)) {
    return {
      required: false,
      message: "連結散水設備の設置義務はありません。",
      basis: "対象外の用途",
    };
  }
  return null;
}

/**
 * (16の2)項の判定: 延べ面積700㎡以上
 */
function checkUndergroundShopping(
  ctx: JudgementContext
): JudgementResult | null {
  if (ctx.useCode === "annex16_2" && ctx.totalArea >= 700) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）であり、延べ面積が700㎡以上（${ctx.totalArea}㎡）のため、連結散水設備の設置が必要です。`,
      basis: "令第二十八条の二",
    };
  }
  return null;
}

/**
 * その他対象用途の判定: 地階の床面積合計700㎡以上
 */
function checkBasementArea(ctx: JudgementContext): JudgementResult | null {
  // (16の2)項以外の対象用途
  if (ctx.useCode !== "annex16_2" && ctx.basementFloorArea >= 700) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）であり、地階の床面積の合計が700㎡以上（${ctx.basementFloorArea}㎡）のため、連結散水設備の設置が必要です。`,
      basis: "令第二十八条の二",
    };
  }
  return null;
}

/**
 * 第28条の2（連結散水設備）の判定を行う統括関数
 */
function judgeArticle28_2(ctx: JudgementContext): JudgementResult {
  // 対象用途かどうかをチェック
  const targetUseResult = checkTargetUse(ctx);
  if (targetUseResult) return targetUseResult;

  // (16の2)項の判定
  const undergroundResult = checkUndergroundShopping(ctx);
  if (undergroundResult) return undergroundResult;

  // その他対象用途の判定
  const basementResult = checkBasementArea(ctx);
  if (basementResult) return basementResult;

  return {
    required: false,
    message: "連結散水設備の設置義務はありません。",
    basis: "－",
  };
}

/**
 * 地階の床面積合計を計算
 */
function calculateBasementFloorArea(floors: Floor[]): number {
  return floors
    .filter((f) => f.type === "basement")
    .reduce((sum, f) => sum + (f.floorArea || 0), 0);
}

export function useArticle28_2Logic(userInput: Article28_2UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, totalFloorAreaInput, floors } = userInput;
    const useCode = buildingUse.value;

    if (!useCode) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "－",
      };
    }

    const context: JudgementContext = {
      useCode,
      useDisplay: getUseDisplayName(useCode),
      totalArea: totalFloorAreaInput.value || 0,
      basementFloorArea: calculateBasementFloorArea(floors.value),
    };

    return judgeArticle28_2(context);
  });

  return {
    regulationResult,
  };
}
