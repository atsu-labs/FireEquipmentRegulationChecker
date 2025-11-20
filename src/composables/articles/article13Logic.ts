import { computed } from "vue";
import { useCodeMatches } from "@/composables/utils";
import type { JudgementResult, Article13UserInput } from "@/types";

export function useArticle13Logic(userInput: Article13UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const buildingUse = userInput.buildingUse;
    const storesDesignatedCombustiblesOver1000x =
      userInput.storesDesignatedCombustiblesOver1000x;
    const parking = userInput.parking;
    const hasCarRepairArea = userInput.hasCarRepairArea;
    const carRepairAreaBasementOrUpper = userInput.carRepairAreaBasementOrUpper;
    const carRepairAreaFirstFloor = userInput.carRepairAreaFirstFloor;
    const hasHelicopterLandingZone = userInput.hasHelicopterLandingZone;
    const hasHighFireUsageAreaOver200sqm =
      userInput.hasHighFireUsageAreaOver200sqm;
    const hasElectricalEquipmentOver200sqm =
      userInput.hasElectricalEquipmentOver200sqm;
    const hasTelecomRoomOver500sqm = userInput.hasTelecomRoomOver500sqm;
    const hasRoadPart = userInput.hasRoadPart;
    const roadPartRooftopArea = userInput.roadPartRooftopArea;
    const roadPartOtherArea = userInput.roadPartOtherArea;
    // Legacy optional properties (kept for compatibility in some callers/tests)
    type BoolRef = { value: boolean };
    type NumRef = { value: number | null };
    const maybeHasParkingArea = (
      userInput as unknown as {
        hasParkingArea?: BoolRef;
      }
    ).hasParkingArea;
    const maybeHasMechanicalParking = (
      userInput as unknown as {
        hasMechanicalParking?: BoolRef;
      }
    ).hasMechanicalParking;
    const maybeMechanicalParkingCapacity = (
      userInput as unknown as {
        mechanicalParkingCapacity?: NumRef;
      }
    ).mechanicalParkingCapacity;

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
    if (hasRoadPart.value) {
      const rooftopArea = roadPartRooftopArea.value ?? 0;
      const otherArea = roadPartOtherArea.value ?? 0;

      // 面積が入力されている場合は、その値で判定
      if (
        roadPartRooftopArea.value !== null ||
        roadPartOtherArea.value !== null
      ) {
        if (rooftopArea >= 600 || otherArea >= 400) {
          return {
            required: true,
            message:
              "道路の用に供される部分で、屋上部分が600㎡以上またはその他の部分が400㎡以上のため、水噴霧、泡、不活性ガス、粉末のいずれかの消火設備の設置が必要です。",
            basis: "令第13条第1項第3号",
          };
        }
        // 面積が入力されていて、条件未満の場合は不要
        return {
          required: false,
          message:
            "道路の用に供される部分は、面積が条件未満のため、設置義務はありません。",
          basis: "令第13条第1項第3号",
        };
      }

      // 面積が入力されていない場合は警告
      return {
        required: "warning",
        message:
          "【要確認】道路の用に供される部分がある場合、屋上部分で600㎡以上、その他の部分で400㎡以上の場合は、水噴霧、泡、不活性ガス、粉末のいずれかの消火設備の設置が必要です。面積を入力してください。",
        basis: "令第13条第1項第3号",
      };
    }

    // 4. 自動車の修理・整備工場
    if (hasCarRepairArea.value) {
      const basementOrUpperArea = carRepairAreaBasementOrUpper.value ?? 0;
      const firstFloorArea = carRepairAreaFirstFloor.value ?? 0;

      // 面積が入力されている場合は、その値で判定
      if (
        carRepairAreaBasementOrUpper.value !== null ||
        carRepairAreaFirstFloor.value !== null
      ) {
        if (basementOrUpperArea >= 200 || firstFloorArea >= 500) {
          return {
            required: true,
            message:
              "自動車の修理・整備の用に供される部分で、地階・2階以上で200㎡以上または1階で500㎡以上のため、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
            basis: "令第13条第1項第4号",
          };
        }
        // 面積が入力されていて、条件未満の場合は不要
        return {
          required: false,
          message:
            "自動車の修理・整備の用に供される部分は、面積が条件未満のため、設置義務はありません。",
          basis: "令第13条第1項第4号",
        };
      }

      // 面積が入力されていない場合は警告
      return {
        required: "warning",
        message:
          "【要確認】自動車の修理・整備の用に供される部分がある場合、地階・2階以上で200㎡以上、1階で500㎡以上の場合は、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。面積を入力してください。",
        basis: "令第13条第1項第4号",
      };
    }

    // 5. 駐車場
    // 駐車部分（共通 parking モデル）。未定義なら legacy の hasParkingArea を参照
    const parkingExists = parking
      ? parking.value.exists
      : Boolean(maybeHasParkingArea && maybeHasParkingArea.value);

    if (parkingExists) {
      // Determine area-based thresholds per Article13 table:
      // - 屋上部分: 300㎡以上
      // - 地階または2階以上の階: 200㎡以上
      // - 1階: 500㎡以上
      // Exclusion: 階が「駐車するすべての車両が同時に屋外に出ることができる構造の階」である場合は当該階を除く
      const rooftopArea = parking?.value.rooftopArea ?? 0;
      const basementOrUpperArea = parking?.value.basementOrUpperArea ?? 0;
      const firstFloorArea = parking?.value.firstFloorArea ?? 0;
      const canAllExit =
        parking?.value.canAllVehiclesExitSimultaneously ?? false;

      // If parking floors are designed so all vehicles can exit simultaneously, those floors are excluded.
      const rooftopApplies = !canAllExit && (rooftopArea || 0) >= 300;
      const basementOrUpperApplies =
        !canAllExit && (basementOrUpperArea || 0) >= 200;
      const firstFloorApplies = !canAllExit && (firstFloorArea || 0) >= 500;

      if (rooftopApplies || basementOrUpperApplies || firstFloorApplies) {
        return {
          required: true,
          message:
            "駐車の用に供される部分があり、階や面積が該当するため、水噴霧、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
          basis: "令第13条第1項第5号イ",
        };
      }

      // If parking exists but no (non-exempt) area reaches threshold, return warning to review details
      return {
        required: "warning",
        message:
          "【要確認】駐車の用に供される部分がある場合、階や構造、面積によって水噴霧、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です（令第13条第1項第5号イ）。",
        basis: "令第13条第1項第5号イ",
      };
    }
    // mechanical parking: prefer new parking model, fallback to legacy fields
    const mechanicalPresent = parking
      ? parking.value.mechanical.present
      : Boolean(maybeHasMechanicalParking && maybeHasMechanicalParking.value);
    const mechanicalCapacity = parking
      ? parking.value.mechanical.capacity ?? 0
      : (maybeMechanicalParkingCapacity &&
          maybeMechanicalParkingCapacity.value) ||
        0;

    if (mechanicalPresent) {
      const capacity = mechanicalCapacity;
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

    // 6. 電気設備（200㎡以上）
    if (hasElectricalEquipmentOver200sqm.value) {
      return {
        required: true,
        message:
          "発電機、変圧器等の電気設備が設置されている部分で、面積が200㎡以上のため、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
        basis: "令第13条第1項第6号",
      };
    }

    // 7. 多量の火気を使用する部分（200㎡以上）
    if (hasHighFireUsageAreaOver200sqm.value) {
      return {
        required: true,
        message:
          "鍛造場、ボイラー室、乾燥室等で、面積が200㎡以上のため、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
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
