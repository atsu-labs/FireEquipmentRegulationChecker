import { computed } from "vue";
import type { JudgementResult, Article23UserInput, Floor } from "@/types";
import { useCodeMatches, getUseDisplayName } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
  isSection: boolean;
  basisSuffix: string;
};

// 第1号の対象用途
const ITEM1_USE_CODES = [
  "annex06_i_1",
  "annex06_i_2",
  "annex06_i_3",
  "annex06_ro",
  "annex16_2",
  "annex16_3",
];

// 第2号の対象用途
const ITEM2_USE_CODES = [
  "annex01",
  "annex02",
  "annex04",
  "annex05_i",
  "annex06_i_4",
  "annex06_ha",
  "annex06_ni",
  "annex12",
  "annex17",
];

// 第3号の対象用途
const ITEM3_USE_CODES = [
  "annex03",
  "annex05_ro",
  "annex07",
  "annex08",
  "annex09",
  "annex10",
  "annex11",
  "annex13",
  "annex14",
  "annex15",
];

// 電話で代替できない高リスク用途
const NON_ALTERNATIVE_CODES = [
  "annex06_i_1",
  "annex06_i_2",
  "annex06_i_3",
  "annex06_ro",
  "annex05_i",
  "annex06_i_4",
  "annex06_ha",
];

/**
 * 第1号の判定: 特定の用途（面積条件なし）
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナント単位では判定しない（建物全体の用途判定）

  if (useCodeMatches(ctx.useCode, ITEM1_USE_CODES)) {
    return createResult(ctx, `令第23条第1項第1号${ctx.basisSuffix}`, null);
  }
  return null;
}

/**
 * 第2号の判定: 特定用途で延べ面積500㎡以上
 */
function checkItem2(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ITEM2_USE_CODES) && ctx.totalArea >= 500) {
    return createResult(ctx, `令第23条第1項第2号${ctx.basisSuffix}`, 500);
  }
  return null;
}

/**
 * 第3号の判定: 特定用途で延べ面積1000㎡以上
 */
function checkItem3(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ITEM3_USE_CODES) && ctx.totalArea >= 1000) {
    return createResult(ctx, `令第23条第1項第3号${ctx.basisSuffix}`, 1000);
  }
  return null;
}

/**
 * 判定結果を生成する共通関数
 */
function createResult(
  ctx: JudgementContext,
  basis: string,
  areaThreshold: number | null
): JudgementResult {
  // 電話で代替できない高リスク用途
  if (useCodeMatches(ctx.useCode, NON_ALTERNATIVE_CODES)) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）が該当するため、設置が必要です。`,
      basis,
    };
  }

  // 電話で代替可能な場合
  let reason = `用途（${ctx.useDisplay}）が該当するため`;
  if (areaThreshold === 500) {
    reason = `用途（${ctx.useDisplay}）で延べ面積が500㎡以上のため`;
  } else if (areaThreshold === 1000) {
    reason = `用途（${ctx.useDisplay}）で延べ面積が1000㎡以上のため`;
  }

  return {
    required: "warning",
    message: `${reason}設置義務がありますが、消防機関へ常時通報することができる電話を設置することで免除される可能性があります。`,
    basis: `${basis}、同条第3項`,
  };
}

/**
 * 第23条（消防機関へ通報する火災報知設備）の判定を行う統括関数
 */
function judgeArticle23(ctx: JudgementContext): JudgementResult | null {
  const checks = [checkItem1, checkItem2, checkItem3];

  for (const check of checks) {
    const result = check(ctx);
    if (result) return result;
  }

  return null;
}

export function useArticle23Logic(userInput: Article23UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, totalArea, floors } = userInput;

    if (!buildingUse.value) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    const positiveResults: JudgementResult[] = [];

    // 1. 建物全体としての判定
    const mainContext: JudgementContext = {
      useCode: buildingUse.value,
      useDisplay: getUseDisplayName(buildingUse.value),
      totalArea: totalArea.value || 0,
      isSection: false,
      basisSuffix: "",
    };

    const mainResult = judgeArticle23(mainContext);
    if (mainResult) {
      if (mainResult.required !== false) {
        positiveResults.push(mainResult);
      }
    }

    // 2. 16項（複合用途）の場合の「みなし判定」（第九条適用）
    if (useCodeMatches(buildingUse.value, ["annex16_i", "annex16_ro"])) {
      // 構成用途ごとにデータを集計
      const componentUseMap = new Map<string, { totalArea: number }>();

      floors.value.forEach((floor: Floor) => {
        floor.componentUses?.forEach((cu) => {
          if (!cu.useCode) return;

          if (!componentUseMap.has(cu.useCode)) {
            componentUseMap.set(cu.useCode, { totalArea: 0 });
          }

          const entry = componentUseMap.get(cu.useCode)!;
          if (cu.floorArea && cu.floorArea > 0) {
            entry.totalArea += cu.floorArea;
          }
        });
      });

      // 各構成用途について判定を実行
      for (const [subUseCode, data] of componentUseMap.entries()) {
        const subContext: JudgementContext = {
          useCode: subUseCode,
          useDisplay: getUseDisplayName(subUseCode),
          totalArea: data.totalArea,
          isSection: true,
          basisSuffix: "（令第九条適用）",
        };

        // 第2号・第3号の判定（第1号はテナント単位では判定しない）
        const item2Result = checkItem2(subContext);
        if (item2Result && item2Result.required !== false) {
          positiveResults.push({
            ...item2Result,
            message: `複合用途内の「${subContext.useDisplay}」部分について、${item2Result.message}`,
          });
          continue;
        }

        const item3Result = checkItem3(subContext);
        if (item3Result && item3Result.required !== false) {
          positiveResults.push({
            ...item3Result,
            message: `複合用途内の「${subContext.useDisplay}」部分について、${item3Result.message}`,
          });
        }
      }
    }

    // 結果の集約
    if (positiveResults.length > 0) {
      if (positiveResults.length === 1) {
        return positiveResults[0];
      }
      const messages = positiveResults.map((r) => `・${r.message}`).join("\n");
      const bases = Array.from(
        new Set(positiveResults.map((r) => r.basis))
      ).join("、\n");

      const hasRequired = positiveResults.some((r) => r.required === true);

      return {
        required: hasRequired ? true : "warning",
        message: messages,
        basis: bases,
      };
    }

    return {
      required: false,
      message: "消防機関へ通報する火災報知設備の設置義務の条件に該当しません。",
      basis: "",
    };
  });

  return {
    regulationResult,
  };
}
