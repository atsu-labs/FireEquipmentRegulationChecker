<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BuildingInputStepper from "@/components/BuildingInputStepper.vue";
import ResultsPanel from "@/components/ResultsPanel.vue";
import { useArticle10Logic } from "@/composables/articles/article10Logic";
import type { Floor, ComponentUse } from "@/types";
import { useArticle11Logic } from "@/composables/articles/article11Logic";
import { useArticle12Logic } from "@/composables/articles/article12Logic";
import { useArticle21Logic } from "@/composables/articles/article21Logic";
import { useArticle22Logic } from "@/composables/articles/article22Logic";
import { useArticle21_2Logic } from "@/composables/articles/article21-2Logic";
import { useArticle23Logic } from "@/composables/articles/article23Logic";
import { useArticle25Logic } from "@/composables/articles/article25Logic";
import { useArticle13Logic } from "@/composables/articles/article13Logic";
import { useArticle19Logic } from "@/composables/articles/article19Logic";
import { useArticle24Logic } from "@/composables/articles/article24Logic";
import { useArticle26Logic } from "@/composables/articles/article26Logic";
import { useArticle27Logic } from "@/composables/articles/article27Logic";
import { useArticle28Logic } from "@/composables/articles/article28Logic";
import { useArticle29Logic } from "@/composables/articles/article29Logic";
import { useArticle29_2Logic } from "@/composables/articles/article29-2Logic";
import { useArticle29_3Logic } from "@/composables/articles/article29-3Logic";
import { useArticle28_2Logic } from "@/composables/articles/article28-2Logic";

const currentStep = ref(1);

const groundFloorsInput = ref<number>(1);
const basementFloorsInput = ref<number>(0);
const floors = ref<Floor[]>([]);
const buildingUse = ref<string | null>(null);
const totalFloorAreaInput = ref<number | null>(null);
const capacityInput = ref<number | null>(null);
const hasNonFloorArea = ref(false);
const nonFloorAreaValue = ref<number | null>(null);

// --- 追加情報のデータ ---
const usesFireEquipment = ref(false);
const storesMinorHazardousMaterials = ref(false);
const storesDesignatedCombustibles = ref(false);
const storesDesignatedCombustiblesOver750x = ref(false);
const structureType = ref<"A" | "B" | "C" | null>(null);
const finishType = ref<"flammable" | "other" | null>(null);
const hasLodging = ref(false); // 令21条用
const isSpecifiedOneStaircase = ref(false); // 令21条7号用

// 令12条
const isCareDependentOccupancy = ref(false);
const hasStageArea = ref(false);
const stageFloorLevel = ref<string | null>(null);
const stageArea = ref<number | null>(null);
const isRackWarehouse = ref(false);
const ceilingHeight = ref<number | null>(null);
const storesDesignatedCombustiblesOver1000x = ref(false);
const hasFireSuppressingStructure = ref(false);
const hasBeds = ref(false);
const storesDesignatedCombustiblesOver500x = ref(false); // 令21条8号用
const hasRoadPart = ref(false); // 令21条12号用
const roadPartRooftopArea = ref<number | null>(null);
const roadPartOtherArea = ref<number | null>(null);
const hasTelecomRoomOver500sqm = ref(false); // 令21条15号用

// 令22条
const hasSpecialCombustibleStructure = ref(false);
const contractedCurrentCapacity = ref<number | null>(null);

// 令21条の2
const hasHotSpringFacility = ref(false);
const isHotSpringFacilityConfirmed = ref(false);

// 令13条: parking を使用し、その他フラグは個別に保持
const article13_hasCarRepairArea = ref(false);
const article13_carRepairAreaBasementOrUpper = ref<number | null>(null);
const article13_carRepairAreaFirstFloor = ref<number | null>(null);
const article13_hasHelicopterLandingZone = ref(false);
const article13_hasHighFireUsageAreaOver200sqm = ref(false);
const article13_hasElectricalEquipmentOver200sqm = ref(false);
// `hasTelecomRoomOver500sqm` を単一のソースオブスとして使用します

