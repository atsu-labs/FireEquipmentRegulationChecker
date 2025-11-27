import { describe, it, expect } from 'vitest';
import { ref, type Ref } from 'vue';
import { useArticle29_2Logic } from '../composables/articles/article29-2Logic';
import type { Article29_2UserInput, Floor } from '@/types';

// テストデータ生成のヘルパー関数
const createMockUserInput = (overrides: Partial<Article29_2UserInput> = {}): Article29_2UserInput => {
  const defaults: Article29_2UserInput = {
    buildingUse: ref(null),
    totalFloorAreaInput: ref(0),
    floors: ref([]),

  };

  const merged: Article29_2UserInput = { ...defaults };
  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const k = key as keyof Article29_2UserInput;
      if (merged[k] && 'value' in merged[k]) {
        (merged[k] as Ref<unknown>).value = (overrides[k] as Ref<unknown>).value;
      }
    }
  }
  return merged;
};

describe('useArticle29_2Logic', () => {
  it('建物の用途が選択されていない場合、設置義務なしと判定されること', () => {
    const userInput = createMockUserInput();
    const { regulationResult } = useArticle29_2Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe('建物の用途を選択してください。');
  });

  // --- 第一号: 別表第一に掲げる建築物で、地階を除く階数が11以上のもの ---
  describe('令第二十九条の二第一号', () => {
    it('地階を除く階数が11階の場合、設置義務ありと判定されること', () => {
      const floors = ref<Floor[]>([
        { level: 1, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 2, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 3, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 4, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 5, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 6, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 7, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 8, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 9, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 10, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 11, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
      ]);
      const userInput = createMockUserInput({ buildingUse: ref('annex01_i'), floors });
      const { regulationResult } = useArticle29_2Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第二十九条の二第一号');
    });

    it('地階を除く階数が10階の場合、第一号では設置義務なしと判定されること', () => {
      const floors = ref<Floor[]>([
        { level: 1, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 2, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 3, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 4, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 5, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 6, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 7, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 8, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 9, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 10, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
      ]);
      const userInput = createMockUserInput({ buildingUse: ref('annex01_i'), floors });
      const { regulationResult } = useArticle29_2Logic(userInput);
      expect(regulationResult.value.required).toBe(false);
    });
  });

  // --- 第二号: 別表第一（十六の二）項に掲げる防火対象物で、延べ面積が1,000平方メートル以上のもの ---
  describe('令第二十九条の二第二号', () => {
    it('用途が(16の2)項で延べ面積が1000㎡の場合、設置義務ありと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex16_2'), totalFloorAreaInput: ref(1000) });
      const { regulationResult } = useArticle29_2Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第二十九条の二第二号');
    });

    it('用途が(16の2)項で延べ面積が999㎡の場合、第二号では設置義務なしと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex16_2'), totalFloorAreaInput: ref(999) });
      const { regulationResult } = useArticle29_2Logic(userInput);
      expect(regulationResult.value.required).toBe(false);
    });
  });

  // --- 設置義務なし ---
  it('どの条件にも該当しない場合、設置義務なしと判定されること', () => {
    const floors = ref<Floor[]>([
      { level: 1, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
      { level: 2, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
      { level: 3, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
      { level: 4, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
    ]);
    const userInput = createMockUserInput({
      buildingUse: ref('annex01_i'),
      totalFloorAreaInput: ref(100),
      floors: floors,
    });
    const { regulationResult } = useArticle29_2Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe('非常コンセント設備の設置義務はありません。');
  });
});