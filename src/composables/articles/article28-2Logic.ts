
import { computed } from 'vue';
import type { Article28_2UserInput ,JudgementResult } from '@/types';
import { useCodeMatches } from '@/composables/utils';
import { getUseDisplayName } from '@/composables/utils';

// 令第28条の2の対象となる用途コードのリスト
const TARGET_USE_CODES = [
  'annex01', // (1)項
  'annex02', // (2)項
  'annex03', // (3)項
  'annex04', // (4)項
  'annex05', // (5)項
  'annex06', // (6)項
  'annex07', // (7)項
  'annex08', // (8)項
  'annex09', // (9)項
  'annex10', // (10)項
  'annex11', // (11)項
  'annex12', // (12)項
  'annex13', // (13)項
  'annex14', // (14)項
  'annex15', // (15)項
  'annex16_2', // (16の2)項
  'annex17', // (17)項
];

export function useArticle28_2Logic(userInput: Article28_2UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, totalFloorAreaInput, floors } = userInput;
    const useCode = buildingUse.value;

    if (!useCode) {
      return { required: false, message: '建物の用途を選択してください。', basis: '－' };
    }

    // 対象用途かどうかを判定
    const isTargetUse = useCodeMatches(useCode, TARGET_USE_CODES);
    if (!isTargetUse) {
      return { required: false, message: '連結散水設備の設置義務はありません。', basis: '対象外の用途' };
    }

    const useDisplayName = getUseDisplayName(useCode);

    // (16の2)項の場合: 延べ面積で判定
    if (useCode === 'annex16_2') {
      const totalArea = totalFloorAreaInput.value || 0;
      if (totalArea >= 700) {
        return {
          required: true,
          message: `用途（${useDisplayName}）であり、延べ面積が700㎡以上（${totalArea}㎡）のため、連結散水設備の設置が必要です。`,
          basis: '令第二十八条の二',
        };
      }
    } else {
      // その他の対象用途の場合: 地階の床面積合計で判定
      const basementFloorArea = floors.value
        .filter(f => f.type === 'basement')
        .reduce((sum, f) => sum + (f.floorArea || 0), 0);

      if (basementFloorArea >= 700) {
        return {
          required: true,
          message: `用途（${useDisplayName}）であり、地階の床面積の合計が700㎡以上（${basementFloorArea}㎡）のため、連結散水設備の設置が必要です。`,
          basis: '令第二十八条の二',
        };
      }
    }

    return { required: false, message: '連結散水設備の設置義務はありません。', basis: '－' };
  });

  return {
    regulationResult,
  };
}
