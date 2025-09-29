/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useArticle13Logic } from "@/composables/articles/article13Logic";

describe("useArticle13Logic - parking split fields", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const makeInput = (overrides: any = {}) => {
    return {
      // article13 logic expects a buildingUse; provide a neutral default
      buildingUse: ref("item01"),
      storesDesignatedCombustiblesOver1000x: ref(false),
      parking: ref({
        exists: true,
        rooftopArea: null,
        basementOrUpperArea: null,
        firstFloorArea: null,
        canAllVehiclesExitSimultaneously: false,
        mechanical: { present: false, capacity: null },
        ...overrides,
      }),
      hasCarRepairArea: ref(false),
      hasHelicopterLandingZone: ref(false),
      hasHighFireUsageArea: ref(false),
      hasElectricalEquipmentArea: ref(false),
      hasTelecomRoomOver500sqm: ref(false),
      hasRoadwayPart: ref(false),
    } as any;
  };

  it("rooftop >=300 and not exit-all -> required", () => {
    const input = makeInput({
      rooftopArea: 300,
      canAllVehiclesExitSimultaneously: false,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe(true);
  });

  it("basementOrUpper >=200 and not exit-all -> required", () => {
    const input = makeInput({
      basementOrUpperArea: 200,
      canAllVehiclesExitSimultaneously: false,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe(true);
  });

  it("firstFloor >=500 and not exit-all -> required", () => {
    const input = makeInput({
      firstFloorArea: 500,
      canAllVehiclesExitSimultaneously: false,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe(true);
  });

  it("any area meets but canAllExit true -> warning", () => {
    const input = makeInput({
      basementOrUpperArea: 300,
      canAllVehiclesExitSimultaneously: true,
    });
    const { regulationResult } = useArticle13Logic(input);
    expect(regulationResult.value.required).toBe("warning");
  });
});
