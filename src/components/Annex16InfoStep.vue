<script setup lang="ts">
import type { PropType } from "vue";
import type { Floor, ComponentUse } from "@/types";
import { buildingUses } from "@/data/buildingUses";
import { computed, ref } from "vue";

// 16項の構成用途として選択可能な用途一覧（16項自身と16項関連を除外）
const availableUses = computed(() => {
  return buildingUses.filter(
    (use) => !use.annexedCode.startsWith("annex16")
  );
});

const props = defineProps({
  // 階情報の配列
  floors: {
    type: Array as PropType<Floor[]>,
    required: true,
  },
});

const emit = defineEmits(["update:floors"]);

// 展開パネルの状態管理
const expandedPanels = ref<number[]>([]);

// 階の表示名を取得
const getFloorLabel = (floor: Floor): string => {
  if (floor.type === "basement") {
    return `B${floor.level}F`;
  }
  return `${floor.level}F`;
};

// ディープコピーを作成してフロア配列を更新
const updateFloors = (newFloors: Floor[]) => {
  emit("update:floors", JSON.parse(JSON.stringify(newFloors)));
};

// 特定階に構成用途を追加
const addComponentUseToFloor = (floorIndex: number) => {
  const newFloors = [...props.floors];
  const newComponentUse: ComponentUse = { useCode: "", floorArea: null, capacity: null };
  newFloors[floorIndex] = {
    ...newFloors[floorIndex],
    componentUses: [...(newFloors[floorIndex].componentUses || []), newComponentUse],
  };
  updateFloors(newFloors);
};

// 特定階の構成用途を削除
const removeComponentUseFromFloor = (floorIndex: number, useIndex: number) => {
  const newFloors = [...props.floors];
  newFloors[floorIndex] = {
    ...newFloors[floorIndex],
    componentUses: newFloors[floorIndex].componentUses.filter((_, i) => i !== useIndex),
  };
  updateFloors(newFloors);
};

// 構成用途のコード更新
const updateUseCode = (floorIndex: number, useIndex: number, value: string) => {
  const newFloors = [...props.floors];
  const newComponentUses = [...newFloors[floorIndex].componentUses];
  newComponentUses[useIndex] = { ...newComponentUses[useIndex], useCode: value };
  newFloors[floorIndex] = { ...newFloors[floorIndex], componentUses: newComponentUses };
  updateFloors(newFloors);
};

// 構成用途の床面積更新
const updateFloorArea = (floorIndex: number, useIndex: number, value: number | null) => {
  const newFloors = [...props.floors];
  const newComponentUses = [...newFloors[floorIndex].componentUses];
  newComponentUses[useIndex] = { ...newComponentUses[useIndex], floorArea: value };
  newFloors[floorIndex] = { ...newFloors[floorIndex], componentUses: newComponentUses };
  updateFloors(newFloors);
};

// 構成用途の収容人員更新
const updateCapacity = (floorIndex: number, useIndex: number, value: number | null) => {
  const newFloors = [...props.floors];
  const newComponentUses = [...newFloors[floorIndex].componentUses];
  newComponentUses[useIndex] = { ...newComponentUses[useIndex], capacity: value };
  newFloors[floorIndex] = { ...newFloors[floorIndex], componentUses: newComponentUses };
  updateFloors(newFloors);
};

// 特定階の割り当て済み面積の合計を計算
const getAssignedAreaForFloor = (floor: Floor): number => {
  return (floor.componentUses || []).reduce((sum, use) => sum + (use.floorArea || 0), 0);
};

// 面積超過警告の判定
const isAreaExceeded = (floor: Floor): boolean => {
  if (!floor.floorArea) return false;
  return getAssignedAreaForFloor(floor) > floor.floorArea;
};

// 全フロアで使用されている用途コードの一覧（重複なし）
const allUseCodes = computed(() => {
  const codes = new Set<string>();
  for (const floor of props.floors) {
    for (const use of floor.componentUses || []) {
      if (use.useCode) {
        codes.add(use.useCode);
      }
    }
  }
  return Array.from(codes).sort();
});

// 用途コードから表示名を取得
const getUseDisplayName = (useCode: string): string => {
  const use = buildingUses.find((u) => u.annexedCode === useCode);
  return use ? use.annexedName : useCode;
};

// 特定階・用途コードに対応するComponentUseを取得（面積と収容人員を表示用に取得）
const getComponentUseForFloor = (floor: Floor, useCode: string): ComponentUse | null => {
  return (floor.componentUses || []).find((u) => u.useCode === useCode) || null;
};

// 未割り当て面積の計算
const getUnassignedArea = (floor: Floor): number => {
  if (!floor.floorArea) return 0;
  const assigned = getAssignedAreaForFloor(floor);
  return Math.max(0, floor.floorArea - assigned);
};
</script>

