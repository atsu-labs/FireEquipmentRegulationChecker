import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useArticle23Logic } from "../composables/articles/article23Logic";
import type { Article23UserInput, Floor } from "../types";

describe("useArticle23Logic", () => {
  const createMockUserInput = (
    overrides: Partial<Article23UserInput>
  ): Article23UserInput => {
    const defaults: Article23UserInput = {
      buildingUse: ref(null),
      totalArea: ref(0),
      floors: ref([]),
    };
    return { ...defaults, ...overrides };
  };

  it("1号: (6)項ロは高リスクなため、電話での代替不可 (required: true)", () => {
    const userInput = createMockUserInput({ buildingUse: ref("annex06_ro") });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第23条第1項第1号");
  });

  it("1号: (16の2)項は電話での代替が可能 (required: warning)", () => {
    const userInput = createMockUserInput({ buildingUse: ref("annex16_2") });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toContain("令第23条第1項第1号");
  });

  it("2号: (5)項イ、面積500㎡以上は高リスクなため、電話での代替不可 (required: true)", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex05_i"),
      totalArea: ref(500),
    });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第23条第1項第2号");
  });

  it("2号: (4)項、面積500㎡以上は電話での代替が可能 (required: warning)", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex04"),
      totalArea: ref(500),
    });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toContain("令第23条第1項第2号");
    expect(regulationResult.value.message).toContain(
      "延べ面積が500㎡以上のため"
    );
  });

  it("2号: (4)項、面積が500㎡未満は設置不要", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex04"),
      totalArea: ref(499),
    });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it("3号: (9)項、面積1000㎡以上は電話での代替が可能 (required: warning)", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex09_i"),
      totalArea: ref(1000),
    });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toContain("令第23条第1項第3号");
    expect(regulationResult.value.message).toContain(
      "延べ面積が1000㎡以上のため"
    );
  });

  it("3号: (9)項、面積が1000㎡未満は設置不要", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex09_i"),
      totalArea: ref(999),
    });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it("どの条件にも該当しない場合 (18項)", () => {
    const userInput = createMockUserInput({ buildingUse: ref("annex18") });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  // --- 令第九条適用のテスト ---
  describe("令第九条適用: 複合用途内の特定用途部分", () => {
    it("(16)項イで複合用途内の(4)項部分が500㎡以上の場合、warning", () => {
      const floors = ref<Floor[]>([
        {
          level: 1,
          type: "ground",
          floorArea: 1000,
          capacity: null,
          isWindowless: false,
          componentUses: [
            { useCode: "annex04", floorArea: 600, capacity: 100 },
            { useCode: "annex15", floorArea: 400, capacity: 30 },
          ],
        },
      ]);
      const userInput = createMockUserInput({
        buildingUse: ref("annex16_i"),
        floors,
      });
      const { regulationResult } = useArticle23Logic(userInput);
      expect(regulationResult.value.required).toBe("warning");
      expect(regulationResult.value.basis).toContain(
        "令第23条第1項第2号（令第九条適用）"
      );
      expect(regulationResult.value.message).toContain("複合用途内");
    });

    it("(16)項イで複合用途内の(5)項イ部分が500㎡以上の場合、設置義務あり (required: true)", () => {
      const floors = ref<Floor[]>([
        {
          level: 1,
          type: "ground",
          floorArea: 1000,
          capacity: null,
          isWindowless: false,
          componentUses: [
            { useCode: "annex05_i", floorArea: 600, capacity: 100 },
            { useCode: "annex15", floorArea: 400, capacity: 30 },
          ],
        },
      ]);
      const userInput = createMockUserInput({
        buildingUse: ref("annex16_i"),
        floors,
      });
      const { regulationResult } = useArticle23Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toContain(
        "令第23条第1項第2号（令第九条適用）"
      );
    });

    it("(16)項イで複合用途内の(9)項部分が1000㎡以上の場合、warning", () => {
      const floors = ref<Floor[]>([
        {
          level: 1,
          type: "ground",
          floorArea: 1500,
          capacity: null,
          isWindowless: false,
          componentUses: [
            { useCode: "annex09_i", floorArea: 1200, capacity: 100 },
            { useCode: "annex15", floorArea: 300, capacity: 30 },
          ],
        },
      ]);
      const userInput = createMockUserInput({
        buildingUse: ref("annex16_i"),
        floors,
      });
      const { regulationResult } = useArticle23Logic(userInput);
      expect(regulationResult.value.required).toBe("warning");
      expect(regulationResult.value.basis).toContain(
        "令第23条第1項第3号（令第九条適用）"
      );
    });

    it("(16)項イで複合用途内の特定用途部分が面積条件を満たさない場合、設置義務なし", () => {
      const floors = ref<Floor[]>([
        {
          level: 1,
          type: "ground",
          floorArea: 800,
          capacity: null,
          isWindowless: false,
          componentUses: [
            { useCode: "annex04", floorArea: 400, capacity: 50 },
            { useCode: "annex15", floorArea: 400, capacity: 30 },
          ],
        },
      ]);
      const userInput = createMockUserInput({
        buildingUse: ref("annex16_i"),
        floors,
      });
      const { regulationResult } = useArticle23Logic(userInput);
      expect(regulationResult.value.required).toBe(false);
    });
  });
});
