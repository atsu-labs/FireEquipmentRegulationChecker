<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BuildingInputStepper from '@/components/BuildingInputStepper.vue';
import ResultsPanel from '@/components/ResultsPanel.vue';
import { Article10Logic } from '@/composables/article10Logic';
import type { Floor } from '@/types';
import { useArticle11Logic } from '@/composables/article11Logic';
import { useArticle12Logic } from '@/composables/article12Logic';
import { useArticle21Logic } from '@/composables/article21Logic';
import { useArticle22Logic } from '@/composables/article22Logic';
import { useArticle21_2Logic } from '@/composables/article21-2Logic';
import { useArticle23Logic } from '@/composables/article23Logic';
import { useArticle25Logic } from '@/composables/article25Logic';
import { useArticle13Logic } from '@/composables/article13Logic';
import { useArticle19Logic } from '@/composables/article19Logic';
import { useArticle24Logic } from '@/composables/article24Logic';
import { useArticle26Logic } from '@/composables/article26Logic';
import { useArticle27Logic } from '@/composables/article27Logic';
import { useArticle28Logic } from '@/composables/article28Logic';

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
const isFlammableItemsAmountOver750 = ref(false);
const structureType = ref<'A' | 'B' | 'C' | null>(null);
const finishType = ref<'flammable' | 'other' | null>(null);
const hasLodging = ref(false); // 令21条用
const isSpecifiedOneStaircase = ref(false); // 令21条7号用

// 令12条
const isCareDependentOccupancy = ref(false);
const hasStageArea = ref(false);
const stageFloorLevel = ref<string | null>(null);
const stageArea = ref<number | null>(null);
const isRackWarehouse = ref(false);
const ceilingHeight = ref<number | null>(null);
const isCombustiblesAmountOver1000 = ref(false);
const hasFireSuppressingStructure = ref(false);
const hasBeds = ref(false);
const storesCombustiblesOver500x = ref(false); // 令21条8号用
const hasRoadPart = ref(false); // 令21条12号用
const roadPartRooftopArea = ref<number | null>(null);
const roadPartOtherArea = ref<number | null>(null);
const hasParkingPart = ref(false); // 令21条13号用
const parkingPartArea = ref<number | null>(null);
const canAllVehiclesExitSimultaneously = ref(false);
const hasTelecomRoomOver500sqm = ref(false); // 令21条15号用

// 令22条
const hasSpecialCombustibleStructure = ref(false);
const contractedCurrentCapacity = ref<number | null>(null);

// 令21条の2
const hasHotSpringFacility = ref(false);
const isHotSpringFacilityConfirmed = ref(false);

// 令13条
const article13_hasParkingArea = ref(false);
const article13_hasMechanicalParking = ref(false);
const article13_mechanicalParkingCapacity = ref<number | null>(null);
const article13_hasCarRepairArea = ref(false);
const article13_hasHelicopterLandingZone = ref(false);
const article13_hasHighFireUsageArea = ref(false);
const article13_hasElectricalEquipmentArea = ref(false);
const article13_hasCommunicationEquipmentRoom = ref(false);
const article13_hasRoadwayPart = ref(false);

// 令19条
const buildingStructure = ref<'fire-resistant' | 'quasi-fire-resistant' | 'other' | null>(null);
const hasMultipleBuildingsOnSite = ref(false);

// 令27条
const siteArea = ref<number | null>(null);
const buildingHeight = ref<number | null>(null);

const showArticle21Item7Checkbox = computed(() => {
  if (!buildingUse.value) return false;
  const targetUses = ['item01', 'item02', 'item03', 'item04', 'item05_i', 'item06', 'item09_i', 'item16_i'];
  return targetUses.some(use => buildingUse.value!.startsWith(use));
});


// hasNonFloorAreaがfalseになったら、面積をリセットする
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
        type: 'ground',
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
        type: 'basement',
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

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};


