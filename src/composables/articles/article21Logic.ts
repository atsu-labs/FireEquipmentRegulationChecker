import { computed } from "vue";
import type { JudgementResult, Article21UserInput, Floor } from "@/types";
import { getUseDisplayName, useCodeMatches } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
  floors: Floor[];
  hasLodging: boolean;
  isSpecifiedOneStaircase: boolean;
  storesDesignatedCombustiblesOver500x: boolean;
  hasRoadPart: boolean;
  roadPartRooftopArea: number;
  roadPartOtherArea: number;
  hasTelecomRoomOver500sqm: boolean;

  // 駐車場関連
  parkingExists: boolean;
  parkingBasementOrUpperArea: number;
  parkingCanAllExit: boolean;

  isSection: boolean; // 第九条適用（みなし判定）かどうか
  basisSuffix: string; // 根拠条文に付記する文字列
};

/**
 * 第1号の判定
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  const item1_i_codes = [
    "annex02_ni",
    "annex05_i",
    "annex06_i_1",
    "annex06_i_2",
    "annex06_i_3",
    "annex06_ro",
    "annex13_ro",
    "annex17",
  ];
  if (useCodeMatches(ctx.useCode, item1_i_codes)) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）が該当するため、設置が必要です。`,
      basis: `令第21条第1項第1号イ${ctx.basisSuffix}`,
    };
  }
  const item1_ro_codes = ["annex06_ha"];
  if (useCodeMatches(ctx.useCode, item1_ro_codes) && ctx.hasLodging) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）で宿泊施設等があるため、設置が必要です。`,
      basis: `令第21条第1項第1号ロ${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第2号の判定
 */
