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
    floors: ref([]),
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
      buildingUse: ref("annex01"),
      totalArea: ref(600),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第11条第1項第1号");
  });

  it("用途がitem02で延べ面積700㎡未満なら設置義務なし", () => {
    const input = createMockInput({
      buildingUse: ref("annex02"),
      totalArea: ref(500),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });

  it("用途がitem11で延べ面積1000㎡以上なら設置義務あり", () => {
    const input = createMockInput({
      buildingUse: ref("annex11"),
      totalArea: ref(1200),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第11条第1項第3号");
  });

  it("指定可燃物を750倍以上貯蔵している場合、設置義務あり", () => {
    const input = createMockInput({
      buildingUse: ref("annex01"),
      storesFlammableItems: ref(true),
      storesDesignatedCombustiblesOver750x: ref(true),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第11条第1項第5号");
  });

  it("構造A・仕上げflammableで面積要件が3倍になること（item01, totalArea 1500㎡）", () => {
    const input = createMockInput({
      buildingUse: ref("annex01"),
      totalArea: ref(1500),
      structureType: ref("A"),
      finishType: ref("flammable"),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.message).toContain("面積要件を3倍で計算");
    expect(regulationResult.value.basis).toContain("令第11条第1項第1号");
  });

  it("構造A・仕上げflammableで面積要件3倍でも未満なら設置義務なし（item01, totalArea 1000㎡）", () => {
    const input = createMockInput({
      buildingUse: ref("annex01"),
      totalArea: ref(1000),
      structureType: ref("A"),
      finishType: ref("flammable"),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toContain("設置義務はありません");
  });

  it("group2用途（item02）で面積要件2倍（構造A, 仕上げother, totalArea 1400㎡）", () => {
    const input = createMockInput({
      buildingUse: ref("annex02"),
      totalArea: ref(1400),
      structureType: ref("A"),
      finishType: ref("other"),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.message).toContain("面積要件を2倍で計算");
    expect(regulationResult.value.basis).toContain("令第11条第1項第2号");
  });

  it("特殊コード（item06_i_1）で面積要件2倍でも1000㎡未満なら設置義務なし", () => {
    const input = createMockInput({
      buildingUse: ref("annex06_i_1"),
      totalArea: ref(900),
      structureType: ref("A"),
      finishType: ref("other"),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toContain("設置義務はありません");
  });

  it("特殊コード（item06_i_1）で面積要件2倍でも1000㎡以上なら設置義務あり", () => {
    const input = createMockInput({
      buildingUse: ref("annex06_i_1"),
      totalArea: ref(1000),
      structureType: ref("A"),
      finishType: ref("other"),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain(
      "1000㎡のいずれか小さい数値"
    );
  });

  it("annex16_2で150㎡以上なら設置義務あり", () => {
    const input = createMockInput({
      buildingUse: ref("annex16_2"),
      totalArea: ref(200),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第11条第1項第4号");
  });

  it("annex16_2で150㎡未満なら設置義務なし", () => {
    const input = createMockInput({
      buildingUse: ref("annex16_2"),
      totalArea: ref(100),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toContain("設置義務はありません");
  });

  it("地階の床面積が要件以上なら設置義務あり（item01, basementArea 120㎡）", () => {
    const input = createMockInput({
      buildingUse: ref("annex01"),
      hasBasement: ref(true),
      basementArea: ref(120),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第11条第1項第6号");
    expect(regulationResult.value.message).toContain("地階の床面積");
  });

  it("無窓階の床面積が要件以上なら設置義務あり（item02, noWindowFloorArea 200㎡）", () => {
    const input = createMockInput({
      buildingUse: ref("annex02"),
      hasNoWindowFloor: ref(true),
      noWindowFloorArea: ref(200),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第11条第1項第6号");
    expect(regulationResult.value.message).toContain("無窓階の床面積");
  });

  it("4階以上の階の床面積が要件以上なら設置義務あり（item11, upperFloorsArea 250㎡）", () => {
    const input = createMockInput({
      buildingUse: ref("annex11"),
      hasUpperFloors: ref(true),
      upperFloorsArea: ref(250),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain("令第11条第1項第6号");
    expect(regulationResult.value.message).toContain("4階以上の階の床面積");
  });

  it("どの条件にも該当しない場合は設置義務なし", () => {
    const input = createMockInput({
      buildingUse: ref("annex01"),
      totalArea: ref(100),
    });
    const { regulationResult } = useArticle11Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toContain("設置義務はありません");
  });
});
