<script setup lang="ts">
import BuildingUseSelector from '@/components/BuildingUseSelector.vue';
import type { Floor } from '@/types';
import type { PropType } from 'vue';

defineProps({
  // v-model props
  currentStep: { type: Number, required: true },
  buildingUse: { type: String as PropType<string | null>, default: null },
  totalFloorAreaInput: { type: Number as PropType<number | null>, default: null },
  capacityInput: { type: Number as PropType<number | null>, default: null },
  groundFloorsInput: { type: Number, required: true },
  basementFloorsInput: { type: Number, required: true },
  hasNonFloorArea: { type: Boolean, required: true },
  nonFloorAreaValue: { type: Object as PropType<number | null | undefined>, default: null },
  structureType: { type: String as PropType<'A' | 'B' | 'C' | null>, default: null },
  finishType: { type: String as PropType<'flammable' | 'other' | null>, default: null },
  usesFireEquipment: { type: Boolean, required: true },
  storesMinorHazardousMaterials: { type: Boolean, required: true },
  storesDesignatedCombustibles: { type: Boolean, required: true },
  isFlammableItemsAmountOver750: { type: Boolean, required: true },
  hasFireSuppressingStructure: { type: Boolean, required: true },
  isCombustiblesAmountOver1000: { type: Boolean, required: true },
  isCareDependentOccupancy: { type: Boolean, required: true },
  hasBeds: { type: Boolean, required: true },
  hasStageArea: { type: Boolean, required: true },
  stageFloorLevel: { type: String as PropType<string | null>, default: null },
  stageArea: { type: Number as PropType<number | null>, default: null },
  isRackWarehouse: { type: Boolean, required: true },
  ceilingHeight: { type: Number as PropType<number | null>, default: null },
  hasLodging: { type: Boolean, required: true },
  isSpecifiedOneStaircase: { type: Boolean, required: true },
  storesCombustiblesOver500x: { type: Boolean, required: true },
  hasRoadPart: { type: Boolean, required: true },
  roadPartRooftopArea: { type: Number as PropType<number | null>, default: null },
  roadPartOtherArea: { type: Number as PropType<number | null>, default: null },
  hasParkingPart: { type: Boolean, required: true },
  parkingPartArea: { type: Number as PropType<number | null>, default: null },
  canAllVehiclesExitSimultaneously: { type: Boolean, required: true },
  hasTelecomRoomOver500sqm: { type: Boolean, required: true },

  // Article 22
  hasSpecialCombustibleStructure: { type: Boolean, required: true },
  contractedCurrentCapacity: { type: Number as PropType<number | null>, default: null },

  // Article 21-2
  hasHotSpringFacility: { type: Boolean, required: true },
  isHotSpringFacilityConfirmed: { type: Boolean, required: true },

  // Other reactive props
  floors: { type: Array as PropType<Floor[]>, required: true },
  showArticle21Item7Checkbox: { type: Boolean, required: true },

  // Functions
  prevStep: { type: Function, required: true },
  nextStep: { type: Function, required: true },
});

