
import { computed } from 'vue';
import type { Article10UserInput, JudgementResult } from '@/types';
import { getUseDisplayName, useCodeMatches } from '@/composables/utils';

// Composable関数としてロジックをエクスポート
export function useArticle10Logic(userInput: Article10UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      totalFloorAreaInput,
      floors,
      usesFireEquipment,
      storesMinorHazardousMaterials,
      storesDesignatedCombustibles,
    } = userInput;

    const useCode = buildingUse.value;
    
    if (!useCode) {
      return { required: false, message: '建物の用途を選択してください。', basis: '－' };
    }
    
  const useDisplay = getUseDisplayName(useCode);
    const totalArea = totalFloorAreaInput.value || 0;

    // --- 第一号 ---
    // イ: (1)項イ, (2)項, (6)項イ(1)~(3), (6)項ロ, (16の2)項, (17)項, (20)項
    const item1Codes = [
      'item01_i', 'item02', 'item06_i_1', 'item06_i_2', 'item06_i_3', 'item06_ro', 'item16_2', 'item17', 'item20'
    ];
    if (useCodeMatches(useCode, item1Codes)) {
      return { required: true, message: `用途（${useDisplay}）により、消火器の設置が必要です。`, basis: '令第十条第一項一号イ' };
    }
  // ロ: (3)項で火気設備あり
  if (useCodeMatches(useCode, ['item03']) && usesFireEquipment.value) {
      return { required: true, message: '（3）項の防火対象物で火気設備等があるため、消火器の設置が必要です。', basis: '令第十条第一項一号ロ' };
    }

    // --- 第二号 --- (延べ面積150㎡以上)
    if (totalArea >= 150) {
      // イ: (1)項ロ, (4)項, (5)項, (6)項イ(4), (6)項ハ, (6)項ニ, (9)項, (12)項~(14)項
      const item2Codes = [
        'item01_ro', 'item04', 'item05', 'item06_i_4', 'item06_ha', 'item06_ni', 'item09', 'item12', 'item13', 'item14'
      ];
      if (useCodeMatches(useCode, item2Codes)) {
        return { required: true, message: `延べ面積150㎡以上で、用途（${useDisplay}）により消火器の設置が必要です。`, basis: '令第十条第一項二号イ' };
      }
  // ロ: (3)項で火気設備なし
  if (useCodeMatches(useCode, ['item03']) && !usesFireEquipment.value) {
        return { required: true, message: '延べ面積150㎡以上の（3）項の防火対象物（火気設備等がない場合）のため、消火器の設置が必要です。', basis: '令第十条第一項二号ロ' };
      }
    }

    // --- 第三号 --- (延べ面積300㎡以上)
    if (totalArea >= 300) {
      const item3Codes = ['item07', 'item08', 'item10', 'item11', 'item15'];
      if (useCodeMatches(useCode, item3Codes)) {
        return { required: true, message: `延べ面積300㎡以上で、用途（${useDisplay}）により消火器の設置が必要です。`, basis: '令第十条第一項三号' };
      }
    }

    // --- 第四号 ---
    if (storesMinorHazardousMaterials.value || storesDesignatedCombustibles.value) {
      let reasonText = '';
      if (storesMinorHazardousMaterials.value) reasonText += '少量危険物';
      if (storesMinorHazardousMaterials.value && storesDesignatedCombustibles.value) reasonText += '・';
      if (storesDesignatedCombustibles.value) reasonText += '指定可燃物';
      return { required: true, message: `${reasonText}の貯蔵・取り扱いがあるため、消火器の設置が必要です。`, basis: '令第十条第一項四号' };
    }

    // --- 第五号 ---
    const applicableFloors = floors.value.filter(floor => {
        const floorArea = floor.floorArea || 0;
        if (floorArea < 50) return false;
        if (floor.type === 'basement') return true;
        if (floor.isWindowless) return true;
        if (floor.type === 'ground' && floor.level >= 3) return true;
        return false;
    });

    if (applicableFloors.length > 0) {
        const floorNames = applicableFloors.map(f => `${f.type === 'ground' ? '地上' : '地下'}${f.level}階`).join(', ');
        return { required: true, message: `床面積50㎡以上の特定の階（${floorNames}）があるため、消火器の設置が必要です。`, basis: '令第十条第一項五号' };
    }

    return { required: false, message: '消火器の設置義務はありません。', basis: '－' };
  });

  return {
    regulationResult,
  };
}
