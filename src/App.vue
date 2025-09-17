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
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