// 中期移行用: 共通パーキング state を導入（親のシングルソース）
import type { Parking } from "@/types";
const parking = ref<Parking>({
  exists: false,
  // new split area fields
  rooftopArea: null,
  basementOrUpperArea: null,
  firstFloorArea: null,
  canAllVehiclesExitSimultaneously: false,
  mechanical: {
    present: false,
    capacity: null,
  },
});

// parking は単一のシングルソースとして使用します（プロキシは不要になりました）

// 令19条
const buildingStructure = ref<
  "fire-resistant" | "quasi-fire-resistant" | "other" | null
>(null);
const hasMultipleBuildingsOnSite = ref(false);

// 令27条
const siteArea = ref<number | null>(null);
const buildingHeight = ref<number | null>(null);

// 16項 構成用途
const componentUses = ref<ComponentUse[]>([{ useCode: "", floorArea: null }]);

// 16項かどうかを判定
const isAnnex16 = computed(() => {
  return buildingUse.value?.startsWith("annex16") ?? false;
});

const showArticle21Item7Checkbox = computed(() => {
  if (!buildingUse.value) return false;
  const targetUses = [
    "annex01",
    "annex02",
    "annex03",
    "annex04",
    "annex05_i",
    "annex06",
    "annex09_i",
    "annex16_i",
  ];
  return targetUses.some((use) => buildingUse.value!.startsWith(use));
});

watch(hasNonFloorArea, (newValue) => {
  if (!newValue) {
    nonFloorAreaValue.value = null;
  }
});

const generateFloors = () => {
  const oldFloorsMap = new Map<string, Floor>();
  for (const floor of floors.value) {
    oldFloorsMap.set(`${floor.type}-${floor.level}`, floor);
  }

  const newFloors: Floor[] = [];

  for (let i = groundFloorsInput.value; i >= 1; i--) {
    const key = `ground-${i}`;
    const existingFloor = oldFloorsMap.get(key);
    if (existingFloor) {
      newFloors.push(existingFloor);
    } else {
      newFloors.push({
        level: i,
        type: "ground",
        floorArea: null,
        capacity: null,
        isWindowless: false,
      });
    }
  }

  for (let i = 1; i <= basementFloorsInput.value; i++) {
    const key = `basement-${i}`;
    const existingFloor = oldFloorsMap.get(key);
    if (existingFloor) {
      newFloors.push(existingFloor);
    } else {
      newFloors.push({
        level: i,
        type: "basement",
        floorArea: null,
        capacity: null,
        isWindowless: false,
      });
    }
  }
  floors.value = newFloors;
};

watch(currentStep, (newValue, oldValue) => {
  if (oldValue === 1 && newValue > 1) {
    generateFloors();
  }
});

// ステップ遷移ロジック（16項: 1→3→4、その他: 1→2→4）
const nextStep = () => {
  if (currentStep.value === 1) {
    // ステップ1から次へ
    if (isAnnex16.value) {
      currentStep.value = 3; // 16項: ステップ3へ
    } else {
      currentStep.value = 2; // その他: ステップ2へ
    }
  } else if (currentStep.value === 2) {
    // ステップ2（各階の情報）から次へ → ステップ4
    currentStep.value = 4;
  } else if (currentStep.value === 3) {
    // ステップ3（16項構成用途）から次へ → ステップ4
    currentStep.value = 4;
  }
};

const prevStep = () => {
  if (currentStep.value === 2 || currentStep.value === 3) {
    // ステップ2またはステップ3からは常にステップ1へ
    currentStep.value = 1;
  } else if (currentStep.value === 4) {
    // ステップ4から戻る
    if (isAnnex16.value) {
      currentStep.value = 3; // 16項: ステップ3へ
    } else {
      currentStep.value = 2; // その他: ステップ2へ
    }
  }
};

const calculatedFloorArea = computed(() => {
  const floorsArea = floors.value.reduce((total: number, floor: Floor) => {
    return total + (floor.floorArea || 0);
  }, 0);
  const extraArea = hasNonFloorArea.value ? nonFloorAreaValue.value || 0 : 0;
  return floorsArea + extraArea;
});

