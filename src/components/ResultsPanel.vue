<script setup lang="ts">
import type { PropType } from 'vue';
import type { JudgementResult } from '@/types';

defineProps({
  totalFloorAreaInput: {
    type: [Number, null] as PropType<number | null>,
    default: null,
  },
  calculatedFloorArea: {
    type: Number,
    default: 0,
  },
  floorAreaMismatch: {
    type: Boolean,
    default: false,
  },
  windowlessFloors: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  judgementResult10: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  judgementResult11: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  judgementResult12: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  judgementResult12Type: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  judgementResult12Title: {
    type: String,
    required: true,
  },
  article21Result: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  article21ResultType: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  article21ResultTitle: {
    type: String,
    required: true,
  },
  article22Result: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  article22ResultType: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  article22ResultTitle: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <v-card style="position: sticky; top: 80px;">
    <v-card-title>建物概要</v-card-title>
    <v-list-item>
      <v-list-item-title>延床面積</v-list-item-title>
      <v-list-item-subtitle>{{ (totalFloorAreaInput || 0).toFixed(2) }} ㎡</v-list-item-subtitle>
    </v-list-item>
    <v-list-item>
      <v-list-item-title>各階の合計面積</v-list-item-title>
      <v-list-item-subtitle>{{ calculatedFloorArea.toFixed(2) }} ㎡</v-list-item-subtitle>
    </v-list-item>

    <v-alert
      v-if="floorAreaMismatch"
      type="warning"
      density="compact"
      variant="outlined"
      class="ma-2"
    >
      申告延床面積と各階の合計面積が一致しません。
    </v-alert>

    <v-list-item>
      <v-list-item-title>無窓階</v-list-item-title>
      <v-list-item-subtitle>
          <span v-if="windowlessFloors.length > 0">{{ windowlessFloors.join(', ') }}</span>
          <span v-else>なし</span>
      </v-list-item-subtitle>
    </v-list-item>

    <v-divider class="my-2"></v-divider>

    <v-card-title>判定結果</v-card-title>
    <v-card-text>
      <v-alert
        :type="judgementResult10.required ? 'error' : 'success'"
        variant="tonal"
        prominent
        class="mb-4"
      >
        <div class="text-h6">
          【消火器】{{ judgementResult10.required ? '設置義務あり' : '設置義務なし' }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult10.message }}</p>
        <p><b>根拠:</b> {{ judgementResult10.basis }}</p>
      </v-alert>

      <v-alert
        :type="judgementResult11.required ? 'error' : 'success'"
        variant="tonal"
        prominent
        class="mb-4"
      >
        <div class="text-h6">
          【屋内消火栓設備】{{ judgementResult11.required ? '設置義務あり' : '設置義務なし' }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult11.message }}</p>
        <p><b>根拠:</b> {{ judgementResult11.basis }}</p>
      </v-alert>

      <v-alert
        :type="judgementResult12Type"
        variant="tonal"
        prominent
        class="mb-4"
      >
        <div class="text-h6">
          {{ judgementResult12Title }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult12.message }}</p>
        <p><b>根拠:</b> {{ judgementResult12.basis }}</p>
      </v-alert>

      <v-alert
        :type="article21ResultType"
        variant="tonal"
        prominent
      >
        <div class="text-h6">
          {{ article21ResultTitle }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ article21Result.message }}</p>
        <p><b>根拠:</b> {{ article21Result.basis }}</p>
      </v-alert>

      <v-alert
        :type="article22ResultType"
        variant="tonal"
        prominent
        class="mt-4"
      >
        <div class="text-h6">
          {{ article22ResultTitle }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ article22Result.message }}</p>
        <p><b>根拠:</b> {{ article22Result.basis }}</p>
      </v-alert>
    </v-card-text>
  </v-card>
</template>
