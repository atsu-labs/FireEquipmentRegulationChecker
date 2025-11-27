import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import BuildingInputStepper from "@/components/BuildingInputStepper.vue";
import { createVuetify } from "vuetify";
import { mdi } from "vuetify/iconsets/mdi-svg";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { nextTick } from "vue";

// 最小限の props を用意してコンポーネントをマウントし、
// ラジオ選択による update:events を検証する

describe("BuildingInputStepper - 指定可燃物ラジオのマッピング", () => {
  const baseProps = () => ({
    currentStep: 4, // ステップ4に変更（追加情報はステップ4に移動）
    buildingUse: null,
    totalFloorAreaInput: null,
    capacityInput: null,
    groundFloorsInput: 1,
    basementFloorsInput: 0,
    hasNonFloorArea: false,
    nonFloorAreaValue: null,
    structureType: null,
    finishType: null,
    usesFireEquipment: false,
    storesMinorHazardousMaterials: false,
    storesDesignatedCombustibles: false,
    storesDesignatedCombustiblesOver750x: false,
    hasFireSuppressingStructure: false,
    storesDesignatedCombustiblesOver1000x: false,
    isCareDependentOccupancy: false,
    hasBeds: false,
    hasStageArea: false,
    stageFloorLevel: null,
    stageArea: null,
    isRackWarehouse: false,
    ceilingHeight: null,
    hasLodging: false,
    isSpecifiedOneStaircase: false,
    storesDesignatedCombustiblesOver500x: false,
    hasRoadPart: false,
    roadPartRooftopArea: null,
    roadPartOtherArea: null,
    hasParkingPart: false,
    canAllVehiclesExitSimultaneously: false,
    hasTelecomRoomOver500sqm: false,
    hasSpecialCombustibleStructure: false,
    contractedCurrentCapacity: null,
    hasHotSpringFacility: false,
    isHotSpringFacilityConfirmed: false,
    article13_hasParkingArea: false,
    article13_hasMechanicalParking: false,
    article13_mechanicalParkingCapacity: null,
    article13_hasCarRepairArea: false,
    article13_hasHelicopterLandingZone: false,
    article13_hasHighFireUsageAreaOver200sqm: false,
    article13_hasElectricalEquipmentOver200sqm: false,
    buildingStructure: null,
    hasMultipleBuildingsOnSite: false,
    siteArea: null,
    buildingHeight: null,
    floors: [],
    showArticle21Item7Checkbox: false,
    isAnnex16: false,
    componentUses: [{ useCode: "", floorArea: null, capacity: null }],
    nonFloorAreaComponentUses: [],
    prevStep: () => {},
    nextStep: () => {},
  });

  it("over1000 を選択すると over750 と over500 も true になる", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: any = baseProps();
    const vuetify = createVuetify({
      components,
      directives,
      icons: { defaultSet: "mdi", sets: { mdi } },
    });
    const wrapper = mount(BuildingInputStepper, {
      props,
      global: { plugins: [vuetify] },
    });

    // 指定可燃物のラジオが確実に表示されるよう props を設定
    await wrapper.setProps({ storesDesignatedCombustibles: true });
    await nextTick();

    // 最初の VRadioGroup に対して選択をシミュレート
    const radioGroup = wrapper.findComponent({ name: "VRadioGroup" });
    expect(radioGroup.exists()).toBe(true);
    await radioGroup.vm.$emit("update:modelValue", "over1000");
    await nextTick();

    // emit 結果を確認
    const emitted = wrapper.emitted();
    // update:storesDesignatedCombustiblesOver1000x が呼ばれて true になっていること
    const e1000 = emitted["update:storesDesignatedCombustiblesOver1000x"] || [];
    expect(e1000.length).toBeGreaterThan(0);
    expect(e1000[e1000.length - 1]).toEqual([true]);

    const e750 = emitted["update:storesDesignatedCombustiblesOver750x"] || [];
    expect(e750.length).toBeGreaterThan(0);
    expect(e750[e750.length - 1]).toEqual([true]);

    const e500 = emitted["update:storesDesignatedCombustiblesOver500x"] || [];
    expect(e500.length).toBeGreaterThan(0);
    expect(e500[e500.length - 1]).toEqual([true]);
  });

  it("over750 を選択すると over500 も true になるが 1000 は false になる", async () => {
    const props = baseProps();
    const vuetify = createVuetify({
      components,
      directives,
      icons: { defaultSet: "mdi", sets: { mdi } },
    });
    const wrapper = mount(BuildingInputStepper, {
      props,
      global: { plugins: [vuetify] },
    });
    await wrapper.setProps({ storesDesignatedCombustibles: true });
    await nextTick();

    const radioGroup = wrapper.findComponent({ name: "VRadioGroup" });
    expect(radioGroup.exists()).toBe(true);
    await radioGroup.vm.$emit("update:modelValue", "over750");
    await nextTick();

    const emitted = wrapper.emitted();
    const e750 = emitted["update:storesDesignatedCombustiblesOver750x"] || [];
    expect(e750.length).toBeGreaterThan(0);
    expect(e750[e750.length - 1]).toEqual([true]);

    const e500 = emitted["update:storesDesignatedCombustiblesOver500x"] || [];
    expect(e500.length).toBeGreaterThan(0);
    expect(e500[e500.length - 1]).toEqual([true]);

    const e1000 = emitted["update:storesDesignatedCombustiblesOver1000x"] || [];
    expect(e1000.length).toBeGreaterThan(0);
    expect(e1000[e1000.length - 1]).toEqual([false]);
  });

  it("present_none を選ぶとすべて false になる", async () => {
    const props = baseProps();
    const vuetify = createVuetify({
      components,
      directives,
      icons: { defaultSet: "mdi", sets: { mdi } },
    });
    const wrapper = mount(BuildingInputStepper, {
      props,
      global: { plugins: [vuetify] },
    });
    await wrapper.setProps({ storesDesignatedCombustibles: true });
    await nextTick();

    const radioGroup = wrapper.findComponent({ name: "VRadioGroup" });
    expect(radioGroup.exists()).toBe(true);
    await radioGroup.vm.$emit("update:modelValue", "present_none");
    await nextTick();

    const emitted = wrapper.emitted();
    const e750 = emitted["update:storesDesignatedCombustiblesOver750x"] || [];
    expect(e750.length).toBeGreaterThan(0);
    expect(e750[e750.length - 1]).toEqual([false]);

    const e1000 = emitted["update:storesDesignatedCombustiblesOver1000x"] || [];
    expect(e1000.length).toBeGreaterThan(0);
    expect(e1000[e1000.length - 1]).toEqual([false]);

    const e500 = emitted["update:storesDesignatedCombustiblesOver500x"] || [];
    expect(e500.length).toBeGreaterThan(0);
    expect(e500[e500.length - 1]).toEqual([false]);
  });
});
