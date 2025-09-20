
import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useArticle19Logic} from '../composables/articles/article19Logic';
import type { Floor, Article19UserInput } from '@/types';

const createMockInput = (overrides: Partial<Article19UserInput> = {}): Article19UserInput => {
  const defaults: Article19UserInput = {
    buildingUse: ref('item01_i_ro'),
    groundFloors: ref(1),
    floors: ref<Floor[]>([]),
    buildingStructure: ref('other'),
    hasMultipleBuildingsOnSite: ref(false),
  };

  return { ...defaults, ...overrides };
};

describe('useArticle19Logic', () => {
  it('建物の用途が選択されていない場合、判定をスキップすること', () => {
    const input = createMockInput({ buildingUse: ref(null) });
    const { regulationResult } = useArticle19Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe('建物の用途を選択してください。');
  });

  it('対象外の用途（(16)項など）の場合、設置義務なしと判定されること', () => {
    const input = createMockInput({ buildingUse: ref('item16') });
    const { regulationResult } = useArticle19Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toContain('対象外です');
  });

  it('同一敷地内に複数の建物がある場合、警告を返すこと', () => {
    const input = createMockInput({ hasMultipleBuildingsOnSite: ref(true) });
    const { regulationResult } = useArticle19Logic(input);
    expect(regulationResult.value.required).toBe('warning');
    expect(regulationResult.value.basis).toBe('令第19条第2項');
  });

  it('建物の耐火性能が選択されていない場合、警告を返すこと', () => {
    const input = createMockInput({ buildingStructure: ref(null) });
    const { regulationResult } = useArticle19Logic(input);
    expect(regulationResult.value.required).toBe('warning');
    expect(regulationResult.value.message).toBe('建物の耐火性能を選択してください。');
  });

  it('平屋建てで1階の面積が基準値未満の場合、設置義務なし', () => {
    const floors: Floor[] = [{ level: 1, type: 'ground', floorArea: 2999, capacity: null, isWindowless: false }];
    const input = createMockInput({ groundFloors: ref(1), floors: ref(floors), buildingStructure: ref('other') });
    const { regulationResult } = useArticle19Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });

  it('平屋建てで1階の面積が基準値以上の場合、設置義務あり（その他の建築物）', () => {
    const floors: Floor[] = [{ level: 1, type: 'ground', floorArea: 3000, capacity: null, isWindowless: false }];
    const input = createMockInput({ groundFloors: ref(1), floors: ref(floors), buildingStructure: ref('other') });
    const { regulationResult } = useArticle19Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.message).toContain('3000㎡');
  });

  it('2階建て以上で1,2階の合計面積が基準値未満の場合、設置義務なし', () => {
    const floors: Floor[] = [
      { level: 2, type: 'ground', floorArea: 1000, capacity: null, isWindowless: false },
      { level: 1, type: 'ground', floorArea: 4999, capacity: null, isWindowless: false },
    ];
    const input = createMockInput({ groundFloors: ref(2), floors: ref(floors), buildingStructure: ref('quasi-fire-resistant') });
    const { regulationResult } = useArticle19Logic(input);
    expect(regulationResult.value.required).toBe(false);
  });

  it('2階建て以上で1,2階の合計面積が基準値以上の場合、設置義務あり（準耐火建築物）', () => {
    const floors: Floor[] = [
      { level: 2, type: 'ground', floorArea: 1000, capacity: null, isWindowless: false },
      { level: 1, type: 'ground', floorArea: 5000, capacity: null, isWindowless: false },
    ];
    const input = createMockInput({ groundFloors: ref(2), floors: ref(floors), buildingStructure: ref('quasi-fire-resistant') });
    const { regulationResult } = useArticle19Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.message).toContain('6000㎡');
  });

  it('3階建てで1,2階の合計面積が基準値以上の場合、設置義務あり（耐火建築物）', () => {
    const floors: Floor[] = [
      { level: 3, type: 'ground', floorArea: 1000, capacity: null, isWindowless: false },
      { level: 2, type: 'ground', floorArea: 4000, capacity: null, isWindowless: false },
      { level: 1, type: 'ground', floorArea: 5000, capacity: null, isWindowless: false },
    ];
    const input = createMockInput({ groundFloors: ref(3), floors: ref(floors), buildingStructure: ref('fire-resistant') });
    const { regulationResult } = useArticle19Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.message).toContain('9000㎡');
  });

  it('対象面積が0の場合、警告を返すこと', () => {
    const input = createMockInput({ floors: ref([]) });
    const { regulationResult } = useArticle19Logic(input);
    expect(regulationResult.value.required).toBe('warning');
    expect(regulationResult.value.message).toContain('床面積が入力されていません');
  });
});
