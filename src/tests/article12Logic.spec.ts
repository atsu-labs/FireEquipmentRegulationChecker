import { describe, it, expect } from "vitest";
import { ref, type Ref } from "vue";
import { useArticle12Logic } from "../composables/articles/article12Logic";
import type { Article12UserInput } from "@/types";

// テストデータ生成のヘルパー関数
const createMockInput = (
  overrides: Partial<Article12UserInput> = {}
): Article12UserInput => {
  const defaults: Article12UserInput = {
    buildingUse: ref(null),
    groundFloors: ref(1),
    totalArea: ref(0),
    floors: ref([]),
    isCareDependentOccupancy: ref(false),
    hasStageArea: ref(false),
    stageFloorLevel: ref("ground"),
    stageArea: ref(0),
    isRackWarehouse: ref(false),
    ceilingHeight: ref(0),
    storesDesignatedCombustiblesOver1000x: ref(false),
    hasFireSuppressingStructure: ref(false),
    hasBeds: ref(false),
  };

  // Create a new object for the merged regulationResult to avoid modifying defaults
  const merged: Article12UserInput = { ...defaults };

  // Deep copy refs to avoid sharing state between tests
  for (const key in defaults) {
    const k = key as keyof Article12UserInput;
    if (defaults[k] && "value" in defaults[k]) {
      (merged[k] as Ref<unknown>).value = (defaults[k] as Ref<unknown>).value;
    }
  }

  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const k = key as keyof Article12UserInput;
      if (merged[k] && "value" in merged[k]) {
        (merged[k] as Ref<unknown>).value = (
          overrides[k] as Ref<unknown>
        ).value;
      }
    }
  }
  return merged;
};

describe("useArticle12Logic", () => {
  it("建物の用途が選択されていない場合、設置義務なしと判定されること", () => {
    const input = createMockInput();
    const { regulationResult } = useArticle12Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe(
      "建物の用途を選択してください。"
    );
  });

  // --- 第1項第1号のテスト ---
  describe("令第12条第1項第1号（避難困難施設等）", () => {
    it("1号ロ: 用途が(6)項ロ(1)で延焼抑制構造でない場合、設置義務あり", () => {
      const input = createMockInput({
        buildingUse: ref("item06_ro_1"),
        hasFireSuppressingStructure: ref(false),
      });
      const { regulationResult } = useArticle12Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第12条第1項第1号ロ");
    });

    it("1号ハ: 用途が(6)項ロ(2)で介助が必要な者が入所し、面積275㎡未満でも延焼抑制構造でない場合、設置義務あり", () => {
      const input = createMockInput({
        buildingUse: ref("item06_ro_2"),
        isCareDependentOccupancy: ref(true),
        totalArea: ref(200),
        hasFireSuppressingStructure: ref(false),
      });
      const { regulationResult } = useArticle12Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第12条第1項第1号ハ");
      expect(regulationResult.value.message).toContain(
        "介助がなければ避難できない者を主として入所させる施設"
      );
    });

    it("1号ハ: 用途が(6)項ロ(4)で介助が必要な者以外で、面積275㎡以上で延焼抑制構造でない場合、設置義務あり", () => {
      const input = createMockInput({
        buildingUse: ref("item06_ro_4"),
        isCareDependentOccupancy: ref(false),
        totalArea: ref(300),
        hasFireSuppressingStructure: ref(false),
      });
      const { regulationResult } = useArticle12Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第12条第1項第1号ハ");
      expect(regulationResult.value.message).toContain(
        "介助がなければ避難できない者を主として入所させるもの以外"
      );
    });

    it("1号ハ: 用途が(6)項ロ(5)で介助が必要な者以外で、面積275㎡未満なら設置義務なし", () => {
      const input = createMockInput({
        buildingUse: ref("item06_ro_5"),
        isCareDependentOccupancy: ref(false),
        totalArea: ref(200),
        hasFireSuppressingStructure: ref(false),
      });
      const { regulationResult } = useArticle12Logic(input);
      expect(regulationResult.value.required).toBe(false);
    });

    it("1号: 延焼抑制構造である場合、設置義務なし", () => {
      const input = createMockInput({
        buildingUse: ref("item06_ro_1"),
        hasFireSuppressingStructure: ref(true),
      });
      const { regulationResult } = useArticle12Logic(input);
      expect(regulationResult.value.required).toBe(false);
    });
  });

  it("用途がitem01で舞台部が地階・無窓階・4階以上かつ面積300㎡以上なら設置義務あり", () => {
    const input = createMockInput({
      buildingUse: ref("item01"),
      hasStageArea: ref(true),
      stageFloorLevel: ref("basement_windowless_4th_or_higher"),
      stageArea: ref(350),
    });
    const { regulationResult } = useArticle12Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第12条第1項第2号");
  });

  it("用途がitem04で平屋建て以外かつ延べ面積3000㎡以上なら設置義務あり", () => {
    const input = createMockInput({
      buildingUse: ref("item04"),
      groundFloors: ref(2),
      totalArea: ref(3500),
    });
    const { regulationResult } = useArticle12Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第12条第1項第4号");
  });

  it("指定可燃物を基準数量の1000倍以上貯蔵している場合、設置義務あり", () => {
    const input = createMockInput({
      buildingUse: ref("item01"),
      storesDesignatedCombustiblesOver1000x: ref(true),
    });
    const { regulationResult } = useArticle12Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第12条第1項第8号");
  });
});
