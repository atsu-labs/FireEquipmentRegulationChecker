import { computed } from 'vue';
import type { Ref } from 'vue';
import { buildingUses } from '@/data/buildingUses';
import type { Article11UserInput } from '@/types';

// 用途コードから表示名を取得する関数
function getUseDisplay(code: string | null): string {
  if (!code) return '未選択';
  const found = buildingUses.find(u => u.annexedCode === code);
  return found ? found.annexedName : code;
}

// 用途コードが指定された項番グループに属するかチェック
function checkUseGroup(useCode: string, groups: string[]): boolean {
    return groups.some(group => useCode.startsWith(group));
}

// Composable関数
export function useArticle11Logic(userInput: Article11UserInput) {
  const regulationResult = computed(() => {
    const buildingUse = userInput.buildingUse.value;
    if (!buildingUse) {
      return { required: false, message: '建物の用途を選択してください。', basis: '-' };
    }

    const useDisplay = getUseDisplay(buildingUse);

    // --- 令第11条第2項: 面積要件の緩和係数 ---
    let areaMultiplier = 1;
    let multiplierDescription = '';
    if (userInput.structureType.value === 'A' && userInput.finishType.value === 'flammable') {
      areaMultiplier = 3;
      multiplierDescription = '（特定主要構造部が耐火構造かつ仕上げが難燃材料のため、面積要件を3倍で計算）';
    } else if (
      (userInput.structureType.value === 'A' && userInput.finishType.value !== 'flammable') ||
      (userInput.structureType.value === 'B' && userInput.finishType.value === 'flammable')
    ) {
      areaMultiplier = 2;
      multiplierDescription = '（構造・仕上げの条件により、面積要件を2倍で計算）';
    }

    const currentTotalArea = userInput.totalArea.value || 0;
    let isAlreadyApplicable = false;
    let totalAreaRuleInfo: { requiredArea: number; basis: string } | null = null;

    // --- 令第11条第1項の各号をチェック ---
    const group2 = ['item02', 'item03', 'item04', 'item05', 'item06', 'item07', 'item08', 'item09', 'item10', 'item12', 'item14'];

    // 一号: (1)項 → 延べ面積 500㎡以上
    if (checkUseGroup(buildingUse, ['item01'])) {
      const requiredArea = 500 * areaMultiplier;
      totalAreaRuleInfo = { requiredArea, basis: '令第11条第1項第1号' };
      if (currentTotalArea >= requiredArea) {
        isAlreadyApplicable = true;
        return {
          required: true,
          message: `用途（${useDisplay}）が（1）項に該当し、延べ面積が${currentTotalArea.toFixed(2)}㎡（≧ ${requiredArea}㎡）のため、設置が必要です。${multiplierDescription}`,
          basis: `令第11条第1項第1号`,
        };
      }
    }
    // 二号: (2)～(10)項, (12)項, (14)項 → 延べ面積 700㎡以上
    //TODO: 第十二条第一項第一号に掲げる防火対象物{(6)イ(1),(2),(6)ロ}の２倍または３倍と1000㎡のいずれか小さい数値とするの処理を追加
    else if (checkUseGroup(buildingUse, group2)) {
        const requiredArea = 700 * areaMultiplier;
        totalAreaRuleInfo = { requiredArea, basis: '令第11条第1項第2号' };
        if (currentTotalArea >= requiredArea) {
            isAlreadyApplicable = true;
            return {
                required: true,
                message: `用途（${useDisplay}）が（2）～（10）項等のいずれかに該当し、延べ面積が${currentTotalArea.toFixed(2)}㎡（≧ ${requiredArea}㎡）のため、設置が必要です。${multiplierDescription}`,
                basis: `令第11条第1項第2号`,
            };
        }
    }
    // 三号: (11)項, (15)項 → 延べ面積 1000㎡以上
    else if (checkUseGroup(buildingUse, ['item11', 'item15'])) {
        const requiredArea = 1000 * areaMultiplier;
        totalAreaRuleInfo = { requiredArea, basis: '令第11条第1項第3号' };
        if (currentTotalArea >= requiredArea) {
            isAlreadyApplicable = true;
            return {
                required: true,
                message: `用途（${useDisplay}）が（11）項または（15）項に該当し、延べ面積が${currentTotalArea.toFixed(2)}㎡（≧ ${requiredArea}㎡）のため、設置が必要です。${multiplierDescription}`,
                basis: `令第11条第1項第3号`,
            };
        }
    }
    // 四号: (16の2)項 → 延べ面積 150㎡以上
    else if (checkUseGroup(buildingUse, ['item16_2'])) {
        const requiredArea = 150 * areaMultiplier;
        totalAreaRuleInfo = { requiredArea, basis: '令第11条第1項第4号' };
        if (currentTotalArea >= requiredArea) {
            isAlreadyApplicable = true;
            return {
                required: true,
                message: `用途（${useDisplay}）が（16の2）項に該当し、延べ面積が${currentTotalArea.toFixed(2)}㎡（≧ ${requiredArea}㎡）のため、設置が必要です。${multiplierDescription}`,
                basis: `令第11条第1項第4号`,
            };
        }
    }

    // 五号: 指定可燃物を750倍以上
    if (userInput.storesFlammableItems.value && userInput.isFlammableItemsAmountOver750.value) {
      return {
        required: true,
        message: '指定可燃物を基準数量の750倍以上、貯蔵または取り扱っているため、設置が必要です。',
        basis: '令第11条第1項第5号',
      };
    }

    // 六号: 地階・無窓階・4階以上の階の床面積
    if (!isAlreadyApplicable) {
        let requiredFloorArea = 0;
        
        if (checkUseGroup(buildingUse, ['item01'])) {
            requiredFloorArea = 100 * areaMultiplier;
        } else if (checkUseGroup(buildingUse, group2)) { // group2は二号と同じ
            requiredFloorArea = 150 * areaMultiplier;
        } else if (checkUseGroup(buildingUse, ['item11', 'item15'])) {
            requiredFloorArea = 200 * areaMultiplier;
        }

        if (requiredFloorArea > 0) {
            const basementArea = userInput.basementArea.value;
            const noWindowFloorArea = userInput.noWindowFloorArea.value;
            const upperFloorsArea = userInput.upperFloorsArea.value;

            if (userInput.hasBasement.value && basementArea >= requiredFloorArea) {
                return {
                    required: true,
                    message: `地階の床面積が${basementArea.toFixed(2)}㎡（≧ ${requiredFloorArea}㎡）のため、設置が必要です。${multiplierDescription}`,
                    basis: '令第11条第1項第6号',
                };
            }
            if (userInput.hasNoWindowFloor.value && noWindowFloorArea >= requiredFloorArea) {
                return {
                    required: true,
                    message: `無窓階の床面積が${noWindowFloorArea.toFixed(2)}㎡（≧ ${requiredFloorArea}㎡）のため、設置が必要です。${multiplierDescription}`,
                    basis: '令第11条第1項第6号',
                };
            }
            if (userInput.hasUpperFloors.value && upperFloorsArea >= requiredFloorArea) {
                return {
                    required: true,
                    message: `4階以上の階の床面積が${upperFloorsArea.toFixed(2)}㎡（≧ ${requiredFloorArea}㎡）のため、設置が必要です。${multiplierDescription}`,
                    basis: '令第11条第1項第6号',
                };
            }
        }
    }

    // --- どの条件にも該当しなかった場合のメッセージ ---
    if (totalAreaRuleInfo) {
      return {
        required: false,
        message: `設置義務はありません。延べ面積 ${currentTotalArea.toFixed(2)}㎡ は、規制対象の ${totalAreaRuleInfo.requiredArea.toFixed(2)}㎡ に達していません。${multiplierDescription}`,
        basis: '-',
      };
    }

    return { required: false, message: '屋内消火栓設備の設置義務はありません。', basis: '-' };
  });

  return {
    regulationResult,
  };
}