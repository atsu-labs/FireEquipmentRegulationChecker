<template>
  <v-select
    label="建物の用途"
    :items="buildingUses"
    item-title="annexedName"
    item-value="annexedCode"
    v-model="selectedUse"
    variant="outlined"
  ></v-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { buildingUses } from "@/data/buildingUses";

const props = defineProps({
  modelValue: { type: String, default: null }
});
const emit = defineEmits(['update:modelValue']);

const selectedUse = ref<string | null>(props.modelValue);

watch(() => props.modelValue, (val) => {
  selectedUse.value = val;
});
watch(selectedUse, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>
