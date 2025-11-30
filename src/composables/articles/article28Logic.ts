import { computed } from "vue";
import { useCodeMatches, getUseDisplayName } from "@/composables/utils";
import type { JudgementResult, Article28UserInput, Floor } from "@/types";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
  hasStageArea: boolean;
  stageArea: number;
  basementOrWindowlessArea: number;
  hasBasementOrWindowlessFloors: boolean;
  isSection: boolean;
  basisSuffix: string;
};

// 第3号の対象用途
const ITEM3_USE_CODES = ["annex02", "annex04", "annex10", "annex13"];

/**
 * 第1号の判定: (16の2)項で延べ面積1,000㎡以上
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナント単位では判定しない

  if (useCodeMatches(ctx.useCode, ["annex16_2"]) && ctx.totalArea >= 1000) {
    return {
      required: true,
      message: `用途が（16の2）項で延べ面積が1,000㎡以上のため、排煙設備の設置が必要です。`,
      basis: `令第28条第1号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第2号の判定: (1)項の舞台部で床面積500㎡以上
 */
function checkItem2(ctx: JudgementContext): JudgementResult | null {
  if (!useCodeMatches(ctx.useCode, ["annex01"])) return null;
  if (!ctx.hasStageArea) return null;

  if (ctx.stageArea >= 500) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）の舞台部で床面積が500㎡以上のため、排煙設備の設置が必要です。`,
      basis: `令第28条第2号${ctx.basisSuffix}`,
    };
  }

  if (ctx.stageArea === 0) {
    return {
      required: "warning",
      message:
        "舞台部の面積が入力されていません。排煙設備の設置義務がある可能性があります。",
      basis: `令第28条第2号${ctx.basisSuffix}`,
    };
  }

  return null;
}

/**
 * 第3号の判定: 特定用途の地階又は無窓階で床面積1,000㎡以上
 */
function checkItem3(ctx: JudgementContext): JudgementResult | null {
  if (!useCodeMatches(ctx.useCode, ITEM3_USE_CODES)) return null;

  if (ctx.basementOrWindowlessArea >= 1000) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）の地階又は無窓階で床面積が1,000㎡以上のため、排煙設備の設置が必要です。`,
      basis: `令第28条第3号${ctx.basisSuffix}`,
    };
  }

  if (ctx.basementOrWindowlessArea === 0 && ctx.hasBasementOrWindowlessFloors) {
    return {
      required: "warning",
      message:
        "地階または無窓階の床面積が入力されていません。排煙設備の設置義務がある可能性があります。",
      basis: `令第28条第3号${ctx.basisSuffix}`,
    };
  }

  return null;
}

/**
 * 第28条（排煙設備）の判定を行う統括関数
 */
function judgeArticle28(ctx: JudgementContext): JudgementResult | null {
  const checks = [checkItem1, checkItem2, checkItem3];

  for (const check of checks) {
    const result = check(ctx);
    if (result) return result;
  }

  return null;
}

/**
 * 地階又は無窓階の床面積合計を計算
 */
function calculateBasementOrWindowlessArea(floors: Floor[]): {
  area: number;
  hasFloors: boolean;
} {
  const targetFloors = floors.filter(
    (f) => f.type === "basement" || f.isWindowless
  );
  const area = targetFloors.reduce((sum, f) => sum + (f.floorArea ?? 0), 0);
  return { area, hasFloors: targetFloors.length > 0 };
}

export function useArticle28Logic(userInput: Article28UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, totalArea, hasStageArea, stageArea, floors } =
      userInput;

    const useCode = buildingUse.value;
    if (!useCode) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    const basementOrWindowless = calculateBasementOrWindowlessArea(
      floors.value
    );
    const positiveResults: JudgementResult[] = [];

    // 1. 建物全体としての判定
    const mainContext: JudgementContext = {
      useCode,
      useDisplay: getUseDisplayName(useCode),
      totalArea: totalArea.value ?? 0,
      hasStageArea: hasStageArea.value,
      stageArea: stageArea.value ?? 0,
      basementOrWindowlessArea: basementOrWindowless.area,
      hasBasementOrWindowlessFloors: basementOrWindowless.hasFloors,
      isSection: false,
      basisSuffix: "",
    };

    const mainResult = judgeArticle28(mainContext);
    if (mainResult) {
      if (mainResult.required !== false) {
        positiveResults.push(mainResult);
      }
    }

    // 2. 16項（複合用途）の場合の「みなし判定」（第九条適用）
    if (useCodeMatches(useCode, ["annex16_i", "annex16_ro"])) {
      // 構成用途ごとにデータを集計
      const componentUseMap = new Map<
        string,
        {
          totalArea: number;
          basementOrWindowlessArea: number;
          hasBasementOrWindowlessFloors: boolean;
        }
      >();

      floors.value.forEach((floor: Floor) => {
        floor.componentUses?.forEach((cu) => {
          if (!cu.useCode) return;

          if (!componentUseMap.has(cu.useCode)) {
            componentUseMap.set(cu.useCode, {
              totalArea: 0,
              basementOrWindowlessArea: 0,
              hasBasementOrWindowlessFloors: false,
            });
          }

          const entry = componentUseMap.get(cu.useCode)!;
          if (cu.floorArea && cu.floorArea > 0) {
            entry.totalArea += cu.floorArea;
            if (floor.type === "basement" || floor.isWindowless) {
              entry.basementOrWindowlessArea += cu.floorArea;
              entry.hasBasementOrWindowlessFloors = true;
            }
          }
        });
      });

      // 各構成用途について判定を実行（第3号のみテナント判定可能）
      for (const [subUseCode, data] of componentUseMap.entries()) {
        const subContext: JudgementContext = {
          useCode: subUseCode,
          useDisplay: getUseDisplayName(subUseCode),
          totalArea: data.totalArea,
          hasStageArea: false, // テナント単位では舞台部の情報はなし
          stageArea: 0,
          basementOrWindowlessArea: data.basementOrWindowlessArea,
          hasBasementOrWindowlessFloors: data.hasBasementOrWindowlessFloors,
          isSection: true,
          basisSuffix: "（令第九条適用）",
        };

        // 第3号の判定
        const subResult = checkItem3(subContext);

        if (subResult && subResult.required !== false) {
          positiveResults.push({
            ...subResult,
            message: `複合用途内の「${subContext.useDisplay}」部分について、${subResult.message}`,
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

      const isAllWarning = positiveResults.every(
        (r) => r.required === "warning"
      );

      return {
        required: isAllWarning ? "warning" : true,
        message: messages,
        basis: bases,
      };
    }

    return {
      required: false,
      message: "排煙設備の設置義務はありません。",
      basis: "-",
    };
  });

  return {
    regulationResult,
  };
}
