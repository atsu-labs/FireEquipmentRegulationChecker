import { computed } from "vue";
import { useCodeMatches } from "@/composables/utils";
import type { JudgementResult, Article13UserInput, Parking } from "@/types";

/**
 * 駐車場関連の判定コンテキスト
 */
type ParkingContext = {
  exists: boolean;
  rooftopArea: number;
  basementOrUpperArea: number;
  firstFloorArea: number;
  canAllVehiclesExitSimultaneously: boolean;
  mechanicalPresent: boolean;
  mechanicalCapacity: number;
};

/**
 * 第1号: (13)項ロ（航空機格納庫）
 */
function checkItem1(useCode: string): JudgementResult | null {
  if (useCodeMatches(useCode, ["annex13_ro"])) {
    return {
      required: true,
      message:
        "航空機格納庫（(13)項ロ）には、泡消火設備又は粉末消火設備の設置が必要です。",
      basis: "令第13条第1項第1号",
    };
  }
  return null;
}

/**
 * 第2号: ヘリポート
 */
function checkItem2(hasHelicopterLandingZone: boolean): JudgementResult | null {
  if (hasHelicopterLandingZone) {
    return {
      required: true,
      message:
        "屋上のヘリポートには、泡消火設備又は粉末消火設備の設置が必要です。",
      basis: "令第13条第1項第2号",
    };
  }
  return null;
}

/**
 * 第3号: 道路の用に供される部分
 */
