import { computed } from "vue";
import type { Article10UserInput, JudgementResult, Floor } from "@/types";
import { getUseDisplayName, useCodeMatches } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
  floors: Floor[];
  usesFireEquipment: boolean;
  storesMinorHazardousMaterials: boolean;
  storesDesignatedCombustibles: boolean;
  isSection: boolean; // 第九条適用（みなし判定）かどうか
  basisSuffix: string; // 根拠条文に付記する文字列
};

/**
 * 第1号の判定（用途による設置義務）
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  // イ: (1)項イ, (2)項, (6)項イ(1)~(3), (6)項ロ, (16の2)項, (17)項, (20)項
  const item1Codes = [
    "annex01_i",
    "annex02",
    "annex06_i_1",
    "annex06_i_2",
    "annex06_i_3",
    "annex06_ro",
    "annex16_2",
    "annex17",
    "annex20",
  ];
  if (useCodeMatches(ctx.useCode, item1Codes)) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）により、消火器の設置が必要です。`,
      basis: `令第十条第一項一号イ${ctx.basisSuffix}`,
    };
  }
  // ロ: (3)項で火気設備あり
  if (useCodeMatches(ctx.useCode, ["annex03"]) && ctx.usesFireEquipment) {
    return {
      required: true,
      message:
        "（3）項の防火対象物で火気設備等があるため、消火器の設置が必要です。",
      basis: `令第十条第一項一号ロ${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第2号の判定（延べ面積150㎡以上）
 */
