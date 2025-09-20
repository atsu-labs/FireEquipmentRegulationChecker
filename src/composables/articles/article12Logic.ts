

import { computed } from 'vue';
import type { Article12UserInput, JudgementResult } from '@/types';
import { getUseDisplayName, useCodeMatches } from '@/composables/utils';


// Composable関数
export function useArticle12Logic(userInput: Article12UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      groundFloors,
      totalArea: totalAreaRef,
      floors,
      isCareDependentOccupancy,
      hasStageArea,
      stageFloorLevel,
      stageArea: stageAreaRef,
      isRackWarehouse,
      ceilingHeight: ceilingHeightRef,
      isCombustiblesAmountOver1000,
      hasFireSuppressingStructure,
      hasBeds,
    } = userInput;

    const useCode = buildingUse.value;
    if (!useCode) {
      return { required: false, message: '建物の用途を選択してください。', basis: '-' };
    }

    const useDisplay = getUseDisplayName(useCode);
    const totalArea = totalAreaRef.value || 0;

    // --- 令第12条第1項 ---

    // 第三号: 11階建て以上
    if (groundFloors.value >= 11) {
    const applicableUses = ['item01', 'item02', 'item03', 'item04', 'item05_i', 'item06', 'item09_i', 'item16_i'];
    if (useCodeMatches(useCode, applicableUses)) {
            return {
                required: true,
                message: `地階を除く階数が11以上であり、用途（${useDisplay}）が令第12条第1項第3号に該当するため、設置が必要です。`,
                basis: '令第12条第1項第3号',
            };
        }
    }
    
    // 第十二号: 11階以上の階
    const hasFloorOver11 = floors.value.some(f => f.type === 'ground' && f.level >= 11);
    if (hasFloorOver11) {
        return {
            required: true,
            message: '11階以上の階が存在するため、その階に設置が必要です。',
            basis: '令第12条第1項第12号',
        };
    }

    // 第一号: 避難困難施設等
    if (!hasFireSuppressingStructure.value) {
        // イ: (6)項イ(1)及び(2)
    if (useCodeMatches(useCode, ['item06_i_1', 'item06_i_2'])) {
            if (!(useCode.startsWith('item06_i_2') && !hasBeds.value)) {
                 return {
                    required: true,
                    message: `用途（${useDisplay}）で、延焼抑制構造でないため、設置が必要です。`,
                    basis: '令第12条第1項第1号イ',
                };
            }
        }
        // ロ: (6)項ロ(1)及び(3)
    if (useCodeMatches(useCode, ['item06_ro_1', 'item06_ro_3'])) {
            return {
                required: true,
                message: `用途（${useDisplay}）で、延焼抑制構造でないため、設置が必要です。`,
                basis: '令第12条第1項第1号ロ',
            };
        }
        // ハ: (6)項ロ(2),(4),(5)
    if (useCodeMatches(useCode, ['item06_ro_2', 'item06_ro_4', 'item06_ro_5'])) {
            // 介助が必要な者が入所する施設の場合、面積に関わらず設置義務あり
            if (isCareDependentOccupancy.value) {
                return {
                    required: true,
                    message: `用途（${useDisplay}）で、介助がなければ避難できない者を主として入所させる施設であり、かつ延焼抑制構造でないため、設置が必要です。`,
                    basis: '令第12条第1項第1号ハ',
                };
            }
            // それ以外の施設の場合、延べ面積が275㎡以上で設置義務あり
            if (!isCareDependentOccupancy.value && totalArea >= 275) {
                return {
                    required: true,
                    message: `用途（${useDisplay}）で、介助がなければ避難できない者を主として入所させるもの以外で延べ面積が275㎡以上、かつ延焼抑制構造でないため、設置が必要です。`,
                    basis: '令第12条第1項第1号ハ',
                };
            }
        }
    }

    // 第二号: 劇場等の舞台部
    if (useCodeMatches(useCode, ['item01']) && hasStageArea.value) {
        const stageArea = stageAreaRef.value || 0;
        if (stageFloorLevel.value === 'basement_windowless_4th_or_higher' && stageArea >= 300) {
            return {
                required: true,
                message: `劇場等で、地階・無窓階・4階以上の階にある舞台部の面積が300㎡以上のため、設置が必要です。`,
                basis: '令第12条第1項第2号',
            };
        }
        if (stageFloorLevel.value === 'other' && stageArea >= 500) {
            return {
                required: true,
                message: `劇場等で、舞台部の面積が500㎡以上のため、設置が必要です。`,
                basis: '令第12条第1項第2号',
            };
        }
    }

    // 第四号: 大規模な平屋建て以外の建物
    if (groundFloors.value + (floors.value.some(f => f.type === 'basement') ? 1 : 0) > 1) { // 平屋建てでない
        const area3000Uses = ['item04', 'item06_i_1', 'item06_i_2', 'item06_i_3'];
        const area6000Uses = ['item01', 'item02', 'item03', 'item05_i', 'item06', 'item09_i']; // (4)項と(6)項イ(1-3)を除く

        if (useCodeMatches(useCode, area3000Uses) && totalArea >= 3000) {
             return {
                required: true,
                message: `平屋建て以外の建物で、用途（${useDisplay}）が令第12条第1項第4号の特定用途に該当し、床面積の合計が3000㎡以上のため、設置が必要です。`,
                basis: '令第12条第1項第4号',
            };
        }
        if (useCodeMatches(useCode, area6000Uses) && !useCodeMatches(useCode, area3000Uses) && totalArea >= 6000) {
             return {
                required: true,
                message: `平屋建て以外の建物で、床面積の合計が6000㎡以上のため、設置が必要です。`,
                basis: '令第12条第1項第4号',
            };
        }
    }

    // 第五号: ラック式倉庫
    if (useCodeMatches(useCode, ['item14']) && isRackWarehouse.value) {
        const ceilingHeight = ceilingHeightRef.value || 0;
        if (ceilingHeight > 10 && totalArea >= 700) {
            return {
                required: true,
                message: `ラック式倉庫で、天井の高さが10mを超え、延べ面積が700㎡以上のため、設置が必要です。`,
                basis: '令第12条第1項第5号',
            };
        }
    }

    // 八号: 指定可燃物1000倍以上
    if (isCombustiblesAmountOver1000.value) {
        return {
            required: true,
            message: '指定可燃物を基準数量の1000倍以上、貯蔵または取り扱っているため、設置が必要です。',
            basis: '令第12条第1項第8号',
        };
    }

    // 第六号: (16の2)項で延べ面積1000㎡以上
    if (useCodeMatches(useCode, ['item16_2']) && totalArea >= 1000) {
        return {
            required: true,
            message: `用途（${useDisplay}）が（16の2）項で、延べ面積が1000㎡以上のため、設置が必要です。`,
            basis: '令第12条第1項第6号',
        };
    }

    // --- 判定に詳細情報が必要な項目 ---

    // 第七号: (16の3)項
    if (useCodeMatches(useCode, ['item16_3']) && totalArea >= 1000) {
        return {
            required: 'warning',
            message: '【要確認】この建物は(16の3)項の複合用途建築物で、延べ面積が1000㎡以上です。特定の用途（(1)～(4)項、(5)項イ、(6)項、(9)項イ）に供される部分の床面積の合計が500㎡以上の場合、スプリンクラー設備の設置が必要になる可能性があります。',
            basis: '令第12条第1項第7号',
        };
    }

    // 第十号: (16)項イ
    const isItem16i = useCodeMatches(useCode, ['item16_i']);
    if (isItem16i && totalArea >= 3000) {
         return {
            required: 'warning',
            message: '【要確認】この建物は(16)項イの複合用途建築物です。特定の用途（(1)～(4)項、(5)項イ、(6)項、(9)項イ）に供される部分の床面積の合計が3000㎡以上の場合、その部分が存する階にスプリンクラー設備の設置が必要になる可能性があります。',
            basis: '令第12条第1項第10号',
        };
    }
    
    // 第十一号: 地階・無窓階・4-10階
    const hasApplicableFloor = floors.value.some(f => 
        f.type === 'basement' || 
        f.isWindowless || 
        (f.type === 'ground' && f.level >= 4 && f.level <= 10)
    );
    if (hasApplicableFloor) {
        const item11Uses = ['item01', 'item02', 'item03', 'item04', 'item05_i', 'item06', 'item09_i', 'item16_i'];
        if (useCodeMatches(useCode, item11Uses)) {
            return {
                required: 'warning',
                message: '【要確認】この建物には地階、無窓階、または4階～10階の階が存在します。これらの階の床面積や、建物全体の用途によっては、スプリンクラー設備の設置が必要になる可能性があります（令第12条第1項第11号）。',
                basis: '令第12条第1項第11号',
            };
        }
    }

    return { required: false, message: 'スプリンクラー設備の設置義務はありません。', basis: '-' };
  });

  return {
    regulationResult,
  };
}
