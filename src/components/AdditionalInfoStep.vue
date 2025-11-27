<script setup lang="ts">
import type { Parking } from "@/types";
import type { PropType } from "vue";
import { useCodeMatches } from "@/composables/utils";
import { computed } from "vue";

const props = defineProps({
  // 建物用途コード
  buildingUse: { type: String as PropType<string | null>, default: null },
  // 火を使用する設備の有無
  usesFireEquipment: { type: Boolean, required: true },
  // 少量危険物の貯蔵有無
  storesMinorHazardousMaterials: { type: Boolean, required: true },
  // 指定可燃物の有無
  storesDesignatedCombustibles: { type: Boolean, required: true },
  // 指定可燃物の500倍以上フラグ
  storesDesignatedCombustiblesOver500x: { type: Boolean, required: true },
  // 指定可燃物の750倍以上フラグ
  storesDesignatedCombustiblesOver750x: { type: Boolean, required: true },
  // 指定可燃物の1000倍以上フラグ
  storesDesignatedCombustiblesOver1000x: { type: Boolean, required: true },
  // 延焼抑制構造の有無
  hasFireSuppressingStructure: { type: Boolean, required: true },
  // 特定一階段等該当フラグ
  isSpecifiedOneStaircase: { type: Boolean, required: true },
  // UI 表示制御（App.vue の計算結果をそのまま受け取る）
  showArticle21Item7Checkbox: { type: Boolean, required: true },
  // 道路の用に供される部分の有無
  hasRoadPart: { type: Boolean, required: true },
  // 屋上部分の床面積（道路部分）
  roadPartRooftopArea: {
    type: Number as PropType<number | null>,
    default: null,
  },
  // 屋上以外の道路部分面積
  roadPartOtherArea: { type: Number as PropType<number | null>, default: null },
  // 共通パーキング情報
  parking: {
    type: Object as PropType<Parking>,
    required: false,
    default: () => ({
      exists: false,
      canAllVehiclesExitSimultaneously: false,
      mechanical: { present: false, capacity: null },
    }),
  },
  // 通信機器室500㎡以上フラグ
  hasTelecomRoomOver500sqm: { type: Boolean, required: true },
  // 温泉設備関連
  hasHotSpringFacility: { type: Boolean, required: true },
  isHotSpringFacilityConfirmed: { type: Boolean, required: true },
  // article13 関連フラグ
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
});

const emit = defineEmits([
  "update:usesFireEquipment",
  "update:storesMinorHazardousMaterials",
  "update:storesDesignatedCombustibles",
  "update:storesDesignatedCombustiblesOver500x",
  "update:storesDesignatedCombustiblesOver750x",
  "update:storesDesignatedCombustiblesOver1000x",
  "update:hasFireSuppressingStructure",
  "update:isSpecifiedOneStaircase",
  "update:hasRoadPart",
  "update:roadPartRooftopArea",
  "update:roadPartOtherArea",
  "update:parking",
  "update:hasTelecomRoomOver500sqm",
  "update:hasHotSpringFacility",
  "update:isHotSpringFacilityConfirmed",
  "update:article13_hasCarRepairArea",
  "update:article13_carRepairAreaBasementOrUpper",
  "update:article13_carRepairAreaFirstFloor",
  "update:article13_hasHelicopterLandingZone",
  "update:article13_hasHighFireUsageAreaOver200sqm",
  "update:article13_hasElectricalEquipmentOver200sqm",
]);

