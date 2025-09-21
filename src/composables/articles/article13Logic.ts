import { computed } from "vue";
import { useCodeMatches } from "@/composables/utils";
import type { JudgementResult, Article13UserInput } from "@/types";

export function useArticle13Logic(userInput: Article13UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      storesDesignatedCombustiblesOver1000x,
      hasParkingArea,
      hasMechanicalParking,
      mechanicalParkingCapacity,
      hasCarRepairArea,
      hasHelicopterLandingZone,
      hasHighFireUsageArea,
      hasElectricalEquipmentArea,
      hasTelecomRoomOver500sqm,
      hasRoadwayPart,
    } = userInput;

    const use = buildingUse.value;
    if (!use) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    // 1. (13)項ロに掲げる防火対象物
    if (useCodeMatches(use, ["item13_ro"])) {
      return {
        required: true,
        message:
          "航空機格納庫（(13)項ロ）には、泡消火設備又は粉末消火設備の設置が必要です。",
        basis: "令第13条第1項第1号",
      };
    }

    // 2. ヘリポート
    if (hasHelicopterLandingZone.value) {
      return {
        required: true,
        message:
          "屋上のヘリポートには、泡消火設備又は粉末消火設備の設置が必要です。",
        basis: "令第13条第1項第2号",
      };
    }

    // 3. 道路の用に供される部分
    if (hasRoadwayPart.value) {
      return {
        required: "warning",
        message:
          "【要確認】道路の用に供される部分がある場合、屋上部分で600㎡以上、その他の部分で400㎡以上の場合は、水噴霧、泡、不活性ガス、粉末のいずれかの消火設備の設置が必要です。",
        basis: "令第13条第1項第3号",
      };
    }

    // 4. 自動車の修理・整備工場
    if (hasCarRepairArea.value) {
      return {
        required: "warning",
        message:
          "【要確認】自動車の修理・整備の用に供される部分がある場合、地階・2階以上で200㎡以上、1階で500㎡以上の場合は、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
        basis: "令第13条第1項第4号",
      };
    }

    // 5. 駐車場
    if (hasParkingArea.value) {
      return {
        required: "warning",
        message:
          "【要確認】駐車の用に供される部分がある場合、階や構造、面積によって水噴霧、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です（令第13条第1項第5号イ）。",
        basis: "令第13条第1項第5号イ",
      };
    }
    if (hasMechanicalParking.value) {
      const capacity = mechanicalParkingCapacity.value ?? 0;
      if (capacity >= 10) {
        return {
          required: true,
          message: `機械式駐車場で収容台数が10台以上のため、水噴霧、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。`,
          basis: "令第13条第1項第5号ロ",
        };
      }
      return {
        required: "warning",
        message:
          "【要確認】機械式駐車場の場合、収容台数が10台以上であれば、水噴霧、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
        basis: "令第13条第1項第5号ロ",
      };
    }

    // 6. 電気設備
    if (hasElectricalEquipmentArea.value) {
      return {
        required: "warning",
        message:
          "【要確認】発電機、変圧器等の電気設備が設置されている部分で、面積が200㎡以上の場合は、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
        basis: "令第13条第1項第6号",
      };
    }

    // 7. 多量の火気を使用する部分
    if (hasHighFireUsageArea.value) {
      return {
        required: "warning",
        message:
          "【要確認】鍛造場、ボイラー室、乾燥室等で、面積が200㎡以上の場合は、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
        basis: "令第13条第1項第7号",
      };
    }

    // 8. 通信機器室（500㎡以上）
    if (hasTelecomRoomOver500sqm.value) {
      return {
        required: "warning",
        message:
          "【要確認】通信機器室で、面積が500㎡以上の場合は、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
        basis: "令第13条第1項第8号",
      };
    }

    // 9. 指定可燃物
    if (storesDesignatedCombustiblesOver1000x.value) {
      return {
        required: "warning",
        message:
          "【要確認】指定可燃物を1000倍以上貯蔵・取り扱っている場合、可燃物の種類に応じて、水噴霧、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。スプリンクラー設備が設置されている場合は免除されることがあります。",
        basis: "令第13条第1項第9号、同条第2項",
      };
    }

    return {
      required: false,
      message: "水噴霧消火設備等の設置義務はありません。",
      basis: "-",
    };
  });

  return {
    regulationResult,
  };
}
