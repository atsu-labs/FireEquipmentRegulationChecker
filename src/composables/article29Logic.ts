import { computed } from 'vue';
import type { BuildingData, JudgementResult } from '@/types';
import { buildingUses } from '@/data/buildingUses';

// 用途コードから表示名を取得する関数
function getUseDisplay(code: string): string {
  const found = buildingUses.find(u => u.annexedCode === code);
  return found ? found.annexedName : code;
}

export function Article29Logic(data: BuildingData) {
  const judgementResult = computed((): JudgementResult => {
    const {
      buildingUse,
      totalFloorAreaInput,
      floors,
      hasRoadPart, // 追加したプロパティ
    } = data;

    const useCode = buildingUse.value;
    const totalArea = totalFloorAreaInput.value || 0;
    const totalFloorsAboveGround = floors.value.filter(f => f.type === 'ground').length; // 地上階数

    if (!useCode) {
      return { required: false, message: '建物の用途を選択してください。', basis: '－' };
    }

    const useDisplay = getUseDisplay(useCode);

    // --- 第一号: 地階を除く階数が7以上の建築物 ---
    if (totalFloorsAboveGround >= 7) {
      return { required: true, message: `地階を除く階数が7以上（${totalFloorsAboveGround}階）のため、連結送水管の設置が必要です。`, basis: '令第二十九条第一号' };
    }

    // --- 第二号: 地階を除く階数が5以上で、延べ面積が6,000平方メートル以上の建築物 ---
    if (totalFloorsAboveGround >= 5 && totalArea >= 6000) {
      return { required: true, message: `地階を除く階数が5以上（${totalFloorsAboveGround}階）かつ延べ面積が6,000㎡以上（${totalArea}㎡）のため、連結送水管の設置が必要です。`, basis: '令第二十九条第二号' };
    }

    // --- 第三号: 別表第一（十六の二）項に掲げる防火対象物で、延べ面積が1,000平方メートル以上のもの（地下街） ---
    if (useCode === 'item16_2' && totalArea >= 1000) {
      return { required: true, message: `用途（${useDisplay}）で延べ面積が1,000㎡以上（${totalArea}㎡）のため、連結送水管の設置が必要です。`, basis: '令第二十九条第三号' };
    }

    // --- 第四号: 別表第一（十八）項に掲げる防火対象物（延長50メートル以上のアーケード） ---
    if (useCode === 'item18') {
      return { required: true, message: `用途（${useDisplay}）のため、連結送水管の設置が必要です。`, basis: '令第二十九条第四号' };
    }

    // --- 第五号: 道路の用に供される部分を有するもの ---
    if (hasRoadPart.value) {
      return { required: true, message: `道路の用に供される部分を有するため、連結送水管の設置が必要です。`, basis: '令第二十九条第五号' };
    }

    return { required: false, message: '連結送水管の設置義務はありません。', basis: '－' };
  });

  return {
    judgementResult,
  };
}