// 指定可燃物の量を一つのラジオでまとめるための双方向マッピング
const selectedDesignatedCombustibleLevel = computed({
  get() {
    if (!props.storesDesignatedCombustibles) return "none";
    if (props.storesDesignatedCombustiblesOver1000x) return "over1000";
    if (props.storesDesignatedCombustiblesOver750x) return "over750";
    if (props.storesDesignatedCombustiblesOver500x) return "over500";
    return "present_none";
  },
  set(val: string) {
    if (val === "none") {
      emit("update:storesDesignatedCombustibles", false);
      emit("update:storesDesignatedCombustiblesOver750x", false);
      emit("update:storesDesignatedCombustiblesOver1000x", false);
      emit("update:storesDesignatedCombustiblesOver500x", false);
    } else {
      emit("update:storesDesignatedCombustibles", true);
      // 階層性を持たせる: over1000 -> over750 & over500 も true, over750 -> over500 も true
      if (val === "over1000") {
        emit("update:storesDesignatedCombustiblesOver750x", true);
        emit("update:storesDesignatedCombustiblesOver1000x", true);
        emit("update:storesDesignatedCombustiblesOver500x", true);
      } else if (val === "over750") {
        emit("update:storesDesignatedCombustiblesOver750x", true);
        emit("update:storesDesignatedCombustiblesOver1000x", false);
        emit("update:storesDesignatedCombustiblesOver500x", true);
      } else if (val === "over500") {
        emit("update:storesDesignatedCombustiblesOver750x", false);
        emit("update:storesDesignatedCombustiblesOver1000x", false);
        emit("update:storesDesignatedCombustiblesOver500x", true);
      } else {
        // present_none
        emit("update:storesDesignatedCombustiblesOver750x", false);
        emit("update:storesDesignatedCombustiblesOver1000x", false);
        emit("update:storesDesignatedCombustiblesOver500x", false);
      }
    }
  },
});
</script>

