import { computed } from "vue";
import type { Article12UserInput, JudgementResult, Floor } from "@/types";
import { getUseDisplayName, useCodeMatches } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
  groundFloors: number;
  floors: Floor[];

  // 詳細条件
  isCareDependentOccupancy: boolean;
  hasStageArea: boolean;
  stageFloorLevel: string;
  stageArea: number;
  isRackWarehouse: boolean;
  ceilingHeight: number;
  storesDesignatedCombustiblesOver1000x: boolean;
  hasFireSuppressingStructure: boolean;
  hasBeds: boolean;

  isSection: boolean; // 第九条適用（みなし判定）かどうか
  basisSuffix: string; // 根拠条文に付記する文字列
};

/**
 * 第1号の判定
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  if (!ctx.hasFireSuppressingStructure) {
    // イ: (6)項イ(1)及び(2)
    if (useCodeMatches(ctx.useCode, ["annex06_i_1", "annex06_i_2"])) {
      if (!(ctx.useCode.startsWith("annex06_i_2") && !ctx.hasBeds)) {
        return {
          required: true,
          message: `用途（${ctx.useDisplay}）で、延焼抑制構造でないため、設置が必要です。`,
          basis: `令第12条第1項第1号イ${ctx.basisSuffix}`,
        };
      }
    }
    // ロ: (6)項ロ(1)及び(3)
    if (useCodeMatches(ctx.useCode, ["annex06_ro_1", "annex06_ro_3"])) {
      return {
        required: true,
        message: `用途（${ctx.useDisplay}）で、延焼抑制構造でないため、設置が必要です。`,
        basis: `令第12条第1項第1号ロ${ctx.basisSuffix}`,
      };
    }
    // ハ: (6)項ロ(2),(4),(5)
    if (
      useCodeMatches(ctx.useCode, [
        "annex06_ro_2",
        "annex06_ro_4",
        "annex06_ro_5",
      ])
    ) {
      // 介助が必要な者が入所する施設の場合、面積に関わらず設置義務あり
      if (ctx.isCareDependentOccupancy) {
        return {
          required: true,
          message: `用途（${ctx.useDisplay}）で、介助がなければ避難できない者を主として入所させる施設であり、かつ延焼抑制構造でないため、設置が必要です。`,
          basis: `令第12条第1項第1号ハ${ctx.basisSuffix}`,
        };
      }
      // それ以外の施設の場合、延べ面積が275㎡以上で設置義務あり
      if (!ctx.isCareDependentOccupancy && ctx.totalArea >= 275) {
        return {
          required: true,
          message: `用途（${ctx.useDisplay}）で、介助がなければ避難できない者を主として入所させるもの以外で延べ面積が275㎡以上、かつ延焼抑制構造でないため、設置が必要です。`,
          basis: `令第12条第1項第1号ハ${ctx.basisSuffix}`,
        };
      }
    }
  }
  return null;
}

/**
 * 第2号の判定
 */
