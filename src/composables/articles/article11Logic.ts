import { computed } from "vue";
import type { Article11UserInput, JudgementResult, Floor } from "@/types";
import { getUseDisplayName, useCodeMatches } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;

  // 構造・仕上げによる緩和関連
  structureType: string;
  finishType: string;
  areaMultiplier: number;
  multiplierDescription: string;

  // 階・面積詳細
  hasBasement: boolean;
  basementArea: number;
  hasNoWindowFloor: boolean;
  noWindowFloorArea: number;
  hasUpperFloors: boolean;
  upperFloorsArea: number;

  // 危険物
  storesFlammableItems: boolean;
  storesDesignatedCombustiblesOver750x: boolean;

  isSection: boolean; // 第九条適用（みなし判定）かどうか
  basisSuffix: string; // 根拠条文に付記する文字列
};

/**
 * 第1号の判定
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ["annex01"])) {
    const requiredArea = 500 * ctx.areaMultiplier;
    if (ctx.totalArea >= requiredArea) {
      return {
        required: true,
        message: `用途（${
          ctx.useDisplay
        }）が（1）項に該当し、延べ面積が${ctx.totalArea.toFixed(
          2
        )}㎡（≧ ${requiredArea}㎡）のため、設置が必要です。${
          ctx.multiplierDescription
        }`,
        basis: `令第11条第1項第1号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第2号の判定
 */
function checkItem2(ctx: JudgementContext): JudgementResult | null {
  const group2 = [
    "annex02",
    "annex03",
    "annex04",
    "annex05",
    "annex06",
    "annex07",
    "annex08",
    "annex09",
    "annex10",
    "annex12",
    "annex14",
  ];

  if (useCodeMatches(ctx.useCode, group2)) {
    // 特殊な防火対象物コード
    const specialCodes = ["annex06_i_1", "annex06_i_2", "annex06_ro"];
    let requiredArea = 700 * ctx.areaMultiplier;
    let basis = `令第11条第1項第2号${ctx.basisSuffix}`;

    if (useCodeMatches(ctx.useCode, specialCodes)) {
      // 2倍または3倍と1000㎡のいずれか小さい数値
      const multipliedArea = 700 * ctx.areaMultiplier;
      requiredArea = Math.min(multipliedArea, 1000);
      basis +=
        "（第十二条第一項第一号該当: ２倍または３倍と1000㎡のいずれか小さい数値）";
    }

    if (ctx.totalArea >= requiredArea) {
      return {
        required: true,
        message: `用途（${
          ctx.useDisplay
        }）が（2）～（10）項等のいずれかに該当し、延べ面積が${ctx.totalArea.toFixed(
          2
        )}㎡（≧ ${requiredArea}㎡）のため、設置が必要です。${
          ctx.multiplierDescription
        }`,
        basis: basis,
      };
    }
  }
  return null;
}

/**
 * 第3号の判定
 */
