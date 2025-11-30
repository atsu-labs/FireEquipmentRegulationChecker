import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useArticle24Logic } from "../composables/articles/article24Logic";
import type { Floor, Article24UserInput } from "@/types";

const createMockInput = (
  overrides: Partial<Article24UserInput> = {}
): Article24UserInput => {
  const defaults: Article24UserInput = {
    buildingUse: ref("annex01_i_ro"),
    totalCapacity: ref(0),
    groundFloors: ref(1),
    basementFloors: ref(0),
    floors: ref<Floor[]>([]),
  };
  return { ...defaults, ...overrides };
};

describe("useArticle24Logic", () => {
  it("用途が選択されていない場合、判定をスキップする", () => {
    const input = createMockInput({ buildingUse: ref(null) });
    const { regulationResult } = useArticle24Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });

  // --- 第1項 ---
  describe("第1項: 非常警報器具", () => {
    it("用途(4)項、収容人員25人で設置義務あり", () => {
      const input = createMockInput({
        buildingUse: ref("annex04"),
        totalCapacity: ref(25),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第1項");
      expect(regulationResult.value.message).toContain("非常警報器具");
      expect(regulationResult.value.message).toContain("免除されます");
    });

    it("用途(4)項、収容人員19人で設置義務なし", () => {
      const input = createMockInput({
        buildingUse: ref("annex04"),
        totalCapacity: ref(19),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(false);
    });

    it("用途(4)項、収容人員50人で設置義務なし（第2項の対象）", () => {
      const input = createMockInput({
        buildingUse: ref("annex04"),
        totalCapacity: ref(50),
      });
      const { regulationResult } = useArticle24Logic(input);
      // This should fall through to paragraph 2
      expect(regulationResult.value.basis).toBe("令第24条第2項第2号");
    });
  });

  // --- 第2項 ---
  describe("第2項: 非常ベル、自動式サイレン又は放送設備", () => {
    it("用途(5)項イ、収容人員25人で設置義務あり", () => {
      const input = createMockInput({
        buildingUse: ref("annex05_i"),
        totalCapacity: ref(25),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第2項第1号");
      expect(regulationResult.value.message).toContain("非常ベル");
      expect(regulationResult.value.message).toContain("免除されます");
    });

    it("用途(1)項、収容人員55人で設置義務あり", () => {
      const input = createMockInput({
        buildingUse: ref("annex01_i_ro"),
        totalCapacity: ref(55),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第2項第2号");
    });

    it("用途(1)項、収容人員40人、地階収容人員25人で設置義務あり", () => {
      const floors: Floor[] = [
        {
          level: 1,
          type: "basement",
          floorArea: 100,
          capacity: 25,
          isWindowless: false,
          componentUses: [],
        },
      ];
      const input = createMockInput({
        buildingUse: ref("annex01_i_ro"),
        totalCapacity: ref(40),
        floors: ref(floors),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第2項第2号");
    });
  });

  // --- 第3項 ---
  describe("第3項: ベル/サイレン + 放送設備", () => {
    it("用途(16の2)項で設置義務あり", () => {
      const input = createMockInput({ buildingUse: ref("annex16_2") });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第3項第1号");
      expect(regulationResult.value.message).not.toContain("免除");
    });

    it("地上11階建てで設置義務あり", () => {
      const input = createMockInput({ groundFloors: ref(11) });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第3項第2号");
    });

    it("地下3階建てで設置義務あり", () => {
      const input = createMockInput({ basementFloors: ref(3) });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第3項第2号");
    });

    it("用途(16)項イ、収容人員500人で設置義務あり", () => {
      const input = createMockInput({
        buildingUse: ref("annex16_i"),
        totalCapacity: ref(500),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第3項第3号");
    });

    it("用途(1)項、収容人員300人で設置義務あり", () => {
      const input = createMockInput({
        buildingUse: ref("annex01_i_ro"),
        totalCapacity: ref(300),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第3項第4号");
    });

    it("用途(8)項、収容人員800人で設置義務あり", () => {
      const input = createMockInput({
        buildingUse: ref("annex08"),
        totalCapacity: ref(800),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第3項第4号");
    });
  });

  it("どの条件にも当てはまらない場合、設置義務なし", () => {
    const input = createMockInput({
      buildingUse: ref("annex18"),
      totalCapacity: ref(10),
    });
    const { regulationResult } = useArticle24Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });

  // --- 令第九条適用のテスト ---
  describe("令第九条適用: 複合用途内の特定用途部分", () => {
    it("(16)項イで複合用途内の(5)項イ部分の収容人員が20人以上の場合、設置義務あり（第2項第1号）", () => {
      const floors: Floor[] = [
        {
          level: 1,
          type: "ground",
          floorArea: 500,
          capacity: 50,
          isWindowless: false,
          componentUses: [
            { useCode: "annex05_i", floorArea: 300, capacity: 25 },
            { useCode: "annex15", floorArea: 200, capacity: 25 },
          ],
        },
      ];
      const input = createMockInput({
        buildingUse: ref("annex16_i"),
        totalCapacity: ref(50),
        floors: ref(floors),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toContain(
        "令第24条第2項第1号（令第九条適用）"
      );
      expect(regulationResult.value.message).toContain("複合用途内");
    });

    it("(16)項イで複合用途内の(1)項部分の収容人員が300人以上の場合、設置義務あり（第3項第4号）", () => {
      const floors: Floor[] = [
        {
          level: 1,
          type: "ground",
          floorArea: 1000,
          capacity: 400,
          isWindowless: false,
          componentUses: [
            { useCode: "annex01_i_ro", floorArea: 600, capacity: 350 },
            { useCode: "annex15", floorArea: 400, capacity: 50 },
          ],
        },
      ];
      const input = createMockInput({
        buildingUse: ref("annex16_i"),
        totalCapacity: ref(400),
        floors: ref(floors),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toContain(
        "令第24条第3項第4号（令第九条適用）"
      );
      expect(regulationResult.value.message).toContain("複合用途内");
    });

    it("(16)項イで複合用途内の(8)項部分の収容人員が800人以上の場合、設置義務あり（第3項第4号）", () => {
      const floors: Floor[] = [
        {
          level: 1,
          type: "ground",
          floorArea: 2000,
          capacity: 900,
          isWindowless: false,
          componentUses: [
            { useCode: "annex08", floorArea: 1500, capacity: 850 },
            { useCode: "annex15", floorArea: 500, capacity: 50 },
          ],
        },
      ];
      const input = createMockInput({
        buildingUse: ref("annex16_i"),
        totalCapacity: ref(900),
        floors: ref(floors),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toContain(
        "令第24条第3項第4号（令第九条適用）"
      );
    });

    it("(16)項イで複合用途内の特定用途部分の収容人員が基準未満の場合、全体で判定", () => {
      const floors: Floor[] = [
        {
          level: 1,
          type: "ground",
          floorArea: 300,
          capacity: 30,
          isWindowless: false,
          componentUses: [
            { useCode: "annex04", floorArea: 150, capacity: 15 },
            { useCode: "annex15", floorArea: 150, capacity: 15 },
          ],
        },
      ];
      const input = createMockInput({
        buildingUse: ref("annex16_i"),
        totalCapacity: ref(30),
        floors: ref(floors),
      });
      const { regulationResult } = useArticle24Logic(input);
      // 全体としても基準を満たさないので設置義務なし
      expect(regulationResult.value.required).toBe(false);
    });

    it("(16)項イでcomponentUsesが空の場合、全体の収容人員が500人以上で設置義務あり（第3項第3号）", () => {
      // componentUsesが空の場合は全体判定のみ
      const floors: Floor[] = [
        {
          level: 1,
          type: "ground",
          floorArea: 2000,
          capacity: 550,
          isWindowless: false,
          componentUses: [],
        },
      ];
      const input = createMockInput({
        buildingUse: ref("annex16_i"),
        totalCapacity: ref(550),
        floors: ref(floors),
      });
      const { regulationResult } = useArticle24Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe("令第24条第3項第3号");
    });
  });
});
