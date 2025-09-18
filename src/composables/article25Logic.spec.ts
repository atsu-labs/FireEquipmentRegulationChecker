import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useArticle25Logic, type Article25UserInput } from './article25Logic';
import type { Floor } from '@/types';

describe('useArticle25Logic', () => {
  const createUserInput = (overrides: Partial<Article25UserInput>): Article25UserInput => {
    const defaults: Article25UserInput = {
      buildingUse: ref(null),
      floors: ref([]),
    };
    return { ...defaults, ...overrides };
  };

  // 1号: (6)項
  describe('第1項第1号: (6)項', () => {
    it('(6)項の2階で収容人員20人以上の場合、warningを返す', () => {
      const floors = ref<Floor[]>([{level: 2, type: 'ground', capacity: 20, floorArea: 0, isWindowless: false }]);
      const userInput = createUserInput({ buildingUse: ref('item06'), floors });
      const { result } = useArticle25Logic(userInput);
      expect(result.value.required).toBe('warning');
      expect(result.value.basis).toBe('令第25条第1項第1号');
    });

    it('(6)項の地階で収容人員10人以上20人未満の場合、warningを返す', () => {
      const floors = ref<Floor[]>([{level: 1, type: 'basement', capacity: 10, floorArea: 0, isWindowless: false }]);
      const userInput = createUserInput({ buildingUse: ref('item06'), floors });
      const { result } = useArticle25Logic(userInput);
      expect(result.value.required).toBe('warning');
      expect(result.value.basis).toBe('令第25条第1項第1号');
    });

    it('(6)項の2階で収容人員9人の場合、設置不要', () => {
      const floors = ref<Floor[]>([{level: 2, type: 'ground', capacity: 9, floorArea: 0, isWindowless: false }]);
      const userInput = createUserInput({ buildingUse: ref('item06'), floors });
      const { result } = useArticle25Logic(userInput);
      expect(result.value.required).toBe(false);
    });
  });

  // 2号: (5)項
  describe('第1項第2号: (5)項', () => {
    it('(5)項の3階で収容人員30人以上の場合、warningを返す', () => {
      const floors = ref<Floor[]>([{level: 3, type: 'ground', capacity: 30, floorArea: 0, isWindowless: false }]);
      const userInput = createUserInput({ buildingUse: ref('item05'), floors });
      const { result } = useArticle25Logic(userInput);
      expect(result.value.required).toBe('warning');
      expect(result.value.basis).toBe('令第25条第1項第2号');
    });
  });

  // 3号: (1)~(4), (7)~(11)項
  describe('第1項第3号: (1)~(4), (7)~(11)項', () => {
    it('(1)項の2階で収容人員50人以上の場合、warningを返す', () => {
      const floors = ref<Floor[]>([{level: 2, type: 'ground', capacity: 50, floorArea: 0, isWindowless: false }]);
      const userInput = createUserInput({ buildingUse: ref('item01'), floors });
      const { result } = useArticle25Logic(userInput);
      expect(result.value.required).toBe('warning');
      expect(result.value.basis).toBe('令第25条第1項第3号');
    });
  });

  // 4号: (12), (15)項
  describe('第1項第4号: (12), (15)項', () => {
    it('(12)項の3階で収容人員150人以上の場合、warningを返す', () => {
      const floors = ref<Floor[]>([{level: 3, type: 'ground', capacity: 150, floorArea: 0, isWindowless: false }]);
      const userInput = createUserInput({ buildingUse: ref('item12'), floors });
      const { result } = useArticle25Logic(userInput);
      expect(result.value.required).toBe('warning');
      expect(result.value.basis).toBe('令第25条第1項第4号');
    });

    it('(15)項の地階で収容人員100人以上の場合、warningを返す', () => {
      const floors = ref<Floor[]>([{level: 1, type: 'basement', capacity: 100, floorArea: 0, isWindowless: false }]);
      const userInput = createUserInput({ buildingUse: ref('item15'), floors });
      const { result } = useArticle25Logic(userInput);
      expect(result.value.required).toBe('warning');
      expect(result.value.basis).toBe('令第25条第1項第4号');
    });
  });

  // 5号: その他
  describe('第1項第5号: その他', () => {
    it('(16)項イの3階で収容人員10人以上の場合、warningを返す', () => {
      const floors = ref<Floor[]>([{level: 3, type: 'ground', capacity: 10, floorArea: 0, isWindowless: false }]);
      const userInput = createUserInput({ buildingUse: ref('item16_i'), floors });
      const { result } = useArticle25Logic(userInput);
      expect(result.value.required).toBe('warning');
      expect(result.value.basis).toBe('令第25条第1項第5号');
    });

    it('(2)項の2階で収容人員10人以上の場合、warningを返す', () => {
      const floors = ref<Floor[]>([{level: 2, type: 'ground', capacity: 10, floorArea: 0, isWindowless: false }]);
      const userInput = createUserInput({ buildingUse: ref('item02'), floors });
      const { result } = useArticle25Logic(userInput);
      expect(result.value.required).toBe('warning');
      expect(result.value.basis).toBe('令第25条第1項第5号');
    });
  });

  it('11階以上の階は判定対象外', () => {
    const floors = ref<Floor[]>([{level: 11, type: 'ground', capacity: 1000, floorArea: 0, isWindowless: false }]);
    const userInput = createUserInput({ buildingUse: ref('item06'), floors });
    const { result } = useArticle25Logic(userInput);
    expect(result.value.required).toBe(false);
  });

  it('どの条件にも該当しない場合', () => {
    const floors = ref<Floor[]>([{level: 1, type: 'ground', capacity: 10, floorArea: 0, isWindowless: false }]);
    const userInput = createUserInput({ buildingUse: ref('item18'), floors });
    const { result } = useArticle25Logic(userInput);
    expect(result.value.required).toBe(false);
  });
});