function checkItem2(ctx: JudgementContext): JudgementResult | null {
  const item2_codes = ["annex09_i"];
  if (useCodeMatches(ctx.useCode, item2_codes) && ctx.totalArea >= 200) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）で、延べ面積が200㎡以上のため、設置が必要です。`,
      basis: `令第21条第1項第2号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第3号の判定（第九条除外：みなし判定なし）
 */
function checkItem3(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // 第九条により除外

  if (ctx.totalArea >= 300) {
    const item3_i_codes = [
      "annex01",
      "annex02_i",
      "annex02_ro",
      "annex02_ha",
      "annex03",
      "annex04",
      "annex06_i_4",
      "annex06_ni",
      "annex16_i",
      "annex16_2",
    ];
    if (useCodeMatches(ctx.useCode, item3_i_codes)) {
      return {
        required: true,
        message: `延べ面積が300㎡以上で、用途（${ctx.useDisplay}）が該当するため、設置が必要です。`,
        basis: `令第21条第1項第3号イ${ctx.basisSuffix}`,
      };
    }
    const item3_ro_codes = ["annex06_ha"];
    if (useCodeMatches(ctx.useCode, item3_ro_codes) && !ctx.hasLodging) {
      return {
        required: true,
        message: `延べ面積が300㎡以上で、用途（${ctx.useDisplay}）が該当し、宿泊施設等がないため、設置が必要です。`,
        basis: `令第21条第1項第3号ロ${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第4号の判定
 */
function checkItem4(ctx: JudgementContext): JudgementResult | null {
  const item4_codes = [
    "annex05_ro",
    "annex07",
    "annex08",
    "annex09_ro",
    "annex10",
    "annex12",
    "annex13_i",
    "annex14",
  ];
  if (useCodeMatches(ctx.useCode, item4_codes) && ctx.totalArea >= 500) {
    return {
      required: true,
      message: `延べ面積が500㎡以上で、用途（${ctx.useDisplay}）が該当するため、設置が必要です。`,
      basis: `令第21条第1項第4号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第5号の判定
 */
function checkItem5(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ["annex16_3"]) && ctx.totalArea >= 500) {
    return {
      required: "warning",
      message:
        "延べ面積500㎡以上の(16の3)項の建物です。(1)～(4)項、(5)項イ、(6)項、(9)項イの用途部分の面積合計が300㎡以上の場合は設置義務があります。",
      basis: `令第21条第1項第5号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第6号の判定
 */
function checkItem6(ctx: JudgementContext): JudgementResult | null {
  const item6_codes = ["annex11", "annex15"];
  if (useCodeMatches(ctx.useCode, item6_codes) && ctx.totalArea >= 1000) {
    return {
      required: true,
      message: `延べ面積が1000㎡以上で、用途（${ctx.useDisplay}）が該当するため、設置が必要です。`,
      basis: `令第21条第1項第6号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第7号の判定（第九条除外：みなし判定なし）
 */
function checkItem7(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // 第九条により除外

  const item7_codes = [
    "annex01",
    "annex02",
    "annex03",
    "annex04",
    "annex05_i",
    "annex06",
    "annex09_i",
    "annex16_i",
  ];
  if (useCodeMatches(ctx.useCode, item7_codes) && ctx.isSpecifiedOneStaircase) {
    return {
      required: true,
      message: "特定一階段等防火対象物に該当するため、設置が必要です。",
      basis: `令第21条第1項第7号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第8号の判定
 */
function checkItem8(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナントごとの危険物データがないためスキップ

  if (ctx.storesDesignatedCombustiblesOver500x) {
    return {
      required: true,
      message:
        "指定可燃物を基準数量の500倍以上、貯蔵・取り扱いしているため、設置が必要です。",
      basis: `令第21条第1項第8号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第9号の判定
 */
function checkItem9(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ["annex16_2"])) {
    return {
      required: "warning",
      message:
        "(16の2)の対象物は、(2)項ニ、(5)項イ、(6)項イ(1)～(3)、(6)項ロ、(6)項ハ（入居、宿泊施設）の部分に設置が必要です。",
      basis: `令第21条第1項第9号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第10号の判定（第九条除外：みなし判定なし）
 */
function checkItem10(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // 第九条により除外

  const item10_codes = ["annex02_i", "annex02_ro", "annex02_ha", "annex03"];
  const applicableFloor10 = ctx.floors.find((floor) => {
    const area = floor.floorArea || 0;
    if (area < 100) return false;
    return floor.type === "basement" || floor.isWindowless;
  });
  if (useCodeMatches(ctx.useCode, item10_codes) && applicableFloor10) {
    const floorName =
      applicableFloor10.type === "basement"
        ? `地階${applicableFloor10.level}階`
        : `地上${applicableFloor10.level}階`;
    const reason = applicableFloor10.isWindowless ? "無窓階である" : "地階で";
    return {
      required: true,
      message: `${floorName}（${reason}）の床面積が100㎡以上のため、設置が必要です。`,
      basis: `令第21条第1項第10号${ctx.basisSuffix}`,
    };
  }
  if (useCodeMatches(ctx.useCode, ["annex16_i"]) && applicableFloor10) {
    return {
      required: "warning",
      message:
        "(2)項、(3)項の用途に供される地階・無窓階の床面積の合計が100㎡以上の場合は設置が必要になります。",
      basis: `令第21条第1項第10号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第11号の判定
 */
function checkItem11(ctx: JudgementContext): JudgementResult | null {
  const applicableFloor11 = ctx.floors.find((floor) => {
    const area = floor.floorArea || 0;
    if (area < 300) return false;
    return (
      floor.type === "basement" ||
      floor.isWindowless ||
      (floor.type === "ground" && floor.level >= 3)
    );
  });
  if (applicableFloor11) {
    const floorName =
      applicableFloor11.type === "basement"
        ? `地階${applicableFloor11.level}階`
        : `地上${applicableFloor11.level}階`;
    const reason = applicableFloor11.isWindowless
      ? "無窓階である"
      : "地階または3階以上で";
    return {
      required: true,
      message: `${floorName}（${reason}）の床面積が300㎡以上のため、設置が必要です。`,
      basis: `令第21条第1項第11号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第12号の判定
 */
function checkItem12(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナントごとの道路部分データがないためスキップ

  if (ctx.hasRoadPart) {
    if (ctx.roadPartRooftopArea >= 600 || ctx.roadPartOtherArea >= 400) {
      return {
        required: true,
        message:
          "道路の用に供される部分の床面積が基準値以上のため、設置が必要です。",
        basis: `令第21条第1項第12号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第13号の判定
 */
function checkItem13(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナントごとの駐車場データがないためスキップ

  if (ctx.parkingExists) {
    // If the basement/upper parking area >= 200 and the structure is NOT the "同時に屋外に出られる構造" exemption, require equipment
    if (
      (ctx.parkingBasementOrUpperArea || 0) >= 200 &&
      !ctx.parkingCanAllExit
    ) {
      return {
        required: true,
        message:
          "駐車の用に供する部分の床面積が基準値以上で、車両が同時に屋外に出られないため、設置が必要です。",
        basis: `令第21条第1項第13号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第14号の判定（第九条除外：みなし判定なし）
 */
function checkItem14(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // 第九条により除外

  const hasApplicableFloor14 = ctx.floors.some(
    (floor) => floor.type === "ground" && floor.level >= 11
  );
  if (hasApplicableFloor14) {
    return {
      required: true,
      message: "11階以上の階があるため、設置が必要です。",
      basis: `令第21条第1項第14号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第15号の判定
 */
function checkItem15(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナントごとの通信機器室データがないためスキップ

  if (ctx.hasTelecomRoomOver500sqm) {
    return {
      required: true,
      message: "通信機器室の床面積が500㎡以上のため、設置が必要です。",
      basis: `令第21条第1項第15号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第21条（自動火災報知設備）の判定を行う統括関数
 */
function judgeArticle21(ctx: JudgementContext): JudgementResult | null {
  // 各号を順番に評価し、該当すれば即座に結果を返す（早期リターン）
  const checks = [
    checkItem1,
    checkItem2,
    checkItem3,
    checkItem4,
    checkItem5,
    checkItem6,
    checkItem7,
    checkItem8,
    checkItem9,
    checkItem10,
    checkItem11,
    checkItem12,
    checkItem13,
    checkItem14,
    checkItem15,
  ];

  for (const check of checks) {
    const result = check(ctx);
    if (result) return result;
  }

  return null;
}

export function useArticle21Logic(userInput: Article21UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const buildingUse = userInput.buildingUse.value;
    const totalArea = userInput.totalArea.value || 0;
    const floors = userInput.floors.value;

    if (!buildingUse) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "－",
      };
    }

    // 駐車場情報の展開
    const parking = userInput.parking;
    const parkingExists = parking?.value?.exists ?? false;
    const parkingBasementOrUpperArea = parking?.value?.basementOrUpperArea ?? 0;
    const parkingCanAllExit =
      parking?.value?.canAllVehiclesExitSimultaneously ?? false;

    // 判定結果を蓄積する配列
    const positiveResults: JudgementResult[] = [];

    // 1. 建物全体としての判定
    const mainContext: JudgementContext = {
      useCode: buildingUse,
      useDisplay: getUseDisplayName(buildingUse),
      totalArea: totalArea,
      floors: floors,
      hasLodging: userInput.hasLodging.value,
      isSpecifiedOneStaircase: userInput.isSpecifiedOneStaircase.value,
      storesDesignatedCombustiblesOver500x:
        userInput.storesDesignatedCombustiblesOver500x.value,
      hasRoadPart: userInput.hasRoadPart.value,
      roadPartRooftopArea: userInput.roadPartRooftopArea.value || 0,
      roadPartOtherArea: userInput.roadPartOtherArea.value || 0,
      hasTelecomRoomOver500sqm: userInput.hasTelecomRoomOver500sqm.value,
      parkingExists,
      parkingBasementOrUpperArea,
      parkingCanAllExit,
      isSection: false,
      basisSuffix: "",
    };

    const mainResult = judgeArticle21(mainContext);
    if (mainResult) {
      positiveResults.push(mainResult);
    }

    // 2. 16項（複合用途）の場合の「みなし判定」（第九条適用）
    // 第21条では、第3号、第7号、第10号、第14号はみなし判定から除外される
    if (useCodeMatches(buildingUse, ["annex16_i", "annex16_ro"])) {
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
          // テナントごとの詳細データはないため、安全側またはデフォルト値を使用
          hasLodging: false,
          isSpecifiedOneStaircase: false,
          storesDesignatedCombustiblesOver500x: false,
          hasRoadPart: false,
          roadPartRooftopArea: 0,
          roadPartOtherArea: 0,
          hasTelecomRoomOver500sqm: false,
          parkingExists: false,
          parkingBasementOrUpperArea: 0,
          parkingCanAllExit: false,
          isSection: true,
          basisSuffix: "（令第九条適用）",
        };

        const subResult = judgeArticle21(subContext);

        if (subResult && subResult.required === true) {
          // warningは除外するか、必要なら含める
          positiveResults.push({
            ...subResult,
            message: `複合用途内の「${subContext.useDisplay}」部分について、${subResult.message}`,
          });
        } else if (subResult && subResult.required === "warning") {
          // warningも表示する場合
          positiveResults.push({
            ...subResult,
            message: `複合用途内の「${subContext.useDisplay}」部分について、${subResult.message}`,
          });
        }
      }
    }

    // 結果の集約
    if (positiveResults.length > 0) {
      // メッセージを結合
      const messages = positiveResults.map((r) => `・${r.message}`).join("\n");
      // 根拠条文を結合（重複排除）
      const bases = Array.from(
        new Set(positiveResults.map((r) => r.basis))
      ).join("、\n");

      // warningが含まれているかチェック
      const hasWarning = positiveResults.some((r) => r.required === "warning");
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
      message: "自動火災報知設備の設置義務の条件に該当しません。",
      basis: "－",
    };
  });

  return {
    regulationResult,
  };
}