// 各階の合計面積を計算する算出プロパティ
const calculatedFloorArea = computed(() => {
  const floorsArea = floors.value.reduce((total: number, floor: Floor) => {
    return total + (floor.floorArea || 0);
  }, 0);
  const extraArea = hasNonFloorArea.value ? (nonFloorAreaValue.value || 0) : 0;
  return floorsArea + extraArea;
});

// 面積の不一致をチェックする算出プロパティ
const floorAreaMismatch = computed(() => {
  if (totalFloorAreaInput.value === null || totalFloorAreaInput.value === 0) {
    return false;
  }
  return (Number(totalFloorAreaInput.value) || 0).toFixed(2) !== calculatedFloorArea.value.toFixed(2);
});


// 無窓階のリストを作成する算出プロパティ
const windowlessFloors = computed(() => {
  return floors.value
    .filter((floor: Floor) => floor.isWindowless && floor.type === 'ground')
    .map((floor: Floor) => `地上 ${floor.level} 階`);
});

// 判定ロジックを実行
const { judgementResult: judgementResult10 } = Article10Logic({
  buildingUse,
  totalFloorAreaInput,
  floors,
  usesFireEquipment,
  storesMinorHazardousMaterials,
  storesDesignatedCombustibles,
});

const article11TotalArea = computed(() => totalFloorAreaInput.value);
const hasBasement = computed(() => basementFloorsInput.value > 0);
const basementArea = computed(() => floors.value.filter((f: Floor) => f.type === 'basement').reduce((sum: number, f: Floor) => sum + (f.floorArea || 0), 0));
const hasNoWindowFloor = computed(() => floors.value.some((f: Floor) => f.isWindowless));
const noWindowFloorArea = computed(() => floors.value.filter((f: Floor) => f.isWindowless).reduce((sum: number, f: Floor) => sum + (f.floorArea || 0), 0));
const hasUpperFloors = computed(() => groundFloorsInput.value >= 4);
const upperFloorsArea = computed(() => floors.value.filter((f: Floor) => f.type === 'ground' && f.level >= 4).reduce((sum: number, f: Floor) => sum + (f.floorArea || 0), 0));


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
  isFlammableItemsAmountOver750,
  structureType,
  finishType,
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
  isCombustiblesAmountOver1000,
  hasFireSuppressingStructure,
  hasBeds,
});

