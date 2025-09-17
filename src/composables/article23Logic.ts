import { computed, type Ref } from 'vue';
import type { JudgementResult } from '@/types';
import { useCodeMatches, getUseDisplayName } from '@/composables/utils';

export interface Article23UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
}

export function useArticle23Logic(userInput: Article23UserInput) {
  const result = computed((): JudgementResult => {
    const { buildingUse, totalArea } = userInput;

    const useName = getUseDisplayName(buildingUse.value);
    const area = totalArea.value || 0;

    let isRequired = false;
    let basis = '';

    // 1号
    const item1Codes = ['item06_i_1', 'item06_i_2', 'item06_i_3', 'item06_ro', 'item16_2', 'item16_3'];
    if (useCodeMatches(buildingUse.value, item1Codes)) {
      isRequired = true;
      basis = '令第23条第1項第1号';
    }

    // 2号
    const item2Codes = ['item01', 'item02', 'item04', 'item05_i', 'item06_i_4', 'item06_ha', 'item06_ni', 'item12', 'item17'];
    if (!isRequired && useCodeMatches(buildingUse.value, item2Codes) && area >= 500) {
      isRequired = true;
      basis = '令第23条第1項第2号';
    }

    // 3号
    const item3Codes = ['item03', 'item05_ro', 'item07', 'item08', 'item09', 'item10', 'item11', 'item13', 'item14', 'item15'];
    if (!isRequired && useCodeMatches(buildingUse.value, item3Codes) && area >= 1000) {
      isRequired = true;
      basis = '令第23条第1項第3号';
    }

    if (isRequired) {
      // 電話で代替できない高リスク用途
      const nonAlternativeCodes = ['item06_i_1', 'item06_i_2', 'item06_i_3', 'item06_ro', 'item05_i', 'item06_i_4', 'item06_ha'];
      if (useCodeMatches(buildingUse.value, nonAlternativeCodes)) {
        return { required: true, message: `用途（${useName}）が該当するため、設置が必要です。`, basis };
      }

      // 電話で代替可能な場合
      let reason = `用途（${useName}）が該当するため`;
      if (basis === '令第23条第1項第2号') {
        reason = `用途（${useName}）で延べ面積が500㎡以上のため`;
      } else if (basis === '令第23条第1項第3号') {
        reason = `用途（${useName}）で延べ面積が1000㎡以上のため`;
      }

      return { 
        required: 'warning', 
        message: `${reason}設置義務がありますが、消防機関へ常時通報することができる電話を設置することで免除される可能性があります。`, 
        basis: `${basis}、同条第3項`
      };
    }

    return {
      required: false,
      message: '消防機関へ通報する火災報知設備の設置義務の条件に該当しません。',
      basis: '',
    };
  });

  return {
    result,
  };
}
