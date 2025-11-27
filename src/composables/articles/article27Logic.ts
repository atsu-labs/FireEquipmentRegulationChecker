
import { computed} from 'vue';
import { useCodeMatches } from '@/composables/utils';
import type { JudgementResult, Article27UserInput } from '@/types';

export function useArticle27Logic(userInput: Article27UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      siteArea,
      buildingHeight,
      totalArea,
      groundFloors,
      floors,
      buildingStructure,
    } = userInput;

    const use = buildingUse.value;
    if (!use) {
      return { required: false, message: '建物の用途を選択してください。', basis: '-' };
    }

    // --- 第2号のチェック（優先） ---
    const height = buildingHeight.value ?? 0;
    const area = totalArea.value ?? 0;
    if (height > 31 && area >= 25000) {
      return {
        required: true,
        message: `建物の高さが31mを超え、延べ面積が25,000㎡以上のため、消防用水の設置が必要です。`,
        basis: '令第27条第2号',
      };
    }

    // --- 第1号のチェック ---
    const excludedUses = ['annex16']; // (16)項は対象外
    if (useCodeMatches(use, excludedUses)) {
        return { required: false, message: 'この用途は令第27条第1号の対象外です。', basis: '令第27条第1号' };
    }

    const currentSiteArea = siteArea.value ?? 0;
    if (currentSiteArea < 20000) {
        return { required: false, message: '敷地面積が20,000㎡未満のため、令第27条第1号の設置義務はありません。', basis: '令第27条第1号' };
    }

    const structure = buildingStructure.value;
    if (!structure) {
        return { required: 'warning', message: '建物の耐火性能を選択してください。', basis: '令第27条第1号' };
    }

    let targetFloorArea = 0;
    const floor1 = floors.value.find(f => f.type === 'ground' && f.level === 1);
    const floor2 = floors.value.find(f => f.type === 'ground' && f.level === 2);

    if (groundFloors.value === 1) {
        targetFloorArea = floor1?.floorArea ?? 0;
    } else if (groundFloors.value >= 2) {
        targetFloorArea = (floor1?.floorArea ?? 0) + (floor2?.floorArea ?? 0);
    }

    if (targetFloorArea === 0) {
        return { required: 'warning', message: '1階または2階の床面積が入力されていません。', basis: '令第27条第1号' };
    }

    const thresholds = {
        'fire-resistant': 15000,
        'quasi-fire-resistant': 10000,
        'other': 5000,
    };
    const threshold = thresholds[structure];

    if (currentSiteArea >= 20000 && targetFloorArea >= threshold) {
        return {
            required: true,
            message: `敷地面積が20,000㎡以上、かつ建物の構造（${structure}）における基準面積（${threshold}㎡）以上（対象面積: ${targetFloorArea.toFixed(2)}㎡）のため、設置が必要です。`,
            basis: '令第27条第1号',
        };
    }

    return { required: false, message: '消防用水の設置義務はありません。', basis: '-' };
  });

  return {
    regulationResult,
  };
}