const floorAreaMismatch = computed(() => {
  if (totalFloorAreaInput.value === null || totalFloorAreaInput.value === 0) {
    return false;
  }
  return (
    (Number(totalFloorAreaInput.value) || 0).toFixed(2) !==
    calculatedFloorArea.value.toFixed(2)
  );
});

const windowlessFloors = computed(() => {
  return floors.value
    .filter((floor: Floor) => floor.isWindowless && floor.type === "ground")
    .map((floor: Floor) => `地上 ${floor.level} 階`);
});

const { regulationResult: judgementResult10 } = useArticle10Logic({
  buildingUse,
  totalFloorAreaInput,
  floors,
  usesFireEquipment,
  storesMinorHazardousMaterials,
  storesDesignatedCombustibles,
});

const judgementResult10Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult10.value.required === true) return "error";
    if (judgementResult10.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult10Title = computed(() => {
  if (judgementResult10.value.required === true)
    return "【消火器】設置義務あり";
  if (judgementResult10.value.required === "warning") return "【消火器】要確認";
  return "【消火器】設置義務なし";
});

const article11TotalArea = computed(() => totalFloorAreaInput.value);
const hasBasement = computed(() => basementFloorsInput.value > 0);
const basementArea = computed(() =>
  floors.value
    .filter((f: Floor) => f.type === "basement")
    .reduce((sum: number, f: Floor) => sum + (f.floorArea || 0), 0)
);
const hasNoWindowFloor = computed(() =>
  floors.value.some((f: Floor) => f.isWindowless)
);
const noWindowFloorArea = computed(() =>
  floors.value
    .filter((f: Floor) => f.isWindowless)
    .reduce((sum: number, f: Floor) => sum + (f.floorArea || 0), 0)
);
const hasUpperFloors = computed(() => groundFloorsInput.value >= 4);
const upperFloorsArea = computed(() =>
  floors.value
    .filter((f: Floor) => f.type === "ground" && f.level >= 4)
    .reduce((sum: number, f: Floor) => sum + (f.floorArea || 0), 0)
);

const { regulationResult: judgementResult11 } = useArticle11Logic({
  buildingUse,
  totalArea: article11TotalArea,
  hasBasement,
  basementArea,
  hasNoWindowFloor,
  noWindowFloorArea,
  hasUpperFloors,
  upperFloorsArea,
  storesFlammableItems: storesDesignatedCombustibles,
  storesDesignatedCombustiblesOver750x: storesDesignatedCombustiblesOver750x,
  structureType,
  finishType,
});

const judgementResult11Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult11.value.required === true) return "error";
    if (judgementResult11.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult11Title = computed(() => {
  if (judgementResult11.value.required === true)
    return "【屋内消火栓設備】設置義務あり";
  if (judgementResult11.value.required === "warning")
    return "【屋内消火栓設備】要確認";
  return "【屋内消火栓設備】設置義務なし";
});

const { regulationResult: judgementResult12 } = useArticle12Logic({
  buildingUse,
  groundFloors: groundFloorsInput,
  totalArea: totalFloorAreaInput,
  floors,
  isCareDependentOccupancy,
  hasStageArea,
  stageFloorLevel,
  stageArea,
  isRackWarehouse,
  ceilingHeight,
  storesDesignatedCombustiblesOver1000x: storesDesignatedCombustiblesOver1000x,
  hasFireSuppressingStructure,
  hasBeds,
});

const { regulationResult: judgementResult13 } = useArticle13Logic({
  buildingUse,
  storesDesignatedCombustiblesOver1000x: storesDesignatedCombustiblesOver1000x,
  parking,
  hasCarRepairArea: article13_hasCarRepairArea,
  carRepairAreaBasementOrUpper: article13_carRepairAreaBasementOrUpper,
  carRepairAreaFirstFloor: article13_carRepairAreaFirstFloor,
  hasHelicopterLandingZone: article13_hasHelicopterLandingZone,
  hasHighFireUsageAreaOver200sqm: article13_hasHighFireUsageAreaOver200sqm,
  hasElectricalEquipmentOver200sqm: article13_hasElectricalEquipmentOver200sqm,
  // 直接 hasTelecomRoomOver500sqm を参照する
  hasTelecomRoomOver500sqm,
  hasRoadPart,
  roadPartRooftopArea,
  roadPartOtherArea,
});

const { regulationResult: judgementResult19 } = useArticle19Logic({
  buildingUse,
  groundFloors: groundFloorsInput,
  floors,
  buildingStructure,
  hasMultipleBuildingsOnSite,
});

const { regulationResult: judgementResult27 } = useArticle27Logic({
  buildingUse,
  siteArea,
  buildingHeight,
  totalArea: totalFloorAreaInput,
  groundFloors: groundFloorsInput,
  floors,
  buildingStructure,
});

const { regulationResult: judgementResult28 } = useArticle28Logic({
  buildingUse,
  totalArea: totalFloorAreaInput,
  hasStageArea,
  stageArea,
  floors,
});

const { regulationResult: judgementResult24 } = useArticle24Logic({
  buildingUse,
  totalCapacity: capacityInput,
  groundFloors: groundFloorsInput,
  basementFloors: basementFloorsInput,
  floors,
});

const { regulationResult: article21Result } = useArticle21Logic({
  buildingUse: buildingUse,
  totalArea: totalFloorAreaInput,
  hasLodging,
  floors,
  isSpecifiedOneStaircase,
  storesDesignatedCombustiblesOver500x: storesDesignatedCombustiblesOver500x,
  hasRoadPart,
  roadPartRooftopArea,
  roadPartOtherArea,
  // Use new parking single-source model
  parking,
  hasTelecomRoomOver500sqm,
});

const judgementResult12Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult12.value.required === true) return "error";
    if (judgementResult12.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult12Title = computed(() => {
  if (judgementResult12.value.required === true)
    return "【スプリンクラー設備】設置義務あり";
  if (judgementResult12.value.required === "warning")
    return "【スプリンクラー設備】要確認";
  return "【スプリンクラー設備】設置義務なし";
});

const article21ResultType = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (article21Result.value.required === true) return "error";
    if (article21Result.value.required === "warning") return "warning";
    return "success";
  }
);

