/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { ref, type Ref } from "vue";
import { useArticle13Logic } from "../composables/articles/article13Logic";
import type { Article13UserInput } from "@/types";

// テストデータ生成のヘルパー関数
const createMockInput = (
  overrides: Partial<{
    [K in keyof Article13UserInput]: Article13UserInput[K]["value"];
  }> = {}
): Article13UserInput => {
  const defaults: Article13UserInput = {
    buildingUse: ref(null),
    storesDesignatedCombustiblesOver1000x: ref(false),
    parking: ref({
      exists: false,
      canAllVehiclesExitSimultaneously: false,
      mechanical: { present: false, capacity: null },
    } as any),
    hasCarRepairArea: ref(false),
    hasHelicopterLandingZone: ref(false),
    hasHighFireUsageArea: ref(false),
    hasElectricalEquipmentArea: ref(false),
    hasTelecomRoomOver500sqm: ref(false),
    hasRoadwayPart: ref(false),
  };

  const refs = { ...defaults };
  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      // ...existing code...
      const k = key as keyof Article13UserInput;
      if (refs[k]) {
        const map = overrides as unknown as Record<string, unknown>;
        (refs[k] as Ref<unknown>).value = map[key];
      }
    }
  }
  return refs;
};

describe("useArticle13Logic", () => {
  it("建物の用途が選択されていない場合、設置義務なしと判定されること", () => {
    const input = createMockInput();
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe(
      "建物の用途を選択してください。"
    );
  });

  it("デフォルト状態では設置義務なしと判定されること", () => {
    const input = createMockInput({ buildingUse: "item01_i_ro" });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toContain("設置義務はありません");
  });

  it("1号: 用途が(13)項ロの場合、設置義務あり", () => {
    const input = createMockInput({ buildingUse: "item13_ro" });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第13条第1項第1号");
    expect(regulationResult.value.message).toContain("航空機格納庫");
  });

  it("2号: ヘリポートがある場合、設置義務あり", () => {
    const input = createMockInput({
      buildingUse: "item01_i_ro",
      hasHelicopterLandingZone: true,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第13条第1項第2号");
    expect(regulationResult.value.message).toContain("ヘリポート");
  });

  it("3号: 道路の用に供される部分がある場合、警告を返す", () => {
    const input = createMockInput({
      buildingUse: "item01_i_ro",
      hasRoadwayPart: true,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第13条第1項第3号");
  });

  it("4号: 自動車修理工場がある場合、警告を返す", () => {
    const input = createMockInput({
      buildingUse: "item01_i_ro",
      hasCarRepairArea: true,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第13条第1項第4号");
  });

  it("5号イ: 駐車場がある場合、警告を返す", () => {
    const input = createMockInput({
      buildingUse: "item01_i_ro",
      parking: { ...(null as any), exists: true },
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第13条第1項第5号イ");
  });

  it("5号ロ: 機械式駐車場で収容台数10台未満の場合、警告を返す", () => {
    const input = createMockInput({
      buildingUse: "item01_i_ro",
      parking: { ...(null as any), mechanical: { present: true, capacity: 9 } },
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第13条第1項第5号ロ");
  });

  it("5号ロ: 機械式駐車場で収容台数10台以上の場合、設置義務あり", () => {
    const input = createMockInput({
      buildingUse: "item01_i_ro",
      parking: {
        ...(null as any),
        mechanical: { present: true, capacity: 10 },
      },
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第13条第1項第5号ロ");
  });

  it("6号: 電気設備室がある場合、警告を返す", () => {
    const input = createMockInput({
      buildingUse: "item01_i_ro",
      hasElectricalEquipmentArea: true,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第13条第1項第6号");
  });

  it("7号: 多量の火気を使用する部分がある場合、警告を返す", () => {
    const input = createMockInput({
      buildingUse: "item01_i_ro",
      hasHighFireUsageArea: true,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第13条第1項第7号");
  });

  it("8号: 通信機器室がある場合、警告を返す", () => {
    const input = createMockInput({
      buildingUse: "item01_i_ro",
      hasTelecomRoomOver500sqm: true,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第13条第1項第8号");
  });

  it("9号: 指定可燃物が1000倍以上ある場合、警告を返す", () => {
    const input = createMockInput({
      buildingUse: "item01_i_ro",
      storesDesignatedCombustiblesOver1000x: true,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toContain("令第13条第1項第9号");
  });
});
