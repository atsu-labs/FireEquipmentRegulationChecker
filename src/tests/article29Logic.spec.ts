import { describe, it, expect } from 'vitest';
import { ref, type Ref } from 'vue';
import { useArticle29Logic } from '../composables/articles/article29Logic';
import type { Article29UserInput, Floor } from '@/types';

// テストデータ生成のヘルパー関数
const createMockUserInput = (overrides: Partial<Article29UserInput> = {}): Article29UserInput => {
  const defaults: Article29UserInput = {
    buildingUse: ref(null),
    totalFloorAreaInput: ref(0),
    floors: ref([]),
    hasRoadPart: ref(false), // useArticle29Logicで追加したプロパティ
  };

  // refオブジェクトを直接上書きするのではなく、.valueを上書きする
  const merged: Article29UserInput = { ...defaults };
  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const k = key as keyof Article29UserInput;
      if (merged[k] && 'value' in merged[k]) {
        (merged[k] as Ref<unknown>).value = (overrides[k] as Ref<unknown>).value;
      }
    }
  }
  return merged;
};

describe('useArticle29Logic', () => {
  it('建物の用途が選択されていない場合、設置義務なしと判定されること', () => {
    const userInput = createMockUserInput();
    const { regulationResult } = useArticle29Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe('建物の用途を選択してください。');
  });

  // --- 第一号: 地階を除く階数が7以上の建築物 ---
  describe('令第二十九条第一号', () => {
    it('地階を除く階数が7階の場合、設置義務ありと判定されること', () => {
      const floors = ref<Floor[]>([
        { level: 1, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 2, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 3, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 4, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 5, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 6, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 7, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
      ]);
      const userInput = createMockUserInput({ buildingUse: ref('annex01_i'), floors });
      const { regulationResult } = useArticle29Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第二十九条第一号');
    });

    it('地階を除く階数が6階の場合、第一号では設置義務なしと判定されること', () => {
      const floors = ref<Floor[]>([
        { level: 1, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 2, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 3, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 4, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 5, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
        { level: 6, type: 'ground', floorArea: 100, capacity: null, isWindowless: false, componentUses: [] },
      ]);
      const userInput = createMockUserInput({ buildingUse: ref('annex01_i'), floors });
      const { regulationResult } = useArticle29Logic(userInput);
      expect(regulationResult.value.required).toBe(false); // 他の条件に該当しない限りfalse
    });
  });

  // --- 第二号: 地階を除く階数が5以上で、延べ面積が6,000平方メートル以上の建築物 ---
  describe('令第二十九条第二号', () => {
    it('地階を除く階数が5階かつ延べ面積が6000㎡の場合、設置義務ありと判定されること', () => {
      const floors = ref<Floor[]>([
        { level: 1, type: 'ground', floorArea: 1200, capacity: null, isWindowless: false, componentUses: [] },
        { level: 2, type: 'ground', floorArea: 1200, capacity: null, isWindowless: false, componentUses: [] },
        { level: 3, type: 'ground', floorArea: 1200, capacity: null, isWindowless: false, componentUses: [] },
        { level: 4, type: 'ground', floorArea: 1200, capacity: null, isWindowless: false, componentUses: [] },
        { level: 5, type: 'ground', floorArea: 1200, capacity: null, isWindowless: false, componentUses: [] },
      ]);
      const userInput = createMockUserInput({ buildingUse: ref('annex01_i'), floors, totalFloorAreaInput: ref(6000) });
      const { regulationResult } = useArticle29Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第二十九条第二号');
    });

    it('地階を除く階数が4階かつ延べ面積が6000㎡の場合、第二号では設置義務なしと判定されること', () => {
      const floors = ref<Floor[]>([
        { level: 1, type: 'ground', floorArea: 1500, capacity: null, isWindowless: false, componentUses: [] },
        { level: 2, type: 'ground', floorArea: 1500, capacity: null, isWindowless: false, componentUses: [] },
        { level: 3, type: 'ground', floorArea: 1500, capacity: null, isWindowless: false, componentUses: [] },
        { level: 4, type: 'ground', floorArea: 1500, capacity: null, isWindowless: false, componentUses: [] },
      ]);
      const userInput = createMockUserInput({ buildingUse: ref('annex01_i'), floors, totalFloorAreaInput: ref(6000) });
      const { regulationResult } = useArticle29Logic(userInput);
      expect(regulationResult.value.required).toBe(false);
    });

    it('地階を除く階数が5階かつ延べ面積が5999㎡の場合、第二号では設置義務なしと判定されること', () => {
      const floors = ref<Floor[]>([
        { level: 1, type: 'ground', floorArea: 1199.8, capacity: null, isWindowless: false, componentUses: [] },
        { level: 2, type: 'ground', floorArea: 1199.8, capacity: null, isWindowless: false, componentUses: [] },
        { level: 3, type: 'ground', floorArea: 1199.8, capacity: null, isWindowless: false, componentUses: [] },
        { level: 4, type: 'ground', floorArea: 1199.8, capacity: null, isWindowless: false, componentUses: [] },
        { level: 5, type: 'ground', floorArea: 1199.8, capacity: null, isWindowless: false, componentUses: [] },
      ]);
      const userInput = createMockUserInput({ buildingUse: ref('annex01_i'), floors, totalFloorAreaInput: ref(5999) });
      const { regulationResult } = useArticle29Logic(userInput);
      expect(regulationResult.value.required).toBe(false);
    });
  });

  // --- 第三号: 別表第一（十六の二）項に掲げる防火対象物で、延べ面積が1,000平方メートル以上のもの（地下街） ---
  describe('令第二十九条第三号', () => {
    it('用途が(16の2)項で延べ面積が1000㎡の場合、設置義務ありと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex16_2'), totalFloorAreaInput: ref(1000) });
      const { regulationResult } = useArticle29Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第二十九条第三号');
    });

    it('用途が(16の2)項で延べ面積が999㎡の場合、第三号では設置義務なしと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex16_2'), totalFloorAreaInput: ref(999) });
      const { regulationResult } = useArticle29Logic(userInput);
      expect(regulationResult.value.required).toBe(false);
    });
  });

  // --- 第四号: 別表第一（十八）項に掲げる防火対象物（延長50メートル以上のアーケード） ---
  describe('令第二十九条第四号', () => {
    it('用途が(18)項の場合、面積に関わらず設置義務ありと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex18'), totalFloorAreaInput: ref(100) });
      const { regulationResult } = useArticle29Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第二十九条第四号');
    });
  });

  // --- 第五号: 道路の用に供される部分を有するもの ---
  describe('令第二十九条第五号', () => {
    it('道路の用に供される部分を有する場合、設置義務ありと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex01_i'), hasRoadPart: ref(true) });
      const { regulationResult } = useArticle29Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第二十九条第五号');
    });

    it('道路の用に供される部分を有しない場合、第五号では設置義務なしと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('annex01_i'), hasRoadPart: ref(false) });
      const { regulationResult } = useArticle29Logic(userInput);
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
      hasRoadPart: ref(false),
    });
    const { regulationResult } = useArticle29Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe('連結送水管の設置義務はありません。');
  });
});