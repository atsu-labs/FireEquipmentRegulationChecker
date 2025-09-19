
import { describe, it, expect } from 'vitest';
import { ref, type Ref } from 'vue';
import { Article28_2Logic } from './article28-2Logic';
import type { BuildingData, Floor } from '@/types';

// テストデータ生成のヘルパー関数
const createMockData = (overrides: Partial<BuildingData> = {}): BuildingData => {
  const defaults: BuildingData = {
    buildingUse: ref(null),
    totalFloorAreaInput: ref(0),
    floors: ref([]),
    // 他のプロパティは今回のロジックでは不要なため省略
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

describe('Article28_2Logic', () => {
  it('建物の用途が選択されていない場合、設置義務なしと判定されること', () => {
    const data = createMockData();
    const { judgementResult } = Article28_2Logic(data);
    expect(judgementResult.value.required).toBe(false);
    expect(judgementResult.value.message).toBe('建物の用途を選択してください。');
  });

  it('対象外の用途の場合、設置義務なしと判定されること', () => {
    const data = createMockData({ buildingUse: ref('item16_i') }); // (16)項イは対象外
    const { judgementResult } = Article28_2Logic(data);
    expect(judgementResult.value.required).toBe(false);
    expect(judgementResult.value.basis).toBe('対象外の用途');
  });

  describe('一般の対象用途（地階の床面積で判定）', () => {
    it('地階の床面積合計が700㎡未満の場合、設置義務なしと判定されること', () => {
      const floors = ref<Floor[]>([{ level: 1, type: 'basement', floorArea: 699, capacity: null, isWindowless: false }]);
      const data = createMockData({ buildingUse: ref('item04'), floors }); // (4)項は対象
      const { judgementResult } = Article28_2Logic(data);
      expect(judgementResult.value.required).toBe(false);
    });

    it('地階の床面積合計がちょうど700㎡の場合、設置義務ありと判定されること', () => {
      const floors = ref<Floor[]>([{ level: 1, type: 'basement', floorArea: 700, capacity: null, isWindowless: false }]);
      const data = createMockData({ buildingUse: ref('item04'), floors });
      const { judgementResult } = Article28_2Logic(data);
      expect(judgementResult.value.required).toBe(true);
      expect(judgementResult.value.basis).toBe('令第二十八条の二');
    });

    it('地階の床面積合計が700㎡以上の場合、設置義務ありと判定されること', () => {
      const floors = ref<Floor[]>(
        [{ level: 1, type: 'basement', floorArea: 400, capacity: null, isWindowless: false }, { level: 2, type: 'basement', floorArea: 301, capacity: null, isWindowless: false }]
      );
      const data = createMockData({ buildingUse: ref('item04'), floors });
      const { judgementResult } = Article28_2Logic(data);
      expect(judgementResult.value.required).toBe(true);
      expect(judgementResult.value.basis).toBe('令第二十八条の二');
    });

    it('地階がない場合、設置義務なしと判定されること', () => {
      const floors = ref<Floor[]>([{ level: 1, type: 'ground', floorArea: 800, capacity: null, isWindowless: false }]);
      const data = createMockData({ buildingUse: ref('item04'), floors });
      const { judgementResult } = Article28_2Logic(data);
      expect(judgementResult.value.required).toBe(false);
    });
  });

  describe('（16の2）項（延べ面積で判定）', () => {
    it('延べ面積が700㎡未満の場合、設置義務なしと判定されること', () => {
      const data = createMockData({ buildingUse: ref('item16_2'), totalFloorAreaInput: ref(699) });
      const { judgementResult } = Article28_2Logic(data);
      expect(judgementResult.value.required).toBe(false);
    });

    it('延べ面積がちょうど700㎡の場合、設置義務ありと判定されること', () => {
      const data = createMockData({ buildingUse: ref('item16_2'), totalFloorAreaInput: ref(700) });
      const { judgementResult } = Article28_2Logic(data);
      expect(judgementResult.value.required).toBe(true);
      expect(judgementResult.value.basis).toBe('令第二十八条の二');
    });

    it('延べ面積が700㎡以上の場合、設置義務ありと判定されること', () => {
      const data = createMockData({ buildingUse: ref('item16_2'), totalFloorAreaInput: ref(701) });
      const { judgementResult } = Article28_2Logic(data);
      expect(judgementResult.value.required).toBe(true);
      expect(judgementResult.value.basis).toBe('令第二十八条の二');
    });
  });
});
