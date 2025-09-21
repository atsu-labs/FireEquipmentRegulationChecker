import { describe, it, expect } from "vitest";
import { ref, type Ref } from "vue";
import { useArticle11Logic } from "../composables/articles/article11Logic";
import type { Article11UserInput } from "@/types";

// テストデータ生成のヘルパー関数
const createMockInput = (
  overrides: Partial<Article11UserInput> = {}
): Article11UserInput => {
  const defaults: Article11UserInput = {
    buildingUse: ref(null),
    totalArea: ref(0),
    hasBasement: ref(false),
    basementArea: ref(0),
    hasNoWindowFloor: ref(false),
    noWindowFloorArea: ref(0),
    hasUpperFloors: ref(false),
    upperFloorsArea: ref(0),
    structureType: ref("C"),
    finishType: ref("other"),
    storesFlammableItems: ref(false),
    storesDesignatedCombustiblesOver750x: ref(false),
  };
  const merged: Article11UserInput = { ...defaults };
  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const k = key as keyof Article11UserInput;
      if (merged[k] && "value" in merged[k]) {
        (merged[k] as Ref<unknown>).value = (
          overrides[k] as Ref<unknown>
        ).value;
      }
    }
  }
  return merged;
};

describe("useArticle11Logic", () => {
  it("建物の用途が選択されていない場合、設置義務なしと判定されること", () => {
    const input = createMockInput();
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe(
      "建物の用途を選択してください。"
    );
  });

  it("用途がitem01で延べ面積500㎡以上なら設置義務あり", () => {
    const input = createMockInput({
      buildingUse: ref("item01"),
      totalArea: ref(600),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第11条第1項第1号");
  });

  it("用途がitem02で延べ面積700㎡未満なら設置義務なし", () => {
    const input = createMockInput({
      buildingUse: ref("item02"),
      totalArea: ref(500),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });

  it("用途がitem11で延べ面積1000㎡以上なら設置義務あり", () => {
    const input = createMockInput({
      buildingUse: ref("item11"),
      totalArea: ref(1200),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第11条第1項第3号");
  });

  it("指定可燃物を750倍以上貯蔵している場合、設置義務あり", () => {
    const input = createMockInput({
      buildingUse: ref("item01"),
      storesFlammableItems: ref(true),
      storesDesignatedCombustiblesOver750x: ref(true),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第11条第1項第5号");
  });
});
