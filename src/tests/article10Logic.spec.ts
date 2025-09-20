import { describe, it, expect } from 'vitest';
import { ref, type Ref } from 'vue';
import { useArticle10Logic } from '../composables/articles/article10Logic';
import type { BuildingData, Floor } from '@/types';

// テストデータ生成のヘルパー関数 (createMockUserInput)
const createMockUserInput = (overrides: Partial<BuildingData> = {}): BuildingData => {
  const defaults: BuildingData = {
    buildingUse: ref(null),
    totalFloorAreaInput: ref(0),
    floors: ref([]),
    usesFireEquipment: ref(false),
    storesMinorHazardousMaterials: ref(false),
    storesDesignatedCombustibles: ref(false),
    hasRoadPart: ref(false),
  };

  // refオブジェクトを直接上書きするのではなく、.valueを上書きする
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


describe('Article10Logic', () => {
  it('建物の用途が選択されていない場合、設置義務なしと判定されること', () => {
  const userInput = createMockUserInput();
  const { regulationResult } = useArticle10Logic(userInput);
  expect(regulationResult.value.required).toBe(false);
  expect(regulationResult.value.message).toBe('建物の用途を選択してください。');
  });

  // --- 第一号 ---
  describe('令第十条第一項一号', () => {
    it('イ: (1)項イに該当する場合、面積に関わらず設置義務ありと判定されること', () => {
  const userInput = createMockUserInput({ buildingUse: ref('item01_i') });
  const { regulationResult } = useArticle10Logic(userInput);
  expect(regulationResult.value.required).toBe(true);
  expect(regulationResult.value.basis).toBe('令第十条第一項一号イ');
    });

    it('ロ: (3)項で火気設備がある場合、面積に関わらず設置義務ありと判定されること', () => {
  const userInput = createMockUserInput({ buildingUse: ref('item03_i'), usesFireEquipment: ref(true) });
  const { regulationResult } = useArticle10Logic(userInput);
  expect(regulationResult.value.required).toBe(true);
  expect(regulationResult.value.basis).toBe('令第十条第一項一号ロ');
    });
  });

  // --- 第二号 ---
  describe('令第十条第一項二号', () => {
    it('イ: (4)項で延べ面積が150㎡以上の場合、設置義務ありと判定されること', () => {
  const userInput = createMockUserInput({ buildingUse: ref('item04'), totalFloorAreaInput: ref(150) });
  const { regulationResult } = useArticle10Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第十条第一項二号イ');
    });

    it('イ: (4)項で延べ面積が150㎡未満の場合、(二号の事由では)設置義務なしと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('item04'), totalFloorAreaInput: ref(149) });
      const { regulationResult } = useArticle10Logic(userInput);
      // 他の条件に該当しない限りfalse
      expect(regulationResult.value.required).toBe(false);
    });

    it('ロ: (3)項で火気設備がなく、延べ面積が150㎡以上の場合、設置義務ありと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('item03_i'), totalFloorAreaInput: ref(150), usesFireEquipment: ref(false) });
      const { regulationResult } = useArticle10Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第十条第一項二号ロ');
    });
  });

  // --- 第三号 ---
  describe('令第十条第一項三号', () => {
    it('(7)項で延べ面積が300㎡以上の場合、設置義務ありと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('item07'), totalFloorAreaInput: ref(300) });
      const { regulationResult } = useArticle10Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第十条第一項三号');
    });

    it('(7)項で延べ面積が300㎡未満の場合、(三号の事由では)設置義務なしと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('item07'), totalFloorAreaInput: ref(299) });
      const { regulationResult } = useArticle10Logic(userInput);
      expect(regulationResult.value.required).toBe(false);
    });
  });

  // --- 第四号 ---
  describe('令第十条第一項四号', () => {
    it('少量危険物を貯蔵している場合、設置義務ありと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('item16'), storesMinorHazardousMaterials: ref(true) });
      const { regulationResult } = useArticle10Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第十条第一項四号');
    });

    it('指定可燃物を貯蔵している場合、設置義務ありと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('item16'), storesDesignatedCombustibles: ref(true) });
      const { regulationResult } = useArticle10Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第十条第一項四号');
    });
  });

  // --- 第五号 ---
  describe('令第十条第一項五号', () => {
    it('床面積50㎡以上の地下階がある場合、設置義務ありと判定されること', () => {
      const floors = ref<Floor[]>([{ level: 1, type: 'basement', floorArea: 50, capacity: null, isWindowless: false }]);
      const userInput = createMockUserInput({ buildingUse: ref('item16'), floors });
      const { regulationResult } = useArticle10Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第十条第一項五号');
    });

    it('床面積50㎡以上の無窓階がある場合、設置義務ありと判定されること', () => {
      const floors = ref<Floor[]>([{ level: 1, type: 'ground', floorArea: 50, capacity: null, isWindowless: true }]);
      const userInput = createMockUserInput({ buildingUse: ref('item16'), floors });
      const { regulationResult } = useArticle10Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第十条第一項五号');
    });

    it('床面積50㎡以上の地上3階以上の階がある場合、設置義務ありと判定されること', () => {
      const floors = ref<Floor[]>([{ level: 3, type: 'ground', floorArea: 50, capacity: null, isWindowless: false }]);
      const userInput = createMockUserInput({ buildingUse: ref('item16'), floors });
      const { regulationResult } = useArticle10Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第十条第一項五号');
    });

     it('床面積が50㎡未満の特定階があっても、設置義務なしと判定されること', () => {
      const floors = ref<Floor[]>([{ level: 1, type: 'basement', floorArea: 49, capacity: null, isWindowless: false }]);
      const userInput = createMockUserInput({ buildingUse: ref('item16'), floors });
      const { regulationResult } = useArticle10Logic(userInput);
      expect(regulationResult.value.required).toBe(false);    });
  });

  // --- 設置義務なし ---
  it('どの条件にも該当しない場合、設置義務なしと判定されること', () => {
    const userInput = createMockUserInput({
      buildingUse: ref('item16'), // (16)項は特定の面積要件がない
      totalFloorAreaInput: ref(100),
      floors: ref([
        { level: 1, type: 'ground', floorArea: 50, capacity: null, isWindowless: false },
        { level: 2, type: 'ground', floorArea: 50, capacity: null, isWindowless: false },
      ]),
      usesFireEquipment: ref(false),
      storesMinorHazardousMaterials: ref(false),
      storesDesignatedCombustibles: ref(false),
    });
    const { regulationResult } = useArticle10Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe('消火器の設置義務はありません。');
  });
});