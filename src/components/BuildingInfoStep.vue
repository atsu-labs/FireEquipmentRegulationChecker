<script setup lang="ts">
import BuildingUseSelector from "@/components/BuildingUseSelector.vue";
import type { PropType } from "vue";
import { useCodeMatches } from "@/composables/utils";

defineProps({
  // 建物用途コード
  buildingUse: { type: String as PropType<string | null>, default: null },
  // 延床面積
  totalFloorAreaInput: {
    type: Number as PropType<number | null>,
    default: null,
  },
  // 建物全体の収容人員
  capacityInput: { type: Number as PropType<number | null>, default: null },
  // 地上階数
  groundFloorsInput: { type: Number, required: true },
  // 地下階数
  basementFloorsInput: { type: Number, required: true },
  // 「階に該当しない部分」があるか
  hasNonFloorArea: { type: Boolean, required: true },
  // 構造区分（A/B/C）
  structureType: {
    type: String as PropType<"A" | "B" | "C" | null>,
    default: null,
  },
  // 壁・天井の仕上げ区分
  finishType: {
    type: String as PropType<"flammable" | "other" | null>,
    default: null,
  },
  // 敷地面積
  siteArea: { type: Number as PropType<number | null>, default: null },
  // 建物の高さ
  buildingHeight: { type: Number as PropType<number | null>, default: null },
  // 建物構造（耐火建築物等）
  buildingStructure: {
    type: String as PropType<
      "fire-resistant" | "quasi-fire-resistant" | "other" | null
    >,
    default: null,
  },
  // 同一敷地内に複数の建物があるか
  hasMultipleBuildingsOnSite: { type: Boolean, required: true },
  // 介護等で避難困難な人がいるか
  isCareDependentOccupancy: { type: Boolean, required: true },
  // 診療所にベッドがあるか
  hasBeds: { type: Boolean, required: true },
  // 宿泊の有無
  hasLodging: { type: Boolean, required: true },
  // 舞台部の有無
  hasStageArea: { type: Boolean, required: true },
  // 舞台の階種別
  stageFloorLevel: { type: String as PropType<string | null>, default: null },
  // 舞台面積
  stageArea: { type: Number as PropType<number | null>, default: null },
  // ラック式倉庫か
  isRackWarehouse: { type: Boolean, required: true },
  // 天井高さ（ラック倉庫用）
  ceilingHeight: { type: Number as PropType<number | null>, default: null },
  // 鉄網入りの壁・床・天井など、特殊な可燃性構造を有するか
  hasSpecialCombustibleStructure: { type: Boolean, required: true },
  // 契約電流容量
  contractedCurrentCapacity: {
    type: Number as PropType<number | null>,
    default: null,
  },
});

