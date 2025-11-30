import { computed } from "vue";
import { getUseDisplayName, useCodeMatches } from "@/composables/utils";
import type { JudgementResult, Article19UserInput, Floor } from "@/types";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  groundFloors: number;
  floors: Floor[];
  buildingStructure: string;
  hasMultipleBuildingsOnSite: boolean;
  isSection: boolean;
  basisSuffix: string;
};

/**
 * 第1項の判定
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  // (16)項、(16の2)項、(16の3)項、(17)項、(18)項は対象外
  const excludedUses = ["annex16", "annex16_2", "annex16_3"];
  if (useCodeMatches(ctx.useCode, excludedUses)) {
    return {
      required: false,
      message: "この用途は屋外消火栓設備の設置義務の対象外です。",
      basis: `令第19条第1項${ctx.basisSuffix}`,
    };
  }

  if (ctx.hasMultipleBuildingsOnSite && !ctx.isSection) {
    return {
      required: "warning",
      message:
        "【要確認】同一敷地内に複数の建物がある場合、それらの位置関係や構造によっては、床面積を合算して判断する必要があります（令第19条第2項）。専門家にご確認ください。",
      basis: `令第19条第2項${ctx.basisSuffix}`,
    };
  }

  if (!ctx.buildingStructure) {
    return {
      required: "warning",
      message: "建物の耐火性能を選択してください。",
      basis: `令第19条第1項${ctx.basisSuffix}`,
    };
  }

  let targetArea = 0;
  const floor1 = ctx.floors.find((f) => f.type === "ground" && f.level === 1);
  const floor2 = ctx.floors.find((f) => f.type === "ground" && f.level === 2);

  // 1階と2階の床面積の合計
  if (ctx.groundFloors === 1) {
    targetArea = floor1?.floorArea ?? 0;
  } else if (ctx.groundFloors >= 2) {
    targetArea = (floor1?.floorArea ?? 0) + (floor2?.floorArea ?? 0);
  }

  if (targetArea === 0) {
    // 面積0の場合は警告
    return {
      required: "warning",
      message: "1階または2階の床面積が入力されていません。",
      basis: `令第19条第1項${ctx.basisSuffix}`,
    };
  }

  const thresholds: Record<string, number> = {
    "fire-resistant": 9000,
    "quasi-fire-resistant": 6000,
    other: 3000,
  };

  const threshold = thresholds[ctx.buildingStructure] || 3000;

  if (targetArea >= threshold) {
    return {
      required: true,
      message: `建物の構造（${
        ctx.buildingStructure
      }）における基準面積（${threshold}㎡）以上（対象面積: ${targetArea.toFixed(
        2
      )}㎡）のため、設置が必要です。`,
      basis: `令第19条第1項${ctx.basisSuffix}`,
    };
  }

  return null;
}

/**
 * 第19条（屋外消火栓設備）の判定を行う統括関数
 */
function judgeArticle19(ctx: JudgementContext): JudgementResult | null {
  return checkItem1(ctx);
}

export function useArticle19Logic(userInput: Article19UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      groundFloors,
      floors,
      buildingStructure,
      hasMultipleBuildingsOnSite,
    } = userInput;

    const use = buildingUse.value;
    if (!use) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    const positiveResults: JudgementResult[] = [];
    let explicitExclusionResult: JudgementResult | null = null;

    // 1. 建物全体としての判定
    const mainContext: JudgementContext = {
      useCode: use,
      useDisplay: getUseDisplayName(use),
      groundFloors: groundFloors.value,
      floors: floors.value,
      buildingStructure: buildingStructure.value,
      hasMultipleBuildingsOnSite: hasMultipleBuildingsOnSite.value,
      isSection: false,
      basisSuffix: "",
    };

    const mainResult = judgeArticle19(mainContext);
    if (mainResult) {
      if (mainResult.required !== false) {
        positiveResults.push(mainResult);
      } else {
        explicitExclusionResult = mainResult;
      }
    }

    // 2. 16項（複合用途）の場合の「みなし判定」（第九条適用）
    if (useCodeMatches(use, ["annex16_i", "annex16_ro"])) {
      // 構成用途ごとにデータを集計
      const componentUseMap = new Map<string, { floors: Floor[] }>();

      floors.value.forEach((floor) => {
        floor.componentUses?.forEach((cu) => {
          if (!cu.useCode) return;

          if (!componentUseMap.has(cu.useCode)) {
            componentUseMap.set(cu.useCode, { floors: [] });
          }

          const entry = componentUseMap.get(cu.useCode)!;
          if (cu.floorArea && cu.floorArea > 0) {
            // みなしフロアを作成
            entry.floors.push({
              ...floor,
              floorArea: cu.floorArea,
              componentUses: [],
            });
          }
        });
      });

      // 各構成用途について判定を実行
      for (const [subUseCode, data] of componentUseMap.entries()) {
        const subContext: JudgementContext = {
          useCode: subUseCode,
          useDisplay: getUseDisplayName(subUseCode),
          groundFloors: groundFloors.value,
          floors: data.floors,
          buildingStructure: buildingStructure.value,
          hasMultipleBuildingsOnSite: false, // テナント単位では考慮不要
          isSection: true,
          basisSuffix: "（令第九条適用）",
        };

        const subResult = judgeArticle19(subContext);

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

    if (explicitExclusionResult) {
      return explicitExclusionResult;
    }

    return {
      required: false,
      message: "屋外消火栓設備の設置義務はありません。",
      basis: "-",
    };
  });

  return {
    regulationResult,
  };
}
