
import { computed} from 'vue';
import { useCodeMatches } from '@/composables/utils';
import type { JudgementResult, Article26UserInput } from '@/types';

// このファイル内で使用する個別の判定結果
interface IndividualResult {
  required: boolean | 'warning' | 'info';
  message: string;
  basis: string;
}

const EXEMPTION_MESSAGE = 'ただし、避難が容易であると認められるものとして総務省令で定める場合は免除されます。';

export function useArticle26Logic(userInput: Article26UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, groundFloors, floors } = userInput;
    const use = buildingUse.value;

    if (!use) {
      return { required: false, message: '建物の用途を選択してください。', basis: '－' };
    }

    // --- 個別の判定ロジック ---
    const fullApplicationUses = ['annex01', 'annex02', 'annex03', 'annex04', 'annex05_i', 'annex06', 'annex09', 'annex16_i', 'annex16_2', 'annex16_3'];
    const partialApplicationUses = ['annex05_ro', 'annex07', 'annex08', 'annex10', 'annex11', 'annex12', 'annex13', 'annex14', 'annex15', 'annex16_ro'];
    const hasFloorOver11 = groundFloors.value >= 11;

    let exitAndCorridorResult: IndividualResult;
    if (useCodeMatches(use, fullApplicationUses)) {
        exitAndCorridorResult = { required: true, message: `この用途の建物には誘導灯の設置が必要です。${EXEMPTION_MESSAGE}`, basis: '令第26条第1項第1号, 第2号' };
    } else if (useCodeMatches(use, partialApplicationUses)) {
        const parts: string[] = [];
        const basementFloorsList = floors.value
            .filter(f => f.type === 'basement')
            .map(f => `地下${f.level}階`);
        
        const windowlessFloorsList = floors.value
            .filter(f => f.isWindowless)
            .map(f => `${f.level}階（無窓階）`);

        parts.push(...basementFloorsList, ...windowlessFloorsList);

        if (hasFloorOver11) {
            parts.push('11階以上の階');
        }

        if (parts.length > 0) {
            const uniqueParts = [...new Set(parts)];
            const message = `この用途の建物では、${uniqueParts.join('、')}の部分に誘導灯の設置が必要です。${EXEMPTION_MESSAGE}`;
            exitAndCorridorResult = { required: true, message, basis: '令第26条第1項第1号, 第2号' };
        } else {
            exitAndCorridorResult = { required: false, message: '', basis: '' };
        }
    } else {
        exitAndCorridorResult = { required: false, message: '', basis: '' };
    }

    const auditoriumUses = ['annex16_i', 'annex16_2'];
    let auditoriumResult: IndividualResult;
    if (useCodeMatches(use, ['annex01'])) {
        auditoriumResult = { required: true, message: `劇場・公会堂など（(1)項）には設置が必要です。${EXEMPTION_MESSAGE}`, basis: '令第26条第1項第3号' };
    } else if (useCodeMatches(use, auditoriumUses)) {
        auditoriumResult = { required: 'warning', message: `【要確認】この建物に劇場、映画館、演芸場、公会堂等の用途に供する部分がある場合、その部分に客席誘導灯の設置が必要です。${EXEMPTION_MESSAGE}`, basis: '令第26条第1項第3号' };
    } else {
        auditoriumResult = { required: false, message: '', basis: '' };
    }

    const signUses = ['annex01', 'annex02', 'annex03', 'annex04', 'annex05', 'annex06', 'annex07', 'annex08', 'annex09', 'annex10', 'annex11', 'annex12', 'annex13', 'annex14', 'annex15', 'annex16'];
    let signResult: IndividualResult;
    if (useCodeMatches(use, signUses)) {
        signResult = { required: true, message: `この用途の建物には設置が必要です。${EXEMPTION_MESSAGE}`, basis: '令第26条第1項第4号' };
    } else {
        signResult = { required: false, message: '', basis: '' };
    }

    // --- 統合ロジック ---
    const isGuideLightRequired = exitAndCorridorResult.required === true;
    const isAuditoriumRequired = auditoriumResult.required === true;
    const isAuditoriumWarning = auditoriumResult.required === 'warning';
    const isSignRequired = signResult.required === true;

    // 客席誘導灯の確認が必要な場合、全体を warning とする
    if (isAuditoriumWarning) {
        let message = auditoriumResult.message;
        // 誘導灯も必要なら、その旨を追記
        if (isGuideLightRequired) {
            message = `${exitAndCorridorResult.message} ${message}`;
        }
        const basis = new Set<string>();
        if (isGuideLightRequired) basis.add(exitAndCorridorResult.basis);
        basis.add(auditoriumResult.basis);

        return {
            required: 'warning',
            message,
            basis: Array.from(basis).join(', '),
        };
    }

    // 誘導灯が必須の場合 (客席誘導灯の warning はない)
    if (isGuideLightRequired) {
      let message = exitAndCorridorResult.message;
      if (isAuditoriumRequired) { // (1)項の場合
        message += ' また、客席誘導灯も必要です。';
      }
      const basis = new Set<string>();
      basis.add(exitAndCorridorResult.basis);
      if (isAuditoriumRequired) basis.add(auditoriumResult.basis);
      
      return { required: true, message, basis: Array.from(basis).join(', ') };
    }
    
    // 誘導灯・客席誘導灯が不要で、誘導標識が必要な場合
    if (isSignRequired) {
      return { 
        required: 'info', 
        message: '誘導灯の設置義務がなく、特定の用途・構造に該当するため、誘導標識の設置が必要です。', 
        basis: signResult.basis 
      };
    }

    // すべて不要な場合
    return { required: false, message: '誘導灯および誘導標識の設置義務はありません。', basis: '－' };
  });

  return {
    regulationResult,
  };
}
