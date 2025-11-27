import { computed} from 'vue';
import type { JudgementResult,Article23UserInput } from '@/types';
import { useCodeMatches, getUseDisplayName } from '@/composables/utils';


export function useArticle23Logic(userInput: Article23UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, totalArea } = userInput;

    const useName = getUseDisplayName(buildingUse.value);
    const area = totalArea.value || 0;

    let isRequired = false;
    let basis = '';

    // 1号
    const item1Codes = ['annex06_i_1', 'annex06_i_2', 'annex06_i_3', 'annex06_ro', 'annex16_2', 'annex16_3'];
    if (useCodeMatches(buildingUse.value, item1Codes)) {
      isRequired = true;
      basis = '令第23条第1項第1号';
    }

    // 2号
    const item2Codes = ['annex01', 'annex02', 'annex04', 'annex05_i', 'annex06_i_4', 'annex06_ha', 'annex06_ni', 'annex12', 'annex17'];
    if (!isRequired && useCodeMatches(buildingUse.value, item2Codes) && area >= 500) {
      isRequired = true;
      basis = '令第23条第1項第2号';
    }

    // 3号
    const item3Codes = ['annex03', 'annex05_ro', 'annex07', 'annex08', 'annex09', 'annex10', 'annex11', 'annex13', 'annex14', 'annex15'];
    if (!isRequired && useCodeMatches(buildingUse.value, item3Codes) && area >= 1000) {
      isRequired = true;
      basis = '令第23条第1項第3号';
    }

    if (isRequired) {
      // 電話で代替できない高リスク用途
      const nonAlternativeCodes = ['annex06_i_1', 'annex06_i_2', 'annex06_i_3', 'annex06_ro', 'annex05_i', 'annex06_i_4', 'annex06_ha'];
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
    regulationResult,
  };
}
