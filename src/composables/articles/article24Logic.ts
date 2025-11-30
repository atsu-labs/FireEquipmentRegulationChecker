import { computed } from "vue";
import { useCodeMatches } from "@/composables/utils";
import type { JudgementResult, Article24UserInput, Floor } from "@/types";

// ========================================
// 定数定義
// ========================================

// 第1項: 非常警報器具が必要な用途
const PARA1_USE_CODES = [
  "annex04",
  "annex06_ro",
  "annex06_ha",
  "annex06_ni",
  "annex09_ro",
  "annex12",
];

// 第2項第1号: 収容人員20人以上で設置が必要な高リスク用途
const PARA2_ITEM1_USE_CODES = ["annex05_i", "annex06_i", "annex09_i"];

// 第2項第2号: 収容人員50人以上または地階等収容人員20人以上で設置が必要な用途
const PARA2_ITEM2_USE_CODES = [
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
  "annex17",
];

// 第3項第1号: 用途だけで設置が必要
const PARA3_ITEM1_USE_CODES = ["annex16_2", "annex16_3"];

// 第3項第4号: 収容人員300人以上で設置が必要な特定用途
const PARA3_ITEM4_GROUP_A_CODES = [
  "annex01",
  "annex02",
  "annex03",
  "annex04",
  "annex05_i",
  "annex06",
  "annex09_i",
];

// 第3項第4号: 収容人員800人以上で設置が必要な用途
const PARA3_ITEM4_GROUP_B_CODES = ["annex05_ro", "annex07", "annex08"];

const EXEMPTION_MESSAGE_1 =
  "ただし、自動火災報知設備又は非常警報設備が設置されている場合は免除されます。";
const EXEMPTION_MESSAGE_2 =
  "ただし、自動火災報知設備が設置されている場合は免除されます。";

// ========================================
// 型定義
// ========================================

interface JudgementContext {
  use: string;
  capacity: number;
  groundFloors: number;
  basementFloors: number;
  basementOrWindowlessCapacity: number;
  basisSuffix: string;
  messagePrefix: string;
}

// ========================================
// 判定関数
// ========================================

/**
 * 第3項第1号: (16の2)項または(16の3)項
 */
