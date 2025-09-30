import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import AdditionalInfoStep from "@/components/AdditionalInfoStep.vue";
import { createVuetify } from "vuetify";
import ResizeObserverPolyfill from "resize-observer-polyfill";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { nextTick } from "vue";

// Vuetifyのセットアップ
const vuetify = createVuetify({
  components,
  directives,
});

// グローバルにVuetifyを適用
global.ResizeObserver = ResizeObserverPolyfill;

describe("AdditionalInfoStep.vue", () => {
  let wrapper: VueWrapper<unknown>;

  const defaultProps = () => ({
    buildingUse: null,
    usesFireEquipment: false,
    storesMinorHazardousMaterials: false,
    storesDesignatedCombustibles: false,
    storesDesignatedCombustiblesOver500x: false,
    storesDesignatedCombustiblesOver750x: false,
    storesDesignatedCombustiblesOver1000x: false,
    hasFireSuppressingStructure: false,
    isSpecifiedOneStaircase: false,
    showArticle21Item7Checkbox: false,
    hasRoadPart: false,
    roadPartRooftopArea: null,
    roadPartOtherArea: null,
    parking: {
      exists: false,
      canAllVehiclesExitSimultaneously: false,
      rooftopArea: null,
      basementOrUpperArea: null,
      firstFloorArea: null,
      mechanical: { present: false, capacity: null },
    },
    hasTelecomRoomOver500sqm: false,
    hasHotSpringFacility: false,
    isHotSpringFacilityConfirmed: false,
    article13_hasCarRepairArea: false,
    article13_hasHelicopterLandingZone: false,
    article13_hasHighFireUsageArea: false,
    article13_hasElectricalEquipmentArea: false,
    article13_hasRoadwayPart: false,
  });

  // 各テストの前にコンポーネントをマウントする
  beforeEach(() => {
    wrapper = mount(AdditionalInfoStep, {
      global: {
        plugins: [vuetify],
      },
      props: defaultProps(),
    });
  });

  // =================================================================
  // 1. 初期表示のテスト
  // =================================================================
  it("正しくマウントされ、追加情報のフォームが表示される", () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("追加情報");
    expect(wrapper.text()).toContain("令第10条（消火器）関連");
    expect(wrapper.text()).toContain("令第11条（屋内消火栓設備）関連");
    expect(wrapper.text()).toContain("令第12条（スプリンクラー設備）関連");
  });

  // =================================================================
  // 2. 指定可燃物の階層ロジックのテスト
  // =================================================================
  it("指定可燃物の750倍を選択すると500倍も自動でtrueになり、1000倍はfalseになる", async () => {
    // 指定可燃物チェックボックスを有効にする
    await wrapper.setProps({ storesDesignatedCombustibles: true });
    await nextTick();

    // ラジオボタンで750倍を選択
    const radioGroup = wrapper.findComponent({ name: "VRadioGroup" });
    expect(radioGroup.exists()).toBe(true);
    await radioGroup.vm.$emit("update:modelValue", "over750");
    await nextTick();

    const emitted = wrapper.emitted();
    
    // 750倍がtrueになる
    const e750 = emitted["update:storesDesignatedCombustiblesOver750x"] || [];
    expect(e750.length).toBeGreaterThan(0);
    expect(e750[e750.length - 1]).toEqual([true]);

    // 500倍も自動でtrueになる
    const e500 = emitted["update:storesDesignatedCombustiblesOver500x"] || [];
    expect(e500.length).toBeGreaterThan(0);
    expect(e500[e500.length - 1]).toEqual([true]);

    // 1000倍はfalseになる
    const e1000 = emitted["update:storesDesignatedCombustiblesOver1000x"] || [];
    expect(e1000.length).toBeGreaterThan(0);
    expect(e1000[e1000.length - 1]).toEqual([false]);
  });

  // =================================================================
  // 3. 動的表示のテスト
  // =================================================================
  it("3項の建物用途で火を使用する設備のチェックボックスが表示される", async () => {
    // 最初は表示されない
    let fireEquipmentCheckbox = wrapper.find('[data-testid="uses-fire-equipment-checkbox"]');
    expect(fireEquipmentCheckbox.exists()).toBe(false);

    // 3項の用途に変更すると表示される
    await wrapper.setProps({ buildingUse: "item03_i" });
    await nextTick();
    
    fireEquipmentCheckbox = wrapper.find('[data-testid="uses-fire-equipment-checkbox"]');
    expect(fireEquipmentCheckbox.exists()).toBe(true);
  });

  it("showArticle21Item7Checkboxがtrueの時に特定一階段等のチェックボックスが表示される", async () => {
    // 最初は表示されない
    let specificCheckbox = wrapper.find('[data-testid="article21-item7-checkbox"]');
    expect(specificCheckbox.exists()).toBe(false);

    // showArticle21Item7Checkboxをtrueにすると表示される
    await wrapper.setProps({ showArticle21Item7Checkbox: true });
    await nextTick();
    
    specificCheckbox = wrapper.find('[data-testid="article21-item7-checkbox"]');
    expect(specificCheckbox.exists()).toBe(true);
    expect(wrapper.text()).toContain("特定一階段等防火対象物に該当する");
  });
});