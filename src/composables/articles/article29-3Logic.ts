import { computed } from "vue";
import type { Article29_3UserInput, JudgementResult } from "@/types";
import { getUseDisplayName } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
};

/**
 * (16の2)項の判定: 延べ面積1,000㎡以上
 */
function checkUndergroundShopping(
  ctx: JudgementContext
): JudgementResult | null {
  if (ctx.useCode === "annex16_2" && ctx.totalArea >= 1000) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）で延べ面積が1,000㎡以上（${ctx.totalArea}㎡）のため、無線通信補助設備の設置が必要です。`,
      basis: "令第二十九条の三",
    };
  }
  return null;
}

/**
 * 第29条の3（無線通信補助設備）の判定を行う統括関数
 */
function judgeArticle29_3(ctx: JudgementContext): JudgementResult {
  const undergroundResult = checkUndergroundShopping(ctx);
  if (undergroundResult) return undergroundResult;

  return {
    required: false,
    message: "無線通信補助設備の設置義務はありません。",
    basis: "－",
  };
}

export function useArticle29_3Logic(userInput: Article29_3UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, totalFloorAreaInput } = userInput;
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
    };

    return judgeArticle29_3(context);
  });

  return {
    regulationResult,
  };
}
