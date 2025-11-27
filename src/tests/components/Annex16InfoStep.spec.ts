import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Annex16InfoStep from "@/components/Annex16InfoStep.vue";
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

describe("Annex16InfoStep.vue", () => {
  const defaultProps = {
    annex16ConfigUse: null,
    annex16FloorArea: null,
  };

  it("正しくマウントされ、タイトルが表示される", () => {
    const wrapper = mount(Annex16InfoStep, {
      global: {
        plugins: [vuetify],
      },
      props: defaultProps,
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("16項（複合用途防火対象物）の情報");
  });

  it("構成用途を入力すると、update:annex16ConfigUse イベントが発行される", async () => {
    const wrapper = mount(Annex16InfoStep, {
      global: {
        plugins: [vuetify],
      },
      props: defaultProps,
    });

    const configUseInput = wrapper.find('input[type="text"]');
    await configUseInput.setValue("事務所、飲食店");

    expect(wrapper.emitted("update:annex16ConfigUse")).toBeTruthy();
    expect(wrapper.emitted("update:annex16ConfigUse")![0]).toEqual([
      "事務所、飲食店",
    ]);
  });

  it("床面積を入力すると、update:annex16FloorArea イベントが発行される", async () => {
    const wrapper = mount(Annex16InfoStep, {
      global: {
        plugins: [vuetify],
      },
      props: defaultProps,
    });

    const floorAreaInput = wrapper.find('input[type="number"]');
    await floorAreaInput.setValue(1500);

    expect(wrapper.emitted("update:annex16FloorArea")).toBeTruthy();
    expect(wrapper.emitted("update:annex16FloorArea")![0]).toEqual([1500]);
  });

  it("空の床面積を入力すると、nullが発行される", async () => {
    const wrapper = mount(Annex16InfoStep, {
      global: {
        plugins: [vuetify],
      },
      props: { annex16ConfigUse: null, annex16FloorArea: 1000 },
    });

    const floorAreaInput = wrapper.find('input[type="number"]');
    await floorAreaInput.setValue("");

    expect(wrapper.emitted("update:annex16FloorArea")).toBeTruthy();
    const emittedValues = wrapper.emitted("update:annex16FloorArea")!;
    expect(emittedValues[emittedValues.length - 1]).toEqual([null]);
  });
});
