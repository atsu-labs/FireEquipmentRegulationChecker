import { computed} from 'vue';
import type { JudgementResult ,Article22UserInput} from '@/types';
import { useCodeMatches, getUseDisplayName } from '@/composables/utils';



export function useArticle22Logic(userInput: Article22UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, totalArea, hasSpecialCombustibleStructure, contractedCurrentCapacity } = userInput;

    if (!hasSpecialCombustibleStructure.value) {
      return {
        required: false,
        message: '漏電火災警報器の設置対象となる特殊な構造ではないため、設置義務はありません。',
        basis: '',
      };
    }

    const useName = getUseDisplayName(buildingUse.value);
    const area = totalArea.value || 0;
    const capacity = contractedCurrentCapacity.value || 0;

    // 1号
    if (useCodeMatches(buildingUse.value, ['item17'])) {
      return { required: true, message: `用途（${useName}）が該当するため、設置が必要です。`, basis: '令第22条第1項第1号' };
    }

    // 2号
    if (useCodeMatches(buildingUse.value, ['item05', 'item09']) && area >= 150) {
      return { required: true, message: `用途（${useName}）で延べ面積が150㎡以上のため、設置が必要です。`, basis: '令第22条第1項第2号' };
    }

    // 3号
    const item3Codes = ['item01', 'item02', 'item03', 'item04', 'item06', 'item12', 'item16_2'];
    if (useCodeMatches(buildingUse.value, item3Codes) && area >= 300) {
      return { required: true, message: `用途（${useName}）で延べ面積が300㎡以上のため、設置が必要です。`, basis: '令第22条第1項第3号' };
    }

    // 4号
    const item4Codes = ['item07', 'item08', 'item10', 'item11'];
    if (useCodeMatches(buildingUse.value, item4Codes) && area >= 500) {
      return { required: true, message: `用途（${useName}）で延べ面積が500㎡以上のため、設置が必要です。`, basis: '令第22条第1項第4号' };
    }

    // 5号
    if (useCodeMatches(buildingUse.value, ['item14', 'item15']) && area >= 1000) {
      return { required: true, message: `用途（${useName}）で延べ面積が1000㎡以上のため、設置が必要です。`, basis: '令第22条第1項第5号' };
    }

    // 6号
    if (useCodeMatches(buildingUse.value, ['item16_i']) && area >= 500) {
      return {
        required: 'warning',
        message: '延べ面積500㎡以上の(16)項イの建物です。特定用途部分の面積合計が300㎡以上の場合は設置義務があります。',
        basis: '令第22条第1項第6号',
      };
    }

    // 7号
    const item7Codes = ['item01', 'item02', 'item03', 'item04', 'item05', 'item06', 'item15', 'item16'];
    if (useCodeMatches(buildingUse.value, item7Codes) && capacity > 50) {
      return { required: true, message: `用途（${useName}）で契約電流容量が50Aを超えるため、設置が必要です。`, basis: '令第22条第1項第7号' };
    }

    return {
      required: false,
      message: '漏電火災警報器の設置義務の条件に該当しません。',
      basis: '',
    };
  });

  return {
    regulationResult,
  };
}
