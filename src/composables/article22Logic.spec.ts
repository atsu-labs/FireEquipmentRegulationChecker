import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useArticle22Logic, type Article22UserInput } from './article22Logic';

describe('useArticle22Logic', () => {
  const createUserInput = (overrides: Partial<Article22UserInput>): Article22UserInput => {
    const defaults: Article22UserInput = {
      buildingUse: ref(null),
      totalArea: ref(0),
      hasSpecialCombustibleStructure: ref(true), // Default to true for most tests
      contractedCurrentCapacity: ref(0),
    };
    return { ...defaults, ...overrides };
  };

  it('特殊な構造でない場合は設置不要', () => {
    const userInput = createUserInput({ hasSpecialCombustibleStructure: ref(false) });
    const { result } = useArticle22Logic(userInput);
    expect(result.value.required).toBe(false);
  });

  it('1号: (17)項の建物', () => {
    const userInput = createUserInput({ buildingUse: ref('item17') });
    const { result } = useArticle22Logic(userInput);
    expect(result.value.required).toBe(true);
    expect(result.value.basis).toBe('令第22条第1項第1号');
  });

  it('2号: (5)項で延べ面積150㎡以上', () => {
    const userInput = createUserInput({ buildingUse: ref('item05_i'), totalArea: ref(150) });
    const { result } = useArticle22Logic(userInput);
    expect(result.value.required).toBe(true);
    expect(result.value.basis).toBe('令第22条第1項第2号');
  });

  it('3号: (6)項で延べ面積300㎡以上', () => {
    const userInput = createUserInput({ buildingUse: ref('item06_i_1'), totalArea: ref(300) });
    const { result } = useArticle22Logic(userInput);
    expect(result.value.required).toBe(true);
    expect(result.value.basis).toBe('令第22条第1項第3号');
  });

  it('4号: (10)項で延べ面積500㎡以上', () => {
    const userInput = createUserInput({ buildingUse: ref('item10'), totalArea: ref(500) });
    const { result } = useArticle22Logic(userInput);
    expect(result.value.required).toBe(true);
    expect(result.value.basis).toBe('令第22条第1項第4号');
  });

  it('5号: (14)項で延べ面積1000㎡以上', () => {
    const userInput = createUserInput({ buildingUse: ref('item14'), totalArea: ref(1000) });
    const { result } = useArticle22Logic(userInput);
    expect(result.value.required).toBe(true);
    expect(result.value.basis).toBe('令第22条第1項第5号');
  });

  it('6号: (16)項イで延べ面積500㎡以上の場合にwarningを返す', () => {
    const userInput = createUserInput({ buildingUse: ref('item16_i'), totalArea: ref(500) });
    const { result } = useArticle22Logic(userInput);
    expect(result.value.required).toBe('warning');
    expect(result.value.basis).toBe('令第22条第1項第6号');
  });

  it('7号: (1)項で契約電流容量が50Aを超える', () => {
    const userInput = createUserInput({ buildingUse: ref('item01_i'), contractedCurrentCapacity: ref(51) });
    const { result } = useArticle22Logic(userInput);
    expect(result.value.required).toBe(true);
    expect(result.value.basis).toBe('令第22条第1項第7号');
  });

  it('7号: (1)項で契約電流容量が50Aちょうど', () => {
    const userInput = createUserInput({ buildingUse: ref('item01_i'), contractedCurrentCapacity: ref(50) });
    const { result } = useArticle22Logic(userInput);
    expect(result.value.required).toBe(false);
  });

  it('どの条件にも該当しない場合', () => {
    const userInput = createUserInput({ buildingUse: ref('item18'), totalArea: ref(100) });
    const { result } = useArticle22Logic(userInput);
    expect(result.value.required).toBe(false);
  });
});
