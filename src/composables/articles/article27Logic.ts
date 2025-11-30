import { computed } from "vue";
import { useCodeMatches } from "@/composables/utils";
import type { JudgementResult, Article27UserInput, Floor } from "@/types";

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  siteArea: number;
  buildingHeight: number;
  totalArea: number;
  groundFloors: number;
  floors: Floor[];
  buildingStructure: "fire-resistant" | "quasi-fire-resistant" | "other" | null;
};

// 構造ごとの基準面積
const STRUCTURE_THRESHOLDS: Record<string, number> = {
  "fire-resistant": 15000,
  "quasi-fire-resistant": 10000,
  other: 5000,
};

/**
 * 第2号の判定: 高さ31m超かつ延べ面積25,000㎡以上
 */
function checkItem2(ctx: JudgementContext): JudgementResult | null {
  if (ctx.buildingHeight > 31 && ctx.totalArea >= 25000) {
    return {
      required: true,
      message: `建物の高さが31mを超え、延べ面積が25,000㎡以上のため、消防用水の設置が必要です。`,
      basis: "令第27条第2号",
    };
  }
  return null;
}

/**
 * 第1号の判定: 敷地面積20,000㎡以上かつ構造基準面積以上
 */
function checkItem1(ctx: JudgementContext): JudgementResult | null {
  // (16)項は対象外
  const excludedUses = ["annex16"];
  if (useCodeMatches(ctx.useCode, excludedUses)) {
    return {
      required: false,
      message: "この用途は令第27条第1号の対象外です。",
      basis: "令第27条第1号",
    };
  }

  // 敷地面積が20,000㎡未満
  if (ctx.siteArea < 20000) {
    return {
      required: false,
      message:
        "敷地面積が20,000㎡未満のため、令第27条第1号の設置義務はありません。",
      basis: "令第27条第1号",
    };
  }

  // 構造が未選択
  if (!ctx.buildingStructure) {
    return {
      required: "warning",
      message: "建物の耐火性能を選択してください。",
      basis: "令第27条第1号",
    };
  }

  // 対象床面積の計算（1階建ては1階、2階建て以上は1階+2階）
  const floor1 = ctx.floors.find((f) => f.type === "ground" && f.level === 1);
  const floor2 = ctx.floors.find((f) => f.type === "ground" && f.level === 2);

  let targetFloorArea = 0;
  if (ctx.groundFloors === 1) {
    targetFloorArea = floor1?.floorArea ?? 0;
  } else if (ctx.groundFloors >= 2) {
    targetFloorArea = (floor1?.floorArea ?? 0) + (floor2?.floorArea ?? 0);
  }

  if (targetFloorArea === 0) {
    return {
      required: "warning",
      message: "1階または2階の床面積が入力されていません。",
      basis: "令第27条第1号",
    };
  }

  const threshold = STRUCTURE_THRESHOLDS[ctx.buildingStructure];

  if (ctx.siteArea >= 20000 && targetFloorArea >= threshold) {
    return {
      required: true,
      message: `敷地面積が20,000㎡以上、かつ建物の構造（${
        ctx.buildingStructure
      }）における基準面積（${threshold}㎡）以上（対象面積: ${targetFloorArea.toFixed(
        2
      )}㎡）のため、設置が必要です。`,
      basis: "令第27条第1号",
    };
  }

  return null;
}

/**
 * 第27条（消防用水）の判定を行う統括関数
 */
function judgeArticle27(ctx: JudgementContext): JudgementResult {
  // 第2号を優先してチェック
  const item2Result = checkItem2(ctx);
  if (item2Result) return item2Result;

  // 第1号のチェック
  const item1Result = checkItem1(ctx);
  if (item1Result) return item1Result;

  return {
    required: false,
    message: "消防用水の設置義務はありません。",
    basis: "-",
  };
}

export function useArticle27Logic(userInput: Article27UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      siteArea,
      buildingHeight,
      totalArea,
      groundFloors,
      floors,
      buildingStructure,
    } = userInput;

    const useCode = buildingUse.value;
    if (!useCode) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    const context: JudgementContext = {
      useCode,
      siteArea: siteArea.value ?? 0,
      buildingHeight: buildingHeight.value ?? 0,
      totalArea: totalArea.value ?? 0,
      groundFloors: groundFloors.value,
      floors: floors.value,
      buildingStructure: buildingStructure.value,
    };

    return judgeArticle27(context);
  });

  return {
    regulationResult,
  };
}
