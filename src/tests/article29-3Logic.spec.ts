import { describe, it, expect } from 'vitest';
import { ref, type Ref } from 'vue';
import { useArticle29_3Logic } from '../composables/articles/article29-3Logic';
import type { Article29_3UserInput } from '@/types';

// テストデータ生成のヘルパー関数
const createMockUserInput = (overrides: Partial<Article29_3UserInput> = {}): Article29_3UserInput => {
  const defaults: Article29_3UserInput = {
    buildingUse: ref(null),
    totalFloorAreaInput: ref(0),
  };

  const merged: Article29_3UserInput = { ...defaults };
  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const k = key as keyof Article29_3UserInput;
      if (merged[k] && 'value' in merged[k]) {
        (merged[k] as Ref<unknown>).value = (overrides[k] as Ref<unknown>).value;
      }
    }
  }
  return merged;
};

describe('useArticle29_3Logic', () => {
  it('建物の用途が選択されていない場合、設置義務なしと判定されること', () => {
    const userInput = createMockUserInput();
    const { regulationResult } = useArticle29_3Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe('建物の用途を選択してください。');
  });

  // --- 別表第一（十六の二）項に掲げる防火対象物で、延べ面積が1,000平方メートル以上のもの ---
  describe('令第二十九条の三', () => {
    it('用途が(16の2)項で延べ面積が1000㎡の場合、設置義務ありと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('item16_2'), totalFloorAreaInput: ref(1000) });
      const { regulationResult } = useArticle29_3Logic(userInput);
      expect(regulationResult.value.required).toBe(true);
      expect(regulationResult.value.basis).toBe('令第二十九条の三');
    });

    it('用途が(16の2)項で延べ面積が999㎡の場合、設置義務なしと判定されること', () => {
      const userInput = createMockUserInput({ buildingUse: ref('item16_2'), totalFloorAreaInput: ref(999) });
      const { regulationResult } = useArticle29_3Logic(userInput);
      expect(regulationResult.value.required).toBe(false);
    });
  });

  // --- 設置義務なし ---
  it('どの条件にも該当しない場合、設置義務なしと判定されること', () => {
    const userInput = createMockUserInput({
      buildingUse: ref('item01_i'),
      totalFloorAreaInput: ref(100),
    });
    const { regulationResult } = useArticle29_3Logic(userInput);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe('無線通信補助設備の設置義務はありません。');
  });
});