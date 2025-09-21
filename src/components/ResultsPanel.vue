<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { JudgementResult } from '@/types';

const props = defineProps({
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
  judgementResult10: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult10Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult10Title: { type: String, required: true },
  judgementResult11: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult11Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult11Title: { type: String, required: true },
  judgementResult12: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult12Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult12Title: { type: String, required: true },
  article21Result: { type: Object as PropType<JudgementResult>, required: true },
  article21ResultType: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  article21ResultTitle: { type: String, required: true },
  article22Result: { type: Object as PropType<JudgementResult>, required: true },
  article22ResultType: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  article22ResultTitle: { type: String, required: true },
  article21_2Result: { type: Object as PropType<JudgementResult>, required: true },
  article21_2ResultType: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  article21_2ResultTitle: { type: String, required: true },
  article23Result: { type: Object as PropType<JudgementResult>, required: true },
  article23ResultType: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  article23ResultTitle: { type: String, required: true },
  article25Result: { type: Object as PropType<JudgementResult>, required: true },
  article25ResultType: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  article25ResultTitle: { type: String, required: true },
  judgementResult13: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult13Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult13Title: { type: String, required: true },
  judgementResult19: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult19Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult19Title: { type: String, required: true },
  judgementResult24: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult24Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult24Title: { type: String, required: true },
  article26Result: { type: Object as PropType<JudgementResult>, required: true },
  article26ResultType: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  article26ResultTitle: { type: String, required: true },
  judgementResult27: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult27Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult27Title: { type: String, required: true },
  judgementResult28: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult28Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult28Title: { type: String, required: true },
  judgementResult29: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult29Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult29Title: { type: String, required: true },
  judgementResult29_2: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult29_2Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult29_2Title: { type: String, required: true },
  judgementResult29_3: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult29_3Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult29_3Title: { type: String, required: true },
  judgementResult28_2: { type: Object as PropType<JudgementResult>, required: true },
  judgementResult28_2Type: { type: String as PropType<'error' | 'warning' | 'success' | 'info'>, required: true },
  judgementResult28_2Title: { type: String, required: true },
});

const results = computed(() => {
  const arr = [
    { title: props.judgementResult10Title, type: props.judgementResult10Type, ...props.judgementResult10 },
    { title: props.judgementResult11Title, type: props.judgementResult11Type, ...props.judgementResult11 },
    { title: props.judgementResult12Title, type: props.judgementResult12Type, ...props.judgementResult12 },
    { title: props.judgementResult13Title, type: props.judgementResult13Type, ...props.judgementResult13 },
    { title: props.judgementResult19Title, type: props.judgementResult19Type, ...props.judgementResult19 },
    { title: props.article21ResultTitle, type: props.article21ResultType, ...props.article21Result },
    { title: props.article21_2ResultTitle, type: props.article21_2ResultType, ...props.article21_2Result },
    { title: props.article22ResultTitle, type: props.article22ResultType, ...props.article22Result },
    { title: props.article23ResultTitle, type: props.article23ResultType, ...props.article23Result },
    { title: props.judgementResult24Title, type: props.judgementResult24Type, ...props.judgementResult24 },
    { title: props.article25ResultTitle, type: props.article25ResultType, ...props.article25Result },
    { title: props.article26ResultTitle, type: props.article26ResultType, ...props.article26Result },
    { title: props.judgementResult27Title, type: props.judgementResult27Type, ...props.judgementResult27 },
    { title: props.judgementResult28Title, type: props.judgementResult28Type, ...props.judgementResult28 },
    { title: props.judgementResult28_2Title, type: props.judgementResult28_2Type, ...props.judgementResult28_2 },
    { title: props.judgementResult29Title, type: props.judgementResult29Type, ...props.judgementResult29 },
    { title: props.judgementResult29_2Title, type: props.judgementResult29_2Type, ...props.judgementResult29_2 },
    { title: props.judgementResult29_3Title, type: props.judgementResult29_3Type, ...props.judgementResult29_3 },
  ];
  const typeOrder = { error: 0, warning: 1, info: 2, success: 3 };
  return arr.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
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
      <v-expansion-panels multiple>
        <v-expansion-panel
          v-for="(item, idx) in results"
          :key="idx"
          :class="item.type === 'error' ? 'obligation-panel' : ''"
        >
          <v-expansion-panel-title>
            <v-icon :color="item.type === 'error' ? 'red' : item.type === 'warning' ? 'orange' : item.type === 'success' ? 'green' : 'blue'">
              {{ item.type === 'error' ? 'mdi-alert' : item.type === 'warning' ? 'mdi-alert-outline' : item.type === 'success' ? 'mdi-check-circle' : 'mdi-information' }}
            </v-icon>
            {{ item.title }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p><b>理由:</b> {{ item.message }}</p>
            <p><b>根拠:</b> {{ item.basis }}</p>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
  </template>
  <style scoped>
  .obligation-panel {
    background-color: #ffe0e0 !important;
  }
  .obligation-panel ::v-deep(.v-expansion-panel-title),
  .obligation-panel ::v-deep(.v-expansion-panel-text) {
    background-color: #ffe0e0 !important;
  }
  </style>

