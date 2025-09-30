import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import BuildingInfoStep from "@/components/BuildingInfoStep.vue";
import { createVuetify } from "vuetify";
import ResizeObserverPolyfill from "resize-observer-polyfill";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// Vuetifyのセットアップ
const vuetify = createVuetify({
  components,
  directives,
});

// グローバルにVuetifyを適用
global.ResizeObserver = ResizeObserverPolyfill;

describe("BuildingInfoStep.vue", () => {
  let wrapper: VueWrapper<unknown>;

  type BuildingInfoStepProps = {
    buildingUse: string | null;
    totalFloorAreaInput: number | null;
    capacityInput: number | null;
    groundFloorsInput: number;
    basementFloorsInput: number;
    hasNonFloorArea: boolean;
    structureType: "A" | "B" | "C" | null;
    finishType: "flammable" | "other" | null;
    siteArea: number | null;
    buildingHeight: number | null;
    buildingStructure: "fire-resistant" | "quasi-fire-resistant" | "other" | null;
    hasMultipleBuildingsOnSite: boolean;
    isCareDependentOccupancy: boolean;
    hasBeds: boolean;
    hasLodging: boolean;
    hasStageArea: boolean;
    stageFloorLevel: string | null;
    stageArea: number | null;
    isRackWarehouse: boolean;
    ceilingHeight: number | null;
    hasSpecialCombustibleStructure: boolean;
    contractedCurrentCapacity: number | null;
  };

  const defaultProps: BuildingInfoStepProps = {
    buildingUse: null,
    totalFloorAreaInput: null,
    capacityInput: null,
    groundFloorsInput: 1,
    basementFloorsInput: 0,
    hasNonFloorArea: false,
    structureType: null,
    finishType: null,
    siteArea: null,
    buildingHeight: null,
    buildingStructure: null,
    hasMultipleBuildingsOnSite: false,
    isCareDependentOccupancy: false,
    hasBeds: false,
    hasLodging: false,
    hasStageArea: false,
    stageFloorLevel: null,
    stageArea: null,
    isRackWarehouse: false,
    ceilingHeight: null,
    hasSpecialCombustibleStructure: false,
    contractedCurrentCapacity: null,
  };

  // 各テストの前にコンポーネントをマウントする
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propsAny: any = defaultProps;
    wrapper = mount(BuildingInfoStep, {
      global: {
        plugins: [vuetify],
      },
      props: propsAny,
    });
  });

  // =================================================================
  // 1. 初期表示のテスト
  // =================================================================
  it("正しくマウントされ、建物情報の入力フォームが表示される", () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("建物情報を入力してください");
    expect(wrapper.text()).toContain("延床面積");
    expect(wrapper.text()).toContain("全体の収容人員");
    expect(wrapper.text()).toContain("地上階");
    expect(wrapper.text()).toContain("地下階");
  });

  // =================================================================
  // 2. 動的表示のテスト
  // =================================================================
  it("（6）項関連の情報が正しく表示される", async () => {
    await wrapper.setProps({ buildingUse: "item06_ro_2" });
    expect(wrapper.text()).toContain("（6）項関連の追加情報");
    expect(wrapper.text()).toContain("介助がなければ避難できない者を主として入所させる施設");
    expect(wrapper.text()).toContain("診療所にベッドがある");
  });

  it("（1）項関連の情報が正しく表示される", async () => {
    await wrapper.setProps({ buildingUse: "item01_i" });
    expect(wrapper.text()).toContain("（1）項関連の追加情報");
    expect(wrapper.text()).toContain("舞台部がある");
  });

  it("（14）項関連の情報が正しく表示される", async () => {
    await wrapper.setProps({ buildingUse: "item14_ko" });
    expect(wrapper.text()).toContain("（14）項関連の追加情報");
    expect(wrapper.text()).toContain("ラック式倉庫である");
  });

  // =================================================================
  // 3. イベント発火のテスト
  // =================================================================
  it("建物用途の変更がemitされる", async () => {
    // BuildingUseSelectorが変更された時のイベントをシミュレート
    const buildingUseSelector = wrapper.findComponent({ name: "BuildingUseSelector" });
    await buildingUseSelector.vm.$emit("update:modelValue", "item01_i");
    
    // イベントが発行されたか確認
    expect(wrapper.emitted("update:buildingUse")).toBeTruthy();
    expect(wrapper.emitted("update:buildingUse")![0]).toEqual(["item01_i"]);
  });
});