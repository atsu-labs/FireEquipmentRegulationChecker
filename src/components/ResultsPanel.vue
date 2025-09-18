<script setup lang="ts">
import type { PropType } from 'vue';
import type { JudgementResult, Article26Result } from '@/types';

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
  article21_2Result: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  article21_2ResultType: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  article21_2ResultTitle: {
    type: String,
    required: true,
  },
  article23Result: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  article23ResultType: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  article23ResultTitle: {
    type: String,
    required: true,
  },
  article25Result: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  article25ResultType: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  article25ResultTitle: {
    type: String,
    required: true,
  },
  judgementResult13: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  judgementResult13Type: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  judgementResult13Title: {
    type: String,
    required: true,
  },
  judgementResult19: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  judgementResult19Type: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  judgementResult19Title: {
    type: String,
    required: true,
  },
  judgementResult24: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  judgementResult24Type: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  judgementResult24Title: {
    type: String,
    required: true,
  },
  judgementResult26: {
    type: Object as PropType<Article26Result>,
    required: true,
  },
  judgementResult26_exitType: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  judgementResult26_exitTitle: {
    type: String,
    required: true,
  },
  judgementResult26_corridorType: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  judgementResult26_corridorTitle: {
    type: String,
    required: true,
  },
  judgementResult26_auditoriumType: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  judgementResult26_auditoriumTitle: {
    type: String,
    required: true,
  },
  judgementResult26_signType: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  judgementResult26_signTitle: {
    type: String,
    required: true,
  },
  judgementResult27: {
    type: Object as PropType<JudgementResult>,
    required: true,
  },
  judgementResult27Type: {
    type: String as PropType<'error' | 'warning' | 'success' | 'info'>,
    required: true,
  },
  judgementResult27Title: {
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

      <v-alert
        :type="article21_2ResultType"
        variant="tonal"
        prominent
        class="mt-4"
      >
        <div class="text-h6">
          {{ article21_2ResultTitle }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ article21_2Result.message }}</p>
        <p><b>根拠:</b> {{ article21_2Result.basis }}</p>
      </v-alert>

      <v-alert
        :type="article23ResultType"
        variant="tonal"
        prominent
        class="mt-4"
      >
        <div class="text-h6">
          {{ article23ResultTitle }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ article23Result.message }}</p>
        <p><b>根拠:</b> {{ article23Result.basis }}</p>
      </v-alert>

      <v-alert
        :type="article25ResultType"
        variant="tonal"
        prominent
        class="mt-4"
      >
        <div class="text-h6">
          {{ article25ResultTitle }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ article25Result.message }}</p>
        <p><b>根拠:</b> {{ article25Result.basis }}</p>
      </v-alert>

      <v-alert
        :type="judgementResult13Type"
        variant="tonal"
        prominent
        class="mt-4"
      >
        <div class="text-h6">
          {{ judgementResult13Title }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult13.message }}</p>
        <p><b>根拠:</b> {{ judgementResult13.basis }}</p>
      </v-alert>

      <v-alert
        :type="judgementResult19Type"
        variant="tonal"
        prominent
        class="mt-4"
      >
        <div class="text-h6">
          {{ judgementResult19Title }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult19.message }}</p>
        <p><b>根拠:</b> {{ judgementResult19.basis }}</p>
      </v-alert>

      <v-alert
        :type="judgementResult24Type"
        variant="tonal"
        prominent
        class="mt-4"
      >
        <div class="text-h6">
          {{ judgementResult24Title }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult24.message }}</p>
        <p><b>根拠:</b> {{ judgementResult24.basis }}</p>
      </v-alert>

      <v-divider class="my-4"></v-divider>
      <p class="text-h5 mb-2">令第26条 誘導灯・誘導標識</p>

      <v-alert
        :type="judgementResult26_exitType"
        variant="tonal"
        prominent
        class="mb-4"
      >
        <div class="text-h6">
          {{ judgementResult26_exitTitle }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult26.exitGuideLight.message }}</p>
        <p><b>根拠:</b> {{ judgementResult26.exitGuideLight.basis }}</p>
      </v-alert>

      <v-alert
        :type="judgementResult26_corridorType"
        variant="tonal"
        prominent
        class="mb-4"
      >
        <div class="text-h6">
          {{ judgementResult26_corridorTitle }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult26.corridorGuideLight.message }}</p>
        <p><b>根拠:</b> {{ judgementResult26.corridorGuideLight.basis }}</p>
      </v-alert>

      <v-alert
        :type="judgementResult26_auditoriumType"
        variant="tonal"
        prominent
        class="mb-4"
      >
        <div class="text-h6">
          {{ judgementResult26_auditoriumTitle }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult26.auditoriumGuideLight.message }}</p>
        <p><b>根拠:</b> {{ judgementResult26.auditoriumGuideLight.basis }}</p>
      </v-alert>

      <v-alert
        :type="judgementResult26_signType"
        variant="tonal"
        prominent
        class="mb-4"
      >
        <div class="text-h6">
          {{ judgementResult26_signTitle }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult26.guideSign.message }}</p>
        <p><b>根拠:</b> {{ judgementResult26.guideSign.basis }}</p>
      </v-alert>

      <v-alert
        :type="judgementResult27Type"
        variant="tonal"
        prominent
        class="mt-4"
      >
        <div class="text-h6">
          {{ judgementResult27Title }}
        </div>
        <v-divider class="my-2"></v-divider>
        <p><b>理由:</b> {{ judgementResult27.message }}</p>
        <p><b>根拠:</b> {{ judgementResult27.basis }}</p>
      </v-alert>
    </v-card-text>
  </v-card>
</template>
