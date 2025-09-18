
import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useArticle27Logic, type Article27UserInput } from './article27Logic';
import type { Floor } from '@/types';

const createMockInput = (overrides: Partial<Article27UserInput> = {}): Article27UserInput => {
  const defaults: Article27UserInput = {
    buildingUse: ref('item01_i_ro'),
    siteArea: ref(0),
    buildingHeight: ref(0),
    totalArea: ref(0),
    groundFloors: ref(1),
    floors: ref<Floor[]>([]),
    buildingStructure: ref('other'),
  };
  return { ...defaults, ...overrides };
};

describe('useArticle27Logic', () => {
  it('用途が選択されていない場合、判定をスキップする', () => {
    const input = createMockInput({ buildingUse: ref(null) });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });

  // --- 第2号のテスト ---
  it('2号: 高さ31m超、延べ面積25000㎡以上で設置義務あり', () => {
    const input = createMockInput({ buildingHeight: ref(32), totalArea: ref(25000) });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第27条第2号');
  });

  it('2号: 高さが31m以下の場合、2号の義務はなし', () => {
    const input = createMockInput({ buildingHeight: ref(31), totalArea: ref(25000) });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.required).toBe(false); // Falls through to 1号 check
  });

  // --- 第1号のテスト ---
  it('1号: 敷地面積20000㎡以上、その他建築物5000㎡以上で設置義務あり', () => {
    const floors: Floor[] = [{ level: 1, type: 'ground', floorArea: 5000, capacity: null, isWindowless: false }];
    const input = createMockInput({ siteArea: ref(20000), floors: ref(floors), buildingStructure: ref('other') });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第27条第1号');
  });

  it('1号: 準耐火建築物10000㎡以上で設置義務あり', () => {
    const floors: Floor[] = [{ level: 1, type: 'ground', floorArea: 10000, capacity: null, isWindowless: false }];
    const input = createMockInput({ siteArea: ref(20000), floors: ref(floors), buildingStructure: ref('quasi-fire-resistant') });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第27条第1号');
  });

  it('1号: 耐火建築物15000㎡以上で設置義務あり', () => {
    const floors: Floor[] = [
        { level: 1, type: 'ground', floorArea: 10000, capacity: null, isWindowless: false },
        { level: 2, type: 'ground', floorArea: 5000, capacity: null, isWindowless: false },
    ];
    const input = createMockInput({ siteArea: ref(20000), groundFloors: ref(2), floors: ref(floors), buildingStructure: ref('fire-resistant') });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第27条第1号');
  });

  it('1号: 敷地面積が20000㎡未満の場合、設置義務なし', () => {
    const floors: Floor[] = [{ level: 1, type: 'ground', floorArea: 5000, capacity: null, isWindowless: false }];
    const input = createMockInput({ siteArea: ref(19999), floors: ref(floors), buildingStructure: ref('other') });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });

  it('1号: 床面積が基準未満の場合、設置義務なし', () => {
    const floors: Floor[] = [{ level: 1, type: 'ground', floorArea: 4999, capacity: null, isWindowless: false }];
    const input = createMockInput({ siteArea: ref(20000), floors: ref(floors), buildingStructure: ref('other') });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });

  it('1号: 対象外用途（(16)項）の場合、設置義務なし', () => {
    const floors: Floor[] = [{ level: 1, type: 'ground', floorArea: 5000, capacity: null, isWindowless: false }];
    const input = createMockInput({ buildingUse: ref('item16'), siteArea: ref(20000), floors: ref(floors) });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toContain('対象外');
  });

  it('1号: 2号の条件を満たす場合、1号の判定はされない', () => {
    const floors: Floor[] = [{ level: 1, type: 'ground', floorArea: 5000, capacity: null, isWindowless: false }];
    const input = createMockInput({ buildingHeight: ref(32), totalArea: ref(25000), siteArea: ref(20000), floors: ref(floors) });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.basis).toBe('令第27条第2号');
  });

  it('耐火性能が未選択の場合、警告を返す', () => {
    const input = createMockInput({ siteArea: ref(20000), buildingStructure: ref(null) });
    const { regulationResult } = useArticle27Logic(input);
    expect(regulationResult.value.required).toBe('warning');
  });
});
