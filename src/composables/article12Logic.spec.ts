import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useArticle12Logic } from './article12Logic';
import type { Article12UserInput, Floor } from '@/types';

// テストデータ生成のヘルパー関数
const createMockInput = (overrides: Partial<Article12UserInput> = {}): Article12UserInput => {
  const defaults: Article12UserInput = {
    buildingUse: ref(null),
    groundFloors: ref(1),
    totalArea: ref(0),
    floors: ref([]),
    isCareDependentOccupancy: ref(false),
    hasStageArea: ref(false),
    stageFloorLevel: ref('ground'),
    stageArea: ref(0),
    isRackWarehouse: ref(false),
    ceilingHeight: ref(0),
    isCombustiblesAmountOver1000: ref(false),
    hasFireSuppressingStructure: ref(false),
    hasBeds: ref(false),
  };
  const merged: Article12UserInput = { ...defaults };
  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const k = key as keyof Article12UserInput;
      if (merged[k] && 'value' in merged[k]) {
        (merged[k] as any).value = (overrides[k] as any).value;
      }
    }
  }
  return merged;
};

describe('useArticle12Logic', () => {
  it('建物の用途が選択されていない場合、設置義務なしと判定されること', () => {
    const input = createMockInput();
    const { regulationResult } = useArticle12Logic(input);
    expect(regulationResult.value.required).toBe(false);
    expect(regulationResult.value.message).toBe('建物の用途を選択してください。');
  });

  it('用途がitem01で舞台部が地階・無窓階・4階以上かつ面積300㎡以上なら設置義務あり', () => {
    const input = createMockInput({ buildingUse: ref('item01'), hasStageArea: ref(true), stageFloorLevel: ref('basement_windowless_4th_or_higher'), stageArea: ref(350) });
    const { regulationResult } = useArticle12Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain('令第12条第1項第2号');
  });

  it('用途がitem04で平屋建て以外かつ延べ面積3000㎡以上なら設置義務あり', () => {
    const input = createMockInput({ buildingUse: ref('item04'), groundFloors: ref(2), totalArea: ref(3500) });
    const { regulationResult } = useArticle12Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain('令第12条第1項第4号');
  });

  it('指定可燃物を基準数量の1000倍以上貯蔵している場合、設置義務あり', () => {
    const input = createMockInput({ buildingUse: ref('item01'), isCombustiblesAmountOver1000: ref(true) });
    const { regulationResult } = useArticle12Logic(input);
    expect(regulationResult.value.required).toBe(true);
    expect(regulationResult.value.basis).toContain('令第12条第1項第8号');
  });
});