<template>
  <v-card>
    <v-card-title>16項 構成用途情報（各階別）</v-card-title>
    <v-card-text>
      <p class="mb-4">
        16項（複合用途防火対象物）の各階について、その階に存在する用途と、用途ごとの床面積・収容人員を入力してください。
      </p>

      <v-expansion-panels v-model="expandedPanels" multiple variant="accordion">
        <v-expansion-panel
          v-for="(floor, floorIndex) in floors"
          :key="`${floor.type}-${floor.level}`"
        >
          <v-expansion-panel-title>
            <v-row align="center" no-gutters>
              <v-col cols="auto" class="mr-3">
                <span class="text-h6 font-weight-bold">{{ getFloorLabel(floor) }}</span>
              </v-col>
              <v-col cols="auto" class="mr-3">
                <span class="text-body-2 text-grey-darken-1">
                  床面積: {{ floor.floorArea ?? '-' }} ㎡
                </span>
              </v-col>
              <v-col cols="auto">
                <v-chip
                  v-if="floor.isWindowless"
                  color="warning"
                  size="small"
                  variant="flat"
                >
                  無窓階
                </v-chip>
              </v-col>
              <v-col cols="auto" class="ml-2">
                <v-chip
                  v-if="isAreaExceeded(floor)"
                  color="error"
                  size="small"
                  variant="flat"
                >
                  面積超過
                </v-chip>
              </v-col>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-alert
              v-if="isAreaExceeded(floor)"
              type="warning"
              variant="tonal"
              class="mb-4"
            >
              用途別床面積の合計（{{ getAssignedAreaForFloor(floor) }} ㎡）が階の床面積（{{ floor.floorArea }} ㎡）を超えています。
            </v-alert>

            <div
              v-for="(componentUse, useIndex) in floor.componentUses || []"
              :key="useIndex"
              class="mb-4"
            >
              <v-row align="center">
                <v-col cols="12" sm="4">
                  <v-autocomplete
                    :model-value="componentUse.useCode"
                    @update:model-value="updateUseCode(floorIndex, useIndex, $event)"
                    :items="availableUses"
                    item-title="annexedName"
                    item-value="annexedCode"
                    label="構成用途"
                    density="compact"
                    hide-details
                    clearable
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-text-field
                    :model-value="componentUse.floorArea"
                    @update:model-value="
                      updateFloorArea(floorIndex, useIndex, $event === '' ? null : Number($event))
                    "
                    label="床面積"
                    type="number"
                    min="0"
                    suffix="㎡"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-text-field
                    :model-value="componentUse.capacity"
                    @update:model-value="
                      updateCapacity(floorIndex, useIndex, $event === '' ? null : Number($event))
                    "
                    label="収容人員"
                    type="number"
                    min="0"
                    suffix="人"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="small"
                    @click="removeComponentUseFromFloor(floorIndex, useIndex)"
                  >
                    削除
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              @click="addComponentUseToFloor(floorIndex)"
            >
              この階に用途を追加
            </v-btn>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- サマリーマトリクス表 -->
      <v-card v-if="allUseCodes.length > 0" class="mt-6" variant="outlined">
        <v-card-title class="text-subtitle-1">用途別 階別一覧</v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">階</th>
                <th class="text-left">階情報</th>
                <th
                  v-for="useCode in allUseCodes"
                  :key="useCode"
                  class="text-center"
                >
                  {{ getUseDisplayName(useCode) }}
                </th>
                <th class="text-right">未割当面積</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="floor in floors"
                :key="`summary-${floor.type}-${floor.level}`"
              >
                <td class="font-weight-bold">{{ getFloorLabel(floor) }}</td>
                <td>
                  <span>{{ floor.floorArea ?? '-' }} ㎡</span>
                  <v-chip
                    v-if="floor.isWindowless"
                    color="warning"
                    size="x-small"
                    variant="flat"
                    class="ml-1"
                  >
                    無窓
                  </v-chip>
                </td>
                <td
                  v-for="useCode in allUseCodes"
                  :key="`${floor.type}-${floor.level}-${useCode}`"
                  class="text-center"
                >
                  <template v-if="getComponentUseForFloor(floor, useCode)">
                    <div>{{ getComponentUseForFloor(floor, useCode)?.floorArea ?? '-' }} ㎡</div>
                    <div class="text-caption text-grey-darken-1">
                      {{ getComponentUseForFloor(floor, useCode)?.capacity ?? '-' }} 人
                    </div>
                  </template>
                  <span v-else class="text-grey-lighten-1">-</span>
                </td>
                <td class="text-right">
                  <span :class="{ 'text-error': isAreaExceeded(floor) }">
                    {{ getUnassignedArea(floor) }} ㎡
                  </span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>