const emit = defineEmits([
  "update:buildingUse",
  "update:totalFloorAreaInput",
  "update:capacityInput",
  "update:groundFloorsInput",
  "update:basementFloorsInput",
  "update:hasNonFloorArea",
  "update:structureType",
  "update:finishType",
  "update:siteArea",
  "update:buildingHeight",
  "update:buildingStructure",
  "update:hasMultipleBuildingsOnSite",
  "update:isCareDependentOccupancy",
  "update:hasBeds",
  "update:hasLodging",
  "update:hasStageArea",
  "update:stageFloorLevel",
  "update:stageArea",
  "update:isRackWarehouse",
  "update:ceilingHeight",
  "update:hasSpecialCombustibleStructure",
  "update:contractedCurrentCapacity",
]);
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>建物情報を入力してください</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="4" md="4" lg="4">
          <BuildingUseSelector
            :model-value="buildingUse === null ? undefined : buildingUse"
            @update:model-value="emit('update:buildingUse', $event)"
          />
        </v-col>
        <v-col cols="12" sm="4" md="4" lg="4">
          <v-text-field
            label="延床面積"
            :model-value="totalFloorAreaInput"
            @update:model-value="
              emit(
                'update:totalFloorAreaInput',
                $event === '' ? null : Number($event)
              )
            "
            type="number"
            min="0"
            suffix="㎡"
            dense
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="4" md="4" lg="4">
          <v-text-field
            label="全体の収容人員"
            :model-value="capacityInput"
            @update:model-value="
              emit(
                'update:capacityInput',
                $event === '' ? null : Number($event)
              )
            "
            type="number"
            min="0"
            suffix="人"
            dense
            hide-details
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="12" class="mt-2">
          <div
            v-if="buildingUse && buildingUse.startsWith('annex06')"
            class="mb-2"
          >
            <p class="font-weight-bold">（6）項関連の追加情報</p>
            <v-checkbox
              v-if="
                useCodeMatches(buildingUse, [
                  'annex06_ro_2',
                  'annex06_ro_4',
                  'annex06_ro_5',
                ])
              "
              :model-value="isCareDependentOccupancy"
              @update:model-value="
                emit('update:isCareDependentOccupancy', $event)
              "
              label="介助がなければ避難できない者を主として入所させる施設"
              hide-details
            ></v-checkbox>
            <v-checkbox
              v-if="useCodeMatches(buildingUse, ['annex06_i_2'])"
              :model-value="hasBeds"
              @update:model-value="emit('update:hasBeds', $event)"
              label="診療所にベッドがある"
              hide-details
            ></v-checkbox>
            <!-- hasLodging は 6項ハ の用途コードのときのみ表示 -->
            <v-checkbox
              v-if="buildingUse && buildingUse.startsWith('annex06_ha')"
              :model-value="hasLodging"
              @update:model-value="emit('update:hasLodging', $event)"
              label="宿泊施設、入居施設、または宿泊を伴うサービスがある"
              hide-details
            ></v-checkbox>
          </div>

          <div
            v-if="buildingUse && buildingUse.startsWith('annex01')"
            class="mb-2"
          >
            <p class="font-weight-bold">（1）項関連の追加情報</p>
            <v-checkbox
              :model-value="hasStageArea"
              @update:model-value="emit('update:hasStageArea', $event)"
              label="舞台部がある"
              hide-details
            ></v-checkbox>
            <v-expand-transition>
              <div v-if="hasStageArea" class="ml-8">
                <v-radio-group
                  :model-value="stageFloorLevel"
                  @update:model-value="emit('update:stageFloorLevel', $event)"
                  label="舞台部のある階"
                >
                  <v-radio
                    label="地階, 無窓階, 4階以上"
                    value="basement_windowless_4th_or_higher"
                  ></v-radio>
                  <v-radio label="上記以外" value="other"></v-radio>
                </v-radio-group>
                <v-text-field
                  label="舞台部の面積"
                  :model-value="stageArea"
                  @update:model-value="
                    emit(
                      'update:stageArea',
                      $event === '' ? null : Number($event)
                    )
                  "
                  type="number"
                  min="0"
                  suffix="㎡"
                  dense
                ></v-text-field>
              </div>
            </v-expand-transition>
          </div>

          <div
            v-if="buildingUse && buildingUse.startsWith('annex14')"
            class="mb-2"
          >
            <p class="font-weight-bold">（14）項関連の追加情報</p>
            <v-checkbox
              :model-value="isRackWarehouse"
              @update:model-value="emit('update:isRackWarehouse', $event)"
              label="ラック式倉庫である"
              hide-details
            ></v-checkbox>
            <v-expand-transition>
              <div v-if="isRackWarehouse" class="ml-8">
                <v-text-field
                  label="天井の高さ"
                  :model-value="ceilingHeight"
                  @update:model-value="
                    emit(
                      'update:ceilingHeight',
                      $event === '' ? null : Number($event)
                    )
                  "
                  type="number"
                  min="0"
                  suffix="m"
                  dense
                ></v-text-field>
              </div>
            </v-expand-transition>
          </div>
        </v-col>
      </v-row>
      <v-row align="center">
        <v-col cols="12" sm="4">
          <v-text-field
            label="地上階"
            :model-value="groundFloorsInput"
            @update:model-value="
              emit('update:groundFloorsInput', Number($event))
            "
            type="number"
            min="0"
            suffix="階"
            dense
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field
            label="地下階"
            :model-value="basementFloorsInput"
            @update:model-value="
              emit('update:basementFloorsInput', Number($event))
            "
            type="number"
            min="0"
            suffix="階"
            dense
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="4">
          <v-checkbox
            :model-value="hasNonFloorArea"
            @update:model-value="emit('update:hasNonFloorArea', $event)"
            label="階に該当しない部分"
            dense
            hide-details
          ></v-checkbox>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <p class="mb-2">建物の構造</p>
          <v-radio-group
            :model-value="structureType"
            @update:model-value="emit('update:structureType', $event)"
            hide-details
          >
            <v-radio label="特定主要構造部が耐火構造" value="A"></v-radio>
            <v-radio label="その他の耐火構造 or 準耐火構造" value="B"></v-radio>
            <v-radio label="その他" value="C"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" md="6">
          <p class="mb-2">壁・天井の仕上げ</p>
          <v-radio-group
            :model-value="finishType"
            @update:model-value="emit('update:finishType', $event)"
            hide-details
          >
            <v-radio label="難燃材料" value="flammable"></v-radio>
            <v-radio label="その他" value="other"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row align="center">
        <!-- 敷地面積: 令第27条第1号で使用（敷地面積20,000㎡以上 かつ 構造基準面積以上） -->
        <v-col cols="12" sm="3" v-if="(totalFloorAreaInput ?? 0) >= 5000">
          <v-text-field
            label="敷地面積"
            :model-value="siteArea"
            @update:model-value="
              emit('update:siteArea', $event === '' ? null : Number($event))
            "
            type="number"
            min="0"
            suffix="㎡"
            dense
            hide-details
          ></v-text-field>
        </v-col>
        <!-- 建物の高さ: 令第27条第2号で使用（高さ31m超 かつ 延べ面積25,000㎡以上） -->
        <v-col cols="12" sm="3" v-if="(totalFloorAreaInput ?? 0) >= 25000">
          <v-text-field
            label="建物の高さ"
            :model-value="buildingHeight"
            @update:model-value="
              emit(
                'update:buildingHeight',
                $event === '' ? null : Number($event)
              )
            "
            type="number"
            min="0"
            suffix="m"
            dense
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="3">
          <v-radio-group
            :model-value="buildingStructure"
            @update:model-value="emit('update:buildingStructure', $event)"
            hide-details
          >
            <v-radio label="耐火建築物" value="fire-resistant"></v-radio>
            <v-radio
              label="準耐火建築物"
              value="quasi-fire-resistant"
            ></v-radio>
            <v-radio label="その他" value="other"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" sm="3">
          <v-checkbox
            :model-value="hasMultipleBuildingsOnSite"
            @update:model-value="
              emit('update:hasMultipleBuildingsOnSite', $event)
            "
            label="同一敷地内に複数の建物がある"
            hide-details
            class="mt-2"
          ></v-checkbox>
        </v-col>
      </v-row>
      <v-row class="mt-4" align="center">
        <v-col cols="12" sm="6">
          <p class="font-weight-bold mb-2">令第22条（漏電火災警報器）関連</p>
          <v-checkbox
            :model-value="hasSpecialCombustibleStructure"
            @update:model-value="
              emit('update:hasSpecialCombustibleStructure', $event)
            "
            label="鉄網入りの壁・床・天井など、特殊な可燃性構造を有する"
            hide-details
          ></v-checkbox>
        </v-col>
        <v-col v-if="hasSpecialCombustibleStructure" cols="12" sm="6">
          <v-text-field
            class="mt-4"
            label="契約電流容量"
            :model-value="contractedCurrentCapacity"
            @update:model-value="
              emit(
                'update:contractedCurrentCapacity',
                $event === '' ? null : Number($event)
              )
            "
            type="number"
            min="0"
            suffix="A"
            dense
            style="max-width: 200px"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
