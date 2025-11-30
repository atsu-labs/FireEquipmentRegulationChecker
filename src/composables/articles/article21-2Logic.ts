import { computed } from "vue";
import type { JudgementResult, Article21_2UserInput, Floor } from "@/types";
import { useCodeMatches, getUseDisplayName } from "@/composables/utils";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  useDisplay: string;
  totalArea: number;
  basementArea: number;
  hasHotSpringFacility: boolean;
  isHotSpringFacilityConfirmed: boolean;
  isSection: boolean;
  basisSuffix: string;
};

/**
 * 第1号の判定: (16の2)項で延べ面積1000㎡以上
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナント単位では判定しない（建物全体の用途判定）

  if (useCodeMatches(ctx.useCode, ["annex16_2"]) && ctx.totalArea >= 1000) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）、延べ面積1000㎡以上のため、設置が必要です。`,
      basis: `令第21条の2第1項第1号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第2号の判定: (16の3)項で延べ面積1000㎡以上
 * 特定用途部分の面積合計が500㎡以上の場合は設置義務あり
 */
function checkItem2WithFloors(
  ctx: JudgementContext,
  floors: Floor[]
): JudgementResult | null {
  if (ctx.isSection) return null; // テナント単位では判定しない

  if (!useCodeMatches(ctx.useCode, ["annex16_3"]) || ctx.totalArea < 1000) {
    return null;
  }

  // 特定用途のコード
  const specificUseCodes = [
    "annex01",
    "annex02",
    "annex03",
    "annex04",
    "annex05_i",
    "annex06",
    "annex09_i",
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

  if (specificUseArea >= 500) {
    return {
      required: true,
      message: `延べ面積1000㎡以上の(16の3)項の建物で、特定用途部分の面積合計が${specificUseArea.toFixed(
        0
      )}㎡（≧500㎡）のため、設置が必要です。`,
      basis: `令第21条の2第1項第2号${ctx.basisSuffix}`,
    };
  }

  // 構成用途の情報がない場合は警告
  if (specificUseArea === 0) {
    return {
      required: "warning",
      message:
        "延べ面積1000㎡以上の(16の3)項の建物です。特定用途部分の面積合計が500㎡以上の場合は設置義務があります。構成用途の面積情報を入力してください。",
      basis: `令第21条の2第1項第2号${ctx.basisSuffix}`,
    };
  }

  return {
    required: false,
    message: `延べ面積1000㎡以上の(16の3)項の建物ですが、特定用途部分の面積合計が${specificUseArea.toFixed(
      0
    )}㎡（＜500㎡）のため、設置義務はありません。`,
    basis: `令第21条の2第1項第2号${ctx.basisSuffix}`,
  };
}

/**
 * 第3号の判定: 温泉の採取のための設備
 */
function checkItem3(ctx: JudgementContext): JudgementResult | null {
  if (ctx.isSection) return null; // テナント単位では判定しない

  if (ctx.hasHotSpringFacility && !ctx.isHotSpringFacilityConfirmed) {
    return {
      required: "warning",
      message:
        "温泉の採取のための設備があり、温泉法の確認を受けていない場合、収容人員によっては設置義務が発生します。",
      basis: `令第21条の2第1項第3号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第4号の判定: 特定用途で地階の面積合計が1000㎡以上
 */
function checkItem4(ctx: JudgementContext): JudgementResult | null {
  const item4Codes = [
    "annex01",
    "annex02",
    "annex03",
    "annex04",
    "annex05_i",
    "annex06",
    "annex09_i",
  ];

  if (
    useCodeMatches(ctx.useCode, item4Codes) &&
    ctx.basementArea >= 1000 &&
    !ctx.hasHotSpringFacility // 3号に該当する場合はそちらを優先
  ) {
    return {
      required: true,
      message: `用途（${ctx.useDisplay}）の地階の床面積合計が1000㎡以上のため、設置が必要です。`,
      basis: `令第21条の2第1項第4号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第5号の判定: (16)項イで地階の面積合計が1000㎡以上
 * 特定用途部分の面積合計が500㎡以上の場合は設置義務あり
 */
function checkItem5WithFloors(
  ctx: JudgementContext,
  floors: Floor[]
): JudgementResult | null {
  if (ctx.isSection) return null; // テナント単位では判定しない

  if (!useCodeMatches(ctx.useCode, ["annex16_i"]) || ctx.basementArea < 1000) {
    return null;
  }

  // 3号に該当する場合はそちらを優先
  if (ctx.hasHotSpringFacility) {
    return null;
  }

  // 特定用途のコード
  const specificUseCodes = [
    "annex01",
    "annex02",
    "annex03",
    "annex04",
    "annex05_i",
    "annex06",
    "annex09_i",
  ];

  // 地階の構成用途から特定用途部分の面積合計を計算
  let specificUseArea = 0;
  floors
    .filter((f) => f.type === "basement")
    .forEach((floor) => {
      floor.componentUses?.forEach((cu) => {
        if (cu.useCode && cu.floorArea && cu.floorArea > 0) {
          if (useCodeMatches(cu.useCode, specificUseCodes)) {
            specificUseArea += cu.floorArea;
          }
        }
      });
    });

  if (specificUseArea >= 500) {
    return {
      required: true,
      message: `(16)項イの地階の床面積合計が1000㎡以上で、特定用途部分の面積合計が${specificUseArea.toFixed(
        0
      )}㎡（≧500㎡）のため、設置が必要です。`,
      basis: `令第21条の2第1項第5号${ctx.basisSuffix}`,
    };
  }

  // 構成用途の情報がない場合は警告
  if (specificUseArea === 0) {
    return {
      required: "warning",
      message:
        "(16)項イの地階の床面積合計が1000㎡以上です。特定用途部分の面積合計が500㎡以上の場合は設置義務があります。構成用途の面積情報を入力してください。",
      basis: `令第21条の2第1項第5号${ctx.basisSuffix}`,
    };
  }

  return {
    required: false,
    message: `(16)項イの地階の床面積合計が1000㎡以上ですが、特定用途部分の面積合計が${specificUseArea.toFixed(
      0
    )}㎡（＜500㎡）のため、設置義務はありません。`,
    basis: `令第21条の2第1項第5号${ctx.basisSuffix}`,
  };
}

/**
 * 第21条の2（ガス漏れ火災警報設備）の判定を行う統括関数
 * 注意: 第2号・第5号はfloors情報が必要なため、別途処理する
 */
function judgeArticle21_2(ctx: JudgementContext): JudgementResult | null {
  const checks = [checkItem1, checkItem3, checkItem4];

  for (const check of checks) {
    const result = check(ctx);
    if (result) return result;
  }

  return null;
}

export function useArticle21_2Logic(userInput: Article21_2UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      totalArea,
      floors,
      hasHotSpringFacility,
      isHotSpringFacilityConfirmed,
    } = userInput;

    if (!buildingUse.value) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    const basementArea = floors.value
      .filter((f) => f.type === "basement")
      .reduce((sum, f) => sum + (f.floorArea || 0), 0);

    const positiveResults: JudgementResult[] = [];

    // 1. 建物全体としての判定
    const mainContext: JudgementContext = {
      useCode: buildingUse.value,
      useDisplay: getUseDisplayName(buildingUse.value),
      totalArea: totalArea.value || 0,
      basementArea,
      hasHotSpringFacility: hasHotSpringFacility.value,
      isHotSpringFacilityConfirmed: isHotSpringFacilityConfirmed.value,
      isSection: false,
      basisSuffix: "",
    };

    const mainResult = judgeArticle21_2(mainContext);
    if (mainResult) {
      if (mainResult.required !== false) {
        positiveResults.push(mainResult);
      }
    }

    // 第2号の判定（floors情報が必要なため別途処理）
    const item2Result = checkItem2WithFloors(mainContext, floors.value);
    if (item2Result) {
      if (item2Result.required !== false) {
        positiveResults.push(item2Result);
      } else if (item2Result.basis) {
        // 明確に「設置義務なし」と判定された場合
        return item2Result;
      }
    }

    // 第5号の判定（floors情報が必要なため別途処理）
    const item5Result = checkItem5WithFloors(mainContext, floors.value);
    if (item5Result) {
      if (item5Result.required !== false) {
        positiveResults.push(item5Result);
      } else if (item5Result.basis) {
        // 明確に「設置義務なし」と判定された場合
        return item5Result;
      }
    }

    // 2. 16項（複合用途）の場合の「みなし判定」（第九条適用）
    if (useCodeMatches(buildingUse.value, ["annex16_i", "annex16_ro"])) {
      // 構成用途ごとにデータを集計
      const componentUseMap = new Map<
        string,
        { totalArea: number; basementArea: number }
      >();

      floors.value.forEach((floor: Floor) => {
        floor.componentUses?.forEach((cu) => {
          if (!cu.useCode) return;

          if (!componentUseMap.has(cu.useCode)) {
            componentUseMap.set(cu.useCode, { totalArea: 0, basementArea: 0 });
          }

          const entry = componentUseMap.get(cu.useCode)!;
          if (cu.floorArea && cu.floorArea > 0) {
            entry.totalArea += cu.floorArea;
            if (floor.type === "basement") {
              entry.basementArea += cu.floorArea;
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
          basementArea: data.basementArea,
          hasHotSpringFacility: false, // テナント単位では温泉設備の情報はなし
          isHotSpringFacilityConfirmed: false,
          isSection: true,
          basisSuffix: "（令第九条適用）",
        };

        // 第4号のみテナント判定可能
        const subResult = checkItem4(subContext);

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
      message: "ガス漏れ火災警報設備の設置義務の条件に該当しません。",
      basis: "",
    };
  });

  return {
    regulationResult,
  };
}
