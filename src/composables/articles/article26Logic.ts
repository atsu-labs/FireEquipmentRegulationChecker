import { computed } from "vue";
import { useCodeMatches } from "@/composables/utils";
import type { JudgementResult, Article26UserInput, Floor } from "@/types";

// このファイル内で使用する個別の判定結果
interface IndividualResult {
  required: boolean | "warning" | "info";
  message: string;
  basis: string;
}

/**
 * 判定に必要なコンテキスト情報
 */
type JudgementContext = {
  useCode: string;
  groundFloors: number;
  floors: Floor[];
};

const EXEMPTION_MESSAGE =
  "ただし、避難が容易であると認められるものとして総務省令で定める場合は免除されます。";

// 完全適用対象用途（すべての階に誘導灯が必要）
const FULL_APPLICATION_USES = [
  "annex01",
  "annex02",
  "annex03",
  "annex04",
  "annex05_i",
  "annex06",
  "annex09",
  "annex16_i",
  "annex16_2",
  "annex16_3",
];

// 部分適用対象用途（地下階・無窓階・11階以上の階に誘導灯が必要）
const PARTIAL_APPLICATION_USES = [
  "annex05_ro",
  "annex07",
  "annex08",
  "annex10",
  "annex11",
  "annex12",
  "annex13",
  "annex14",
  "annex15",
  "annex16_ro",
];

// 客席誘導灯の確認が必要な複合用途
const AUDITORIUM_CHECK_USES = ["annex16_i", "annex16_2"];

// 誘導標識の設置対象用途
const SIGN_REQUIRED_USES = [
  "annex01",
  "annex02",
  "annex03",
  "annex04",
  "annex05",
  "annex06",
  "annex07",
  "annex08",
  "annex09",
  "annex10",
  "annex11",
  "annex12",
  "annex13",
  "annex14",
  "annex15",
  "annex16",
];

/**
 * 第1号・第2号の判定: 避難口誘導灯・通路誘導灯
 */
function checkExitAndCorridorLight(ctx: JudgementContext): IndividualResult {
  const hasFloorOver11 = ctx.groundFloors >= 11;

  // 完全適用対象用途
  if (useCodeMatches(ctx.useCode, FULL_APPLICATION_USES)) {
    return {
      required: true,
      message: `この用途の建物には誘導灯の設置が必要です。${EXEMPTION_MESSAGE}`,
      basis: "令第26条第1項第1号, 第2号",
    };
  }

  // 部分適用対象用途
  if (useCodeMatches(ctx.useCode, PARTIAL_APPLICATION_USES)) {
    const parts: string[] = [];

    const basementFloorsList = ctx.floors
      .filter((f) => f.type === "basement")
      .map((f) => `地下${f.level}階`);

    const windowlessFloorsList = ctx.floors
      .filter((f) => f.isWindowless)
      .map((f) => `${f.level}階（無窓階）`);

    parts.push(...basementFloorsList, ...windowlessFloorsList);

    if (hasFloorOver11) {
      parts.push("11階以上の階");
    }

    if (parts.length > 0) {
      const uniqueParts = [...new Set(parts)];
      const message = `この用途の建物では、${uniqueParts.join(
        "、"
      )}の部分に誘導灯の設置が必要です。${EXEMPTION_MESSAGE}`;
      return {
        required: true,
        message,
        basis: "令第26条第1項第1号, 第2号",
      };
    }
  }

  return { required: false, message: "", basis: "" };
}

/**
 * 第3号の判定: 客席誘導灯
 */
function checkAuditoriumLight(ctx: JudgementContext): IndividualResult {
  // (1)項（劇場等）は客席誘導灯が必要
  if (useCodeMatches(ctx.useCode, ["annex01"])) {
    return {
      required: true,
      message: `劇場・公会堂など（(1)項）には設置が必要です。${EXEMPTION_MESSAGE}`,
      basis: "令第26条第1項第3号",
    };
  }

  // 複合用途の場合は確認が必要
  if (useCodeMatches(ctx.useCode, AUDITORIUM_CHECK_USES)) {
    return {
      required: "warning",
      message: `【要確認】この建物に劇場、映画館、演芸場、公会堂等の用途に供する部分がある場合、その部分に客席誘導灯の設置が必要です。${EXEMPTION_MESSAGE}`,
      basis: "令第26条第1項第3号",
    };
  }

  return { required: false, message: "", basis: "" };
}

/**
 * 第4号の判定: 誘導標識
 */
function checkGuidanceSign(ctx: JudgementContext): IndividualResult {
  if (useCodeMatches(ctx.useCode, SIGN_REQUIRED_USES)) {
    return {
      required: true,
      message: `この用途の建物には設置が必要です。${EXEMPTION_MESSAGE}`,
      basis: "令第26条第1項第4号",
    };
  }

  return { required: false, message: "", basis: "" };
}

/**
 * 第26条（誘導灯・誘導標識）の判定を行う統括関数
 */
function judgeArticle26(ctx: JudgementContext): JudgementResult {
  const exitAndCorridorResult = checkExitAndCorridorLight(ctx);
  const auditoriumResult = checkAuditoriumLight(ctx);
  const signResult = checkGuidanceSign(ctx);

  const isGuideLightRequired = exitAndCorridorResult.required === true;
  const isAuditoriumRequired = auditoriumResult.required === true;
  const isAuditoriumWarning = auditoriumResult.required === "warning";
  const isSignRequired = signResult.required === true;

  // 客席誘導灯の確認が必要な場合、全体を warning とする
  if (isAuditoriumWarning) {
    let message = auditoriumResult.message;
    // 誘導灯も必要なら、その旨を追記
    if (isGuideLightRequired) {
      message = `${exitAndCorridorResult.message} ${message}`;
    }
    const basis = new Set<string>();
    if (isGuideLightRequired) basis.add(exitAndCorridorResult.basis);
    basis.add(auditoriumResult.basis);

    return {
      required: "warning",
      message,
      basis: Array.from(basis).join(", "),
    };
  }

  // 誘導灯が必須の場合 (客席誘導灯の warning はない)
  if (isGuideLightRequired) {
    let message = exitAndCorridorResult.message;
    if (isAuditoriumRequired) {
      // (1)項の場合
      message += " また、客席誘導灯も必要です。";
    }
    const basis = new Set<string>();
    basis.add(exitAndCorridorResult.basis);
    if (isAuditoriumRequired) basis.add(auditoriumResult.basis);

    return { required: true, message, basis: Array.from(basis).join(", ") };
  }

  // 誘導灯・客席誘導灯が不要で、誘導標識が必要な場合
  if (isSignRequired) {
    return {
      required: "info",
      message:
        "誘導灯の設置義務がなく、特定の用途・構造に該当するため、誘導標識の設置が必要です。",
      basis: signResult.basis,
    };
  }

  // すべて不要な場合
  return {
    required: false,
    message: "誘導灯および誘導標識の設置義務はありません。",
    basis: "－",
  };
}

export function useArticle26Logic(userInput: Article26UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, groundFloors, floors } = userInput;
    const useCode = buildingUse.value;

    if (!useCode) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "－",
      };
    }

    const context: JudgementContext = {
      useCode,
      groundFloors: groundFloors.value,
      floors: floors.value,
    };

    return judgeArticle26(context);
  });

  return {
    regulationResult,
  };
}
