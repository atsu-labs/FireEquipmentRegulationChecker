
import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useArticle28Logic } from '../composables/articles/article28Logic';
import type { Floor, Article28UserInput } from '@/types';

const createMockInput = (overrides: Partial<Article28UserInput> = {}): Article28UserInput => {
  const defaults: Article28UserInput = {
    buildingUse: ref('item18'), // Default to a non-applicable use
    totalArea: ref(0),
    hasStageArea: ref(false),
    stageArea: ref(0),
    floors: ref<Floor[]>([]),
  };
  return { ...defaults, ...overrides };
};

describe('useArticle28Logic', () => {
  it('用途が選択されていない場合、判定をスキップする', () => {
    const input = createMockInput({ buildingUse: ref(null) });
    const { regulationResult } = useArticle28Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });

  // --- 第1号のテスト ---
  describe('第1号: (16の2)項で延べ面積1000㎡以上', () => {
    it('用途(16の2)項、延べ面積1000㎡で設置義務あり', () => {
      const input = createMockInput({ buildingUse: ref('item16_2'), totalArea: ref(1000) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第28条第1号');
    });

    it('用途(16の2)項、延べ面積999㎡で設置義務なし', () => {
      const input = createMockInput({ buildingUse: ref('item16_2'), totalArea: ref(999) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe(false);
    });

    it('用途(16の2)項以外、延べ面積1000㎡で設置義務なし', () => {
      const input = createMockInput({ buildingUse: ref('item01_i_ro'), totalArea: ref(1000) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe(false);
    });
  });

  // --- 第2号のテスト ---
  describe('第2号: (1)項の舞台部で床面積500㎡以上', () => {
    it('用途(1)項、舞台部あり、面積500㎡で設置義務あり', () => {
      const input = createMockInput({ buildingUse: ref('item01_i_ro'), hasStageArea: ref(true), stageArea: ref(500) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第28条第2号');
    });

    it('用途(1)項、舞台部あり、面積499㎡で設置義務なし', () => {
      const input = createMockInput({ buildingUse: ref('item01_i_ro'), hasStageArea: ref(true), stageArea: ref(499) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe(false);
    });

    it('用途(1)項、舞台部あり、面積未入力で警告', () => {
      const input = createMockInput({ buildingUse: ref('item01_i_ro'), hasStageArea: ref(true), stageArea: ref(0) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe('warning');
      expect(regulationResult.value.message).toContain('舞台部の面積が入力されていません');
    });

    it('用途(1)項以外、舞台部あり、面積500㎡で設置義務なし', () => {
      const input = createMockInput({ buildingUse: ref('item02_i'), hasStageArea: ref(true), stageArea: ref(500) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe(false);
    });
  });

  // --- 第3号のテスト ---
  describe('第3号: 特定用途の地階又は無窓階で床面積1000㎡以上', () => {
    it('用途(2)項、地階あり、面積1000㎡で設置義務あり', () => {
      const floors: Floor[] = [{ level: 1, type: 'basement', floorArea: 1000, capacity: null, isWindowless: false }];
      const input = createMockInput({ buildingUse: ref('item02_i'), floors: ref(floors) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第28条第3号');
    });

    it('用途(4)項、無窓階あり、面積1000㎡で設置義務あり', () => {
      const floors: Floor[] = [{ level: 1, type: 'ground', floorArea: 1000, capacity: null, isWindowless: true }];
      const input = createMockInput({ buildingUse: ref('item04'), floors: ref(floors) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第28条第3号');
    });

    it('用途(10)項、地階あり、面積999㎡で設置義務なし', () => {
      const floors: Floor[] = [{ level: 1, type: 'basement', floorArea: 999, capacity: null, isWindowless: false }];
      const input = createMockInput({ buildingUse: ref('item10'), floors: ref(floors) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe(false);
    });

    it('用途(13)項、地階あり、面積未入力で警告', () => {
      const floors: Floor[] = [{ level: 1, type: 'basement', floorArea: 0, capacity: null, isWindowless: false }];
      const input = createMockInput({ buildingUse: ref('item13'), floors: ref(floors) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe('warning');
      expect(regulationResult.value.message).toContain('床面積が入力されていません');
    });

    it('用途(2)項以外、地階あり、面積1000㎡で設置義務なし', () => {
      const floors: Floor[] = [{ level: 1, type: 'basement', floorArea: 1000, capacity: null, isWindowless: false }];
      const input = createMockInput({ buildingUse: ref('item01_i_ro'), floors: ref(floors) });
      const { regulationResult } = useArticle28Logic(input);
      expect(regulationResult.value.required).toBe(false);
    });
  });

  it('どの条件にも当てはまらない場合、設置義務なし', () => {
    const input = createMockInput({ buildingUse: ref('item18'), totalArea: ref(100) });
    const { regulationResult } = useArticle28Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });
});
