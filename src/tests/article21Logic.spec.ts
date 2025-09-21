import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useArticle21Logic } from "../composables/articles/article21Logic";
import type { Floor, Article21UserInput } from "../types";

describe("useArticle21Logic", () => {
  const createMockUserInput = (
    overrides: Partial<Article21UserInput>
  ): Article21UserInput => {
    const defaults: Article21UserInput = {
      buildingUse: ref(null),
      totalArea: ref(0),
      hasLodging: ref(false),
      floors: ref([]),
      isSpecifiedOneStaircase: ref(false),
      storesDesignatedCombustiblesOver500x: ref(false),
      hasRoadPart: ref(false),
      roadPartRooftopArea: ref(0),
      roadPartOtherArea: ref(0),
      hasParkingPart: ref(false),
      parkingPartArea: ref(0),
      canAllVehiclesExitSimultaneously: ref(false),
      hasTelecomRoomOver500sqm: ref(false),
    };
    return { ...defaults, ...overrides };
  };

  it("1号イ: (五)項イの建物で設置が必要になる", () => {
    const userInput = createMockUserInput({ buildingUse: ref("item05_i") });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第1号イ");
  });

  it("1号ロ: (六)項ハの宿泊施設で設置が必要になる", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item06_ha_1"),
      hasLodging: ref(true),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第1号ロ");
  });

  it("2号: (九)項イで延べ面積200㎡以上の場合", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item09_i"),
      totalArea: ref(200),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第2号");
  });

  it("3号イ: (四)項で延べ面積300㎡以上の場合", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item04"),
      totalArea: ref(300),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第3号イ");
  });

  it("3号ロ: (六)項ハの宿泊施設なしで延べ面積300㎡以上の場合", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item06_ha_2"),
      hasLodging: ref(false),
      totalArea: ref(300),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第3号ロ");
  });

  it("4号: (七)項で延べ面積500㎡以上の場合", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item07"),
      totalArea: ref(500),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第4号");
  });

  it("5号: (16の3)項で延べ面積500㎡以上の場合にwarningを返す", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item16_3"),
      totalArea: ref(500),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe("warning");
    expect(regulationResult.value.basis).toBe("令第21条第1項第5号");
  });

  it("6号: (十一)項で延べ面積1000㎡以上の場合", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item11"),
      totalArea: ref(1000),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第6号");
  });

  it("7号: 対象用途で特定一階段の場合", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item02_i"),
      isSpecifiedOneStaircase: ref(true),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第7号");
  });

  it("7号: 対象用途だが、特定一階段でない場合", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item02_i"),
      isSpecifiedOneStaircase: ref(false),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it("7号: 対象用途でない場合", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item07"),
      isSpecifiedOneStaircase: ref(true),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it("8号: 指定可燃物を基準数量の500倍以上貯蔵・取り扱いしている場合", () => {
    const userInput = createMockUserInput({
      storesDesignatedCombustiblesOver500x: ref(true),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第8号");
  });

  it("8号: 指定可燃物を基準数量の500倍以上貯蔵・取り扱いしていない場合", () => {
    const userInput = createMockUserInput({
      storesDesignatedCombustiblesOver500x: ref(false),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it("9号: (16の2)号は、判定できないのでwarningを返す", () => {
    const userInput = createMockUserInput({ buildingUse: ref("item16_2") });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe("warning");
  });

  it("10号: (2)項イで地階の面積が100㎡以上", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "basement",
        floorArea: 100,
        capacity: null,
        isWindowless: false,
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("item02_i"),
      floors,
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第10号");
  });

  it("10号: (3)項イで無窓階の面積が100㎡以上", () => {
    const floors = ref<Floor[]>([
      {
        level: 2,
        type: "ground",
        floorArea: 100,
        capacity: null,
        isWindowless: true,
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("item03_i"),
      floors,
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第10号");
  });

  it("10号: (16)項イで無窓階の面積が100㎡以上は、判定できないのでwarningを返す", () => {
    const floors = ref<Floor[]>([
      {
        level: 2,
        type: "ground",
        floorArea: 100,
        capacity: null,
        isWindowless: true,
      },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref("item16_i"),
      floors,
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe("warning");
  });

  it("11号: 地階で床面積300㎡以上の場合", () => {
    const floors = ref<Floor[]>([
      {
        level: 1,
        type: "basement",
        floorArea: 300,
        capacity: null,
        isWindowless: false,
      },
    ]);
    const userInput = createMockUserInput({ floors });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第11号");
  });

  it("11号: 無窓階で床面積300㎡以上の場合", () => {
    const floors = ref<Floor[]>([
      {
        level: 2,
        type: "ground",
        floorArea: 300,
        capacity: null,
        isWindowless: true,
      },
    ]);
    const userInput = createMockUserInput({ floors });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第11号");
  });

  it("11号: 3階で床面積300㎡以上の場合", () => {
    const floors = ref<Floor[]>([
      {
        level: 3,
        type: "ground",
        floorArea: 300,
        capacity: null,
        isWindowless: false,
      },
    ]);
    const userInput = createMockUserInput({ floors });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第11号");
  });

  it("14号: 11階建ての場合", () => {
    const floors = ref<Floor[]>([
      {
        level: 11,
        type: "ground",
        floorArea: 100,
        capacity: null,
        isWindowless: false,
      },
    ]);
    const userInput = createMockUserInput({ floors });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第14号");
  });

  it("12号: 道路の用に供される部分（屋上）が600㎡以上の場合", () => {
    const userInput = createMockUserInput({
      hasRoadPart: ref(true),
      roadPartRooftopArea: ref(600),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第12号");
  });

  it("12号: 道路の用に供される部分（屋上以外）が400㎡以上の場合", () => {
    const userInput = createMockUserInput({
      hasRoadPart: ref(true),
      roadPartOtherArea: ref(400),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第12号");
  });

  it("13号: 駐車の用に供する部分が200㎡以上で、同時に屋外に出られない場合", () => {
    const userInput = createMockUserInput({
      hasParkingPart: ref(true),
      parkingPartArea: ref(200),
      canAllVehiclesExitSimultaneously: ref(false),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第13号");
  });

  it("15号: 通信機器室が500㎡以上の場合", () => {
    const userInput = createMockUserInput({
      hasTelecomRoomOver500sqm: ref(true),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第15号");
  });

  it("どの条件にも該当しない場合", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("item18"),
      totalArea: ref(100),
    });
    const { regulationResult } = useArticle21Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });
});
