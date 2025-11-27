import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useArticle26Logic} from '../composables/articles/article26Logic';
import type { Floor, Article26UserInput } from '@/types';

const createMockUserInput = (overrides: Partial<Article26UserInput>): Article26UserInput => {
  const defaults: Article26UserInput = {
    buildingUse: ref(null),
    groundFloors: ref(1),
    floors: ref<Floor[]>([]),
  };
  return { ...defaults, ...overrides };
};

describe('useArticle26Logic', () => {
  it('用途が選択されていない場合、設置義務なしと判定されること', () => {
    const userInput = createMockUserInput({});
    const { regulationResult } = useArticle26Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toContain('建物の用途を選択してください');
  });

  describe('誘導灯の判定', () => {
    it('(1)項の場合、誘導灯と客席誘導灯が必要と判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex01') });
      const { regulationResult } = useArticle26Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.message).toContain('誘導灯の設置が必要です');
      expect(regulationResult.value.message).toContain('客席誘導灯も必要です');
    });

    it('(7)項で2階が無窓階の場合、メッセージに「2階（無窓階）」が含まれること', () => {
      const userInput = createMockUserInput({
        buildingUse: ref('annex07'),
        floors: ref([{ level: 2, type: 'ground', floorArea: 100, capacity: 10, isWindowless: true }])
      });
      const { regulationResult } = useArticle26Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.message).toContain('2階（無窓階）の部分に誘導灯の設置が必要です');
    });

    it('地階、無窓階、11階以上の複合条件で、メッセージが正しく連結されること', () => {
      const userInput = createMockUserInput({
        buildingUse: ref('annex08'), // (8)項
        groundFloors: ref(12),
        floors: ref([
          { level: 1, type: 'basement', floorArea: 100, capacity: 10, isWindowless: false },
          { level: 3, type: 'ground', floorArea: 100, capacity: 10, isWindowless: true },
        ])
      });
      const { regulationResult } = useArticle26Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.message).toContain('地下1階、3階（無窓階）、11階以上の階の部分に誘導灯の設置が必要です');
    });

    it('(16)項イの場合、warningと判定され、誘導灯と客席誘導灯の確認メッセージが表示されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex16_i') });
      const { regulationResult } = useArticle26Logic(userInput);
      expect(regulationResult.value.required).toBe('warning');
      expect(regulationResult.value.message).toContain('この用途の建物には誘導灯の設置が必要です');
      expect(regulationResult.value.message).toContain('【要確認】');
    });
  });

  describe('誘導標識の判定', () => {
    it('誘導灯が不要な(5)項ロで、地階や無窓階がない場合、誘導標識が必要と判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex05_ro') });
      const { regulationResult } = useArticle26Logic(userInput);
      expect(regulationResult.value.required).toBe('info');
      expect(regulationResult.value.message).toContain('誘導標識の設置が必要です');
    });

    it('誘導灯が必要な(1)項の場合、誘導標識は不要と判定されること（誘導灯が優先される）', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex01') });
      const { regulationResult } = useArticle26Logic(userInput);
      // このテストは上の「誘導灯の判定」でカバーされているが、意図を明確にするために残す
      expect(regulationResult.value.message).not.toContain('誘導標識');
    });

    it('(7)項で誘導灯の条件に当てはまらない場合、誘導標識が必要と判定されること', () => {
        const userInput = createMockUserInput({ 
            buildingUse: ref('annex07'),
            groundFloors: ref(10),
        });
        const { regulationResult } = useArticle26Logic(userInput);
        expect(regulationResult.value.required).toBe('info');
        expect(regulationResult.value.message).toContain('誘導標識の設置が必要です');
    });
  });

  describe('どちらも不要なケース', () => {
    it('対象外の用途（(17)項など）の場合、どちらも不要と判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex17') });
      const { regulationResult } = useArticle26Logic(userInput);
      expect(regulationResult.value.required).toBe(false);
      expect(regulationResult.value.message).toContain('誘導灯および誘導標識の設置義務はありません');
    });
  });
});