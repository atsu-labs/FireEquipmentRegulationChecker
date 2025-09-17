import { computed, type Ref } from 'vue';
import type { Floor, JudgementResult } from '@/types';
import { useCodeMatches } from '@/composables/utils';

export interface Article21_2UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  floors: Ref<Floor[]>;
  hasHotSpringFacility: Ref<boolean>;
  isHotSpringFacilityConfirmed: Ref<boolean>;
}

export function useArticle21_2Logic(userInput: Article21_2UserInput) {
  const result = computed((): JudgementResult => {
    const { buildingUse, totalArea, floors, hasHotSpringFacility, isHotSpringFacilityConfirmed } = userInput;
    const area = totalArea.value || 0;

    // 1号
    if (useCodeMatches(buildingUse.value, ['item16_2']) && area >= 1000) {
      return { required: true, message: '延べ面積1000㎡以上の(16の2)項に該当するため、設置が必要です。', basis: '令第21条の2第1項第1号' };
    }

    // 2号
    if (useCodeMatches(buildingUse.value, ['item16_3']) && area >= 1000) {
      return { 
        required: 'warning', 
        message: '延べ面積1000㎡以上の(16の3)項の建物です。特定用途部分の面積合計が500㎡以上の場合は設置義務があります。', 
        basis: '令第21条の2第1項第2号' 
      };
    }

    // 3号
    if (hasHotSpringFacility.value && !isHotSpringFacilityConfirmed.value) {
        return { 
            required: 'warning', 
            message: '温泉の採取のための設備があり、温泉法の確認を受けていない場合、収容人員によっては設置義務が発生します。', 
            basis: '令第21条の2第1項第3号' 
        };
    }

    // 4号
    const item4Codes = ['item01', 'item02', 'item03', 'item04', 'item05_i', 'item06', 'item09_i'];
    const basementArea = floors.value
      .filter(f => f.type === 'basement')
      .reduce((sum, f) => sum + (f.floorArea || 0), 0);

    if (useCodeMatches(buildingUse.value, item4Codes) && basementArea >= 1000) {
        if (hasHotSpringFacility.value) { // 3号に該当する場合はそちらを優先
            // No-op, fall through to default
        } else {
            return { required: true, message: `特定用途の地階の床面積合計が1000㎡以上のため、設置が必要です。`, basis: '令第21条の2第1項第4号' };
        }
    }

    // 5号
    if (useCodeMatches(buildingUse.value, ['item16_i']) && basementArea >= 1000) {
        if (hasHotSpringFacility.value) { // 3号に該当する場合はそちらを優先
            // No-op, fall through to default
        } else {
            return { 
                required: 'warning', 
                message: '(16)項イの地階の床面積合計が1000㎡以上です。特定用途部分の面積合計が500㎡以上の場合は設置義務があります。', 
                basis: '令第21条の2第1項第5号' 
            };
        }
    }

    return {
      required: false,
      message: 'ガス漏れ火災警報設備の設置義務の条件に該当しません。',
      basis: '',
    };
  });

  return {
    result,
  };
}
