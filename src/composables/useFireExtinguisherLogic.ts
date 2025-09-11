import { computed } from 'vue';
import type { Ref } from 'vue';
import type { BuildingData, Floor } from '@/types';

// Composable関数としてロジックをエクスポート
export function useFireExtinguisherLogic(data: BuildingData) {
  const judgementResult = computed(() => {
    const {
      buildingUse,
      totalFloorAreaInput,
      floors,
      usesFireEquipment,
      storesMinorHazardousMaterials,
      storesDesignatedCombustibles,
    } = data;

    const useCode = buildingUse.value;
    const totalArea = totalFloorAreaInput.value || 0;

    if (!useCode) {
      return { result: false, reason: '建物の用途を選択してください。', 根拠: '－' };
    }

    // --- 第一号 ---
    // イ: (1)項イ, (2)項, (6)項イ(1)~(3), (6)項ロ, (16の2)項, (17)項, (20)項
    const isItem1_i = 
      useCode === 'item01_i' ||
      useCode.startsWith('item02') ||
      ['item06_i_1', 'item06_i_2', 'item06_i_3'].includes(useCode) ||
      useCode.startsWith('item06_ro') ||
      useCode === 'item16_2' ||
      useCode === 'item17' ||
      useCode === 'item20';
    if (isItem1_i) {
      return { result: true, reason: `用途（${useCode}）により、消火器の設置が必要です。`, 根拠: '令第十条第一項一号イ' };
    }
    // ロ: (3)項で火気設備あり
    if (useCode.startsWith('item03') && usesFireEquipment.value) {
      return { result: true, reason: '（3）項の防火対象物で火気設備等があるため、消火器の設置が必要です。', 根拠: '令第十条第一項一号ロ' };
    }

    // --- 第二号 --- (延べ面積150㎡以上)
    if (totalArea >= 150) {
      // イ: (1)項ロ, (4)項, (5)項, (6)項イ(4), (6)項ハ, (6)項ニ, (9)項, (12)項~(14)項
      const isItem2_i = 
        useCode === 'item01_ro' ||
        useCode === 'item04' ||
        useCode.startsWith('item05') ||
        useCode === 'item06_i_4' ||
        useCode.startsWith('item06_ha') ||
        useCode === 'item06_ni' ||
        useCode.startsWith('item09') ||
        useCode.startsWith('item12') ||
        useCode.startsWith('item13') ||
        useCode === 'item14';
      if (isItem2_i) {
        return { result: true, reason: `延べ面積150㎡以上で、用途（${useCode}）により消火器の設置が必要です。`, 根拠: '令第十条第一項二号イ' };
      }
      // ロ: (3)項で火気設備なし
      if (useCode.startsWith('item03') && !usesFireEquipment.value) {
        return { result: true, reason: '延べ面積150㎡以上の（3）項の防火対象物（火気設備等がない場合）のため、消火器の設置が必要です。', 根拠: '令第十条第一項二号ロ' };
      }
    }

    // --- 第三号 --- (延べ面積300㎡以上)
    if (totalArea >= 300) {
      const isItem3 = 
        useCode === 'item07' ||
        useCode === 'item08' ||
        useCode === 'item10' ||
        useCode === 'item11' ||
        useCode === 'item15';
      if (isItem3) {
        return { result: true, reason: `延べ面積300㎡以上で、用途（${useCode}）により消火器の設置が必要です。`, 根拠: '令第十条第一項三号' };
      }
    }

    // --- 第四号 ---
    if (storesMinorHazardousMaterials.value || storesDesignatedCombustibles.value) {
      let reasonText = '';
      if (storesMinorHazardousMaterials.value) reasonText += '少量危険物';
      if (storesMinorHazardousMaterials.value && storesDesignatedCombustibles.value) reasonText += '・';
      if (storesDesignatedCombustibles.value) reasonText += '指定可燃物';
      return { result: true, reason: `${reasonText}の貯蔵・取り扱いがあるため、消火器の設置が必要です。`, 根拠: '令第十条第一項四号' };
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
        return { result: true, reason: `床面積50㎡以上の特定の階（${floorNames}）があるため、消火器の設置が必要です。`, 根拠: '令第十条第一項五号' };
    }

    return { result: false, reason: '消火器の設置義務はありません。', 根拠: '－' };
  });

  return {
    judgementResult,
  };
}
