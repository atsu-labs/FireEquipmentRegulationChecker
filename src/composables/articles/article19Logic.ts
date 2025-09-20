
import { computed} from 'vue';
import { useCodeMatches } from '@/composables/utils';
import type { JudgementResult, Article19UserInput } from '@/types';

export function useArticle19Logic(userInput: Article19UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, groundFloors, floors, buildingStructure, hasMultipleBuildingsOnSite } = userInput;

    const use = buildingUse.value;
    if (!use) {
      return { required: false, message: '建物の用途を選択してください。', basis: '-' };
    }

    // (16)項、(16の2)項、(16の3)項、(17)項、(18)項は対象外 (JSONでは17,18は対象だが、一般的に除外されるケースが多いので要確認。ここではJSONに従う)
    // Note: JSONには(17),(18)が含まれるが、多くの実務では除外される。ここではJSONの定義通りとする。
    const excludedUses = ['item16', 'item16_2', 'item16_3'];
    if (useCodeMatches(use, excludedUses)) {
      return { required: false, message: 'この用途は屋外消火栓設備の設置義務の対象外です。', basis: '令第19条第1項' };
    }

    if (hasMultipleBuildingsOnSite.value) {
        return {
            required: 'warning',
            message: '【要確認】同一敷地内に複数の建物がある場合、それらの位置関係や構造によっては、床面積を合算して判断する必要があります（令第19条第2項）。専門家にご確認ください。',
            basis: '令第19条第2項',
        };
    }

    const structure = buildingStructure.value;
    if (!structure) {
        return { required: 'warning', message: '建物の耐火性能を選択してください。', basis: '令第19条第1項' };
    }

    let targetArea = 0;
    const floor1 = floors.value.find(f => f.type === 'ground' && f.level === 1);
    const floor2 = floors.value.find(f => f.type === 'ground' && f.level === 2);

    if (groundFloors.value === 1) {
        targetArea = floor1?.floorArea ?? 0;
    } else if (groundFloors.value >= 2) {
        targetArea = (floor1?.floorArea ?? 0) + (floor2?.floorArea ?? 0);
    }

    if (targetArea === 0) {
        return { required: 'warning', message: '1階または2階の床面積が入力されていません。', basis: '令第19条第1項' };
    }

    const thresholds = {
        'fire-resistant': 9000,
        'quasi-fire-resistant': 6000,
        'other': 3000,
    };

    const threshold = thresholds[structure];

    if (targetArea >= threshold) {
        return {
            required: true,
            message: `建物の構造（${structure}）における基準面積（${threshold}㎡）以上（対象面積: ${targetArea.toFixed(2)}㎡）のため、設置が必要です。`,
            basis: '令第19条第1項',
        };
    }

    return { required: false, message: '屋外消火栓設備の設置義務はありません。', basis: '-' };
  });

  return {
    regulationResult,
  };
}