function checkItem3(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ["annex11", "annex15"])) {
    const requiredArea = 1000 * ctx.areaMultiplier;
    if (ctx.totalArea >= requiredArea) {
      return {
        required: true,
        message: `用途（${
          ctx.useDisplay
        }）が（11）項または（15）項に該当し、延べ面積が${ctx.totalArea.toFixed(
          2
        )}㎡（≧ ${requiredArea}㎡）のため、設置が必要です。${
          ctx.multiplierDescription
        }`,
        basis: `令第11条第1項第3号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第4号の判定
 */
function checkItem4(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ["annex16_2"])) {
    const requiredArea = 150 * ctx.areaMultiplier;
    if (ctx.totalArea >= requiredArea) {
      return {
        required: true,
        message: `用途（${
          ctx.useDisplay
        }）が（16の2）項に該当し、延べ面積が${ctx.totalArea.toFixed(
          2
        )}㎡（≧ ${requiredArea}㎡）のため、設置が必要です。${
          ctx.multiplierDescription
        }`,
        basis: `令第11条第1項第4号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第5号の判定
 */
function checkItem5(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナントごとの危険物データがないためスキップ

  if (ctx.storesFlammableItems && ctx.storesDesignatedCombustiblesOver750x) {
    return {
      required: true,
      message:
        "指定可燃物を基準数量の750倍以上、貯蔵または取り扱っているため、設置が必要です。",
      basis: `令第11条第1項第5号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第6号の判定
 */
function checkItem6(ctx: JudgementContext): JudgementResult | null {
  let requiredFloorArea = 0;
  const group2 = [
    "annex02",
    "annex03",
    "annex04",
    "annex05",
    "annex06",
    "annex07",
    "annex08",
    "annex09",
    "annex10",
    "annex12",
    "annex14",
  ];

  if (useCodeMatches(ctx.useCode, ["annex01"])) {
    requiredFloorArea = 100 * ctx.areaMultiplier;
  } else if (useCodeMatches(ctx.useCode, group2)) {
    requiredFloorArea = 150 * ctx.areaMultiplier;
  } else if (useCodeMatches(ctx.useCode, ["annex11", "annex15"])) {
    requiredFloorArea = 200 * ctx.areaMultiplier;
  }

  if (requiredFloorArea > 0) {
    if (ctx.hasBasement && ctx.basementArea >= requiredFloorArea) {
      return {
        required: true,
        message: `地階の床面積が${ctx.basementArea.toFixed(
          2
        )}㎡（≧ ${requiredFloorArea}㎡）のため、設置が必要です。${
          ctx.multiplierDescription
        }`,
        basis: `令第11条第1項第6号${ctx.basisSuffix}`,
      };
    }
    if (ctx.hasNoWindowFloor && ctx.noWindowFloorArea >= requiredFloorArea) {
      return {
        required: true,
        message: `無窓階の床面積が${ctx.noWindowFloorArea.toFixed(
          2
        )}㎡（≧ ${requiredFloorArea}㎡）のため、設置が必要です。${
          ctx.multiplierDescription
        }`,
        basis: `令第11条第1項第6号${ctx.basisSuffix}`,
      };
    }
    if (ctx.hasUpperFloors && ctx.upperFloorsArea >= requiredFloorArea) {
      return {
        required: true,
        message: `4階以上の階の床面積が${ctx.upperFloorsArea.toFixed(
          2
        )}㎡（≧ ${requiredFloorArea}㎡）のため、設置が必要です。${
          ctx.multiplierDescription
        }`,
        basis: `令第11条第1項第6号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第11条（屋内消火栓設備）の判定を行う統括関数
 */
function judgeArticle11(ctx: JudgementContext): JudgementResult | null {
  // 各号を順番に評価
  const checks = [
    checkItem1,
    checkItem2,
    checkItem3,
    checkItem4,
    checkItem5,
    checkItem6,
  ];

  for (const check of checks) {
    const result = check(ctx);
    if (result) return result;
  }

  return null;
}

// Composable関数
export function useArticle11Logic(userInput: Article11UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const buildingUse = userInput.buildingUse.value;
    if (!buildingUse) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    // --- 面積要件の緩和係数計算（共通） ---
    let areaMultiplier = 1;
    let multiplierDescription = "";
    if (
      userInput.structureType.value === "A" &&
      userInput.finishType.value === "flammable"
    ) {
      areaMultiplier = 3;
      multiplierDescription =
        "（特定主要構造部が耐火構造かつ仕上げが難燃材料のため、面積要件を3倍で計算）";
    } else if (
      (userInput.structureType.value === "A" &&
        userInput.finishType.value !== "flammable") ||
      (userInput.structureType.value === "B" &&
        userInput.finishType.value === "flammable")
    ) {
      areaMultiplier = 2;
      multiplierDescription =
        "（構造・仕上げの条件により、面積要件を2倍で計算）";
    }

    const positiveResults: JudgementResult[] = [];

    // 1. 建物全体としての判定
    const mainContext: JudgementContext = {
      useCode: buildingUse,
      useDisplay: getUseDisplayName(buildingUse),
      totalArea: userInput.totalArea.value || 0,
      structureType: userInput.structureType.value,
      finishType: userInput.finishType.value,
      areaMultiplier,
      multiplierDescription,
      hasBasement: userInput.hasBasement.value,
      basementArea: userInput.basementArea.value,
      hasNoWindowFloor: userInput.hasNoWindowFloor.value,
      noWindowFloorArea: userInput.noWindowFloorArea.value,
      hasUpperFloors: userInput.hasUpperFloors.value,
      upperFloorsArea: userInput.upperFloorsArea.value,
      storesFlammableItems: userInput.storesFlammableItems.value,
      storesDesignatedCombustiblesOver750x:
        userInput.storesDesignatedCombustiblesOver750x.value,
      isSection: false,
      basisSuffix: "",
    };

    const mainResult = judgeArticle11(mainContext);
    if (mainResult) {
      positiveResults.push(mainResult);
    }

    // 2. 16項（複合用途）の場合の「みなし判定」（第九条適用）
    if (useCodeMatches(buildingUse, ["annex16_i", "annex16_ro"])) {
      const floors = userInput.floors.value;

      // 構成用途ごとにデータを集計
      const componentUseMap = new Map<
        string,
        {
          totalArea: number;
          basementArea: number;
          noWindowFloorArea: number;
          upperFloorsArea: number;
        }
      >();

      floors.forEach((floor) => {
        floor.componentUses?.forEach((cu) => {
          if (!cu.useCode) return;

          if (!componentUseMap.has(cu.useCode)) {
            componentUseMap.set(cu.useCode, {
              totalArea: 0,
              basementArea: 0,
              noWindowFloorArea: 0,
              upperFloorsArea: 0,
            });
          }

          const entry = componentUseMap.get(cu.useCode)!;
          if (cu.floorArea && cu.floorArea > 0) {
            entry.totalArea += cu.floorArea;

            // 階ごとの面積集計（第6号用）
            if (floor.type === "basement") {
              entry.basementArea += cu.floorArea;
            }
            if (floor.isWindowless) {
              entry.noWindowFloorArea += cu.floorArea;
            }
            if (floor.type === "ground" && floor.level >= 4) {
              entry.upperFloorsArea += cu.floorArea;
            }
          }
        });
      });

      // 各構成用途について判定を実行
      for (const [subUseCode, data] of componentUseMap.entries()) {
        const subContext: JudgementContext = {
          useCode: subUseCode,
          useDisplay: getUseDisplayName(subUseCode),
          totalArea: data.totalArea,
          structureType: userInput.structureType.value, // 建物全体の構造を流用
          finishType: userInput.finishType.value, // 建物全体の仕上げを流用
          areaMultiplier,
          multiplierDescription,
          hasBasement: data.basementArea > 0,
          basementArea: data.basementArea,
          hasNoWindowFloor: data.noWindowFloorArea > 0,
          noWindowFloorArea: data.noWindowFloorArea,
          hasUpperFloors: data.upperFloorsArea > 0,
          upperFloorsArea: data.upperFloorsArea,
          storesFlammableItems: false, // テナントごとの情報はなし
          storesDesignatedCombustiblesOver750x: false,
          isSection: true,
          basisSuffix: "（令第九条適用）",
        };

        const subResult = judgeArticle11(subContext);

        if (subResult) {
          positiveResults.push({
            ...subResult,
            message: `複合用途内の「${subContext.useDisplay}」部分について、${subResult.message}`,
          });
        }
      }
    }

    // 結果の集約
    if (positiveResults.length > 0) {
      const messages = positiveResults.map((r) => `・${r.message}`).join("\n");
      const bases = Array.from(
        new Set(positiveResults.map((r) => r.basis))
      ).join("、\n");

      return {
        required: true,
        message: messages,
        basis: bases,
      };
    }

    return {
      required: false,
      message: "屋内消火栓設備の設置義務はありません。",
      basis: "-",
    };
  });

  return {
    regulationResult,
  };
}
