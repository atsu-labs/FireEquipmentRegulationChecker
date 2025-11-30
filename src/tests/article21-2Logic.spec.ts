import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useArticle21_2Logic } from "../composables/articles/article21-2Logic";
import type { Floor, Article21_2UserInput } from "@/types";

describe("useArticle21_2Logic", () => {
  const createMockUserInput = (
    overrides: Partial<Article21_2UserInput>
  ): Article21_2UserInput => {
    const defaults: Article21_2UserInput = {
      buildingUse: ref(null),
      totalArea: ref(0),
      floors: ref([]),
      hasHotSpringFacility: ref(false),
      isHotSpringFacilityConfirmed: ref(false),
    };
    return { ...defaults, ...overrides };
  };

  it("1号: (16の2)項で延べ面積1000㎡以上", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex16_2"),
      totalArea: ref(1000),
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条の2第1項第1号");
  });

  it("2号: (16の3)項で延べ面積1000㎡以上、構成用途情報なしの場合にwarningを返す", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex16_3"),
      totalArea: ref(1000),
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第21条の2第1項第2号");
  });

  it("2号: (16の3)項で特定用途部分の面積合計が500㎡以上の場合に設置義務あり", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "ground",
        floorArea: 600,
        capacity: null,
        isWindowless: false,
        componentUses: [
          { useCode: "annex01_i", floorArea: 300, capacity: 50 },
          { useCode: "annex06_i", floorArea: 250, capacity: 30 },
        ],
      },
      {
        level: 2,
        type: "ground",
        floorArea: 400,
        capacity: null,
        isWindowless: false,
        componentUses: [],
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("annex16_3"),
      totalArea: ref(1000),
      floors,
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条の2第1項第2号");
  });

  it("2号: (16の3)項で特定用途部分の面積合計が500㎡未満の場合は設置義務なし", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "ground",
        floorArea: 600,
        capacity: null,
        isWindowless: false,
        componentUses: [
          { useCode: "annex01_i", floorArea: 200, capacity: 50 },
          { useCode: "annex15", floorArea: 400, capacity: 30 }, // 非特定用途
        ],
      },
      {
        level: 2,
        type: "ground",
        floorArea: 400,
        capacity: null,
        isWindowless: false,
        componentUses: [],
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("annex16_3"),
      totalArea: ref(1000),
      floors,
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.basis).toBe("令第21条の2第1項第2号");
  });

  it("3号: 温泉設備があり、法の確認がない場合にwarningを返す", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex05_i"),
      hasHotSpringFacility: ref(true),
      isHotSpringFacilityConfirmed: ref(false),
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第21条の2第1項第3号");
  });

  it("3号: 温泉設備があり、法の確認がある場合は設置不要", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex05_i"),
      hasHotSpringFacility: ref(true),
      isHotSpringFacilityConfirmed: ref(true),
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it("4号: (1)項で地階の面積合計が1000㎡以上", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "basement",
        floorArea: 1000,
        capacity: null,
        isWindowless: false,
        componentUses: [],
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("annex01_i"),
      floors,
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条の2第1項第4号");
  });

  it("4号: (1)項で地階の面積合計が1000㎡未満", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "basement",
        floorArea: 999,
        capacity: null,
        isWindowless: false,
        componentUses: [],
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("annex01_i"),
      floors,
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it("4号: 3号に該当する場合、4号の条件を満たしても3号が優先される", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "basement",
        floorArea: 1000,
        capacity: null,
        isWindowless: false,
        componentUses: [],
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("annex01_i"),
      floors,
      hasHotSpringFacility: ref(true),
      isHotSpringFacilityConfirmed: ref(false),
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe("warning"); // 3号のwarning
    expect(regulationResult.value.basis).toBe("令第21条の2第1項第3号");
  });

  it("5号: (16)項イで地階の面積合計が1000㎡以上、構成用途情報なしの場合にwarningを返す", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "basement",
        floorArea: 1000,
        capacity: null,
        isWindowless: false,
        componentUses: [],
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("annex16_i"),
      floors,
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第21条の2第1項第5号");
  });

  it("5号: (16)項イで地階の特定用途部分の面積合計が500㎡以上の場合に設置義務あり", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "basement",
        floorArea: 1000,
        capacity: null,
        isWindowless: false,
        componentUses: [
          { useCode: "annex01_i", floorArea: 300, capacity: 50 },
          { useCode: "annex06_i", floorArea: 250, capacity: 30 },
        ],
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("annex16_i"),
      floors,
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条の2第1項第5号");
  });

  it("5号: (16)項イで地階の特定用途部分の面積合計が500㎡未満の場合は設置義務なし", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "basement",
        floorArea: 1000,
        capacity: null,
        isWindowless: false,
        componentUses: [
          { useCode: "annex01_i", floorArea: 200, capacity: 50 },
          { useCode: "annex15", floorArea: 800, capacity: 30 }, // 非特定用途
        ],
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("annex16_i"),
      floors,
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.basis).toBe("令第21条の2第1項第5号");
  });

  it("令第九条適用: (16)項で複合用途内の特定用途部分の地階面積が1000㎡以上の場合", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "basement",
        floorArea: 1500,
        capacity: null,
        isWindowless: false,
        componentUses: [
          { useCode: "annex01_i", floorArea: 1200, capacity: 100 },
          { useCode: "annex15", floorArea: 300, capacity: 30 },
        ],
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("annex16_i"),
      floors,
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain(
      "令第21条の2第1項第4号（令第九条適用）"
    );
    expect(regulationResult.value.message).toContain("複合用途内");
  });

  it("どの条件にも該当しない場合", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex18"),
      totalArea: ref(100),
    });
    const { regulationResult } = useArticle21_2Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });
});
