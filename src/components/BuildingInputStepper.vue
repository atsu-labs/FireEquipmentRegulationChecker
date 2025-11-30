<script setup lang="ts">
import BuildingInfoStep from "@/components/BuildingInfoStep.vue";
import FloorInfoStep from "@/components/FloorInfoStep.vue";
import AdditionalInfoStep from "@/components/AdditionalInfoStep.vue";
import Annex16InfoStep from "@/components/Annex16InfoStep.vue";
import type { Floor, Parking, ComponentUse } from "@/types";
import type { PropType } from "vue";
import { watch } from "vue";

const props = defineProps({
  // v-model props
  // currentStep: UI の現在ステップ。コンポーネント内テンプレートで使用（親: `App.vue` が管理）
  currentStep: { type: Number, required: true },
  // buildingUse: 建物用途コード。多くの article ロジックで判定に使用（例: article10..29 系）
  buildingUse: { type: String as PropType<string | null>, default: null },
  // totalFloorAreaInput: 延床面積。各記事ロジック（article10/11/12/21/22/27/28/29 等）と ResultsPanel で参照
  totalFloorAreaInput: {
    type: Number as PropType<number | null>,
    default: null,
  },
  // capacityInput: 建物全体の収容人員。主に article24（非常警報器具・設備）や ResultsPanel で使用
  capacityInput: { type: Number as PropType<number | null>, default: null },
  // groundFloorsInput: 地上階数。フロア生成ロジック（親の generateFloors）と article12/19/24/26/27 等で使用
  groundFloorsInput: { type: Number, required: true },
  // basementFloorsInput: 地下階数。フロア生成と article12/24/27 等で使用
  basementFloorsInput: { type: Number, required: true },
  // hasNonFloorArea: 「階に該当しない部分」があるか。計算（calculatedFloorArea）と UI 表示制御に使用
  hasNonFloorArea: { type: Boolean, required: true },
  // nonFloorAreaValue: 階に該当しない部分の面積。計算（calculatedFloorArea）で加算
  nonFloorAreaValue: {
    type: Object as PropType<number | null | undefined>,
    default: null,
  },
  // structureType: 構造区分（A/B/C）。article11（屋内消火栓）で使用
  structureType: {
    type: String as PropType<"A" | "B" | "C" | null>,
    default: null,
  },
  // finishType: 壁・天井の仕上げ区分。article11 の判定に使用
  finishType: {
    type: String as PropType<"flammable" | "other" | null>,
    default: null,
  },
  // usesFireEquipment: 火を使用する設備の有無。article10（消火器）で使用
  usesFireEquipment: { type: Boolean, required: true },
  // storesMinorHazardousMaterials: 少量危険物の貯蔵有無。article10 で使用
  storesMinorHazardousMaterials: { type: Boolean, required: true },
  // storesDesignatedCombustibles: 指定可燃物の有無。article10, article11, article12 等で使用
  storesDesignatedCombustibles: { type: Boolean, required: true },
  // storesDesignatedCombustiblesOver750x: 指定可燃物の750倍以上フラグ。article11 等で使用
  storesDesignatedCombustiblesOver750x: { type: Boolean, required: true },
  // hasFireSuppressingStructure: 延焼抑制構造の有無。article12（スプリンクラー）で考慮
  hasFireSuppressingStructure: { type: Boolean, required: true },
  // storesDesignatedCombustiblesOver1000x: 指定可燃物の1000倍以上フラグ。article12/article13 等で使用
  storesDesignatedCombustiblesOver1000x: { type: Boolean, required: true },
  // isCareDependentOccupancy: 介護等で避難困難な人がいるか。article12 で使用
  isCareDependentOccupancy: { type: Boolean, required: true },
  // hasStageArea: 舞台部の有無。article12 / article28 等で使用
  hasStageArea: { type: Boolean, required: true },
  // stageFloorLevel: 舞台の階種別。article12 / article28 の判定で使用
  stageFloorLevel: { type: String as PropType<string | null>, default: null },
  // stageArea: 舞台面積。article12 /article28 の閾値判定で使用
  stageArea: { type: Number as PropType<number | null>, default: null },
  // isRackWarehouse: ラック式倉庫か。article12（スプリンクラー）で使用
  isRackWarehouse: { type: Boolean, required: true },
  // ceilingHeight: 天井高さ（ラック倉庫用）。article12 で参照
  ceilingHeight: { type: Number as PropType<number | null>, default: null },
  // hasLodging: 宿泊の有無。article21（自動火災報知）で使用
  hasLodging: { type: Boolean, required: true },
  // isSpecifiedOneStaircase: 特定一階段等該当フラグ。UI 表示は showArticle21Item7Checkbox と組合せ、article21 の判定に使用
  isSpecifiedOneStaircase: { type: Boolean, required: true },
  // storesDesignatedCombustiblesOver500x: 指定可燃物500倍以上フラグ。article21 などで使用
  storesDesignatedCombustiblesOver500x: { type: Boolean, required: true },
  // hasRoadPart: 道路用に供される部分の有無。article21 / article13 等で使用
  hasRoadPart: { type: Boolean, required: true },
  // roadPartRooftopArea: 屋上部分の床面積（道路部分）。article21 の面積計算に使用
  roadPartRooftopArea: {
    type: Number as PropType<number | null>,
    default: null,
  },
  // roadPartOtherArea: 屋上以外の道路部分面積。article21 で使用
  roadPartOtherArea: { type: Number as PropType<number | null>, default: null },
  // hasParkingPart: 駐車部分の有無。article21 / article13 で使用
  // parking: 共通パーキング情報（Ref<Parking>）
  parking: {
    type: Object as PropType<Parking>,
    required: false,
    default: () => ({
      exists: false,
      canAllVehiclesExitSimultaneously: false,
      mechanical: { present: false, capacity: null },
    }),
  },
  // hasTelecomRoomOver500sqm: 通信機器室500㎡以上フラグ。article13, article21 等で使用（App.vue と共有）
  hasTelecomRoomOver500sqm: { type: Boolean, required: true },

  // Article 22
  // hasSpecialCombustibleStructure / contractedCurrentCapacity: article22（漏電火災警報器）で使用
  hasSpecialCombustibleStructure: { type: Boolean, required: true },
  contractedCurrentCapacity: {
    type: Number as PropType<number | null>,
    default: null,
  },

  // Article 21-2
  // 温泉設備関連: article21-2（ガス漏れ火災警報設備）で使用
  hasHotSpringFacility: { type: Boolean, required: true },
  isHotSpringFacilityConfirmed: { type: Boolean, required: true },

  // Article 13
  // article13_* 系は article13Logic にそのまま渡される（駐車・機械式駐車・修理場等）
  // Article13 legacy flags removed; use `parking` instead
  article13_hasCarRepairArea: { type: Boolean, required: true },
  article13_carRepairAreaBasementOrUpper: {
    type: Number as PropType<number | null>,
    default: null,
  },
  article13_carRepairAreaFirstFloor: {
    type: Number as PropType<number | null>,
    default: null,
  },
  article13_hasHelicopterLandingZone: { type: Boolean, required: true },
  article13_hasHighFireUsageAreaOver200sqm: { type: Boolean, required: true },
  article13_hasElectricalEquipmentOver200sqm: { type: Boolean, required: true },

  // Article 19
  // buildingStructure / hasMultipleBuildingsOnSite: article19（屋外消火栓）や article27 等で使用
  buildingStructure: {
    type: String as PropType<
      "fire-resistant" | "quasi-fire-resistant" | "other" | null
    >,
    default: null,
  },
  hasMultipleBuildingsOnSite: { type: Boolean, required: true },

  // Article 27
  // siteArea / buildingHeight: article27（消防用水）で使用
  siteArea: { type: Number as PropType<number | null>, default: null },
  //
  buildingHeight: { type: Number as PropType<number | null>, default: null },

  // Other reactive props
  // floors: 各階データ。ほとんどの article ロジック（article10/11/12/21/24/25/27/28/29 等）で参照される
  floors: { type: Array as PropType<Floor[]>, required: true },
  // showArticle21Item7Checkbox: UI 表示制御（App.vue の計算結果をそのまま受け取る）
  showArticle21Item7Checkbox: { type: Boolean, required: true },
  // isAnnex16: 16項かどうかを判定するフラグ
  isAnnex16: { type: Boolean, required: true },
  // componentUses: 16項の構成用途情報
  componentUses: {
    type: Array as PropType<ComponentUse[]>,
    required: true,
  },
  // nonFloorAreaComponentUses: 階に該当しない部分の構成用途情報
  nonFloorAreaComponentUses: {
    type: Array as PropType<ComponentUse[]>,
    required: true,
  },

  // Functions
  // prevStep / nextStep: ステッパーの前後移動（親のメソッドを受け取る）
  prevStep: { type: Function, required: true },
  nextStep: { type: Function, required: true },
});

