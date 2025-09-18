
import { computed, type Ref } from 'vue';
import { useCodeMatches } from '@/composables/utils';
import type { JudgementResult, Floor } from '@/types';

export interface Article26UserInput {
  buildingUse: Ref<string | null>;
  basementFloors: Ref<number>;
  groundFloors: Ref<number>;
  floors: Ref<Floor[]>;
}

export interface Article26Result {
  exitGuideLight: JudgementResult;
  corridorGuideLight: JudgementResult;
  auditoriumGuideLight: JudgementResult;
  guideSign: JudgementResult;
}

const EXEMPTION_MESSAGE = 'ただし、避難が容易であると認められるものとして総務省令で定める場合は免除されます。';

export function useArticle26Logic(userInput: Article26UserInput) {
  const regulationResult = computed((): Article26Result => {
    const { buildingUse, basementFloors, groundFloors, floors } = userInput;
    const use = buildingUse.value;

    const createInitialResult = (message: string): JudgementResult => ({
        required: false,
        message,
        basis: '-',
    });

    if (!use) {
        return {
            exitGuideLight: createInitialResult('建物の用途を選択してください。'),
            corridorGuideLight: createInitialResult('建物の用途を選択してください。'),
            auditoriumGuideLight: createInitialResult('建物の用途を選択してください。'),
            guideSign: createInitialResult('建物の用途を選択してください。'),
        };
    }

    // --- 1. 避難口誘導灯 & 2. 通路誘導灯 ---
    const fullApplicationUses = ['item01', 'item02', 'item03', 'item04', 'item05_i', 'item06', 'item09', 'item16_i', 'item16_2', 'item16_3'];
    const partialApplicationUses = ['item05_ro', 'item07', 'item08', 'item10', 'item11', 'item12', 'item13', 'item14', 'item15', 'item16_ro'];
    const hasBasement = basementFloors.value > 0;
    const hasWindowlessFloor = floors.value.some(f => f.isWindowless);
    const hasFloorOver11 = groundFloors.value >= 11;

    let exitAndCorridorResult: JudgementResult;
    if (useCodeMatches(use, fullApplicationUses)) {
        exitAndCorridorResult = {
            required: true,
            message: `この用途の建物には設置が必要です。${EXEMPTION_MESSAGE}`,
            basis: '令第26条第1項第1号, 第2号',
        };
    } else if (useCodeMatches(use, partialApplicationUses)) {
        if (hasBasement || hasWindowlessFloor || hasFloorOver11) {
            exitAndCorridorResult = {
                required: true,
                message: `この用途の建物では、地階、無窓階、または11階以上の部分に設置が必要です。${EXEMPTION_MESSAGE}`,
                basis: '令第26条第1項第1号, 第2号',
            };
        } else {
            exitAndCorridorResult = createInitialResult('設置義務はありません。');
        }
    } else {
        exitAndCorridorResult = createInitialResult('設置義務はありません。');
    }

    // --- 3. 客席誘導灯 ---
    const auditoriumUses = ['item16_i', 'item16_2'];
    let auditoriumResult: JudgementResult;
    if (useCodeMatches(use, ['item01'])) {
        auditoriumResult = {
            required: true,
            message: `劇場・公会堂など（(1)項）には設置が必要です。${EXEMPTION_MESSAGE}`,
            basis: '令第26条第1項第3号',
        };
    } else if (useCodeMatches(use, auditoriumUses)) {
        auditoriumResult = {
            required: 'warning',
            message: `【要確認】この建物に劇場、映画館、演芸場、公会堂等の用途に供する部分がある場合、その部分に客席誘導灯の設置が必要です。${EXEMPTION_MESSAGE}`,
            basis: '令第26条第1項第3号',
        };
    } else {
        auditoriumResult = createInitialResult('設置義務はありません。');
    }

    // --- 4. 誘導標識 ---
    const signUses = ['item01', 'item02', 'item03', 'item04', 'item05', 'item06', 'item07', 'item08', 'item09', 'item10', 'item11', 'item12', 'item13', 'item14', 'item15', 'item16'];
    let signResult: JudgementResult;
    if (useCodeMatches(use, signUses)) {
        signResult = {
            required: true,
            message: `この用途の建物には設置が必要です。${EXEMPTION_MESSAGE}`,
            basis: '令第26条第1項第4号',
        };
    } else {
        signResult = createInitialResult('設置義務はありません。');
    }

    return {
        exitGuideLight: exitAndCorridorResult,
        corridorGuideLight: exitAndCorridorResult, // 避難口誘導灯と同じ
        auditoriumGuideLight: auditoriumResult,
        guideSign: signResult,
    };
  });

  return {
    regulationResult,
  };
}
