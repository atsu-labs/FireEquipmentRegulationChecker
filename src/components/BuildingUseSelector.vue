<template>
  <v-select
    label="建物の用途"
    :items="buildingUses"
    item-title="title"
    item-value="value"
    v-model="selectedUse"
    variant="outlined"
  ></v-select>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { buildingUses, type BuildingUse } from "@/data/buildingUses";

const selectedUse = ref<BuildingUse | null>(null);
</script>
