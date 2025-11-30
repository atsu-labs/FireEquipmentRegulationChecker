import { computed } from "vue";
import type { Article29UserInput, JudgementResult } from "@/types";
import { getUseDisplayName } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
  totalFloorsAboveGround: number;
  hasRoadPart: boolean;
};

/**
 * 第一号の判定: 地階を除く階数が7以上の建築物
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  if (ctx.totalFloorsAboveGround >= 7) {
    return {
      required: true,
      message: `地階を除く階数が7以上（${ctx.totalFloorsAboveGround}階）のため、連結送水管の設置が必要です。`,
      basis: "令第二十九条第一号",
    };
  }
  return null;
}

/**
 * 第二号の判定: 地階を除く階数が5以上で、延べ面積が6,000平方メートル以上の建築物
 */
function checkItem2(ctx: JudgementContext): JudgementResult | null {
  if (ctx.totalFloorsAboveGround >= 5 && ctx.totalArea >= 6000) {
    return {
      required: true,
      message: `地階を除く階数が5以上（${ctx.totalFloorsAboveGround}階）かつ延べ面積が6,000㎡以上（${ctx.totalArea}㎡）のため、連結送水管の設置が必要です。`,
      basis: "令第二十九条第二号",
    };
  }
  return null;
}

/**
 * 第三号の判定: 別表第一（十六の二）項に掲げる防火対象物で、延べ面積が1,000平方メートル以上のもの（地下街）
 */
function checkItem3(ctx: JudgementContext): JudgementResult | null {
  if (ctx.useCode === "annex16_2" && ctx.totalArea >= 1000) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）で延べ面積が1,000㎡以上（${ctx.totalArea}㎡）のため、連結送水管の設置が必要です。`,
      basis: "令第二十九条第三号",
    };
  }
  return null;
}

/**
 * 第四号の判定: 別表第一（十八）項に掲げる防火対象物（延長50メートル以上のアーケード）
 */
function checkItem4(ctx: JudgementContext): JudgementResult | null {
  if (ctx.useCode === "annex18") {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）のため、連結送水管の設置が必要です。`,
      basis: "令第二十九条第四号",
    };
  }
  return null;
}

/**
 * 第五号の判定: 道路の用に供される部分を有するもの
 */
function checkItem5(ctx: JudgementContext): JudgementResult | null {
  if (ctx.hasRoadPart) {
    return {
      required: true,
      message: `道路の用に供される部分を有するため、連結送水管の設置が必要です。`,
      basis: "令第二十九条第五号",
    };
  }
  return null;
}

/**
 * 第29条（連結送水管）の判定を行う統括関数
 */
function judgeArticle29(ctx: JudgementContext): JudgementResult | null {
  const checks = [checkItem1, checkItem2, checkItem3, checkItem4, checkItem5];

  for (const check of checks) {
    const result = check(ctx);
    if (result) return result;
  }

  return null;
}

export function useArticle29Logic(userInput: Article29UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, totalFloorAreaInput, floors, hasRoadPart } = userInput;

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
      hasRoadPart: hasRoadPart.value,
    };

    const result = judgeArticle29(context);

    if (result) {
      return result;
    }

    return {
      required: false,
      message: "連結送水管の設置義務はありません。",
      basis: "－",
    };
  });

  return {
    regulationResult,
  };
}