<template>
  <v-card>
    <v-card-title>追加情報</v-card-title>
    <v-card-text>
      <p class="font-weight-bold mb-2">令第10条（消火器）関連</p>
      <v-checkbox
        v-if="useCodeMatches(buildingUse, ['annex03'])"
        :model-value="usesFireEquipment"
        @update:model-value="emit('update:usesFireEquipment', $event)"
        label="火を使用する設備又は器具がある（簡易なものを除く）"
        hide-details
        data-testid="uses-fire-equipment-checkbox"
      ></v-checkbox>
      <v-checkbox
        :model-value="storesMinorHazardousMaterials"
        @update:model-value="
          emit('update:storesMinorHazardousMaterials', $event)
        "
        label="少量危険物を貯蔵・取り扱いしている"
        hide-details
      ></v-checkbox>
      <v-divider class="my-4"></v-divider>
      <p class="font-weight-bold mb-2">令第11条（屋内消火栓設備）関連</p>
      <v-checkbox
        :model-value="storesDesignatedCombustibles"
        @update:model-value="
          emit('update:storesDesignatedCombustibles', $event)
        "
        label="指定可燃物を貯蔵・取り扱いしている"
        hide-details
      ></v-checkbox>
      <v-expand-transition>
        <div v-if="storesDesignatedCombustibles" class="ml-8">
          <v-radio-group
            v-model="selectedDesignatedCombustibleLevel"
            label="指定可燃物の量"
            hide-details
          >
            <v-radio label="量不明 / 少量" value="present_none"></v-radio>
            <v-radio label="基準数量の500倍以上" value="over500"></v-radio>
            <v-radio label="基準数量の750倍以上" value="over750"></v-radio>
            <v-radio label="基準数量の1000倍以上" value="over1000"></v-radio>
          </v-radio-group>
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

      <v-divider class="my-4"></v-divider>
      <p class="font-weight-bold mb-2">令第21条（自動火災報知設備）関連</p>
      <v-checkbox
        v-if="showArticle21Item7Checkbox"
        :model-value="isSpecifiedOneStaircase"
        @update:model-value="emit('update:isSpecifiedOneStaircase', $event)"
        label="特定一階段等防火対象物に該当する"
        hide-details
        data-testid="article21-annex7-checkbox"
      ></v-checkbox>

      <v-divider class="my-4"></v-divider>
      <p class="font-weight-bold mb-2">
        令第21条（自動火災報知設備）関連 - 追加項目
      </p>

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
            @update:model-value="
              emit(
                'update:roadPartRooftopArea',
                $event === '' ? null : Number($event)
              )
            "
            type="number"
            min="0"
            suffix="㎡"
            dense
          ></v-text-field>
          <v-text-field
            label="屋上以外の部分の床面積"
            :model-value="roadPartOtherArea"
            @update:model-value="
              emit(
                'update:roadPartOtherArea',
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

      <v-checkbox
        :model-value="parking.exists"
        @update:model-value="
          (val) => emit('update:parking', { ...parking, exists: val })
        "
        label="駐車の用に供する部分がある"
        hide-details
      ></v-checkbox>
      <v-expand-transition>
        <div v-if="parking.exists" class="ml-8">
          <v-text-field
            label="屋上部分の床面積"
            :model-value="parking.rooftopArea"
            @update:model-value="
              (val) =>
                emit('update:parking', {
                  ...parking,
                  rooftopArea: val === '' ? null : Number(val),
                })
            "
            type="number"
            min="0"
            suffix="㎡"
            dense
          ></v-text-field>
          <v-text-field
            label="地階または二階以上にある駐車部分の面積合計"
            :model-value="parking.basementOrUpperArea"
            @update:model-value="
              (val) =>
                emit('update:parking', {
                  ...parking,
                  basementOrUpperArea: val === '' ? null : Number(val),
                })
            "
            type="number"
            min="0"
            suffix="㎡"
            dense
          ></v-text-field>
          <v-text-field
            label="一階の駐車部分の床面積"
            :model-value="parking.firstFloorArea"
            @update:model-value="
              (val) =>
                emit('update:parking', {
                  ...parking,
                  firstFloorArea: val === '' ? null : Number(val),
                })
            "
            type="number"
            min="0"
            suffix="㎡"
            dense
          ></v-text-field>
          <v-checkbox
            :model-value="parking.canAllVehiclesExitSimultaneously"
            @update:model-value="
              (val) =>
                emit('update:parking', {
                  ...parking,
                  canAllVehiclesExitSimultaneously: val,
                })
            "
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
      <p class="font-weight-bold mb-2">
        令第21条の2（ガス漏れ火災警報設備）関連
      </p>
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
            @update:model-value="
              emit('update:isHotSpringFacilityConfirmed', $event)
            "
            label="上記設備は温泉法の確認を受けている"
            hide-details
          ></v-checkbox>
        </div>
      </v-expand-transition>

      <v-divider class="my-4"></v-divider>
      <p class="font-weight-bold mb-2">令第13条（水噴霧消火設備等）関連</p>
      <v-checkbox
        :model-value="parking.mechanical.present"
        @update:model-value="
          (val) =>
            emit('update:parking', {
              ...parking,
              mechanical: { ...parking.mechanical, present: val },
            })
        "
        label="機械式駐車場がある"
        hide-details
      ></v-checkbox>
      <v-expand-transition>
        <div v-if="parking.mechanical.present" class="ml-8">
          <v-text-field
            label="収容台数"
            :model-value="parking.mechanical.capacity"
            @update:model-value="
              (val) =>
                emit('update:parking', {
                  ...parking,
                  mechanical: {
                    ...parking.mechanical,
                    capacity: val === '' ? null : Number(val),
                  },
                })
            "
            type="number"
            min="0"
            suffix="台"
            dense
            style="max-width: 200px"
          ></v-text-field>
        </div>
      </v-expand-transition>
      <v-checkbox
        :model-value="article13_hasCarRepairArea"
        @update:model-value="emit('update:article13_hasCarRepairArea', $event)"
        label="自動車の修理・整備工場がある"
        hide-details
      ></v-checkbox>
      <v-expand-transition>
        <div v-if="article13_hasCarRepairArea" class="ml-8">
          <v-text-field
            label="地階・2階以上の修理・整備部分の床面積"
            :model-value="article13_carRepairAreaBasementOrUpper"
            @update:model-value="
              emit(
                'update:article13_carRepairAreaBasementOrUpper',
                $event === '' ? null : Number($event)
              )
            "
            type="number"
            min="0"
            suffix="㎡"
            dense
          ></v-text-field>
          <v-text-field
            label="1階の修理・整備部分の床面積"
            :model-value="article13_carRepairAreaFirstFloor"
            @update:model-value="
              emit(
                'update:article13_carRepairAreaFirstFloor',
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
      <v-checkbox
        :model-value="article13_hasHelicopterLandingZone"
        @update:model-value="
          emit('update:article13_hasHelicopterLandingZone', $event)
        "
        label="屋上にヘリポートがある"
        hide-details
      ></v-checkbox>
      <v-checkbox
        :model-value="article13_hasHighFireUsageAreaOver200sqm"
        @update:model-value="
          emit('update:article13_hasHighFireUsageAreaOver200sqm', $event)
        "
        label="ボイラー室など多量の火気を使用する部分がある（200㎡以上）"
        hide-details
      ></v-checkbox>
      <v-checkbox
        :model-value="article13_hasElectricalEquipmentOver200sqm"
        @update:model-value="
          emit('update:article13_hasElectricalEquipmentOver200sqm', $event)
        "
        label="変圧器など電気設備がある（200㎡以上）"
        hide-details
      ></v-checkbox>
    </v-card-text>
  </v-card>
</template>
