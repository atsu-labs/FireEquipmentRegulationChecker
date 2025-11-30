import { computed } from "vue";
import type { Article29_2UserInput, JudgementResult } from "@/types";
import { getUseDisplayName } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
  totalFloorsAboveGround: number;
};

/**
 * 第一号の判定: 地階を除く階数が11以上
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  if (ctx.totalFloorsAboveGround >= 11) {
    return {
      required: true,
      message: `地階を除く階数が11以上（${ctx.totalFloorsAboveGround}階）のため、非常コンセント設備の設置が必要です。`,
      basis: "令第二十九条の二第一号",
    };
  }
  return null;
}

/**
 * 第二号の判定: (16の2)項で延べ面積1,000㎡以上
 */
function checkItem2(ctx: JudgementContext): JudgementResult | null {
  if (ctx.useCode === "annex16_2" && ctx.totalArea >= 1000) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）で延べ面積が1,000㎡以上（${ctx.totalArea}㎡）のため、非常コンセント設備の設置が必要です。`,
      basis: "令第二十九条の二第二号",
    };
  }
  return null;
}

/**
 * 第29条の2（非常コンセント設備）の判定を行う統括関数
 */
function judgeArticle29_2(ctx: JudgementContext): JudgementResult {
  const checks = [checkItem1, checkItem2];

  for (const check of checks) {
    const result = check(ctx);
    if (result) return result;
  }

  return {
    required: false,
    message: "非常コンセント設備の設置義務はありません。",
    basis: "－",
  };
}

export function useArticle29_2Logic(userInput: Article29_2UserInput) {
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

    const totalFloorsAboveGround = floors.value.filter(
      (f) => f.type === "ground"
    ).length;

    const context: JudgementContext = {
      useCode,
      useDisplay: getUseDisplayName(useCode),
      totalArea: totalFloorAreaInput.value || 0,
      totalFloorsAboveGround,
    };

    return judgeArticle29_2(context);
  });

  return {
    regulationResult,
  };
}