const { regulationResult: judgementResult13 } = useArticle13Logic({
  buildingUse,
  isCombustiblesAmountOver1000,
  hasParkingArea: article13_hasParkingArea,
  hasMechanicalParking: article13_hasMechanicalParking,
  mechanicalParkingCapacity: article13_mechanicalParkingCapacity,
  hasCarRepairArea: article13_hasCarRepairArea,
  hasHelicopterLandingZone: article13_hasHelicopterLandingZone,
  hasHighFireUsageArea: article13_hasHighFireUsageArea,
  hasElectricalEquipmentArea: article13_hasElectricalEquipmentArea,
  hasCommunicationEquipmentRoom: article13_hasCommunicationEquipmentRoom,
  hasRoadwayPart: article13_hasRoadwayPart,
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

const { regulationResult: judgementResult26 } = useArticle26Logic({
  buildingUse,
  basementFloors: basementFloorsInput,
  groundFloors: groundFloorsInput,
  floors,
});

const { result: article21Result } = useArticle21Logic({
  buildingUse: buildingUse,
  totalArea: totalFloorAreaInput,
  hasLodging,
  floors,
  isSpecifiedOneStaircase,
  storesCombustiblesOver500x,
  hasRoadPart,
  roadPartRooftopArea,
  roadPartOtherArea,
  hasParkingPart,
  parkingPartArea,
  canAllVehiclesExitSimultaneously,
  hasTelecomRoomOver500sqm,
});

const judgementResult12Type = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (judgementResult12.value.required === true) {
    return 'error';
  }
  if (judgementResult12.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const judgementResult12Title = computed(() => {
  if (judgementResult12.value.required === true) {
    return '【スプリンクラー設備】設置義務あり';
  }
  if (judgementResult12.value.required === 'warning') {
    return '【スプリンクラー設備】要確認';
  }
  return '【スプリンクラー設備】設置義務なし';
});

const article21ResultType = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (article21Result.value.required === true) {
    return 'error';
  }
  if (article21Result.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const article21ResultTitle = computed(() => {
  if (article21Result.value.required === true) {
    return '【自動火災報知設備】設置義務あり';
  }
  if (article21Result.value.required === 'warning') {
    return '【自動火災報知設備】要確認';
  }
  return '【自動火災報知設備】設置義務なし';
});

const { result: article22Result } = useArticle22Logic({
  buildingUse,
  totalArea: totalFloorAreaInput,
  hasSpecialCombustibleStructure,
  contractedCurrentCapacity,
});

const article22ResultType = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (article22Result.value.required === true) {
    return 'error';
  }
  if (article22Result.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const article22ResultTitle = computed(() => {
  if (article22Result.value.required === true) {
    return '【漏電火災警報器】設置義務あり';
  }
  if (article22Result.value.required === 'warning') {
    return '【漏電火災警報器】要確認';
  }
  return '【漏電火災警報器】設置義務なし';
});

const { result: article21_2Result } = useArticle21_2Logic({
  buildingUse,
  totalArea: totalFloorAreaInput,
  floors,
  hasHotSpringFacility,
  isHotSpringFacilityConfirmed,
});

const article21_2ResultType = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (article21_2Result.value.required === true) {
    return 'error';
  }
  if (article21_2Result.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const article21_2ResultTitle = computed(() => {
  if (article21_2Result.value.required === true) {
    return '【ガス漏れ火災警報設備】設置義務あり';
  }
  if (article21_2Result.value.required === 'warning') {
    return '【ガス漏れ火災警報設備】要確認';
  }
  return '【ガス漏れ火災警報設備】設置義務なし';
});

const { result: article23Result } = useArticle23Logic({
  buildingUse,
  totalArea: totalFloorAreaInput,
});

const article23ResultType = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (article23Result.value.required === true) {
    return 'error';
  }
  if (article23Result.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const article23ResultTitle = computed(() => {
  if (article23Result.value.required === true) {
    return '【消防機関へ通報する火災報知設備】設置義務あり';
  }
  if (article23Result.value.required === 'warning') {
    return '【消防機関へ通報する火災報知設備】要確認';
  }
  return '【消防機関へ通報する火災報知設備】設置義務なし';
});

const { result: article25Result } = useArticle25Logic({
  buildingUse,
  floors,
});

const article25ResultType = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (article25Result.value.required === true) {
    return 'error';
  }
  if (article25Result.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const article25ResultTitle = computed(() => {
  if (article25Result.value.required === true) {
    return '【避難器具】設置義務あり';
  }
  if (article25Result.value.required === 'warning') {
    return '【避難器具】要確認';
  }
  return '【避難器具】設置義務なし';
});

const judgementResult13Type = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (judgementResult13.value.required === true) {
    return 'error';
  }
  if (judgementResult13.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const judgementResult13Title = computed(() => {
  if (judgementResult13.value.required === true) {
    return '【水噴霧消火設備等】設置義務あり';
  }
  if (judgementResult13.value.required === 'warning') {
    return '【水噴霧消火設備等】要確認';
  }
  return '【水噴霧消火設備等】設置義務なし';
});

const judgementResult19Type = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (judgementResult19.value.required === true) {
    return 'error';
  }
  if (judgementResult19.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const judgementResult19Title = computed(() => {
  if (judgementResult19.value.required === true) {
    return '【屋外消火栓設備】設置義務あり';
  }
  if (judgementResult19.value.required === 'warning') {
    return '【屋外消火栓設備】要確認';
  }
  return '【屋外消火栓設備】設置義務なし';
});

const judgementResult24Type = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (judgementResult24.value.required === true) {
    return 'error';
  }
  if (judgementResult24.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const judgementResult24Title = computed(() => {
  if (judgementResult24.value.required === true) {
    return '【非常警報器具・設備】設置義務あり';
  }
  if (judgementResult24.value.required === 'warning') {
    return '【非常警報器具・設備】要確認';
  }
  return '【非常警報器具・設備】設置義務なし';
});

// --- 令第26条 算出プロパティ ---
const judgementResult26_exitType = computed((): 'error' | 'warning' | 'success' | 'info' => {
  const required = judgementResult26.value.exitGuideLight.required;
  if (required === true) return 'error';
  if (required === 'warning') return 'warning';
  return 'success';
});
const judgementResult26_exitTitle = computed(() => {
  const required = judgementResult26.value.exitGuideLight.required;
  if (required === true) return '【避難口誘導灯】設置義務あり';
  if (required === 'warning') return '【避難口誘導灯】要確認';
  return '【避難口誘導灯】設置義務なし';
});

const judgementResult26_corridorType = computed((): 'error' | 'warning' | 'success' | 'info' => {
  const required = judgementResult26.value.corridorGuideLight.required;
  if (required === true) return 'error';
  if (required === 'warning') return 'warning';
  return 'success';
});
const judgementResult26_corridorTitle = computed(() => {
  const required = judgementResult26.value.corridorGuideLight.required;
  if (required === true) return '【通路誘導灯】設置義務あり';
  if (required === 'warning') return '【通路誘導灯】要確認';
  return '【通路誘導灯】設置義務なし';
});

const judgementResult26_auditoriumType = computed((): 'error' | 'warning' | 'success' | 'info' => {
  const required = judgementResult26.value.auditoriumGuideLight.required;
  if (required === true) return 'error';
  if (required === 'warning') return 'warning';
  return 'success';
});
const judgementResult26_auditoriumTitle = computed(() => {
  const required = judgementResult26.value.auditoriumGuideLight.required;
  if (required === true) return '【客席誘導灯】設置義務あり';
  if (required === 'warning') return '【客席誘導灯】要確認';
  return '【客席誘導灯】設置義務なし';
});

const judgementResult26_signType = computed((): 'error' | 'warning' | 'success' | 'info' => {
  const required = judgementResult26.value.guideSign.required;
  if (required === true) return 'error';
  if (required === 'warning') return 'warning';
  return 'success';
});
const judgementResult26_signTitle = computed(() => {
  const required = judgementResult26.value.guideSign.required;
  if (required === true) return '【誘導標識】設置義務あり';
  if (required === 'warning') return '【誘導標識】要確認';
  return '【誘導標識】設置義務なし';
});

const judgementResult27Type = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (judgementResult27.value.required === true) {
    return 'error';
  }
  if (judgementResult27.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const judgementResult27Title = computed(() => {
  if (judgementResult27.value.required === true) {
    return '【消防用水】設置義務あり';
  }
  if (judgementResult27.value.required === 'warning') {
    return '【消防用水】要確認';
  }
  return '【消防用水】設置義務なし';
});

const judgementResult28Type = computed((): 'error' | 'warning' | 'success' | 'info' => {
  if (judgementResult28.value.required === true) {
    return 'error';
  }
  if (judgementResult28.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const judgementResult28Title = computed(() => {
  if (judgementResult28.value.required === true) {
    return '【排煙設備】設置義務あり';
  }
  if (judgementResult28.value.required === 'warning') {
    return '【排煙設備】要確認';
  }
  return '【排煙設備】設置義務なし';
});


// 初期状態で1階建てのフォームを表示
generateFloors();
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>消防用設備 規制チェッカー</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12" md="7">
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
              v-model:storesMinorHazardousMaterials="storesMinorHazardousMaterials"
              v-model:storesDesignatedCombustibles="storesDesignatedCombustibles"
              v-model:isFlammableItemsAmountOver750="isFlammableItemsAmountOver750"
              v-model:hasFireSuppressingStructure="hasFireSuppressingStructure"
              v-model:isCombustiblesAmountOver1000="isCombustiblesAmountOver1000"
              v-model:isCareDependentOccupancy="isCareDependentOccupancy"
              v-model:hasBeds="hasBeds"
              v-model:hasStageArea="hasStageArea"
              v-model:stageFloorLevel="stageFloorLevel"
              v-model:stageArea="stageArea"
              v-model:isRackWarehouse="isRackWarehouse"
              v-model:ceilingHeight="ceilingHeight"
              v-model:hasLodging="hasLodging"
              v-model:isSpecifiedOneStaircase="isSpecifiedOneStaircase"
              v-model:storesCombustiblesOver500x="storesCombustiblesOver500x"
              v-model:hasRoadPart="hasRoadPart"
              v-model:roadPartRooftopArea="roadPartRooftopArea"
              v-model:roadPartOtherArea="roadPartOtherArea"
              v-model:hasParkingPart="hasParkingPart"
              v-model:parkingPartArea="parkingPartArea"
              v-model:canAllVehiclesExitSimultaneously="canAllVehiclesExitSimultaneously"
              v-model:hasTelecomRoomOver500sqm="hasTelecomRoomOver500sqm"
              v-model:hasSpecialCombustibleStructure="hasSpecialCombustibleStructure"
              v-model:contractedCurrentCapacity="contractedCurrentCapacity"
              v-model:hasHotSpringFacility="hasHotSpringFacility"
              v-model:isHotSpringFacilityConfirmed="isHotSpringFacilityConfirmed"
              v-model:article13_hasParkingArea="article13_hasParkingArea"
              v-model:article13_hasMechanicalParking="article13_hasMechanicalParking"
              v-model:article13_mechanicalParkingCapacity="article13_mechanicalParkingCapacity"
              v-model:article13_hasCarRepairArea="article13_hasCarRepairArea"
              v-model:article13_hasHelicopterLandingZone="article13_hasHelicopterLandingZone"
              v-model:article13_hasHighFireUsageArea="article13_hasHighFireUsageArea"
              v-model:article13_hasElectricalEquipmentArea="article13_hasElectricalEquipmentArea"
              v-model:article13_hasCommunicationEquipmentRoom="article13_hasCommunicationEquipmentRoom"
              v-model:article13_hasRoadwayPart="article13_hasRoadwayPart"
              v-model:buildingStructure="buildingStructure"
              v-model:hasMultipleBuildingsOnSite="hasMultipleBuildingsOnSite"
              v-model:siteArea="siteArea"
              v-model:buildingHeight="buildingHeight"
              :floors="floors"
              :showArticle21Item7Checkbox="showArticle21Item7Checkbox"
              :nextStep="nextStep"
              :prevStep="prevStep"
            />
          </v-col>

          <v-col cols="12" md="5">
            <ResultsPanel
              :totalFloorAreaInput="totalFloorAreaInput"
              :calculatedFloorArea="calculatedFloorArea"
              :floorAreaMismatch="floorAreaMismatch"
              :windowlessFloors="windowlessFloors"
              :judgementResult10="judgementResult10"
              :judgementResult11="judgementResult11"
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
              :judgementResult26="judgementResult26"
              :judgementResult26_exitType="judgementResult26_exitType"
              :judgementResult26_exitTitle="judgementResult26_exitTitle"
              :judgementResult26_corridorType="judgementResult26_corridorType"
              :judgementResult26_corridorTitle="judgementResult26_corridorTitle"
              :judgementResult26_auditoriumType="judgementResult26_auditoriumType"
              :judgementResult26_auditoriumTitle="judgementResult26_auditoriumTitle"
              :judgementResult26_signType="judgementResult26_signType"
              :judgementResult26_signTitle="judgementResult26_signTitle"
              :judgementResult27="judgementResult27"
              :judgementResult27Type="judgementResult27Type"
              :judgementResult27Title="judgementResult27Title"
              :judgementResult28="judgementResult28"
              :judgementResult28Type="judgementResult28Type"
              :judgementResult28Title="judgementResult28Title"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>