function checkPara3Item1(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.use, PARA3_ITEM1_USE_CODES)) {
    return {
      required: true,
      message: `${ctx.messagePrefix}用途（(16の2)項または(16の3)項）に該当するため、非常ベル及び放送設備、又は自動式サイレン及び放送設備の設置が必要です。`,
      basis: `令第24条第3項第1号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第3項第2号: 地上11階以上または地下3階以上
 */
function checkPara3Item2(ctx: JudgementContext): JudgementResult | null {
  if (ctx.groundFloors >= 11 || ctx.basementFloors >= 3) {
    return {
      required: true,
      message: `${ctx.messagePrefix}地階を除く階数が11以上、又は地階の階数が3以上であるため、非常ベル及び放送設備、又は自動式サイレン及び放送設備の設置が必要です。`,
      basis: `令第24条第3項第2号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第3項第3号: (16)項イで収容人員500人以上
 */
function checkPara3Item3(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.use, ["annex16_i"]) && ctx.capacity >= 500) {
    return {
      required: true,
      message: `${ctx.messagePrefix}用途が(16)項イで収容人員が500人以上のため、非常ベル及び放送設備、又は自動式サイレン及び放送設備の設置が必要です。`,
      basis: `令第24条第3項第3号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第3項第4号: 特定用途で収容人員が基準以上
 */
function checkPara3Item4(ctx: JudgementContext): JudgementResult | null {
  if (
    useCodeMatches(ctx.use, PARA3_ITEM4_GROUP_A_CODES) &&
    ctx.capacity >= 300
  ) {
    return {
      required: true,
      message: `${ctx.messagePrefix}特定用途（${ctx.use}）で収容人員が300人以上のため、非常ベル及び放送設備、又は自動式サイレン及び放送設備の設置が必要です。`,
      basis: `令第24条第3項第4号${ctx.basisSuffix}`,
    };
  }
  if (
    useCodeMatches(ctx.use, PARA3_ITEM4_GROUP_B_CODES) &&
    ctx.capacity >= 800
  ) {
    return {
      required: true,
      message: `${ctx.messagePrefix}特定用途（${ctx.use}）で収容人員が800人以上のため、非常ベル及び放送設備、又は自動式サイレン及び放送設備の設置が必要です。`,
      basis: `令第24条第3項第4号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第2項第1号: 高リスク用途で収容人員20人以上
 */
function checkPara2Item1(ctx: JudgementContext): JudgementResult | null {
  if (useCodeMatches(ctx.use, PARA2_ITEM1_USE_CODES) && ctx.capacity >= 20) {
    return {
      required: true,
      message: `${ctx.messagePrefix}特定用途（${ctx.use}）で収容人員が20人以上のため、非常ベル、自動式サイレン又は放送設備の設置が必要です。${EXEMPTION_MESSAGE_2}`,
      basis: `令第24条第2項第1号${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 第2項第2号: 収容人員50人以上または地階等収容人員20人以上
 */
function checkPara2Item2(ctx: JudgementContext): JudgementResult | null {
  if (
    useCodeMatches(ctx.use, PARA2_ITEM2_USE_CODES) &&
    !useCodeMatches(ctx.use, PARA2_ITEM1_USE_CODES)
  ) {
    if (ctx.capacity >= 50 || ctx.basementOrWindowlessCapacity >= 20) {
      return {
        required: true,
        message: `${ctx.messagePrefix}収容人員が50人以上、又は地階・無窓階の収容人員が20人以上のため、非常ベル、自動式サイレン又は放送設備の設置が必要です。${EXEMPTION_MESSAGE_2}`,
        basis: `令第24条第2項第2号${ctx.basisSuffix}`,
      };
    }
  }
  return null;
}

/**
 * 第1項: 特定用途で収容人員20人以上50人未満
 */
function checkPara1(ctx: JudgementContext): JudgementResult | null {
  if (
    useCodeMatches(ctx.use, PARA1_USE_CODES) &&
    ctx.capacity >= 20 &&
    ctx.capacity < 50
  ) {
    return {
      required: true,
      message: `${ctx.messagePrefix}特定用途で収容人員が20人以上50人未満のため、非常警報器具の設置が必要です。${EXEMPTION_MESSAGE_1}`,
      basis: `令第24条第1項${ctx.basisSuffix}`,
    };
  }
  return null;
}

/**
 * 令第24条の判定を行う
 */
function judgeArticle24(ctx: JudgementContext): JudgementResult {
  // 第3項のチェック（最も厳しい要件から）
  const para3Item1 = checkPara3Item1(ctx);
  if (para3Item1) return para3Item1;

  const para3Item2 = checkPara3Item2(ctx);
  if (para3Item2) return para3Item2;

  const para3Item3 = checkPara3Item3(ctx);
  if (para3Item3) return para3Item3;

  const para3Item4 = checkPara3Item4(ctx);
  if (para3Item4) return para3Item4;

  // 第2項のチェック
  const para2Item1 = checkPara2Item1(ctx);
  if (para2Item1) return para2Item1;

  const para2Item2 = checkPara2Item2(ctx);
  if (para2Item2) return para2Item2;

  // 第1項のチェック
  const para1 = checkPara1(ctx);
  if (para1) return para1;

  return {
    required: false,
    message: "非常警報器具・設備の設置義務はありません。",
    basis: "-",
  };
}

/**
 * 地階・無窓階の収容人員を計算する
 */
function calcBasementOrWindowlessCapacity(floors: Floor[]): number {
  return floors
    .filter((f) => f.type === "basement" || f.isWindowless)
    .reduce((sum, f) => sum + (f.capacity ?? 0), 0);
}

// ========================================
// メインロジック
// ========================================

export function useArticle24Logic(userInput: Article24UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, totalCapacity, groundFloors, basementFloors, floors } =
      userInput;

    const use = buildingUse.value;
    const capacity = totalCapacity.value ?? 0;

    if (!use) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    const basementOrWindowlessCapacity = calcBasementOrWindowlessCapacity(
      floors.value
    );

    // 複合用途（16項イ/ロ）の場合、令第九条適用で各用途部分ごとに判定
    if (useCodeMatches(use, ["annex16_i", "annex16_ro"])) {
      const componentUses = floors.value.flatMap((f) => f.componentUses ?? []);

      if (componentUses.length > 0) {
        // 各テナントの収容人員を集計
        for (const comp of componentUses) {
          const compCapacity = comp.capacity ?? 0;

          const ctx: JudgementContext = {
            use: comp.useCode,
            capacity: compCapacity,
            groundFloors: groundFloors.value,
            basementFloors: basementFloors.value,
            basementOrWindowlessCapacity: 0, // 個別テナントでは計算が難しいため0とする
            basisSuffix: "（令第九条適用）",
            messagePrefix: "複合用途内の特定用途部分について、",
          };

          const result = judgeArticle24(ctx);
          if (result.required) {
            return result;
          }
        }
      }

      // 複合用途全体としての判定
      const ctx: JudgementContext = {
        use,
        capacity,
        groundFloors: groundFloors.value,
        basementFloors: basementFloors.value,
        basementOrWindowlessCapacity,
        basisSuffix: "",
        messagePrefix: "",
      };
      return judgeArticle24(ctx);
    }

    // 通常の単一用途の判定
    const ctx: JudgementContext = {
      use,
      capacity,
      groundFloors: groundFloors.value,
      basementFloors: basementFloors.value,
      basementOrWindowlessCapacity,
      basisSuffix: "",
      messagePrefix: "",
    };

    return judgeArticle24(ctx);
  });

  return {
    regulationResult,
  };
}