const emit = defineEmits([
  "update:currentStep",
  "update:buildingUse",
  "update:totalFloorAreaInput",
  "update:capacityInput",
  "update:groundFloorsInput",
  "update:basementFloorsInput",
  "update:hasNonFloorArea",
  "update:nonFloorAreaValue",
  "update:structureType",
  "update:finishType",
  "update:usesFireEquipment",
  "update:storesMinorHazardousMaterials",
  "update:storesDesignatedCombustibles",
  "update:storesDesignatedCombustiblesOver750x",
  "update:hasFireSuppressingStructure",
  "update:storesDesignatedCombustiblesOver1000x",
  "update:isCareDependentOccupancy",
  "update:hasStageArea",
  "update:stageFloorLevel",
  "update:stageArea",
  "update:isRackWarehouse",
  "update:ceilingHeight",
  "update:hasLodging",
  "update:isSpecifiedOneStaircase",
  "update:storesDesignatedCombustiblesOver500x",
  "update:hasRoadPart",
  "update:roadPartRooftopArea",
  "update:roadPartOtherArea",
  "update:parking",
  "update:hasTelecomRoomOver500sqm",
  "update:hasSpecialCombustibleStructure",
  "update:contractedCurrentCapacity",
  "update:hasHotSpringFacility",
  "update:isHotSpringFacilityConfirmed",
  // article13 legacy updates removed; parking represents the state
  "update:article13_hasCarRepairArea",
  "update:article13_carRepairAreaBasementOrUpper",
  "update:article13_carRepairAreaFirstFloor",
  "update:article13_hasHelicopterLandingZone",
  "update:article13_hasHighFireUsageAreaOver200sqm",
  "update:article13_hasElectricalEquipmentOver200sqm",
  "update:buildingStructure",
  "update:hasMultipleBuildingsOnSite",
  "update:siteArea",
  "update:buildingHeight",
  "update:componentUses",
  "update:floors",
  "update:nonFloorAreaComponentUses",
]);

