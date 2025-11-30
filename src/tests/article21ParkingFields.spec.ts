/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useArticle21Logic } from "@/composables/articles/article21Logic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockUserInput = (overrides: any = {}) => {
  const defaults: any = {
    buildingUse: ref(null),
    totalArea: ref(0),
    hasLodging: ref(false),
    floors: ref([]),
    isSpecifiedOneStaircase: ref(false),
    storesDesignatedCombustiblesOver500x: ref(false),
    hasRoadPart: ref(false),
    roadPartRooftopArea: ref(0),
    roadPartOtherArea: ref(0),
    parking: ref({
      exists: false,
      rooftopArea: null,
      basementOrUpperArea: null,
      firstFloorArea: null,
      canAllVehiclesExitSimultaneously: false,
      mechanical: { present: false, capacity: null },
    }),
    hasTelecomRoomOver500sqm: ref(false),
  };
  return { ...defaults, ...overrides };
};

describe("useArticle21Logic - parking split fields", () => {
  it("basementOrUpper >=200 and not exit-all -> required (13号)", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex15"),
      parking: ref({
        exists: true,
        basementOrUpperArea: 200,
        canAllVehiclesExitSimultaneously: false,
        mechanical: { present: false, capacity: null },
      }),
    });
    const { regulationResult } = useArticle21Logic(userInput as any);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe("令第21条第1項第13号");
  });

  it("rooftop >=200 should NOT trigger 21#13", () => {
    const userInput = createMockUserInput({
      buildingUse: ref("annex15"),
      parking: ref({
        exists: true,
        rooftopArea: 200,
        canAllVehiclesExitSimultaneously: false,
        mechanical: { present: false, capacity: null },
      }),
    });
    const { regulationResult } = useArticle21Logic(userInput as any);
    expect(regulationResult.value.required).toBe(false);
  });
});