const emit = defineEmits([
  'update:currentStep',
  'update:buildingUse',
  'update:totalFloorAreaInput',
  'update:capacityInput',
  'update:groundFloorsInput',
  'update:basementFloorsInput',
  'update:hasNonFloorArea',
  'update:nonFloorAreaValue',
  'update:structureType',
  'update:finishType',
  'update:usesFireEquipment',
  'update:storesMinorHazardousMaterials',
  'update:storesDesignatedCombustibles',
  'update:isFlammableItemsAmountOver750',
  'update:hasFireSuppressingStructure',
  'update:isCombustiblesAmountOver1000',
  'update:isCareDependentOccupancy',
  'update:hasBeds',
  'update:hasStageArea',
  'update:stageFloorLevel',
  'update:stageArea',
  'update:isRackWarehouse',
  'update:ceilingHeight',
  'update:hasLodging',
  'update:isSpecifiedOneStaircase',
  'update:storesCombustiblesOver500x',
  'update:hasRoadPart',
  'update:roadPartRooftopArea',
  'update:roadPartOtherArea',
  'update:hasParkingPart',
  'update:parkingPartArea',
  'update:canAllVehiclesExitSimultaneously',
  'update:hasTelecomRoomOver500sqm',
  'update:hasSpecialCombustibleStructure',
  'update:contractedCurrentCapacity',
  'update:hasHotSpringFacility',
  'update:isHotSpringFacilityConfirmed',
]);
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
      <v-stepper-item
        title="各階の情報"
        :value="2"
        :complete="currentStep > 2"
        editable
      ></v-stepper-item>
      <v-divider></v-divider>
      <v-stepper-item
        title="追加情報"
        :value="3"
        editable
      ></v-stepper-item>
    </v-stepper-header>

    <v-stepper-window>
      <v-stepper-window-item :value="1">
        <v-card class="mb-4">
          <v-card-title>建物情報を入力してください</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="3">
                <BuildingUseSelector
                  :model-value="buildingUse"
                  @update:model-value="emit('update:buildingUse', $event)"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  label="延床面積"
                  :model-value="totalFloorAreaInput"
                  @update:model-value="emit('update:totalFloorAreaInput', $event === '' ? null : Number($event))"
                  type="number"
                  min="0"
                  suffix="㎡"
                  dense
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  label="全体の収容人員"
                  :model-value="capacityInput"
                  @update:model-value="emit('update:capacityInput', $event === '' ? null : Number($event))"
                  type="number"
                  min="0"
                  suffix="人"
                  dense
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="12" sm="3">
                <v-text-field
                  label="地上階"
                  :model-value="groundFloorsInput"
                  @update:model-value="emit('update:groundFloorsInput', Number($event))"
                  type="number"
                  min="0"
                  suffix="階"
                  dense
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  label="地下階"
                  :model-value="basementFloorsInput"
                  @update:model-value="emit('update:basementFloorsInput', Number($event))"
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
          </v-card-text>
        </v-card>
      </v-stepper-window-item>

      <v-stepper-window-item :value="2">
        <div v-if="floors.length > 0">
          <h2 class="mb-3">各階の情報を入力してください</h2>
          <template v-if="hasNonFloorArea">
            <v-card class="mb-3" color="grey-lighten-5">
              <v-card-text>
                <v-row align="center" class="py-2">
                  <v-col cols="12" md="2" class="font-weight-bold text-md-center">
                    階に該当しない部分
                  </v-col>
                  <v-col cols="12" md="10">
                    <v-row align="center">
                      <v-col cols="12" sm>
                        <v-text-field
                          label="面積"
                          :model-value="nonFloorAreaValue"
                          @update:model-value="emit('update:nonFloorAreaValue', $event === '' ? null : Number($event))"
                          type="number"
                          min="0"
                          placeholder="50"
                          suffix="㎡"
                          dense
                          hide-details
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm></v-col>
                      <v-col cols="12" sm style="min-height: 56px;"></v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>
          <v-card
            v-for="floor in floors"
            :key="`${floor.type}-${floor.level}`"
            class="mb-3"
            :color="floor.type === 'ground' ? 'grey-lighten-3' : 'brown-lighten-2'"
            variant="flat"
          >
            <v-card-text>
              <v-row align="center" class="py-2">
                <v-col cols="12" md="2" class="font-weight-bold text-md-center">
                  {{ floor.type === 'ground' ? `地上 ${floor.level} 階` : `地下 ${floor.level} 階` }}
                </v-col>
                <v-col cols="12" md="10">
                  <v-row align="center">
                    <v-col cols="12" sm>
                      <v-text-field
                        label="床面積"
                        v-model.number="floor.floorArea"
                        type="number"
                        min="0"
                        placeholder="500"
                        suffix="㎡"
                        dense
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm>
                      <v-text-field
                        label="階の収容人員"
                        v-model.number="floor.capacity"
                        type="number"
                        min="0"
                        placeholder="50"
                        suffix="人"
                        dense
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm style="min-height: 56px;">
                      <v-checkbox
                        v-if="floor.type === 'ground'"
                        v-model="floor.isWindowless"
                        label="無窓階"
                        dense
                        hide-details
                        class="mt-0"
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </v-stepper-window-item>

      <v-stepper-window-item :value="3">
        <v-card>
          <v-card-title>追加情報</v-card-title>
          <v-card-text>
            <p class="font-weight-bold mb-2">令第10条（消火器）関連</p>
            <v-checkbox
              :model-value="usesFireEquipment"
              @update:model-value="emit('update:usesFireEquipment', $event)"
              label="火を使用する設備又は器具がある（簡易なものを除く）"
              hide-details
            ></v-checkbox>
            <v-checkbox
              :model-value="storesMinorHazardousMaterials"
              @update:model-value="emit('update:storesMinorHazardousMaterials', $event)"
              label="少量危険物を貯蔵・取り扱いしている"
              hide-details
            ></v-checkbox>
            <v-divider class="my-4"></v-divider>
            <p class="font-weight-bold mb-2">令第11条（屋内消火栓設備）関連</p>
            <v-checkbox
              :model-value="storesDesignatedCombustibles"
              @update:model-value="emit('update:storesDesignatedCombustibles', $event)"
              label="指定可燃物を貯蔵・取り扱いしている"
              hide-details
            ></v-checkbox>
            <v-expand-transition>
              <div v-if="storesDesignatedCombustibles" class="ml-8">
                <v-checkbox
                  :model-value="isFlammableItemsAmountOver750"
                  @update:model-value="emit('update:isFlammableItemsAmountOver750', $event)"
                  label="その量は750倍以上である"
                  hide-details
                ></v-checkbox>
              </div>
            </v-expand-transition>
            <v-divider class="my-4"></v-divider>
            <p class="font-weight-bold mb-2">令第12条（スプリンクラー設備）関連</p>
            <v-checkbox
              :model-value="hasFireSuppressingStructure"
              @update:model-value="emit('update:hasFireSuppressingStructure', $event)"
              label="延焼抑制構造である（主要構造部が耐火構造＋開口部が防火設備など）"
              hide-details
            ></v-checkbox>
            <v-checkbox
              :model-value="isCombustiblesAmountOver1000"
              @update:model-value="emit('update:isCombustiblesAmountOver1000', $event)"
              label="指定可燃物を基準数量の1000倍以上貯蔵・取り扱いしている"
              hide-details
            ></v-checkbox>

            <div v-if="buildingUse && buildingUse.startsWith('item06')" class="mt-4">
              <p class="font-weight-bold">（6）項関連の追加情報</p>
              <v-checkbox
                :model-value="isCareDependentOccupancy"
                @update:model-value="emit('update:isCareDependentOccupancy', $event)"
                label="介助がなければ避難できない者を主として入所させる施設"
                hide-details
              ></v-checkbox>
              <v-checkbox
                :model-value="hasBeds"
                @update:model-value="emit('update:hasBeds', $event)"
                label="診療所にベッドがある"
                hide-details
              ></v-checkbox>
            </div>

            <div v-if="buildingUse && buildingUse.startsWith('item01')" class="mt-4">
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
                    <v-radio label="地階, 無窓階, 4階以上" value="basement_windowless_4th_or_higher"></v-radio>
                    <v-radio label="上記以外" value="other"></v-radio>
                  </v-radio-group>
                  <v-text-field
                    label="舞台部の面積"
                    :model-value="stageArea"
                    @update:model-value="emit('update:stageArea', $event === '' ? null : Number($event))"
                    type="number"
                    min="0"
                    suffix="㎡"
                    dense
                  ></v-text-field>
                </div>
              </v-expand-transition>
            </div>

            <div v-if="buildingUse && buildingUse.startsWith('item14')" class="mt-4">
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
                    @update:model-value="emit('update:ceilingHeight', $event === '' ? null : Number($event))"
                    type="number"
                    min="0"
                    suffix="m"
                    dense
                  ></v-text-field>
                </div>
              </v-expand-transition>
            </div>

            <v-divider class="my-4"></v-divider>
            <p class="font-weight-bold mb-2">令第21条（自動火災報知設備）関連</p>
            <v-checkbox
              :model-value="hasLodging"
              @update:model-value="emit('update:hasLodging', $event)"
              label="宿泊施設、入居施設、または宿泊を伴うサービスがある"
              hide-details
            ></v-checkbox>
            <v-checkbox
              v-if="showArticle21Item7Checkbox"
              :model-value="isSpecifiedOneStaircase"
              @update:model-value="emit('update:isSpecifiedOneStaircase', $event)"
              label="特定一階段等防火対象物に該当する"
              hide-details
            ></v-checkbox>
            <v-checkbox
              :model-value="storesCombustiblesOver500x"
              @update:model-value="emit('update:storesCombustiblesOver500x', $event)"
              label="指定可燃物を基準数量の500倍以上、貯蔵・取り扱いしている"
              hide-details
            ></v-checkbox>

            <v-divider class="my-4"></v-divider>
            <p class="font-weight-bold mb-2">令第21条（自動火災報知設備）関連 - 追加項目</p>

            <v-checkbox
              :model-value="hasRoadPart"
              @update:model-value="emit('update:hasRoadPart', $event)"
              label="道路の用に供される部分がある"
              hide-details
            ></v-checkbox>
            <v-expand-transition>
              <div v-if="hasRoadPart" class="ml-8">
                <v-text-field
                  label="屋上部分の床面積"
                  :model-value="roadPartRooftopArea"
                  @update:model-value="emit('update:roadPartRooftopArea', $event === '' ? null : Number($event))"
                  type="number"
                  min="0"
                  suffix="㎡"
                  dense
                ></v-text-field>
                <v-text-field
                  label="屋上以外の部分の床面積"
                  :model-value="roadPartOtherArea"
                  @update:model-value="emit('update:roadPartOtherArea', $event === '' ? null : Number($event))"
                  type="number"
                  min="0"
                  suffix="㎡"
                  dense
                ></v-text-field>
              </div>
            </v-expand-transition>

            <v-checkbox
              :model-value="hasParkingPart"
              @update:model-value="emit('update:hasParkingPart', $event)"
              label="地階、2階以上に駐車の用に供する部分がある"
              hide-details
            ></v-checkbox>
            <v-expand-transition>
              <div v-if="hasParkingPart" class="ml-8">
                <v-text-field
                  label="当該部分の床面積"
                  :model-value="parkingPartArea"
                  @update:model-value="emit('update:parkingPartArea', $event === '' ? null : Number($event))"
                  type="number"
                  min="0"
                  suffix="㎡"
                  dense
                ></v-text-field>
                <v-checkbox
                  :model-value="canAllVehiclesExitSimultaneously"
                  @update:model-value="emit('update:canAllVehiclesExitSimultaneously', $event)"
                  label="駐車するすべての車両が同時に屋外に出られる構造の階である"
                  hide-details
                ></v-checkbox>
              </div>
            </v-expand-transition>

            <v-checkbox
              :model-value="hasTelecomRoomOver500sqm"
              @update:model-value="emit('update:hasTelecomRoomOver500sqm', $event)"
              label="通信機器室500㎡以上"
              hide-details
            ></v-checkbox>

            <v-divider class="my-4"></v-divider>
            <p class="font-weight-bold mb-2">令第22条（漏電火災警報器）関連</p>
            <v-checkbox
              :model-value="hasSpecialCombustibleStructure"
              @update:model-value="emit('update:hasSpecialCombustibleStructure', $event)"
              label="鉄網入りの壁・床・天井など、特殊な可燃性構造を有する"
              hide-details
            ></v-checkbox>
            <v-text-field
              class="mt-4"
              label="契約電流容量"
              :model-value="contractedCurrentCapacity"
              @update:model-value="emit('update:contractedCurrentCapacity', $event === '' ? null : Number($event))"
              type="number"
              min="0"
              suffix="A"
              dense
              style="max-width: 200px;"
            ></v-text-field>

            <v-divider class="my-4"></v-divider>
            <p class="font-weight-bold mb-2">令第21条の2（ガス漏れ火災警報設備）関連</p>
            <v-checkbox
              :model-value="hasHotSpringFacility"
              @update:model-value="emit('update:hasHotSpringFacility', $event)"
              label="温泉の採取のための設備がある"
              hide-details
            ></v-checkbox>
            <v-expand-transition>
              <div v-if="hasHotSpringFacility" class="ml-8">
                <v-checkbox
                  :model-value="isHotSpringFacilityConfirmed"
                  @update:model-value="emit('update:isHotSpringFacilityConfirmed', $event)"
                  label="上記設備は温泉法の確認を受けている"
                  hide-details
                ></v-checkbox>
              </div>
            </v-expand-transition>

          </v-card-text>
        </v-card>
      </v-stepper-window-item>
    </v-stepper-window>

    <v-card-actions>
      <v-btn v-if="currentStep > 1" @click="prevStep">
        戻る
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn v-if="currentStep < 3" color="primary" @click="nextStep">
        次へ
      </v-btn>
    </v-card-actions>
  </v-stepper>
</template>