const article21ResultTitle = computed(() => {
  if (article21Result.value.required === true)
    return "【自動火災報知設備】設置義務あり";
  if (article21Result.value.required === "warning")
    return "【自動火災報知設備】要確認";
  return "【自動火災報知設備】設置義務なし";
});

const { regulationResult: article22Result } = useArticle22Logic({
  buildingUse,
  totalArea: totalFloorAreaInput,
  hasSpecialCombustibleStructure,
  contractedCurrentCapacity,
});

const article22ResultType = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (article22Result.value.required === true) return "error";
    if (article22Result.value.required === "warning") return "warning";
    return "success";
  }
);

const article22ResultTitle = computed(() => {
  if (article22Result.value.required === true)
    return "【漏電火災警報器】設置義務あり";
  if (article22Result.value.required === "warning")
    return "【漏電火災警報器】要確認";
  return "【漏電火災警報器】設置義務なし";
});

const { regulationResult: article21_2Result } = useArticle21_2Logic({
  buildingUse,
  totalArea: totalFloorAreaInput,
  floors,
  hasHotSpringFacility,
  isHotSpringFacilityConfirmed,
});

const article21_2ResultType = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (article21_2Result.value.required === true) return "error";
    if (article21_2Result.value.required === "warning") return "warning";
    return "success";
  }
);

const article21_2ResultTitle = computed(() => {
  if (article21_2Result.value.required === true)
    return "【ガス漏れ火災警報設備】設置義務あり";
  if (article21_2Result.value.required === "warning")
    return "【ガス漏れ火災警報設備】要確認";
  return "【ガス漏れ火災警報設備】設置義務なし";
});

const { regulationResult: article23Result } = useArticle23Logic({
  buildingUse,
  totalArea: totalFloorAreaInput,
});

const article23ResultType = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (article23Result.value.required === true) return "error";
    if (article23Result.value.required === "warning") return "warning";
    return "success";
  }
);

