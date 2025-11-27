<script setup lang="ts">
import type { PropType } from "vue";

defineProps({
  // 16項の構成用途
  annex16ConfigUse: {
    type: String as PropType<string | null>,
    default: null,
  },
  // 16項の床面積
  annex16FloorArea: {
    type: Number as PropType<number | null>,
    default: null,
  },
});

const emit = defineEmits([
  "update:annex16ConfigUse",
  "update:annex16FloorArea",
]);
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>16項（複合用途防火対象物）の情報</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            label="構成用途"
            :model-value="annex16ConfigUse"
            @update:model-value="emit('update:annex16ConfigUse', $event)"
            placeholder="例: 事務所、飲食店、物販店"
            dense
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="床面積"
            :model-value="annex16FloorArea"
            @update:model-value="
              emit(
                'update:annex16FloorArea',
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
      </v-row>
    </v-card-text>
  </v-card>
</template>
