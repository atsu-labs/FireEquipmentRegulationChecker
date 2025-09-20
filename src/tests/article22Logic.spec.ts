import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useArticle22Logic } from '../composables/articles/article22Logic';
import type { Article22UserInput } from '../types';

describe('useArticle22Logic', () => {
  const createMockUserInput = (overrides: Partial<Article22UserInput>): Article22UserInput => {
    const defaults: Article22UserInput = {
      buildingUse: ref(null),
      totalArea: ref(0),
      hasSpecialCombustibleStructure: ref(true), // Default to true for most tests
      contractedCurrentCapacity: ref(0),
    };
    return { ...defaults, ...overrides };
  };

  it('特殊な構造でない場合は設置不要', () => {
    const userInput = createMockUserInput({ hasSpecialCombustibleStructure: ref(false) });
    const { regulationResult } = useArticle22Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it('1号: (17)項の建物', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item17') });
    const { regulationResult } = useArticle22Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第22条第1項第1号');
  });

  it('2号: (5)項で延べ面積150㎡以上', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item05_i'), totalArea: ref(150) });
    const { regulationResult } = useArticle22Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第22条第1項第2号');
  });

  it('3号: (6)項で延べ面積300㎡以上', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item06_i_1'), totalArea: ref(300) });
    const { regulationResult } = useArticle22Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第22条第1項第3号');
  });

  it('4号: (10)項で延べ面積500㎡以上', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item10'), totalArea: ref(500) });
    const { regulationResult } = useArticle22Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第22条第1項第4号');
  });

  it('5号: (14)項で延べ面積1000㎡以上', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item14'), totalArea: ref(1000) });
    const { regulationResult } = useArticle22Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第22条第1項第5号');
  });

  it('6号: (16)項イで延べ面積500㎡以上の場合にwarningを返す', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item16_i'), totalArea: ref(500) });
    const { regulationResult } = useArticle22Logic(userInput);
    expect(regulationResult.value.required).toBe('warning');
    expect(regulationResult.value.basis).toBe('令第22条第1項第6号');
  });

  it('7号: (1)項で契約電流容量が50Aを超える', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item01_i'), contractedCurrentCapacity: ref(51) });
    const { regulationResult } = useArticle22Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第22条第1項第7号');
  });

  it('7号: (1)項で契約電流容量が50Aちょうど', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item01_i'), contractedCurrentCapacity: ref(50) });
    const { regulationResult } = useArticle22Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it('どの条件にも該当しない場合', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item18'), totalArea: ref(100) });
    const { regulationResult } = useArticle22Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });
});