function checkItem2(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ["annex01"]) && ctx.hasStageArea) {
    if (
      ctx.stageFloorLevel === "basement_windowless_4th_or_higher" &&
      ctx.stageArea >= 300
    ) {
      return {
        required: true,
        message: `劇場等で、地階・無窓階・4階以上の階にある舞台部の面積が300㎡以上のため、設置が必要です。`,
        basis: `令第12条第1項第2号${ctx.basisSuffix}`,
      };
    }
    if (ctx.stageFloorLevel === "other" && ctx.stageArea >= 500) {
      return {
        required: true,
        message: `劇場等で、舞台部の面積が500㎡以上のため、設置が必要です。`,
        basis: `令第12条第1項第2号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第3号の判定（第九条除外：みなし判定なし）
 */
function checkItem3(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // 第九条により除外

  if (ctx.groundFloors >= 11) {
    const applicableUses = [
      "annex01",
      "annex02",
      "annex03",
      "annex04",
      "annex05_i",
      "annex06",
      "annex09_i",
      "annex16_i",
    ];
    if (useCodeMatches(ctx.useCode, applicableUses)) {
      return {
        required: true,
        message: `地階を除く階数が11以上であり、用途（${ctx.useDisplay}）が令第12条第1項第3号に該当するため、設置が必要です。`,
        basis: `令第12条第1項第3号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第4号の判定
 */
function checkItem4(ctx: JudgementContext): JudgementResult | null {
  // 平屋建てでない（みなし判定の場合は階数情報が不完全な可能性があるが、安全側に倒して判定するか、建物全体の階数を使用する）
  // ここでは建物全体の階数情報(groundFloors)を使用する前提とする
  const isNotOneStory =
    ctx.groundFloors + (ctx.floors.some((f) => f.type === "basement") ? 1 : 0) >
    1;

  if (isNotOneStory) {
    const area3000Uses = [
      "annex04",
      "annex06_i_1",
      "annex06_i_2",
      "annex06_i_3",
    ];
    const area6000Uses = [
      "annex01",
      "annex02",
      "annex03",
      "annex05_i",
      "annex06",
      "annex09_i",
    ];

    if (useCodeMatches(ctx.useCode, area3000Uses) && ctx.totalArea >= 3000) {
      return {
        required: true,
        message: `平屋建て以外の建物で、用途（${ctx.useDisplay}）が令第12条第1項第4号の特定用途に該当し、床面積の合計が3000㎡以上のため、設置が必要です。`,
        basis: `令第12条第1項第4号${ctx.basisSuffix}`,
      };
    }
    if (
      useCodeMatches(ctx.useCode, area6000Uses) &&
      !useCodeMatches(ctx.useCode, area3000Uses) &&
      ctx.totalArea >= 6000
    ) {
      return {
        required: true,
        message: `平屋建て以外の建物で、床面積の合計が6000㎡以上のため、設置が必要です。`,
        basis: `令第12条第1項第4号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第5号の判定
 */
function checkItem5(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ["annex14"]) && ctx.isRackWarehouse) {
    if (ctx.ceilingHeight > 10 && ctx.totalArea >= 700) {
      return {
        required: true,
        message: `ラック式倉庫で、天井の高さが10mを超え、延べ面積が700㎡以上のため、設置が必要です。`,
        basis: `令第12条第1項第5号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第6号の判定
 */
function checkItem6(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ["annex16_2"]) && ctx.totalArea >= 1000) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）が（16の2）項で、延べ面積が1000㎡以上のため、設置が必要です。`,
      basis: `令第12条第1項第6号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第7号の判定
 */
function checkItem7(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ["annex16_3"]) && ctx.totalArea >= 1000) {
    return {
      required: "warning",
      message:
        "【要確認】この建物は(16の3)項の複合用途建築物で、延べ面積が1000㎡以上です。特定の用途（(1)～(4)項、(5)項イ、(6)項、(9)項イ）に供される部分の床面積の合計が500㎡以上の場合、スプリンクラー設備の設置が必要になる可能性があります。",
      basis: `令第12条第1項第7号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第8号の判定
 */
function checkItem8(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナントごとの危険物データがないためスキップ

  if (ctx.storesDesignatedCombustiblesOver1000x) {
    return {
      required: true,
      message:
        "指定可燃物を基準数量の1000倍以上、貯蔵または取り扱っているため、設置が必要です。",
      basis: `令第12条第1項第8号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第10号の判定（第九条除外：みなし判定なし）
 */
function checkItem10(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // 第九条により除外

  const isItem16i = useCodeMatches(ctx.useCode, ["annex16_i"]);
  if (isItem16i && ctx.totalArea >= 3000) {
    return {
      required: "warning",
      message:
        "【要確認】この建物は(16)項イの複合用途建築物です。特定の用途（(1)～(4)項、(5)項イ、(6)項、(9)項イ）に供される部分の床面積の合計が3000㎡以上の場合、その部分が存する階にスプリンクラー設備の設置が必要になる可能性があります。",
      basis: `令第12条第1項第10号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第11号の判定（第九条除外：みなし判定なし）
 */
function checkItem11(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // 第九条により除外

  const hasApplicableFloor = ctx.floors.some(
    (f) =>
      f.type === "basement" ||
      f.isWindowless ||
      (f.type === "ground" && f.level >= 4 && f.level <= 10)
  );
  if (hasApplicableFloor) {
    const item11Uses = [
      "annex01",
      "annex02",
      "annex03",
      "annex04",
      "annex05_i",
      "annex06",
      "annex09_i",
      "annex16_i",
    ];
    if (useCodeMatches(ctx.useCode, item11Uses)) {
      return {
        required: "warning",
        message:
          "【要確認】この建物には地階、無窓階、または4階～10階の階が存在します。これらの階の床面積や、建物全体の用途によっては、スプリンクラー設備の設置が必要になる可能性があります（令第12条第1項第11号）。",
        basis: `令第12条第1項第11号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第12号の判定（第九条除外：みなし判定なし）
 */
function checkItem12(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // 第九条により除外

  const hasFloorOver11 = ctx.floors.some(
    (f) => f.type === "ground" && f.level >= 11
  );
  if (hasFloorOver11) {
    return {
      required: true,
      message: "11階以上の階が存在するため、その階に設置が必要です。",
      basis: `令第12条第1項第12号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第12条（スプリンクラー設備）の判定を行う統括関数
 */
function judgeArticle12(ctx: JudgementContext): JudgementResult | null {
  const checks = [
    checkItem1,
    checkItem2,
    checkItem3,
    checkItem4,
    checkItem5,
    checkItem6,
    checkItem7,
    checkItem8,
    checkItem10,
    checkItem11,
    checkItem12,
  ];

  for (const check of checks) {
    const result = check(ctx);
    if (result) return result;
  }

  return null;
}

// Composable関数
export function useArticle12Logic(userInput: Article12UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const buildingUse = userInput.buildingUse.value;
    if (!buildingUse) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    const positiveResults: JudgementResult[] = [];

    // 1. 建物全体としての判定
    const mainContext: JudgementContext = {
      useCode: buildingUse,
      useDisplay: getUseDisplayName(buildingUse),
      totalArea: userInput.totalArea.value || 0,
      groundFloors: userInput.groundFloors.value,
      floors: userInput.floors.value,
      isCareDependentOccupancy: userInput.isCareDependentOccupancy.value,
      hasStageArea: userInput.hasStageArea.value,
      stageFloorLevel: userInput.stageFloorLevel.value || "",
      stageArea: userInput.stageArea.value || 0,
      isRackWarehouse: userInput.isRackWarehouse.value,
      ceilingHeight: userInput.ceilingHeight.value || 0,
      storesDesignatedCombustiblesOver1000x:
        userInput.storesDesignatedCombustiblesOver1000x.value,
      hasFireSuppressingStructure: userInput.hasFireSuppressingStructure.value,
      hasBeds: userInput.hasBeds.value,
      isSection: false,
      basisSuffix: "",
    };

    const mainResult = judgeArticle12(mainContext);
    if (mainResult) {
      positiveResults.push(mainResult);
    }

    // 2. 16項（複合用途）の場合の「みなし判定」（第九条適用）
    if (useCodeMatches(buildingUse, ["annex16_i", "annex16_ro"])) {
      const floors = userInput.floors.value;

      // 構成用途ごとにデータを集計
      const componentUseMap = new Map<
        string,
        { totalArea: number; floors: Floor[] }
      >();

      floors.forEach((floor) => {
        floor.componentUses?.forEach((cu) => {
          if (!cu.useCode) return;

          if (!componentUseMap.has(cu.useCode)) {
            componentUseMap.set(cu.useCode, { totalArea: 0, floors: [] });
          }

          const entry = componentUseMap.get(cu.useCode)!;
          if (cu.floorArea && cu.floorArea > 0) {
            entry.totalArea += cu.floorArea;
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
          groundFloors: userInput.groundFloors.value, // 建物全体の階数を使用
          floors: data.floors,
          // テナントごとの詳細データはないため、安全側またはデフォルト値を使用
          isCareDependentOccupancy: false,
          hasStageArea: false,
          stageFloorLevel: "other",
          stageArea: 0,
          isRackWarehouse: false,
          ceilingHeight: 0,
          storesDesignatedCombustiblesOver1000x: false,
          hasFireSuppressingStructure:
            userInput.hasFireSuppressingStructure.value, // 建物全体の構造を使用
          hasBeds: false,
          isSection: true,
          basisSuffix: "（令第九条適用）",
        };

        const subResult = judgeArticle12(subContext);

        if (subResult) {
          // warningの場合は重複を避けるなどの制御が必要かもしれないが、一旦すべて表示
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
      message: "スプリンクラー設備の設置義務はありません。",
      basis: "-",
    };
  });

  return {
    regulationResult,
  };
}
