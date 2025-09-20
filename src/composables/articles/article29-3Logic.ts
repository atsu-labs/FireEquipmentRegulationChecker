import { computed } from 'vue';
import type { BuildingData, JudgementResult } from '@/types';
import { buildingUses } from '@/data/buildingUses';

// 用途コードから表示名を取得する関数
function getUseDisplay(code: string): string {
  const found = buildingUses.find(u => u.annexedCode === code);
  return found ? found.annexedName : code;
}

export function useArticle29_3Logic(userInput: BuildingData) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      totalFloorAreaInput,
    } = userInput;

    const useCode = buildingUse.value;
    const totalArea = totalFloorAreaInput.value || 0;

    if (!useCode) {
      return { required: false, message: '建物の用途を選択してください。', basis: '－' };
    }

    const useDisplay = getUseDisplay(useCode);

    // --- 別表第一（十六の二）項に掲げる防火対象物で、延べ面積が1,000平方メートル以上のもの ---
    if (useCode === 'item16_2' && totalArea >= 1000) {
      return { required: true, message: `用途（${useDisplay}）で延べ面積が1,000㎡以上（${totalArea}㎡）のため、無線通信補助設備の設置が必要です。`, basis: '令第二十九条の三' };
    }

    return { required: false, message: '無線通信補助設備の設置義務はありません。', basis: '－' };
  });

  return {
    regulationResult,
  };
}
