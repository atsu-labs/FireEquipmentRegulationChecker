import { computed, type Ref } from 'vue';
import type { Floor } from '../types';
import { buildingUses } from '../data/buildingUses';

export interface Article21UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  hasLodging: Ref<boolean>;
  floors: Ref<Floor[]>;
  isSpecifiedOneStaircase: Ref<boolean>;
  storesCombustiblesOver500x: Ref<boolean>;
  hasRoadPart: Ref<boolean>;
  roadPartRooftopArea: Ref<number | null>;
  roadPartOtherArea: Ref<number | null>;
  hasParkingPart: Ref<boolean>;
  parkingPartArea: Ref<number | null>;
  canAllVehiclesExitSimultaneously: Ref<boolean>;
  hasTelecomRoomOver500sqm: Ref<boolean>;
}

// annexedCodeから日本語の用途名を取得するヘルパー関数
function getUseDisplayName(code: string | null): string {
  if (!code) return '不明';
  const found = buildingUses.find(u => u.annexedCode === code);
  return found ? found.annexedName : code;
}

// buildingUse(annexedCode)がrequiredCodesのいずれかに前方一致するかを確認するヘルパー関数
const useCodeMatches = (buildingUse: string | null, requiredCodes: string[]): boolean => {
  if (!buildingUse) {
    return false;
  }
  return requiredCodes.some(code => buildingUse.startsWith(code));
};