const article23ResultTitle = computed(() => {
  if (article23Result.value.required === true)
    return "【消防機関へ通報する火災報知設備】設置義務あり";
  if (article23Result.value.required === "warning")
    return "【消防機関へ通報する火災報知設備】要確認";
  return "【消防機関へ通報する火災報知設備】設置義務なし";
});

const { regulationResult: article25Result } = useArticle25Logic({
  buildingUse,
  floors,
});

const article25ResultType = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (article25Result.value.required === true) return "error";
    if (article25Result.value.required === "warning") return "warning";
    return "success";
  }
);

const article25ResultTitle = computed(() => {
  if (article25Result.value.required === true)
    return "【避難器具】設置義務あり";
  if (article25Result.value.required === "warning") return "【避難器具】要確認";
  return "【避難器具】設置義務なし";
});

const judgementResult13Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult13.value.required === true) return "error";
    if (judgementResult13.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult13Title = computed(() => {
  if (judgementResult13.value.required === true)
    return "【水噴霧消火設備等】設置義務あり";
  if (judgementResult13.value.required === "warning")
    return "【水噴霧消火設備等】要確認";
  return "【水噴霧消火設備等】設置義務なし";
});

const judgementResult19Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult19.value.required === true) return "error";
    if (judgementResult19.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult19Title = computed(() => {
  if (judgementResult19.value.required === true)
    return "【屋外消火栓設備】設置義務あり";
  if (judgementResult19.value.required === "warning")
    return "【屋外消火栓設備】要確認";
  return "【屋外消火栓設備】設置義務なし";
});

const judgementResult24Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult24.value.required === true) return "error";
    if (judgementResult24.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult24Title = computed(() => {
  if (judgementResult24.value.required === true)
    return "【非常警報器具・設備】設置義務あり";
  if (judgementResult24.value.required === "warning")
    return "【非常警報器具・設備】要確認";
  return "【非常警報器具・設備】設置義務なし";
});

const { regulationResult: article26Result } = useArticle26Logic({
  buildingUse,
  groundFloors: groundFloorsInput,
  floors,
});

const article26ResultType = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (article26Result.value.required === "warning") return "warning";
    if (article26Result.value.required === "info") return "info";
    return article26Result.value.required ? "error" : "success";
  }
);

const article26ResultTitle = computed(() => {
  if (!article26Result.value.required) {
    return "【誘導灯・誘導標識】設置義務なし";
  }
  if (article26Result.value.basis.includes("第4号")) {
    return "【誘導標識】設置義務あり";
  }
  return "【誘導灯】設置義務あり";
});

