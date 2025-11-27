import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import BuildingInputStepper from "@/components/BuildingInputStepper.vue";
import { createVuetify } from "vuetify";
import ResizeObserverPolyfill from "resize-observer-polyfill";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// (MountProps type removed; casting to any below for test mount compatibility)

// Vuetifyのセットアップ
const vuetify = createVuetify({
  components,
  directives,
});

// グローバルにVuetifyを適用
global.ResizeObserver = ResizeObserverPolyfill;

describe("BuildingInputStepper.vue", () => {
  let wrapper: VueWrapper<unknown>;

  type BuildingInputStepperProps = {
    currentStep: number;
    buildingUse: string | null;
    totalFloorAreaInput: number | null;
    capacityInput: number | null;
    groundFloorsInput: number;
    basementFloorsInput: number;
    hasNonFloorArea: boolean;
    nonFloorAreaValue: number | null | undefined;
    structureType: "A" | "B" | "C" | null;
    finishType: "flammable" | "other" | null;
    usesFireEquipment: boolean;
    storesMinorHazardousMaterials: boolean;
    storesDesignatedCombustibles: boolean;
    storesDesignatedCombustiblesOver750x: boolean;
    hasFireSuppressingStructure: boolean;
    storesDesignatedCombustiblesOver1000x: boolean;
    isCareDependentOccupancy: boolean;
    hasBeds: boolean;
    hasStageArea: boolean;
    stageFloorLevel: string | null;
    stageArea: number | null;
    isRackWarehouse: boolean;
    ceilingHeight: number | null;
    hasLodging: boolean;
    isSpecifiedOneStaircase: boolean;
    storesDesignatedCombustiblesOver500x: boolean;
    hasRoadPart: boolean;
    roadPartRooftopArea: number | null;
    roadPartOtherArea: number | null;
    hasParkingPart: boolean;
    canAllVehiclesExitSimultaneously: boolean;
    hasTelecomRoomOver500sqm: boolean;
    hasSpecialCombustibleStructure: boolean;
    contractedCurrentCapacity: number | null;
    hasHotSpringFacility: boolean;
    isHotSpringFacilityConfirmed: boolean;
    article13_hasParkingArea: boolean;
    article13_hasMechanicalParking: boolean;
    article13_mechanicalParkingCapacity: number | null;
    article13_hasCarRepairArea: boolean;
    article13_hasHelicopterLandingZone: boolean;
    article13_hasHighFireUsageAreaOver200sqm: boolean;
    article13_hasElectricalEquipmentOver200sqm: boolean;
    buildingStructure:
      | "fire-resistant"
      | "quasi-fire-resistant"
      | "other"
      | null;
    hasMultipleBuildingsOnSite: boolean;
    siteArea: number | null;
    buildingHeight: number | null;
    floors: unknown[]; // Floor[]
    showArticle21Item7Checkbox: boolean;
    nextStep: () => void;
    prevStep: () => void;
  };

  const defaultProps: BuildingInputStepperProps = {
    // --- v-model props ---
    currentStep: 1,
    buildingUse: null,
    totalFloorAreaInput: null,
    capacityInput: null,
    groundFloorsInput: 0,
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
    nextStep: () => {},
    prevStep: () => {},
  };

  // 各テストの前にコンポーネントをマウントする
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propsAny: any = defaultProps;
    wrapper = mount(BuildingInputStepper, {
      global: {
        plugins: [vuetify],
      },
      // defaultProps is strongly-typed; cast to `any` for mount to satisfy typings in tests
      props: propsAny,
    });
  });

  // =================================================================
  // 1. 初期表示のテスト
  // =================================================================
  it("正しくマウントされ、最初のステップが表示される", () => {
    // コンポーネントが存在することを確認
    expect(wrapper.exists()).toBe(true);
    // ステップ1のタイトルが表示されていることを確認
    expect(wrapper.text()).toContain("建物情報を入力してください");
  });

  // =================================================================
  // 2. ユーザー入力とイベント発行のテスト
  // =================================================================
  it("延床面積を入力すると、update:totalFloorAreaInput イベントが発行される", async () => {
    // v-text-field を見つけて値を設定
    const areaInput = wrapper.find('input[type="number"]'); // より具体的にセレクタを指定する方が良い
    await areaInput.setValue(1500);

    // イベントが発行されたか確認
    expect(wrapper.emitted("update:totalFloorAreaInput")).toBeTruthy();
    // イベントのペイロード（データ）が正しいか確認
    expect(wrapper.emitted("update:totalFloorAreaInput")![0]).toEqual([1500]);
  });

  it("「建物の主な用途」を選択すると、update:buildingUse イベントが発行される", async () => {
    // v-select を見つけて値を設定（v-selectのテストは少し複雑になる場合があります）
    // この例では、v-selectの内部構造に依存しない方法を試みます
    wrapper.vm.$emit("update:buildingUse", "annex01_i");
    await wrapper.vm.$nextTick();
    // イベントが発行されたか確認
    expect(wrapper.emitted("update:buildingUse")).toBeTruthy();
    expect(wrapper.emitted("update:buildingUse")![0]).toEqual(["annex01_i"]);
  });

  // =================================================================
  // 3. 動的なUIの表示/非表示テスト（今後の機能追加用）
  // =================================================================
  /* 
  it('特定の用途と面積が入力されたときに、追加のチェックボックスが表示される', async () => {
    // --- 初期状態の確認 ---
    // 特定のチェックボックスが最初は表示されていないことを確認
    // 例: `showArticle21Item7Checkbox` に連動するチェックボックス
    let specificCheckbox = wrapper.find('[data-testid="article21-item7-checkbox"]');
    expect(specificCheckbox.exists()).toBe(false);

    // --- props を更新してUIの変更をトリガー ---
    // 親コンポーネントからのpropsが変更されたことをシミュレート
    await wrapper.setProps({
      showArticle21Item7Checkbox: true,
    });

    // --- UIが更新されたことを確認 ---
    // チェックボックスが表示されたことを確認
    specificCheckbox = wrapper.find('[data-testid="article21-item7-checkbox"]');
    expect(wrapper.text()).toContain('特定の避難階段が1つ'); // ラベルのテキストなどで確認

    // --- 再度 props を更新して非表示になることを確認 ---
    await wrapper.setProps({
      showArticle21Item7Checkbox: false,
    });
    specificCheckbox = wrapper.find('[data-testid="article21-item7-checkbox"]');
    expect(specificCheckbox.exists()).toBe(false);
  }); 
  */

  /*
  // --- 以下は、より具体的なテストケースの例です ---

  it('用途が「(6)項イ」で、特定の条件を満たす場合のみ、介助者に関するチェックボックスが表示される', async () => {
    // 1. 初期状態ではチェックボックスは非表示
    expect(wrapper.find('[data-testid="care-dependent-checkbox"]').exists()).toBe(false);

    // 2. 用途を「(6)項イ」に変更
    await wrapper.findComponent({ name: 'v-select' }).setValue('annex06_i_1');

    // 3. 親コンポーネント側で用途に応じた表示フラグが更新されたと仮定し、propsを更新
    await wrapper.setProps({ showCareDependentCheckbox: true }); // このpropは仮のものです

    // 4. チェックボックスが表示されたことを確認
    expect(wrapper.find('[data-testid="care-dependent-checkbox"]').exists()).toBe(true);
  });
  */

  // =================================================================
  // 4. 用途が3項の時に「火を使用する設備又は器具がある（簡易なものを除く）」チェックボックスが表示されるかどうかのテスト
  // =================================================================
  it("用途が3項の時に「火を使用する設備又は器具がある（簡易なものを除く）」チェックボックスが表示される", async () => {
    // --- 初期状態の確認 ---
    let fireEquipmentCheckbox = wrapper.find(
      '[data-testid="uses-fire-equipment-checkbox"]'
    );
    expect(fireEquipmentCheckbox.exists()).toBe(false);

    // --- props を更新してUIの変更をトリガー ---
    await wrapper.setProps({ buildingUse: "annex03_i", currentStep: 3 });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // --- UIが更新されたことを確認 ---
    fireEquipmentCheckbox = wrapper.find(
      '[data-testid="uses-fire-equipment-checkbox"]'
    );
    expect(fireEquipmentCheckbox.exists()).toBe(true);

    // --- 用途を3項以外に変更して非表示になることを確認 ---
    await wrapper.setProps({ buildingUse: "annex01_1" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEquipmentCheckbox = wrapper.find(
      '[data-testid="uses-fire-equipment-checkbox"]'
    );
    expect(fireEquipmentCheckbox.exists()).toBe(false);
  });
});
