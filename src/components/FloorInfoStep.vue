<script setup lang="ts">
import type { Floor } from "@/types";
import type { PropType } from "vue";

defineProps({
  // 「階に該当しない部分」があるか
  hasNonFloorArea: { type: Boolean, required: true },
  // 階に該当しない部分の面積
  nonFloorAreaValue: {
    type: Object as PropType<number | null | undefined>,
    default: null,
  },
  // 各階データ
  floors: { type: Array as PropType<Floor[]>, required: true },
});

const emit = defineEmits([
  "update:nonFloorAreaValue",
]);
</script>

<template>
  <div v-if="floors.length > 0">
    <h2 class="mb-3">各階の情報を入力してください</h2>
    <template v-if="hasNonFloorArea">
      <v-card class="mb-3" color="grey-lighten-5">
        <v-card-text>
          <v-row align="center" class="py-2">
            <v-col
              cols="12"
              md="2"
              class="font-weight-bold text-md-center"
            >
              階に該当しない部分
            </v-col>
            <v-col cols="12" md="10">
              <v-row align="center">
                <v-col cols="12" sm>
                  <v-text-field
                    label="面積"
                    :model-value="nonFloorAreaValue"
                    @update:model-value="
                      emit(
                        'update:nonFloorAreaValue',
                        $event === '' ? null : Number($event)
                      )
                    "
                    type="number"
                    min="0"
                    placeholder="50"
                    suffix="㎡"
                    dense
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm></v-col>
                <v-col cols="12" sm style="min-height: 56px"></v-col>
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
      :color="
        floor.type === 'ground' ? 'grey-lighten-3' : 'brown-lighten-2'
      "
      variant="flat"
    >
      <v-card-text class="py-2">
        <v-row align="center" class="py-2">
          <v-col cols="12" md="2" class="font-weight-bold text-md-center">
            {{
              floor.type === "ground"
                ? `地上 ${floor.level} 階`
                : `地下 ${floor.level} 階`
            }}
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
              <v-col cols="12" sm style="min-height: 56px">
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
</template>