const judgementResult27Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult27.value.required === true) return "error";
    if (judgementResult27.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult27Title = computed(() => {
  if (judgementResult27.value.required === true)
    return "【消防用水】設置義務あり";
  if (judgementResult27.value.required === "warning")
    return "【消防用水】要確認";
  return "【消防用水】設置義務なし";
});

const judgementResult28Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult28.value.required === true) return "error";
    if (judgementResult28.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult28Title = computed(() => {
  if (judgementResult28.value.required === true)
    return "【排煙設備】設置義務あり";
  if (judgementResult28.value.required === "warning")
    return "【排煙設備】要確認";
  return "【排煙設備】設置義務なし";
});

const { regulationResult: judgementResult29 } = useArticle29Logic({
  buildingUse,
  totalFloorAreaInput,
  floors,
  hasRoadPart,
});

const judgementResult29Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult29.value.required === true) return "error";
    if (judgementResult29.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult29Title = computed(() => {
  if (judgementResult29.value.required === true)
    return "【連結送水管】設置義務あり";
  if (judgementResult29.value.required === "warning")
    return "【連結送水管】要確認";
  return "【連結送水管】設置義務なし";
});

const { regulationResult: judgementResult29_2 } = useArticle29_2Logic({
  buildingUse,
  totalFloorAreaInput,
  floors,
});

const judgementResult29_2Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult29_2.value.required === true) return "error";
    if (judgementResult29_2.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult29_2Title = computed(() => {
  if (judgementResult29_2.value.required === true)
    return "【非常コンセント設備】設置義務あり";
  if (judgementResult29_2.value.required === "warning")
    return "【非常コンセント設備】要確認";
  return "【非常コンセント設備】設置義務なし";
});

const { regulationResult: judgementResult29_3 } = useArticle29_3Logic({
  buildingUse,
  totalFloorAreaInput,
});

const { regulationResult: judgementResult28_2 } = useArticle28_2Logic({
  buildingUse,
  totalFloorAreaInput,
  floors,
});

const judgementResult29_3Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult29_3.value.required === true) return "error";
    if (judgementResult29_3.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult29_3Title = computed(() => {
  if (judgementResult29_3.value.required === true)
    return "【無線通信補助設備】設置義務あり";
  if (judgementResult29_3.value.required === "warning")
    return "【無線通信補助設備】要確認";
  return "【無線通信補助設備】設置義務なし";
});

const judgementResult28_2Type = computed(
  (): "error" | "warning" | "success" | "info" => {
    if (judgementResult28_2.value.required === true) return "error";
    if (judgementResult28_2.value.required === "warning") return "warning";
    return "success";
  }
);

const judgementResult28_2Title = computed(() => {
  if (judgementResult28_2.value.required === true)
    return "【連結散水設備】設置義務あり";
  if (judgementResult28_2.value.required === "warning")
    return "【連結散水設備】要確認";
  return "【連結散水設備】設置義務なし";
});

generateFloors();

// 互換エイリアスは不要になったため削除しました。
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>消防用設備 規制チェッカー</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="fill-height">
          <v-col cols="12" md="6" class="scrollable-content">
            <BuildingInputStepper
              v-model:currentStep="currentStep"
              v-model:buildingUse="buildingUse"
              v-model:totalFloorAreaInput="totalFloorAreaInput"
              v-model:capacityInput="capacityInput"
              v-model:groundFloorsInput="groundFloorsInput"
              v-model:basementFloorsInput="basementFloorsInput"
              v-model:hasNonFloorArea="hasNonFloorArea"
              v-model:nonFloorAreaValue="nonFloorAreaValue"
              v-model:structureType="structureType"
              v-model:finishType="finishType"
              v-model:usesFireEquipment="usesFireEquipment"
              v-model:storesMinorHazardousMaterials="
                storesMinorHazardousMaterials
              "
              v-model:storesDesignatedCombustibles="
                storesDesignatedCombustibles
              "
              v-model:storesDesignatedCombustiblesOver750x="
                storesDesignatedCombustiblesOver750x
              "
              v-model:hasFireSuppressingStructure="hasFireSuppressingStructure"
              v-model:storesDesignatedCombustiblesOver1000x="
                storesDesignatedCombustiblesOver1000x
              "
              v-model:isCareDependentOccupancy="isCareDependentOccupancy"
              v-model:hasBeds="hasBeds"
              v-model:hasStageArea="hasStageArea"
              v-model:stageFloorLevel="stageFloorLevel"
              v-model:stageArea="stageArea"
              v-model:isRackWarehouse="isRackWarehouse"
              v-model:ceilingHeight="ceilingHeight"
              v-model:hasLodging="hasLodging"
              v-model:isSpecifiedOneStaircase="isSpecifiedOneStaircase"
              v-model:storesDesignatedCombustiblesOver500x="
                storesDesignatedCombustiblesOver500x
              "
              v-model:hasRoadPart="hasRoadPart"
              v-model:roadPartRooftopArea="roadPartRooftopArea"
              v-model:roadPartOtherArea="roadPartOtherArea"
              v-model:parking="parking"
              v-model:hasTelecomRoomOver500sqm="hasTelecomRoomOver500sqm"
              v-model:hasSpecialCombustibleStructure="
                hasSpecialCombustibleStructure
              "
              v-model:contractedCurrentCapacity="contractedCurrentCapacity"
              v-model:hasHotSpringFacility="hasHotSpringFacility"
              v-model:isHotSpringFacilityConfirmed="
                isHotSpringFacilityConfirmed
              "
              v-model:article13_hasCarRepairArea="article13_hasCarRepairArea"
              v-model:article13_carRepairAreaBasementOrUpper="
                article13_carRepairAreaBasementOrUpper
              "
              v-model:article13_carRepairAreaFirstFloor="
                article13_carRepairAreaFirstFloor
              "
              v-model:article13_hasHelicopterLandingZone="
                article13_hasHelicopterLandingZone
              "
              v-model:article13_hasHighFireUsageAreaOver200sqm="
                article13_hasHighFireUsageAreaOver200sqm
              "
              v-model:article13_hasElectricalEquipmentOver200sqm="
                article13_hasElectricalEquipmentOver200sqm
              "
              v-model:buildingStructure="buildingStructure"
              v-model:hasMultipleBuildingsOnSite="hasMultipleBuildingsOnSite"
              v-model:siteArea="siteArea"
              v-model:buildingHeight="buildingHeight"
              v-model:componentUses="componentUses"
              :floors="floors"
              :isAnnex16="isAnnex16"
              :showArticle21Item7Checkbox="showArticle21Item7Checkbox"
              :nextStep="nextStep"
              :prevStep="prevStep"
            />
          </v-col>

          <v-col cols="12" md="6" class="scrollable-content">
            <ResultsPanel
              :totalFloorAreaInput="totalFloorAreaInput"
              :calculatedFloorArea="calculatedFloorArea"
              :floorAreaMismatch="floorAreaMismatch"
              :windowlessFloors="windowlessFloors"
              :judgementResult10="judgementResult10"
              :judgementResult10Type="judgementResult10Type"
              :judgementResult10Title="judgementResult10Title"
              :judgementResult11="judgementResult11"
              :judgementResult11Type="judgementResult11Type"
              :judgementResult11Title="judgementResult11Title"
              :judgementResult12="judgementResult12"
              :judgementResult12Type="judgementResult12Type"
              :judgementResult12Title="judgementResult12Title"
              :article21Result="article21Result"
              :article21ResultType="article21ResultType"
              :article21ResultTitle="article21ResultTitle"
              :article22Result="article22Result"
              :article22ResultType="article22ResultType"
              :article22ResultTitle="article22ResultTitle"
              :article21_2Result="article21_2Result"
              :article21_2ResultType="article21_2ResultType"
              :article21_2ResultTitle="article21_2ResultTitle"
              :article23Result="article23Result"
              :article23ResultType="article23ResultType"
              :article23ResultTitle="article23ResultTitle"
              :article25Result="article25Result"
              :article25ResultType="article25ResultType"
              :article25ResultTitle="article25ResultTitle"
              :judgementResult13="judgementResult13"
              :judgementResult13Type="judgementResult13Type"
              :judgementResult13Title="judgementResult13Title"
              :judgementResult19="judgementResult19"
              :judgementResult19Type="judgementResult19Type"
              :judgementResult19Title="judgementResult19Title"
              :judgementResult24="judgementResult24"
              :judgementResult24Type="judgementResult24Type"
              :judgementResult24Title="judgementResult24Title"
              :article26Result="article26Result"
              :article26ResultType="article26ResultType"
              :article26ResultTitle="article26ResultTitle"
              :judgementResult27="judgementResult27"
              :judgementResult27Type="judgementResult27Type"
              :judgementResult27Title="judgementResult27Title"
              :judgementResult28="judgementResult28"
              :judgementResult28Type="judgementResult28Type"
              :judgementResult28Title="judgementResult28Title"
              :judgementResult29="judgementResult29"
              :judgementResult29Type="judgementResult29Type"
              :judgementResult29Title="judgementResult29Title"
              :judgementResult29_2="judgementResult29_2"
              :judgementResult29_2Type="judgementResult29_2Type"
              :judgementResult29_2Title="judgementResult29_2Title"
              :judgementResult29_3="judgementResult29_3"
              :judgementResult29_3Type="judgementResult29_3Type"
              :judgementResult29_3Title="judgementResult29_3Title"
              :judgementResult28_2="judgementResult28_2"
              :judgementResult28_2Type="judgementResult28_2Type"
              :judgementResult28_2Title="judgementResult28_2Title"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
<style scoped>
.scrollable-content {
  height: 90vh;
  overflow-y: auto;
}
</style>
