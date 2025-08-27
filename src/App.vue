<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BuildingUseSelector from './components/BuildingUseSelector.vue';

interface Floor {
  level: number;
  type: 'ground' | 'basement';
  floorArea: number | null;
  capacity: number | null;
  isWindowless: boolean;
}


const groundFloorsInput = ref<number>(1);
const basementFloorsInput = ref<number>(0);
const floors = ref<Floor[]>([]);
const buildingUse = ref<string | null>(null);
const totalFloorAreaInput = ref<number | null>(null);
const capacityInput = ref<number | null>(null);
const hasNonFloorArea = ref(false);
const nonFloorAreaValue = ref<number | null>(null);

// hasNonFloorAreaがfalseになったら、面積をリセットする
watch(hasNonFloorArea, (newValue) => {
  if (!newValue) {
    nonFloorAreaValue.value = null;
  }
});

const generateFloors = () => {
  // 既存の階のデータをMapに保存して、素早く参照できるようにする
  const oldFloorsMap = new Map<string, Floor>();
  for (const floor of floors.value) {
    oldFloorsMap.set(`${floor.type}-${floor.level}`, floor);
  }

  const newFloors: Floor[] = [];

  // 地上階を生成（階数が大きい順）
  for (let i = groundFloorsInput.value; i >= 1; i--) {
    const key = `ground-${i}`;
    const existingFloor = oldFloorsMap.get(key);
    if (existingFloor) {
      // 既存のデータがあればそれを使う
      newFloors.push(existingFloor);
    } else {
      // なければ新しい空のデータを作成
      newFloors.push({
        level: i,
        type: 'ground',
        floorArea: null,
        capacity: null,
        isWindowless: false,
      });
    }
  }

  // 地下階を生成（階数が小さい順）
  for (let i = 1; i <= basementFloorsInput.value; i++) {
    const key = `basement-${i}`;
    const existingFloor = oldFloorsMap.get(key);
    if (existingFloor) {
      // 既存のデータがあればそれを使う
      newFloors.push(existingFloor);
    } else {
      // なければ新しい空のデータを作成
      newFloors.push({
        level: i,
        type: 'basement',
        floorArea: null,
        capacity: null,
        isWindowless: false, // 地下階には無窓階チェックボックスは不要
      });
    }
  }
  floors.value = newFloors;
};

// 延床面積を計算する算出プロパティ
const totalFloorArea = computed(() => {
  const floorsArea = floors.value.reduce((total, floor) => {
    return total + (floor.floorArea || 0);
  }, 0);
  const extraArea = hasNonFloorArea.value ? (nonFloorAreaValue.value || 0) : 0;
  const totalArea = floorsArea + extraArea + (totalFloorAreaInput.value || 0);
  return totalArea;
});

// 無窓階のリストを作成する算出プロパティ
const windowlessFloors = computed(() => {
  return floors.value
    .filter(floor => floor.isWindowless && floor.type === 'ground')
    .map(floor => `地上 ${floor.level} 階`);
});


// 初期状態で1階建てのフォームを表示
generateFloors();
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>消防用設備 規制チェッカー</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12" md="7">
            <v-card class="mb-4">
              <v-card-title>建物情報を入力してください</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="3">
                    <BuildingUseSelector v-model="buildingUse" />
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-text-field
                      label="延床面積"
                      v-model.number="totalFloorAreaInput"
                      type="number"
                      min="0"
                      suffix="㎡"
                      dense
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-text-field
                      label="全体の収容人員"
                      v-model.number="capacityInput"
                      type="number"
                      min="0"
                      suffix="人"
                      dense
                      hide-details
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row align="center">
                  <v-col cols="12" sm="3">
                    <v-text-field
                      label="地上階"
                      v-model.number="groundFloorsInput"
                      type="number"
                      min="0"
                      suffix="階"
                      dense
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-text-field
                      label="地下階"
                      v-model.number="basementFloorsInput"
                      type="number"
                      min="0"
                      suffix="階"
                      dense
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-checkbox
                      v-model="hasNonFloorArea"
                      label="階に該当しない部分"
                      dense
                      hide-details
                    ></v-checkbox>
                  </v-col>
                   <v-col v-if="hasNonFloorArea" cols="12" sm="2">
                    <v-text-field
                      label="面積"
                      v-model.number="nonFloorAreaValue"
                      type="number"
                      min="0"
                      placeholder="50"
                      suffix="㎡"
                      dense
                      hide-details
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="generateFloors">フォームを生成</v-btn>
              </v-card-actions>
            </v-card>

            <div v-if="floors.length > 0">
              <h2 class="mb-3">各階の情報を入力してください</h2>
              <v-card
                v-for="floor in floors"
                :key="`${floor.type}-${floor.level}`"
                class="mb-3"
                :color="floor.type === 'ground' ? 'grey-lighten-3' : 'brown-lighten-2'"
                variant="flat"
              >
                <v-card-text>
                  <v-row align="center" class="py-2">
                    <v-col cols="12" md="2" class="font-weight-bold text-md-center">
                      {{ floor.type === 'ground' ? `地上 ${floor.level} 階` : `地下 ${floor.level} 階` }}
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
                        <v-col cols="12" sm style="min-height: 56px;">
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
          </v-col>

          <v-col cols="12" md="5">
            <v-card style="position: sticky; top: 80px;">
              <v-card-title>建物概要</v-card-title>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>延床面積</v-list-item-title>
                  <v-list-item-subtitle>{{ totalFloorArea.toFixed(2) }} ㎡</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>無窓階</v-list-item-title>
                  <v-list-item-subtitle>
                    <span v-if="windowlessFloors.length > 0">{{ windowlessFloors.join(', ') }}</span>
                    <span v-else>なし</span>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-divider class="my-2"></v-divider>

              <v-card-title>判定結果</v-card-title>
              <v-card-text>
                <p>ここに判定結果が表示されます。</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
