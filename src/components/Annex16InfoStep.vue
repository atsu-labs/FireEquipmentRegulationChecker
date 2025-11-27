<script setup lang="ts">
import type { PropType } from "vue";
import type { ComponentUse } from "@/types";
import { buildingUses } from "@/data/buildingUses";
import { computed } from "vue";

// 16項の構成用途として選択可能な用途一覧（16項自身と16項関連を除外）
const availableUses = computed(() => {
  return buildingUses.filter(
    (use) => !use.annexedCode.startsWith("annex16")
  );
});

const props = defineProps({
  // 構成用途の配列
  componentUses: {
    type: Array as PropType<ComponentUse[]>,
    required: true,
  },
});

const emit = defineEmits(["update:componentUses"]);

// 構成用途を追加
const addComponentUse = () => {
  const newUses = [...props.componentUses, { useCode: "", floorArea: null }];
  emit("update:componentUses", newUses);
};

// 構成用途を削除
const removeComponentUse = (index: number) => {
  const newUses = props.componentUses.filter((_, i) => i !== index);
  emit("update:componentUses", newUses);
};

// 構成用途のコード更新
const updateUseCode = (index: number, value: string) => {
  const newUses = [...props.componentUses];
  newUses[index] = { ...newUses[index], useCode: value };
  emit("update:componentUses", newUses);
};

// 構成用途の床面積更新
const updateFloorArea = (index: number, value: number | null) => {
  const newUses = [...props.componentUses];
  newUses[index] = { ...newUses[index], floorArea: value };
  emit("update:componentUses", newUses);
};
</script>

<template>
  <v-card>
    <v-card-title>16項 構成用途情報</v-card-title>
    <v-card-text>
      <p class="mb-4">
        16項（複合用途防火対象物）を構成する各用途と、その用途に供する部分の床面積を入力してください。
      </p>

      <div
        v-for="(componentUse, index) in componentUses"
        :key="index"
        class="mb-4"
      >
        <v-row align="center">
          <v-col cols="12" sm="5">
            <v-autocomplete
              :model-value="componentUse.useCode"
              @update:model-value="updateUseCode(index, $event)"
              :items="availableUses"
              item-title="annexedName"
              item-value="annexedCode"
              label="構成用途"
              dense
              hide-details
              clearable
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              :model-value="componentUse.floorArea"
              @update:model-value="
                updateFloorArea(index, $event === '' ? null : Number($event))
              "
              label="床面積"
              type="number"
              min="0"
              suffix="㎡"
              dense
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3">
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              @click="removeComponentUse(index)"
              :disabled="componentUses.length <= 1"
            >
              削除
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <v-btn color="primary" variant="outlined" @click="addComponentUse">
        用途を追加
      </v-btn>
    </v-card-text>
  </v-card>
</template>
