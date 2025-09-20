import { computed } from 'vue';
import type { Article29_2UserInput, JudgementResult } from '@/types';
import { getUseDisplayName } from '@/composables/utils';

export function useArticle29_2Logic(userInput: Article29_2UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      totalFloorAreaInput,
      floors,
    } = userInput;

    const useCode = buildingUse.value;
    const totalArea = totalFloorAreaInput.value || 0;
    const totalFloorsAboveGround = floors.value.filter(f => f.type === 'ground').length; // 地上階数

    if (!useCode) {
      return { required: false, message: '建物の用途を選択してください。', basis: '－' };
    }

  const useDisplay = getUseDisplayName(useCode);

    // --- 第一号: 別表第一に掲げる建築物で、地階を除く階数が11以上のもの ---
    if (totalFloorsAboveGround >= 11) {
      return { required: true, message: `地階を除く階数が11以上（${totalFloorsAboveGround}階）のため、非常コンセント設備の設置が必要です。`, basis: '令第二十九条の二第一号' };
    }

    // --- 第二号: 別表第一（十六の二）項に掲げる防火対象物で、延べ面積が1,000平方メートル以上のもの ---
    if (useCode === 'item16_2' && totalArea >= 1000) {
      return { required: true, message: `用途（${useDisplay}）で延べ面積が1,000㎡以上（${totalArea}㎡）のため、非常コンセント設備の設置が必要です。`, basis: '令第二十九条の二第二号' };
    }

    return { required: false, message: '非常コンセント設備の設置義務はありません。', basis: '－' };
  });

  return {
    regulationResult,
  };
}