function checkItem2(ctx: JudgementContext): JudgementResult | null {
  if (ctx.totalArea < 150) return null;

  // イ: (1)項ロ, (4)項, (5)項, (6)項イ(4), (6)項ハ, (6)項ニ, (9)項, (12)項~(14)項
  const item2Codes = [
    "annex01_ro",
    "annex04",
    "annex05",
    "annex06_i_4",
    "annex06_ha",
    "annex06_ni",
    "annex09",
    "annex12",
    "annex13",
    "annex14",
  ];
  if (useCodeMatches(ctx.useCode, item2Codes)) {
    return {
      required: true,
      message: `延べ面積150㎡以上で、用途（${ctx.useDisplay}）により消火器の設置が必要です。`,
      basis: `令第十条第一項二号イ${ctx.basisSuffix}`,
    };
  }
  // ロ: (3)項で火気設備なし
  if (useCodeMatches(ctx.useCode, ["annex03"]) && !ctx.usesFireEquipment) {
    return {
      required: true,
      message:
        "延べ面積150㎡以上の（3）項の防火対象物（火気設備等がない場合）のため、消火器の設置が必要です。",
      basis: `令第十条第一項二号ロ${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第3号の判定（延べ面積300㎡以上）
 */
function checkItem3(ctx: JudgementContext): JudgementResult | null {
  if (ctx.totalArea < 300) return null;

  const item3Codes = ["annex07", "annex08", "annex10", "annex11", "annex15"];
  if (useCodeMatches(ctx.useCode, item3Codes)) {
    return {
      required: true,
      message: `延べ面積300㎡以上で、用途（${ctx.useDisplay}）により消火器の設置が必要です。`,
      basis: `令第十条第一項三号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第4号の判定（少量危険物・指定可燃物）
 */
function checkItem4(ctx: JudgementContext): JudgementResult | null {
  // ※みなし判定の場合、部分ごとの危険物有無データがないため、ここでは建物全体の判定時のみ適用します。
  if (ctx.isSection) return null;

  if (ctx.storesMinorHazardousMaterials || ctx.storesDesignatedCombustibles) {
    let reasonText = "";
    if (ctx.storesMinorHazardousMaterials) reasonText += "少量危険物";
    if (ctx.storesMinorHazardousMaterials && ctx.storesDesignatedCombustibles)
      reasonText += "・";
    if (ctx.storesDesignatedCombustibles) reasonText += "指定可燃物";
    return {
      required: true,
      message: `${reasonText}の貯蔵・取り扱いがあるため、消火器の設置が必要です。`,
      basis: `令第十条第一項四号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第5号の判定（地階・無窓階・3階以上で50㎡以上）
 */
function checkItem5(ctx: JudgementContext): JudgementResult | null {
  const applicableFloors = ctx.floors.filter((floor) => {
    const floorArea = floor.floorArea || 0;
    if (floorArea < 50) return false;
    if (floor.type === "basement") return true;
    if (floor.isWindowless) return true;
    if (floor.type === "ground" && floor.level >= 3) return true;
    return false;
  });

  if (applicableFloors.length > 0) {
    const floorNames = applicableFloors
      .map((f) => `${f.type === "ground" ? "地上" : "地下"}${f.level}階`)
      .join(", ");
    return {
      required: true,
      message: `床面積50㎡以上の特定の階（${floorNames}）があるため、消火器の設置が必要です。`,
      basis: `令第十条第一項五号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第10条（消火器）の判定を行う統括関数
 */
function judgeArticle10(ctx: JudgementContext): JudgementResult {
  // 各号を順番に評価し、該当すれば即座に結果を返す（早期リターン）
  const result1 = checkItem1(ctx);
  if (result1) return result1;

  const result2 = checkItem2(ctx);
  if (result2) return result2;

  const result3 = checkItem3(ctx);
  if (result3) return result3;

  const result4 = checkItem4(ctx);
  if (result4) return result4;

  const result5 = checkItem5(ctx);
  if (result5) return result5;

  return {
    required: false,
    message: "消火器の設置義務はありません。",
    basis: "－",
  };
}

// Composable関数としてロジックをエクスポート
export function useArticle10Logic(userInput: Article10UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      totalFloorAreaInput,
      floors,
      usesFireEquipment,
      storesMinorHazardousMaterials,
      storesDesignatedCombustibles,
    } = userInput;

    const useCode = buildingUse.value;

    if (!useCode) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "－",
      };
    }

    // 判定結果を蓄積する配列
    const positiveResults: JudgementResult[] = [];

    // 共通コンテキストの作成（建物全体用）
    const mainContext: JudgementContext = {
      useCode,
      useDisplay: getUseDisplayName(useCode),
      totalArea: totalFloorAreaInput.value || 0,
      floors: floors.value,
      usesFireEquipment: usesFireEquipment.value,
      storesMinorHazardousMaterials: storesMinorHazardousMaterials.value,
      storesDesignatedCombustibles: storesDesignatedCombustibles.value,
      isSection: false,
      basisSuffix: "",
    };

    // 1. 建物全体としての判定
    const mainResult = judgeArticle10(mainContext);
    if (mainResult.required) {
      positiveResults.push(mainResult);
    }

    // 2. 16項（複合用途）の場合の「みなし判定」（第九条適用）
    // 建物全体の判定結果に関わらず、部分ごとの判定も行い、該当するものを全てリストアップする
    if (useCodeMatches(useCode, ["annex16_i", "annex16_ro"])) {
      // 構成用途ごとにデータを集計
      const componentUseMap = new Map<
        string,
        { totalArea: number; floors: Floor[] }
      >();

      floors.value.forEach((floor) => {
        floor.componentUses?.forEach((cu) => {
          if (!cu.useCode) return;

          if (!componentUseMap.has(cu.useCode)) {
            componentUseMap.set(cu.useCode, { totalArea: 0, floors: [] });
          }

          const entry = componentUseMap.get(cu.useCode)!;
          if (cu.floorArea && cu.floorArea > 0) {
            entry.totalArea += cu.floorArea;

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
          totalArea: data.totalArea,
          floors: data.floors,
          usesFireEquipment: false, // テナントごとの情報は現状ないためfalse
          storesMinorHazardousMaterials: false,
          storesDesignatedCombustibles: false,
          isSection: true,
          basisSuffix: "（令第九条適用）",
        };

        const subResult = judgeArticle10(subContext);

        if (subResult.required) {
          positiveResults.push({
            ...subResult,
            message: `複合用途内の「${subContext.useDisplay}」部分について、${subResult.message}`,
          });
        }
      }
    }

    // 結果の集約
    if (positiveResults.length > 0) {
      // メッセージを結合（リスト形式で見やすく）
      const messages = positiveResults.map((r) => `・${r.message}`).join("\n");
      // 根拠条文を結合（重複排除）
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
      message: "消火器の設置義務はありません。",
      basis: "－",
    };
  });

  return {
    regulationResult,
  };
}
