
import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useArticle26Logic, type Article26UserInput } from './article26Logic';
import type { Floor } from '@/types';

const createMockInput = (overrides: Partial<Article26UserInput> = {}): Article26UserInput => {
  const defaults: Article26UserInput = {
    buildingUse: ref('item18'), // Default to a non-applicable use
    basementFloors: ref(0),
    groundFloors: ref(1),
    floors: ref<Floor[]>([]),
  };
  return { ...defaults, ...overrides };
};

describe('useArticle26Logic', () => {
  it('用途が選択されていない場合、すべての判定をスキップする', () => {
    const input = createMockInput({ buildingUse: ref(null) });
    const { regulationResult } = useArticle26Logic(input);
    const result = regulationResult.value;
    expect(result.exitGuideLight.required).toBe(false);
    expect(result.corridorGuideLight.required).toBe(false);
    expect(result.auditoriumGuideLight.required).toBe(false);
    expect(result.guideSign.required).toBe(false);
    expect(result.exitGuideLight.message).toContain('選択してください');
  });

  describe('避難口誘導灯 & 通路誘導灯', () => {
    it('全部適用用途（例: (1)項）の場合、設置義務あり', () => {
      const input = createMockInput({ buildingUse: ref('item01_i_ro') });
      const { regulationResult } = useArticle26Logic(input);
      expect(regulationResult.value.exitGuideLight.required).toBe(true);
      expect(regulationResult.value.corridorGuideLight.required).toBe(true);
      expect(regulationResult.value.exitGuideLight.basis).toContain('第1号, 第2号');
    });

    it('部分適用用途（例: (7)項）で対象階がない場合、設置義務なし', () => {
      const input = createMockInput({ buildingUse: ref('item07') });
      const { regulationResult } = useArticle26Logic(input);
      expect(regulationResult.value.exitGuideLight.required).toBe(false);
    });

    it('部分適用用途（例: (7)項）で地階がある場合、設置義務あり', () => {
      const input = createMockInput({ buildingUse: ref('item07'), basementFloors: ref(1) });
      const { regulationResult } = useArticle26Logic(input);
      expect(regulationResult.value.exitGuideLight.required).toBe(true);
    });

    it('部分適用用途（例: (7)項）で無窓階がある場合、設置義務あり', () => {
      const floors: Floor[] = [{ level: 2, type: 'ground', floorArea: 100, capacity: 10, isWindowless: true }];
      const input = createMockInput({ buildingUse: ref('item07'), floors: ref(floors) });
      const { regulationResult } = useArticle26Logic(input);
      expect(regulationResult.value.exitGuideLight.required).toBe(true);
    });

    it('部分適用用途（例: (7)項）で11階以上の場合、設置義務あり', () => {
      const input = createMockInput({ buildingUse: ref('item07'), groundFloors: ref(11) });
      const { regulationResult } = useArticle26Logic(input);
      expect(regulationResult.value.exitGuideLight.required).toBe(true);
    });
  });

  describe('客席誘導灯', () => {
    it('用途が(1)項の場合、設置義務あり', () => {
      const input = createMockInput({ buildingUse: ref('item01_i_ro') });
      const { regulationResult } = useArticle26Logic(input);
      expect(regulationResult.value.auditoriumGuideLight.required).toBe(true);
    });

    it('用途が(16)項イの場合、警告を返す', () => {
      const input = createMockInput({ buildingUse: ref('item16_i') });
      const { regulationResult } = useArticle26Logic(input);
      expect(regulationResult.value.auditoriumGuideLight.required).toBe('warning');
      expect(regulationResult.value.auditoriumGuideLight.message).toContain('要確認');
    });

    it('その他の用途の場合、設置義務なし', () => {
      const input = createMockInput({ buildingUse: ref('item02_i') });
      const { regulationResult } = useArticle26Logic(input);
      expect(regulationResult.value.auditoriumGuideLight.required).toBe(false);
    });
  });

  describe('誘導標識', () => {
    it('適用用途（例: (15)項）の場合、設置義務あり', () => {
      const input = createMockInput({ buildingUse: ref('item15') });
      const { regulationResult } = useArticle26Logic(input);
      expect(regulationResult.value.guideSign.required).toBe(true);
    });

    it('適用外用途（例: (17)項）の場合、設置義務なし', () => {
      const input = createMockInput({ buildingUse: ref('item17') });
      const { regulationResult } = useArticle26Logic(input);
      expect(regulationResult.value.guideSign.required).toBe(false);
    });
  });
});