watch(
  () => props.buildingUse,
  (newBuildingUse: string | null) => {
    console.log("buildingUse changed:", newBuildingUse);
  }
);

// 駐車情報は親の `parking` を単一のソースとして使用します
</script>

<template>
  <v-stepper
    :model-value="currentStep"
    @update:model-value="emit('update:currentStep', $event)"
    alt-labels
    non-linear
  >
    <v-stepper-header>
      <v-stepper-item
        title="建物情報"
        :value="1"
        :complete="currentStep > 1"
        editable
      ></v-stepper-item>
      <v-divider></v-divider>
      <!-- ステップ2（各階の情報）: 全ての用途で表示 -->
      <v-stepper-item
        title="各階の情報"
        :value="2"
        :complete="currentStep > 2"
        editable
      ></v-stepper-item>
      <v-divider v-if="isAnnex16"></v-divider>
      <!-- 16項: ステップ3（構成用途情報） -->
      <v-stepper-item
        v-if="isAnnex16"
        title="構成用途情報"
        :value="3"
        :complete="currentStep > 3"
        editable
      ></v-stepper-item>
      <v-divider></v-divider>
      <v-stepper-item title="追加情報" :value="4" editable></v-stepper-item>
    </v-stepper-header>

    <v-stepper-window>
      <v-stepper-window-item :value="1">
        <BuildingInfoStep
          :buildingUse="buildingUse"
          :totalFloorAreaInput="totalFloorAreaInput"
          :capacityInput="capacityInput"
          :groundFloorsInput="groundFloorsInput"
          :basementFloorsInput="basementFloorsInput"
          :hasNonFloorArea="hasNonFloorArea"
          :structureType="structureType"
          :finishType="finishType"
          :siteArea="siteArea"
          :buildingHeight="buildingHeight"
          :buildingStructure="buildingStructure"
          :hasMultipleBuildingsOnSite="hasMultipleBuildingsOnSite"
          :isCareDependentOccupancy="isCareDependentOccupancy"
          :hasLodging="hasLodging"
          :hasStageArea="hasStageArea"
          :stageFloorLevel="stageFloorLevel"
          :stageArea="stageArea"
          :isRackWarehouse="isRackWarehouse"
          :ceilingHeight="ceilingHeight"
          :hasSpecialCombustibleStructure="hasSpecialCombustibleStructure"
          :contractedCurrentCapacity="contractedCurrentCapacity"
          @update:buildingUse="emit('update:buildingUse', $event)"
          @update:totalFloorAreaInput="
            emit('update:totalFloorAreaInput', $event)
          "
          @update:capacityInput="emit('update:capacityInput', $event)"
          @update:groundFloorsInput="emit('update:groundFloorsInput', $event)"
          @update:basementFloorsInput="
            emit('update:basementFloorsInput', $event)
          "
          @update:hasNonFloorArea="emit('update:hasNonFloorArea', $event)"
          @update:structureType="emit('update:structureType', $event)"
          @update:finishType="emit('update:finishType', $event)"
          @update:siteArea="emit('update:siteArea', $event)"
          @update:buildingHeight="emit('update:buildingHeight', $event)"
          @update:buildingStructure="emit('update:buildingStructure', $event)"
          @update:hasMultipleBuildingsOnSite="
            emit('update:hasMultipleBuildingsOnSite', $event)
          "
          @update:isCareDependentOccupancy="
            emit('update:isCareDependentOccupancy', $event)
          "
          @update:hasLodging="emit('update:hasLodging', $event)"
          @update:hasStageArea="emit('update:hasStageArea', $event)"
          @update:stageFloorLevel="emit('update:stageFloorLevel', $event)"
          @update:stageArea="emit('update:stageArea', $event)"
          @update:isRackWarehouse="emit('update:isRackWarehouse', $event)"
          @update:ceilingHeight="emit('update:ceilingHeight', $event)"
          @update:hasSpecialCombustibleStructure="
            emit('update:hasSpecialCombustibleStructure', $event)
          "
          @update:contractedCurrentCapacity="
            emit('update:contractedCurrentCapacity', $event)
          "
        />
      </v-stepper-window-item>

      <!-- ステップ2: 各階の情報（全ての用途） -->
      <v-stepper-window-item :value="2">
        <FloorInfoStep
          :hasNonFloorArea="hasNonFloorArea"
          :nonFloorAreaValue="nonFloorAreaValue"
          :floors="floors"
          @update:nonFloorAreaValue="emit('update:nonFloorAreaValue', $event)"
        />
      </v-stepper-window-item>

      <!-- ステップ3: 構成用途情報（16項のみ） -->
      <v-stepper-window-item :value="3">
        <Annex16InfoStep
          :floors="floors"
          :hasNonFloorArea="hasNonFloorArea"
          :nonFloorAreaValue="nonFloorAreaValue"
          :nonFloorAreaComponentUses="nonFloorAreaComponentUses"
          @update:floors="emit('update:floors', $event)"
          @update:nonFloorAreaComponentUses="
            emit('update:nonFloorAreaComponentUses', $event)
          "
        />
      </v-stepper-window-item>

      <!-- ステップ4: 追加情報 -->
      <v-stepper-window-item :value="4">
        <AdditionalInfoStep
          :buildingUse="buildingUse"
          :usesFireEquipment="usesFireEquipment"
          :storesMinorHazardousMaterials="storesMinorHazardousMaterials"
          :storesDesignatedCombustibles="storesDesignatedCombustibles"
          :storesDesignatedCombustiblesOver500x="
            storesDesignatedCombustiblesOver500x
          "
          :storesDesignatedCombustiblesOver750x="
            storesDesignatedCombustiblesOver750x
          "
          :storesDesignatedCombustiblesOver1000x="
            storesDesignatedCombustiblesOver1000x
          "
          :hasFireSuppressingStructure="hasFireSuppressingStructure"
          :isSpecifiedOneStaircase="isSpecifiedOneStaircase"
          :showArticle21Item7Checkbox="showArticle21Item7Checkbox"
          :hasRoadPart="hasRoadPart"
          :roadPartRooftopArea="roadPartRooftopArea"
          :roadPartOtherArea="roadPartOtherArea"
          :parking="parking"
          :hasTelecomRoomOver500sqm="hasTelecomRoomOver500sqm"
          :hasHotSpringFacility="hasHotSpringFacility"
          :isHotSpringFacilityConfirmed="isHotSpringFacilityConfirmed"
          :article13_hasCarRepairArea="article13_hasCarRepairArea"
          :article13_carRepairAreaBasementOrUpper="
            article13_carRepairAreaBasementOrUpper
          "
          :article13_carRepairAreaFirstFloor="article13_carRepairAreaFirstFloor"
          :article13_hasHelicopterLandingZone="
            article13_hasHelicopterLandingZone
          "
          :article13_hasHighFireUsageAreaOver200sqm="
            article13_hasHighFireUsageAreaOver200sqm
          "
          :article13_hasElectricalEquipmentOver200sqm="
            article13_hasElectricalEquipmentOver200sqm
          "
          @update:usesFireEquipment="emit('update:usesFireEquipment', $event)"
          @update:storesMinorHazardousMaterials="
            emit('update:storesMinorHazardousMaterials', $event)
          "
          @update:storesDesignatedCombustibles="
            emit('update:storesDesignatedCombustibles', $event)
          "
          @update:storesDesignatedCombustiblesOver500x="
            emit('update:storesDesignatedCombustiblesOver500x', $event)
          "
          @update:storesDesignatedCombustiblesOver750x="
            emit('update:storesDesignatedCombustiblesOver750x', $event)
          "
          @update:storesDesignatedCombustiblesOver1000x="
            emit('update:storesDesignatedCombustiblesOver1000x', $event)
          "
          @update:hasFireSuppressingStructure="
            emit('update:hasFireSuppressingStructure', $event)
          "
          @update:isSpecifiedOneStaircase="
            emit('update:isSpecifiedOneStaircase', $event)
          "
          @update:hasRoadPart="emit('update:hasRoadPart', $event)"
          @update:roadPartRooftopArea="
            emit('update:roadPartRooftopArea', $event)
          "
          @update:roadPartOtherArea="emit('update:roadPartOtherArea', $event)"
          @update:parking="emit('update:parking', $event)"
          @update:hasTelecomRoomOver500sqm="
            emit('update:hasTelecomRoomOver500sqm', $event)
          "
          @update:hasHotSpringFacility="
            emit('update:hasHotSpringFacility', $event)
          "
          @update:isHotSpringFacilityConfirmed="
            emit('update:isHotSpringFacilityConfirmed', $event)
          "
          @update:article13_hasCarRepairArea="
            emit('update:article13_hasCarRepairArea', $event)
          "
          @update:article13_carRepairAreaBasementOrUpper="
            emit('update:article13_carRepairAreaBasementOrUpper', $event)
          "
          @update:article13_carRepairAreaFirstFloor="
            emit('update:article13_carRepairAreaFirstFloor', $event)
          "
          @update:article13_hasHelicopterLandingZone="
            emit('update:article13_hasHelicopterLandingZone', $event)
          "
          @update:article13_hasHighFireUsageAreaOver200sqm="
            emit('update:article13_hasHighFireUsageAreaOver200sqm', $event)
          "
          @update:article13_hasElectricalEquipmentOver200sqm="
            emit('update:article13_hasElectricalEquipmentOver200sqm', $event)
          "
        />
      </v-stepper-window-item>
    </v-stepper-window>

    <v-card-actions>
      <v-btn v-if="currentStep > 1" @click="prevStep"> 戻る </v-btn>
      <v-spacer></v-spacer>
      <v-btn v-if="currentStep < 4" color="primary" @click="nextStep">
        次へ
      </v-btn>
    </v-card-actions>
  </v-stepper>
</template>
