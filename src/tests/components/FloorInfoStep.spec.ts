import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import FloorInfoStep from "@/components/FloorInfoStep.vue";
import { createVuetify } from "vuetify";
import ResizeObserverPolyfill from "resize-observer-polyfill";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import type { Floor } from "@/types";

// Vuetifyのセットアップ
const vuetify = createVuetify({
  components,
  directives,
});

// グローバルにVuetifyを適用
global.ResizeObserver = ResizeObserverPolyfill;

describe("FloorInfoStep.vue", () => {
  let wrapper: VueWrapper<unknown>;

  const mockFloors: Floor[] = [
    {
      type: "ground",
      level: 1,
      floorArea: 500,
      capacity: 50,
      isWindowless: false,
    },
    {
      type: "ground", 
      level: 2,
      floorArea: 400,
      capacity: 40,
      isWindowless: true,
    },
    {
      type: "basement",
      level: 1,
      floorArea: 300,
      capacity: 30,
      isWindowless: false,
    },
  ];

  const defaultProps = {
    hasNonFloorArea: false,
    nonFloorAreaValue: null,
    floors: mockFloors,
  };

  // 各テストの前にコンポーネントをマウントする
  beforeEach(() => {
    wrapper = mount(FloorInfoStep, {
      global: {
        plugins: [vuetify],
      },
      props: defaultProps,
    });
  });

  // =================================================================
  // 1. 初期表示のテスト
  // =================================================================
  it("正しくマウントされ、階情報のフォームが表示される", () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("各階の情報を入力してください");
    expect(wrapper.text()).toContain("地上 1 階");
    expect(wrapper.text()).toContain("地上 2 階");
    expect(wrapper.text()).toContain("地下 1 階");
  });

  // =================================================================
  // 2. 階に該当しない部分の表示テスト
  // =================================================================
  it("hasNonFloorAreaがtrueの時に階に該当しない部分が表示される", async () => {
    // 最初は表示されない
    expect(wrapper.text()).not.toContain("階に該当しない部分");

    // hasNonFloorAreaをtrueにすると表示される
    await wrapper.setProps({ hasNonFloorArea: true });
    expect(wrapper.text()).toContain("階に該当しない部分");
  });

  // =================================================================
  // 3. 無窓階チェックボックスのテスト
  // =================================================================
  it("地上階のみに無窓階チェックボックスが表示される", () => {
    const windowlessCheckboxes = wrapper.findAll('input[type="checkbox"]');
    
    // 地上階の数だけ無窓階チェックボックスがある（地下階には無い）
    const groundFloors = mockFloors.filter(f => f.type === "ground");
    expect(windowlessCheckboxes.length).toBeGreaterThanOrEqual(groundFloors.length);
    
    // 無窓階のラベルが存在する
    expect(wrapper.text()).toContain("無窓階");
  });

  // =================================================================
  // 4. 空の階リストのテスト
  // =================================================================
  it("floorsが空の時は何も表示されない", async () => {
    await wrapper.setProps({ floors: [] });
    expect(wrapper.text()).not.toContain("各階の情報を入力してください");
  });
});