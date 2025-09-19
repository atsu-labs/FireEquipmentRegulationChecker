import { describe, it, expect } from 'vitest';
import { ref, type Ref } from 'vue';
import { Article29_3Logic } from './article29-3Logic';
import type { BuildingData } from '@/types';

// テストデータ生成のヘルパー関数
const createMockData = (overrides: Partial<BuildingData> = {}): BuildingData => {
  const defaults: BuildingData = {
    buildingUse: ref(null),
    totalFloorAreaInput: ref(0),
    floors: ref([]),
    usesFireEquipment: ref(false),
    storesMinorHazardousMaterials: ref(false),
    storesDesignatedCombustibles: ref(false),
    hasRoadPart: ref(false),
  };

  const merged: BuildingData = { ...defaults };
  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const k = key as keyof BuildingData;
      if (merged[k] && 'value' in merged[k]) {
        (merged[k] as Ref<unknown>).value = (overrides[k] as Ref<unknown>).value;
      }
    }
  }
  return merged;
};

describe('Article29_3Logic', () => {
  it('建物の用途が選択されていない場合、設置義務なしと判定されること', () => {
    const data = createMockData();
    const { judgementResult } = Article29_3Logic(data);
    expect(judgementResult.value.required).toBe(false);
    expect(judgementResult.value.message).toBe('建物の用途を選択してください。');
  });

  // --- 別表第一（十六の二）項に掲げる防火対象物で、延べ面積が1,000平方メートル以上のもの ---
  describe('令第二十九条の三', () => {
    it('用途が(16の2)項で延べ面積が1000㎡の場合、設置義務ありと判定されること', () => {
      const data = createMockData({ buildingUse: ref('item16_2'), totalFloorAreaInput: ref(1000) });
      const { judgementResult } = Article29_3Logic(data);
      expect(judgementResult.value.required).toBe(true);
      expect(judgementResult.value.basis).toBe('令第二十九条の三');
    });

    it('用途が(16の2)項で延べ面積が999㎡の場合、設置義務なしと判定されること', () => {
      const data = createMockData({ buildingUse: ref('item16_2'), totalFloorAreaInput: ref(999) });
      const { judgementResult } = Article29_3Logic(data);
      expect(judgementResult.value.required).toBe(false);
    });
  });

  // --- 設置義務なし ---
  it('どの条件にも該当しない場合、設置義務なしと判定されること', () => {
    const data = createMockData({
      buildingUse: ref('item01_i'),
      totalFloorAreaInput: ref(100),
      floors: ref([]),
      hasRoadPart: ref(false),
    });
    const { judgementResult } = Article29_3Logic(data);
    expect(judgementResult.value.required).toBe(false);
    expect(judgementResult.value.message).toBe('無線通信補助設備の設置義務はありません。');
  });
});