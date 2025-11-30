import { computed } from "vue";
import type { JudgementResult, Article22UserInput, Floor } from "@/types";
import { useCodeMatches, getUseDisplayName } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
  hasSpecialCombustibleStructure: boolean;
  contractedCurrentCapacity: number;
  isSection: boolean;
  basisSuffix: string;
};

/**
 * 第1号の判定: (17)項
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.useCode, ["annex17"])) {
    return {
      required: true,
      message: `木造モルタル構造等で、用途（${ctx.useDisplay}）が該当するため、設置が必要です。`,
      basis: `令第22条第1項第1号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第2号の判定: (5)項、(9)項 で延べ面積150㎡以上
 */
function checkItem2(ctx: JudgementContext): JudgementResult | null {
  if (
    useCodeMatches(ctx.useCode, ["annex05", "annex09"]) &&
    ctx.totalArea >= 150
  ) {
    return {
      required: true,
      message: `木造モルタル構造等で、用途（${ctx.useDisplay}）、延べ面積が150㎡以上のため、設置が必要です。`,
      basis: `令第22条第1項第2号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第3号の判定: (1)～(4)項、(6)項、(12)項、(16の2)項 で延べ面積300㎡以上
 */
function checkItem3(ctx: JudgementContext): JudgementResult | null {
  const item3Codes = [
    "annex01",
    "annex02",
    "annex03",
    "annex04",
    "annex06",
    "annex12",
    "annex16_2",
  ];
  if (useCodeMatches(ctx.useCode, item3Codes) && ctx.totalArea >= 300) {
    return {
      required: true,
      message: `木造モルタル構造等で、用途（${ctx.useDisplay}）、延べ面積が300㎡以上のため、設置が必要です。`,
      basis: `令第22条第1項第3号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第4号の判定: (7)項、(8)項、(10)項、(11)項 で延べ面積500㎡以上
 */
function checkItem4(ctx: JudgementContext): JudgementResult | null {
  const item4Codes = ["annex07", "annex08", "annex10", "annex11"];
  if (useCodeMatches(ctx.useCode, item4Codes) && ctx.totalArea >= 500) {
    return {
      required: true,
      message: `木造モルタル構造等で、用途（${ctx.useDisplay}）、延べ面積が500㎡以上のため、設置が必要です。`,
      basis: `令第22条第1項第4号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第5号の判定: (14)項、(15)項 で延べ面積1000㎡以上
 */
function checkItem5(ctx: JudgementContext): JudgementResult | null {
  if (
    useCodeMatches(ctx.useCode, ["annex14", "annex15"]) &&
    ctx.totalArea >= 1000
  ) {
    return {
      required: true,
      message: `木造モルタル構造等で、用途（${ctx.useDisplay}）、延べ面積が1000㎡以上のため、設置が必要です。`,
      basis: `令第22条第1項第5号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第6号の判定: (16)項イ で延べ面積500㎡以上かつ特定用途部分が300㎡以上
 * この判定はfloors情報が必要なため、judgeArticle22ではなく別途処理する
 */
function checkItem6WithFloors(
  ctx: JudgementContext,
  floors: Floor[]
): JudgementResult | null {
  if (ctx.isSection) return null; // 第九条により除外

  if (!useCodeMatches(ctx.useCode, ["annex16_i"]) || ctx.totalArea < 500) {
    return null;
  }

  // 特定用途のコード（(1)～(4)項、(5)項イ、(6)項、(9)項イ、(12)項）
  const specificUseCodes = [
    "annex01",
    "annex02",
    "annex03",
    "annex04",
    "annex05_i",
    "annex06",
    "annex09_i",
    "annex12",
  ];

  // 構成用途から特定用途部分の面積合計を計算
  let specificUseArea = 0;
  floors.forEach((floor) => {
    floor.componentUses?.forEach((cu) => {
      if (cu.useCode && cu.floorArea && cu.floorArea > 0) {
        if (useCodeMatches(cu.useCode, specificUseCodes)) {
          specificUseArea += cu.floorArea;
        }
      }
    });
  });

  if (specificUseArea >= 300) {
    return {
      required: true,
      message: `木造モルタル構造等で、延べ面積500㎡以上の(16)項イの建物で、特定用途部分の面積合計が${specificUseArea.toFixed(
        0
      )}㎡（≧300㎡）のため、設置が必要です。`,
      basis: `令第22条第1項第6号${ctx.basisSuffix}`,
    };
  }

  // 構成用途の情報がない場合は警告
  if (specificUseArea === 0) {
    return {
      required: "warning",
      message:
        "木造モルタル構造等で、延べ面積500㎡以上の(16)項イの建物です。特定用途部分の面積合計が300㎡以上の場合は設置義務があります。構成用途の面積情報を入力してください。",
      basis: `令第22条第1項第6号${ctx.basisSuffix}`,
    };
  }

  return {
    required: false,
    message: `延べ面積500㎡以上の(16)項イの建物ですが、特定用途部分の面積合計が${specificUseArea.toFixed(
      0
    )}㎡（＜300㎡）のため、設置義務はありません。`,
    basis: `令第22条第1項第6号${ctx.basisSuffix}`,
  };
}

/**
 * 第7号の判定: 特定用途で契約電流容量が50Aを超える
 */
function checkItem7(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナントごとの契約電流容量データがないためスキップ

  const item7Codes = [
    "annex01",
    "annex02",
    "annex03",
    "annex04",
    "annex05",
    "annex06",
    "annex15",
    "annex16",
  ];
  if (
    useCodeMatches(ctx.useCode, item7Codes) &&
    ctx.contractedCurrentCapacity > 50
  ) {
    return {
      required: true,
      message: `木造モルタル構造等で、用途（${ctx.useDisplay}）、契約電流容量が50Aを超えるため、設置が必要です。`,
      basis: `令第22条第1項第7号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第22条（漏電火災警報器）の判定を行う統括関数
 * 注意: 第6号はfloors情報が必要なため、別途checkItem6WithFloorsで処理する
 */
function judgeArticle22(ctx: JudgementContext): JudgementResult | null {
  // 特殊な構造でなければ対象外
  if (!ctx.hasSpecialCombustibleStructure) {
    return {
      required: false,
      message:
        "漏電火災警報器の設置対象となる特殊な構造ではないため、設置義務はありません。",
      basis: "",
    };
  }

  // 第6号はfloors情報が必要なため、ここでは処理しない
  const checks = [
    checkItem1,
    checkItem2,
    checkItem3,
    checkItem4,
    checkItem5,
    checkItem7,
  ];

  for (const check of checks) {
    const result = check(ctx);
    if (result) return result;
  }

  return null;
}

export function useArticle22Logic(userInput: Article22UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      totalArea,
      hasSpecialCombustibleStructure,
      contractedCurrentCapacity,
      floors,
    } = userInput;

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
      hasSpecialCombustibleStructure: hasSpecialCombustibleStructure.value,
      contractedCurrentCapacity: contractedCurrentCapacity.value || 0,
      isSection: false,
      basisSuffix: "",
    };

    const mainResult = judgeArticle22(mainContext);
    if (mainResult) {
      if (mainResult.required !== false) {
        positiveResults.push(mainResult);
      } else {
        // 特殊構造でない場合は即時リターン
        return mainResult;
      }
    }

    // 第6号の判定（floors情報が必要なため別途処理）
    const item6Result = checkItem6WithFloors(mainContext, floors.value);
    if (item6Result) {
      if (item6Result.required !== false) {
        positiveResults.push(item6Result);
      } else if (item6Result.basis) {
        // 第6号で「設置義務なし」と明確に判定された場合はその結果を返す
        return item6Result;
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
          hasSpecialCombustibleStructure: hasSpecialCombustibleStructure.value,
          contractedCurrentCapacity: 0, // テナントごとの情報はなし
          isSection: true,
          basisSuffix: "（令第九条適用）",
        };

        const subResult = judgeArticle22(subContext);

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
      message: "漏電火災警報器の設置義務の条件に該当しません。",
      basis: "",
    };
  });

  return {
    regulationResult,
  };
}
