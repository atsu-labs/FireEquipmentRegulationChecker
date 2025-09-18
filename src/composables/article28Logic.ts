
import { computed, type Ref } from 'vue';
import { useCodeMatches } from '@/composables/utils';
import type { JudgementResult, Floor } from '@/types';

export interface Article28UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  hasStageArea: Ref<boolean>;
  stageArea: Ref<number | null>;
  floors: Ref<Floor[]>;
}

export function useArticle28Logic(userInput: Article28UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      totalArea,
      hasStageArea,
      stageArea,
      floors,
    } = userInput;

    const use = buildingUse.value;
    const currentTotalArea = totalArea.value ?? 0;

    if (!use) {
      return { required: false, message: '建物の用途を選択してください。', basis: '-' };
    }

    // --- 第1号のチェック ---
    if (useCodeMatches(use, ['item16_2']) && currentTotalArea >= 1000) {
      return {
        required: true,
        message: `用途が（16の2）項で延べ面積が1,000㎡以上のため、排煙設備の設置が必要です。`,
        basis: '令第28条第1号',
      };
    }

    // --- 第2号のチェック ---
    if (useCodeMatches(use, ['item01']) && hasStageArea.value) {
        const currentStageArea = stageArea.value ?? 0;
        if (currentStageArea >= 500) {
            return {
                required: true,
                message: `用途が（1）項の舞台部で床面積が500㎡以上のため、排煙設備の設置が必要です。`,
                basis: '令第28条第2号',
            };
        } else if (currentStageArea === 0) {
            return { required: 'warning', message: '舞台部の面積が入力されていません。排煙設備の設置義務がある可能性があります。', basis: '令第28条第2号' };
        }
    }

    // --- 第3号のチェック ---
    const para3_uses = ['item02', 'item04', 'item10', 'item13'];
    if (useCodeMatches(use, para3_uses)) {
        const basementOrWindowlessFloors = floors.value.filter(f => f.type === 'basement' || f.isWindowless);
        const totalBasementOrWindowlessArea = basementOrWindowlessFloors.reduce((sum, f) => sum + (f.floorArea ?? 0), 0);

        if (totalBasementOrWindowlessArea >= 1000) {
            return {
                required: true,
                message: `用途が（2）項、（4）項、（10）項又は（13）項の地階又は無窓階で床面積が1,000㎡以上のため、排煙設備の設置が必要です。`,
                basis: '令第28条第3号',
            };
        } else if (totalBasementOrWindowlessArea === 0 && basementOrWindowlessFloors.length > 0) {
            return { required: 'warning', message: '地階または無窓階の床面積が入力されていません。排煙設備の設置義務がある可能性があります。', basis: '令第28条第3号' };
        }
    }

    return { required: false, message: '排煙設備の設置義務はありません。', basis: '-' };
  });

  return {
    regulationResult,
  };
}