function checkItem3(
  hasRoadPart: boolean,
  rooftopArea: number | null,
  otherArea: number | null
): JudgementResult | null {
  if (!hasRoadPart) return null;

  // 面積が入力されている場合は、その値で判定
  if (rooftopArea !== null || otherArea !== null) {
    if ((rooftopArea ?? 0) >= 600 || (otherArea ?? 0) >= 400) {
      return {
        required: true,
        message:
          "道路の用に供される部分で、屋上部分が600㎡以上またはその他の部分が400㎡以上のため、水噴霧、泡、不活性ガス、粉末のいずれかの消火設備の設置が必要です。",
        basis: "令第13条第1項第3号",
      };
    }
    // 面積が入力されていて、条件未満の場合は不要（basisは条文番号を維持）
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

/**
 * 第4号: 自動車の修理・整備工場
 */
function checkItem4(
  hasCarRepairArea: boolean,
  basementOrUpperArea: number | null,
  firstFloorArea: number | null
): JudgementResult | null {
  if (!hasCarRepairArea) return null;

  // 面積が入力されている場合は、その値で判定
  if (basementOrUpperArea !== null || firstFloorArea !== null) {
    if ((basementOrUpperArea ?? 0) >= 200 || (firstFloorArea ?? 0) >= 500) {
      return {
        required: true,
        message:
          "自動車の修理・整備の用に供される部分で、地階・2階以上で200㎡以上または1階で500㎡以上のため、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
        basis: "令第13条第1項第4号",
      };
    }
    // 面積が入力されていて、条件未満の場合は不要（basisは条文番号を維持）
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

/**
 * 第5号イ: 駐車場（面積基準）
 */
function checkItem5_i(ctx: ParkingContext): JudgementResult | null {
  if (!ctx.exists) return null;

  // 駐車するすべての車両が同時に屋外に出られる構造の場合は面積判定から除外
  const canAllExit = ctx.canAllVehiclesExitSimultaneously;
  const rooftopApplies = !canAllExit && ctx.rooftopArea >= 300;
  const basementOrUpperApplies = !canAllExit && ctx.basementOrUpperArea >= 200;
  const firstFloorApplies = !canAllExit && ctx.firstFloorArea >= 500;

  if (rooftopApplies || basementOrUpperApplies || firstFloorApplies) {
    return {
      required: true,
      message:
        "駐車の用に供される部分があり、階や面積が該当するため、水噴霧、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
      basis: "令第13条第1項第5号イ",
    };
  }

  // 駐車場が存在するが面積条件未達の場合は警告
  return {
    required: "warning",
    message:
      "【要確認】駐車の用に供される部分がある場合、階や構造、面積によって水噴霧、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です（令第13条第1項第5号イ）。",
    basis: "令第13条第1項第5号イ",
  };
}

/**
 * 第5号ロ: 機械式駐車場
 */
function checkItem5_ro(ctx: ParkingContext): JudgementResult | null {
  if (!ctx.mechanicalPresent) return null;

  if (ctx.mechanicalCapacity >= 10) {
    return {
      required: true,
      message:
        "機械式駐車場で収容台数が10台以上のため、水噴霧、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
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

/**
 * 第6号: 電気設備（200㎡以上）
 */
function checkItem6(
  hasElectricalEquipmentOver200sqm: boolean
): JudgementResult | null {
  if (hasElectricalEquipmentOver200sqm) {
    return {
      required: true,
      message:
        "発電機、変圧器等の電気設備が設置されている部分で、面積が200㎡以上のため、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
      basis: "令第13条第1項第6号",
    };
  }
  return null;
}

/**
 * 第7号: 多量の火気を使用する部分（200㎡以上）
 */
function checkItem7(
  hasHighFireUsageAreaOver200sqm: boolean
): JudgementResult | null {
  if (hasHighFireUsageAreaOver200sqm) {
    return {
      required: true,
      message:
        "鍛造場、ボイラー室、乾燥室等で、面積が200㎡以上のため、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
      basis: "令第13条第1項第7号",
    };
  }
  return null;
}

/**
 * 第8号: 通信機器室（500㎡以上）
 */
function checkItem8(hasTelecomRoomOver500sqm: boolean): JudgementResult | null {
  if (hasTelecomRoomOver500sqm) {
    return {
      required: true,
      message:
        "通信機器室で、面積が500㎡以上の場合は、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。",
      basis: "令第13条第1項第8号",
    };
  }
  return null;
}

/**
 * 第9号: 指定可燃物
 */
function checkItem9(
  storesDesignatedCombustiblesOver1000x: boolean
): JudgementResult | null {
  if (storesDesignatedCombustiblesOver1000x) {
    return {
      required: true,
      message:
        "指定可燃物を1000倍以上貯蔵・取り扱っている場合、可燃物の種類に応じて、水噴霧、泡、不活性ガス、ハロゲン化物、粉末のいずれかの消火設備の設置が必要です。スプリンクラー設備が設置されている場合は免除されることがあります。",
      basis: "令第13条第1項第9号、同条第2項",
    };
  }
  return null;
}

/**
 * Parking情報からParkingContextを生成
 */
function createParkingContext(
  parking: { value: Parking } | undefined,
  legacyHasParkingArea?: { value: boolean },
  legacyHasMechanicalParking?: { value: boolean },
  legacyMechanicalParkingCapacity?: { value: number | null }
): ParkingContext {
  if (parking) {
    const p = parking.value;
    const mechanical = p.mechanical ?? { present: false, capacity: null };
    return {
      exists: p.exists,
      rooftopArea: p.rooftopArea ?? 0,
      basementOrUpperArea: p.basementOrUpperArea ?? 0,
      firstFloorArea: p.firstFloorArea ?? 0,
      canAllVehiclesExitSimultaneously:
        p.canAllVehiclesExitSimultaneously ?? false,
      mechanicalPresent: mechanical.present ?? false,
      mechanicalCapacity: mechanical.capacity ?? 0,
    };
  }

  // Legacy fallback
  return {
    exists: Boolean(legacyHasParkingArea?.value),
    rooftopArea: 0,
    basementOrUpperArea: 0,
    firstFloorArea: 0,
    canAllVehiclesExitSimultaneously: false,
    mechanicalPresent: Boolean(legacyHasMechanicalParking?.value),
    mechanicalCapacity: legacyMechanicalParkingCapacity?.value ?? 0,
  };
}

export function useArticle13Logic(userInput: Article13UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const use = userInput.buildingUse.value;
    if (!use) {
      return {
        required: false,
        message: "建物の用途を選択してください。",
        basis: "-",
      };
    }

    // Legacy optional properties (kept for compatibility in some callers/tests)
    type BoolRef = { value: boolean };
    type NumRef = { value: number | null };
    const maybeHasParkingArea = (
      userInput as unknown as { hasParkingArea?: BoolRef }
    ).hasParkingArea;
    const maybeHasMechanicalParking = (
      userInput as unknown as { hasMechanicalParking?: BoolRef }
    ).hasMechanicalParking;
    const maybeMechanicalParkingCapacity = (
      userInput as unknown as { mechanicalParkingCapacity?: NumRef }
    ).mechanicalParkingCapacity;

    // 駐車場コンテキストを生成
    const parkingCtx = createParkingContext(
      userInput.parking,
      maybeHasParkingArea,
      maybeHasMechanicalParking,
      maybeMechanicalParkingCapacity
    );

    // 各号を順番にチェック
    const results: JudgementResult[] = [];

    // 第1号: 航空機格納庫
    const r1 = checkItem1(use);
    if (r1) return r1;

    // 第2号: ヘリポート
    const r2 = checkItem2(userInput.hasHelicopterLandingZone.value);
    if (r2) return r2;

    // 第3号: 道路の用に供される部分
    const r3 = checkItem3(
      userInput.hasRoadPart.value,
      userInput.roadPartRooftopArea.value,
      userInput.roadPartOtherArea.value
    );
    if (r3?.required === true) return r3;
    if (r3) results.push(r3);

    // 第4号: 自動車の修理・整備工場
    const r4 = checkItem4(
      userInput.hasCarRepairArea.value,
      userInput.carRepairAreaBasementOrUpper.value,
      userInput.carRepairAreaFirstFloor.value
    );
    if (r4?.required === true) return r4;
    if (r4) results.push(r4);

    // 第5号イ: 駐車場（面積基準）
    const r5i = checkItem5_i(parkingCtx);
    if (r5i?.required === true) return r5i;
    if (r5i) results.push(r5i);

    // 第5号ロ: 機械式駐車場
    const r5ro = checkItem5_ro(parkingCtx);
    if (r5ro?.required === true) return r5ro;
    if (r5ro) results.push(r5ro);

    // 第6号: 電気設備
    const r6 = checkItem6(userInput.hasElectricalEquipmentOver200sqm.value);
    if (r6) return r6;

    // 第7号: 多量の火気を使用する部分
    const r7 = checkItem7(userInput.hasHighFireUsageAreaOver200sqm.value);
    if (r7) return r7;

    // 第8号: 通信機器室
    const r8 = checkItem8(userInput.hasTelecomRoomOver500sqm.value);
    if (r8) return r8;

    // 第9号: 指定可燃物
    const r9 = checkItem9(
      userInput.storesDesignatedCombustiblesOver1000x.value
    );
    if (r9) return r9;

    // warningがあれば最初のものを返す
    if (results.length > 0) {
      return results[0];
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
