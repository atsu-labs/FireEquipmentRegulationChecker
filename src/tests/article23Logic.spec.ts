import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useArticle23Logic } from '../composables/articles/article23Logic';
import type { Article23UserInput } from '../types';

describe('useArticle23Logic', () => {
  const createMockUserInput = (overrides: Partial<Article23UserInput>): Article23UserInput => {
    const defaults: Article23UserInput = {
      buildingUse: ref(null),
      totalArea: ref(0),
    };
    return { ...defaults, ...overrides };
  };

  it('1号: (6)項ロは高リスクなため、電話での代替不可 (required: true)', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item06_ro') });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第23条第1項第1号');
  });

  it('1号: (16の2)項は電話での代替が可能 (required: warning)', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item16_2') });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe('warning');
    expect(regulationResult.value.basis).toContain('令第23条第1項第1号');
  });

  it('2号: (5)項イ、面積500㎡以上は高リスクなため、電話での代替不可 (required: true)', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item05_i'), totalArea: ref(500) });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toBe('令第23条第1項第2号');
  });

  it('2号: (4)項、面積500㎡以上は電話での代替が可能 (required: warning)', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item04'), totalArea: ref(500) });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe('warning');
    expect(regulationResult.value.basis).toContain('令第23条第1項第2号');
    expect(regulationResult.value.message).toContain('延べ面積が500㎡以上のため');
  });

  it('2号: (4)項、面積が500㎡未満は設置不要', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item04'), totalArea: ref(499) });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it('3号: (9)項、面積1000㎡以上は電話での代替が可能 (required: warning)', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item09_i'), totalArea: ref(1000) });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe('warning');
    expect(regulationResult.value.basis).toContain('令第23条第1項第3号');
    expect(regulationResult.value.message).toContain('延べ面積が1000㎡以上のため');
  });

  it('3号: (9)項、面積が1000㎡未満は設置不要', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item09_i'), totalArea: ref(999) });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });

  it('どの条件にも該当しない場合 (18項)', () => {
    const userInput = createMockUserInput({ buildingUse: ref('item18') });
    const { regulationResult } = useArticle23Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
  });
});