export function useArticle21Logic(userInput: Article21UserInput) {
  const result = computed((): EquipmentResult => {
    const buildingUse = userInput.buildingUse.value;
    const totalArea = userInput.totalArea.value || 0;
    const hasLodging = userInput.hasLodging.value;
    const floors = userInput.floors.value;
    const useName = getUseDisplayName(buildingUse);
    const isSpecifiedOneStaircase = userInput.isSpecifiedOneStaircase.value;
    const storesCombustiblesOver500x = userInput.storesCombustiblesOver500x.value;
    const hasRoadPart = userInput.hasRoadPart.value;
    const roadPartRooftopArea = userInput.roadPartRooftopArea.value || 0;
    const roadPartOtherArea = userInput.roadPartOtherArea.value || 0;
    const hasParkingPart = userInput.hasParkingPart.value;
    const parkingPartArea = userInput.parkingPartArea.value || 0;
    const canAllVehiclesExitSimultaneously = userInput.canAllVehiclesExitSimultaneously.value;
    const hasTelecomRoomOver500sqm = userInput.hasTelecomRoomOver500sqm.value;

    // --- 第1号 ---
    const item1_i_codes = ['item02_ni', 'item05_i', 'item06_i_1', 'item06_i_2', 'item06_i_3', 'item06_ro', 'item13_ro', 'item17'];
    if (useCodeMatches(buildingUse, item1_i_codes)) {
      return { required: true, message: `用途（${useName}）が該当するため、設置が必要です。`, basis: '令第21条第1項第1号イ' };
    }
    const item1_ro_codes = ['item06_ha'];
    if (useCodeMatches(buildingUse, item1_ro_codes) && hasLodging) {
      return { required: true, message: `用途（${useName}）で宿泊施設等があるため、設置が必要です。`, basis: '令第21条第1項第1号ロ' };
    }

    // --- 第2号 ---
    const item2_codes = ['item09_i'];
    if (useCodeMatches(buildingUse, item2_codes) && totalArea >= 200) {
      return { required: true, message: `用途（${useName}）で、延べ面積が200㎡以上のため、設置が必要です。`, basis: '令第21条第1項第2号' };
    }

    // --- 第3号 ---
    if (totalArea >= 300) {
        const item3_i_codes = ['item01', 'item02_i', 'item02_ro', 'item02_ha', 'item03', 'item04', 'item06_i_4', 'item06_ni', 'item16_i', 'item16_2'];
        if (useCodeMatches(buildingUse, item3_i_codes)) {
            return { required: true, message: `延べ面積が300㎡以上で、用途（${useName}）が該当するため、設置が必要です。`, basis: '令第21条第1項第3号イ' };
        }
        const item3_ro_codes = ['item06_ha'];
        if (useCodeMatches(buildingUse, item3_ro_codes) && !hasLodging) {
            return { required: true, message: `延べ面積が300㎡以上で、用途（${useName}）が該当し、宿泊施設等がないため、設置が必要です。`, basis: '令第21条第1項第3号ロ' };
        }
    }

    // --- 第4号 ---
    const item4_codes = ['item05_ro', 'item07', 'item08', 'item09_ro', 'item10', 'item12', 'item13_i', 'item14'];
    if (useCodeMatches(buildingUse, item4_codes) && totalArea >= 500) {
        return { required: true, message: `延べ面積が500㎡以上で、用途（${useName}）が該当するため、設置が必要です。`, basis: '令第21条第1項第4号' };
    }

    // --- 第5号 ---
    if (useCodeMatches(buildingUse, ['item16_3']) && totalArea >= 500) {
      return { 
        required: 'warning', 
        message: '延べ面積500㎡以上の(16の3)項の建物です。(1)～(4)項、(5)項イ、(6)項、(9)項イの用途部分の面積合計が300㎡以上の場合は設置義務があります。', 
        basis: '令第21条第1項第5号' 
      };
    }

    // --- 第6号 ---
    const item6_codes = ['item11', 'item15'];
    if (useCodeMatches(buildingUse, item6_codes) && totalArea >= 1000) {
        return { required: true, message: `延べ面積が1000㎡以上で、用途（${useName}）が該当するため、設置が必要です。`, basis: '令第21条第1項第6号' };
    }

    // --- 第7号 ---
    const item7_codes = ['item01', 'item02', 'item03', 'item04', 'item05_i', 'item06', 'item09_i', 'item16_i'];
    if (useCodeMatches(buildingUse, item7_codes) && isSpecifiedOneStaircase) {
      return { required: true, message: `特定一階段等防火対象物に該当するため、設置が必要です。`, basis: '令第21条第1項第7号' };
    }

    // --- 第8号 ---
    if (storesCombustiblesOver500x) {
      return { required: true, message: '指定可燃物を基準数量の500倍以上、貯蔵・取り扱いしているため、設置が必要です。', basis: '令第21条第1項第8号' };
    }

    // --- 第9号 ---
    if (useCodeMatches(buildingUse, ['item16_2']) ) {
        return { required: 'warning', message: `(16の2)の対象物は、(2)項ニ、(5)項イ、(6)項イ(1)～(3)、(6)項ロ、(6)項ハ（入居、宿泊施設）の部分に設置が必要です。`, basis: '令第21条第1項第9号' };
    }

    // --- 第10号 ---
    const item10_codes = ['item02_i', 'item02_ro', 'item02_ha', 'item03'];
      const applicableFloor10 = floors.find(floor => {
        const area = floor.floorArea || 0;
        if (area < 100) return false;
        return floor.type === 'basement' || floor.isWindowless ;
      });
    if (useCodeMatches(buildingUse, item10_codes) && applicableFloor10) {
      const floorName = applicableFloor10.type === 'basement' ? `地階${applicableFloor10.level}階` : `地上${applicableFloor10.level}階`;
      const reason = applicableFloor10.isWindowless ? '無窓階である' : '地階で';
      return { required: true, message: `${floorName}（${reason}）の床面積が100㎡以上のため、設置が必要です。`, basis: '令第21条第1項第10号' };
    }
    if (useCodeMatches(buildingUse, ['item16_i'])  && applicableFloor10 ) {
      return { required: 'warning', message: `(2)項、(3)項の用途に供される地階・無窓階の床面積の合計が100㎡以上の場合は設置が必要になります。`, basis: '令第21条第1項第10号' };
    }
    // --- 第11号 ---
    const applicableFloor11 = floors.find(floor => {
      const area = floor.floorArea || 0;
      if (area < 300) return false;
      return floor.type === 'basement' || floor.isWindowless || (floor.type === 'ground' && floor.level >= 3);
    });
    if (applicableFloor11) {
      const floorName = applicableFloor11.type === 'basement' ? `地階${applicableFloor11.level}階` : `地上${applicableFloor11.level}階`;
      const reason = applicableFloor11.isWindowless ? '無窓階である' : '地階または3階以上で';
      return { required: true, message: `${floorName}（${reason}）の床面積が300㎡以上のため、設置が必要です。`, basis: '令第21条第1項第11号' };
    }

    // --- 第12号 ---
    if (hasRoadPart) {
      if (roadPartRooftopArea >= 600 || roadPartOtherArea >= 400) {
        return { required: true, message: '道路の用に供される部分の床面積が基準値以上のため、設置が必要です。', basis: '令第21条第1項第12号' };
      }
    }

    // --- 第13号 ---
    if (hasParkingPart) {
      if (parkingPartArea >= 200 && !canAllVehiclesExitSimultaneously) {
        return { required: true, message: '駐車の用に供する部分の床面積が基準値以上で、車両が同時に屋外に出られないため、設置が必要です。', basis: '令第21条第1項第13号' };
      }
    }

    // --- 第14号 ---
    const hasApplicableFloor14 = floors.some(floor => floor.type === 'ground' && floor.level >= 11);
    if (hasApplicableFloor14) {
      return { required: true, message: '11階以上の階があるため、設置が必要です。', basis: '令第21条第1項第14号' };
    }

    // --- 第15号 ---
    if (hasTelecomRoomOver500sqm) {
      return { required: true, message: '通信機器室の床面積が500㎡以上のため、設置が必要です。', basis: '令第21条第1項第15号' };
    }

    // Note: 10号もApp.vueから渡されるデータ構造の拡張が必要。

    return {
      required: false,
      message: '自動火災報知設備の設置義務の条件に該当しません。',
      basis: '',
    };
  });

  return {
    result,
  };
}
