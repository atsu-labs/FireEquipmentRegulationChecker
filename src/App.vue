<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BuildingUseSelector from '@/components/BuildingUseSelector.vue';
import { Article10Logic } from '@/composables/article10Logic';
import type { Floor } from '@/types';
import { useArticle11Logic } from '@/composables/article11Logic';
import { useArticle12Logic } from '@/composables/article12Logic';
import { buildingUses } from '@/data/buildingUses';

const currentStep = ref(1);

const groundFloorsInput = ref<number>(1);
const basementFloorsInput = ref<number>(0);
const floors = ref<Floor[]>([]);
const buildingUse = ref<string | null>(null);
const totalFloorAreaInput = ref<number | null>(null);
const capacityInput = ref<number | null>(null);
const hasNonFloorArea = ref(false);
const nonFloorAreaValue = ref<number | null>(null);

// --- 追加情報のデータ ---
const usesFireEquipment = ref(false);
const storesMinorHazardousMaterials = ref(false);
const storesDesignatedCombustibles = ref(false);
const isFlammableItemsAmountOver750 = ref(false);
const structureType = ref<'A' | 'B' | 'C' | null>(null);
const finishType = ref<'flammable' | 'other' | null>(null);

// 令12条
const isCareDependentOccupancy = ref(false);
const hasStageArea = ref(false);
const stageFloorLevel = ref<string | null>(null);
const stageArea = ref<number | null>(null);
const isRackWarehouse = ref(false);
const ceilingHeight = ref<number | null>(null);
const isCombustiblesAmountOver1000 = ref(false);
const hasFireSuppressingStructure = ref(false);
const hasBeds = ref(false);


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

const nextStep = () => {
  if (currentStep.value === 1) {
    generateFloors();
  }
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};


// 各階の合計面積を計算する算出プロパティ
const calculatedFloorArea = computed(() => {
  const floorsArea = floors.value.reduce((total, floor) => {
    return total + (floor.floorArea || 0);
  }, 0);
  const extraArea = hasNonFloorArea.value ? (nonFloorAreaValue.value || 0) : 0;
  return floorsArea + extraArea;
});

// 面積の不一致をチェックする算出プロパティ
const floorAreaMismatch = computed(() => {
  if (totalFloorAreaInput.value === null || totalFloorAreaInput.value === 0) {
    return false;
  }
  // toFixed(2)で比較することで、浮動小数点数の誤差を回避
  return totalFloorAreaInput.value.toFixed(2) !== calculatedFloorArea.value.toFixed(2);
});


// 無窓階のリストを作成する算出プロパティ
const windowlessFloors = computed(() => {
  return floors.value
    .filter(floor => floor.isWindowless && floor.type === 'ground')
    .map(floor => `地上 ${floor.level} 階`);
});

// 判定ロジックを実行
const { judgementResult: judgementResult10 } = Article10Logic({
  buildingUse,
  totalFloorAreaInput,
  floors,
  usesFireEquipment,
  storesMinorHazardousMaterials,
  storesDesignatedCombustibles,
});

// Article11UserInputのためのComputedプロパティ
const article11TotalArea = computed(() => totalFloorAreaInput.value);
const hasBasement = computed(() => basementFloorsInput.value > 0);
const basementArea = computed(() => floors.value.filter(f => f.type === 'basement').reduce((sum, f) => sum + (f.floorArea || 0), 0));
const hasNoWindowFloor = computed(() => floors.value.some(f => f.isWindowless));
const noWindowFloorArea = computed(() => floors.value.filter(f => f.isWindowless).reduce((sum, f) => sum + (f.floorArea || 0), 0));
const hasUpperFloors = computed(() => groundFloorsInput.value >= 4);
const upperFloorsArea = computed(() => floors.value.filter(f => f.type === 'ground' && f.level >= 4).reduce((sum, f) => sum + (f.floorArea || 0), 0));


const { regulationResult: judgementResult11 } = useArticle11Logic({
  buildingUse,
  totalArea: article11TotalArea,
  hasBasement,
  basementArea,
  hasNoWindowFloor,
  noWindowFloorArea,
  hasUpperFloors,
  upperFloorsArea,
  storesFlammableItems: storesDesignatedCombustibles,
  isFlammableItemsAmountOver750,
  structureType,
  finishType,
});

const { regulationResult: judgementResult12 } = useArticle12Logic({
  buildingUse,
  groundFloors: groundFloorsInput,
  totalArea: totalFloorAreaInput,
  floors,
  isCareDependentOccupancy,
  hasStageArea,
  stageFloorLevel,
  stageArea,
  isRackWarehouse,
  ceilingHeight,
  isCombustiblesAmountOver1000,
  hasFireSuppressingStructure,
  hasBeds,
});

const judgementResult12Type = computed(() => {
  if (judgementResult12.value.required === true) {
    return 'error';
  }
  if (judgementResult12.value.required === 'warning') {
    return 'warning';
  }
  return 'success';
});

const judgementResult12Title = computed(() => {
  if (judgementResult12.value.required === true) {
    return '【スプリンクラー設備】設置義務あり';
  }
  if (judgementResult12.value.required === 'warning') {
    return '【スプリンクラー設備】要確認';
  }
  return '【スプリンクラー設備】設置義務なし';
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
            <v-stepper v-model="currentStep" alt-labels>
              <v-stepper-header>
                <v-stepper-item
                  title="建物情報"
                  :value="1"
                  :complete="currentStep > 1"
                ></v-stepper-item>

                <v-divider></v-divider>

                <v-stepper-item
                  title="各階の情報"
                  :value="2"
                  :complete="currentStep > 2"
                ></v-stepper-item>

                <v-divider></v-divider>

                <v-stepper-item
                  title="追加情報"
                  :value="3"
                ></v-stepper-item>
              </v-stepper-header>

              <v-stepper-window>
                <v-stepper-window-item :value="1">
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
                          <!-- 階に該当しない部分の入力は各階入力エリアで表示するため、ここでは非表示 -->
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-stepper-window-item>

                <v-stepper-window-item :value="2">
                  <div v-if="floors.length > 0">
                    <h2 class="mb-3">各階の情報を入力してください</h2>
                    <template v-if="hasNonFloorArea">
                      <v-card class="mb-3" color="grey-lighten-5">
                        <v-card-text>
                          <v-row align="center" class="py-2">
                            <v-col cols="12" md="2" class="font-weight-bold text-md-center">
                              階に該当しない部分
                            </v-col>
                            <v-col cols="12" md="10">
                              <v-row align="center">
                                <v-col cols="12" sm>
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
                                <!-- 空のカラムで幅を揃える -->
                                <v-col cols="12" sm></v-col>
                                <v-col cols="12" sm style="min-height: 56px;"></v-col>
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
                </v-stepper-window-item>
                <v-stepper-window-item :value="3">
                  <v-card>
                    <v-card-title>追加情報</v-card-title>
                    <v-card-text>
                      <p class="font-weight-bold mb-2">令第10条（消火器）関連</p>
                      <v-checkbox
                        v-model="usesFireEquipment"
                        label="火を使用する設備又は器具がある（簡易なものを除く）"
                        hide-details
                      ></v-checkbox>
                      <v-checkbox
                        v-model="storesMinorHazardousMaterials"
                        label="少量危険物を貯蔵・取り扱いしている"
                        hide-details
                      ></v-checkbox>
                      <v-divider class="my-4"></v-divider>
                      <p class="font-weight-bold mb-2">令第11条（屋内消火栓設備）関連</p>
                      <v-checkbox
                        v-model="storesDesignatedCombustibles"
                        label="指定可燃物を貯蔵・取り扱いしている"
                        hide-details
                      ></v-checkbox>
                      <v-expand-transition>
                        <div v-if="storesDesignatedCombustibles" class="ml-8">
                          <v-checkbox
                            v-model="isFlammableItemsAmountOver750"
                            label="その量は750倍以上である"
                            hide-details
                          ></v-checkbox>
                        </div>
                      </v-expand-transition>

                      <v-row class="mt-4">
                        <v-col cols="12" md="6">
                          <p class="mb-2">建物の構造</p>
                          <v-radio-group v-model="structureType" hide-details>
                            <v-radio label="特定主要構造部が耐火構造" value="A"></v-radio>
                            <v-radio label="その他の耐火構造 or 準耐火構造" value="B"></v-radio>
                            <v-radio label="その他" value="C"></v-radio>
                          </v-radio-group>
                        </v-col>
                        <v-col cols="12" md="6">
                          <p class="mb-2">壁・天井の仕上げ</p>
                          <v-radio-group v-model="finishType" hide-details>
                            <v-radio label="難燃材料" value="flammable"></v-radio>
                            <v-radio label="その他" value="other"></v-radio>
                          </v-radio-group>
                        </v-col>
                      </v-row>
                      <v-divider class="my-4"></v-divider>
                      <p class="font-weight-bold mb-2">令第12条（スプリンクラー設備）関連</p>
                      <v-checkbox
                        v-model="hasFireSuppressingStructure"
                        label="延焼抑制構造である（主要構造部が耐火構造＋開口部が防火設備など）"
                        hide-details
                      ></v-checkbox>
                      <v-checkbox
                        v-model="isCombustiblesAmountOver1000"
                        label="指定可燃物を基準数量の1000倍以上貯蔵・取り扱いしている"
                        hide-details
                      ></v-checkbox>

                      <div v-if="buildingUse && buildingUse.startsWith('item06')" class="mt-4">
                        <p class="font-weight-bold">（6）項関連の追加情報</p>
                        <v-checkbox
                          v-model="isCareDependentOccupancy"
                          label="介助がなければ避難できない者を主として入所させる施設"
                          hide-details
                        ></v-checkbox>
                        <v-checkbox
                          v-model="hasBeds"
                          label="診療所にベッドがある"
                          hide-details
                        ></v-checkbox>
                      </div>

                      <div v-if="buildingUse && buildingUse.startsWith('item01')" class="mt-4">
                        <p class="font-weight-bold">（1）項関連の追加情報</p>
                        <v-checkbox
                          v-model="hasStageArea"
                          label="舞台部がある"
                          hide-details
                        ></v-checkbox>
                        <v-expand-transition>
                          <div v-if="hasStageArea" class="ml-8">
                            <v-radio-group v-model="stageFloorLevel" label="舞台部のある階">
                              <v-radio label="地階, 無窓階, 4階以上" value="basement_windowless_4th_or_higher"></v-radio>
                              <v-radio label="上記以外" value="other"></v-radio>
                            </v-radio-group>
                            <v-text-field
                              label="舞台部の面積"
                              v-model.number="stageArea"
                              type="number"
                              min="0"
                              suffix="㎡"
                              dense
                            ></v-text-field>
                          </div>
                        </v-expand-transition>
                      </div>

                      <div v-if="buildingUse && buildingUse.startsWith('item14')" class="mt-4">
                        <p class="font-weight-bold">（14）項関連の追加情報</p>
                        <v-checkbox
                          v-model="isRackWarehouse"
                          label="ラック式倉庫である"
                          hide-details
                        ></v-checkbox>
                         <v-expand-transition>
                          <div v-if="isRackWarehouse" class="ml-8">
                            <v-text-field
                              label="天井の高さ"
                              v-model.number="ceilingHeight"
                              type="number"
                              min="0"
                              suffix="m"
                              dense
                            ></v-text-field>
                          </div>
                        </v-expand-transition>
                      </div>

                    </v-card-text>
                  </v-card>
                </v-stepper-window-item>
              </v-stepper-window>

              <v-card-actions>
                <v-btn v-if="currentStep > 1" @click="prevStep">
                  戻る
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn v-if="currentStep < 3" color="primary" @click="nextStep">
                  次へ
                </v-btn>
              </v-card-actions>
            </v-stepper>
          </v-col>

          <v-col cols="12" md="5">
            <v-card style="position: sticky; top: 80px;">
              <v-card-title>建物概要</v-card-title>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>申告延床面積</v-list-item-title>
                  <v-list-item-subtitle>{{ (totalFloorAreaInput || 0).toFixed(2) }} ㎡</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>各階の合計面積</v-list-item-title>
                  <v-list-item-subtitle>{{ calculatedFloorArea.toFixed(2) }} ㎡</v-list-item-subtitle>
                </v-list-item-content>
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
                <v-alert
                  :type="judgementResult10.result ? 'error' : 'success'"
                  variant="tonal"
                  prominent
                  class="mb-4"
                >
                  <div class="text-h6">
                    【消火器】{{ judgementResult10.result ? '設置義務あり' : '設置義務なし' }}
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <p><b>理由:</b> {{ judgementResult10.reason }}</p>
                  <p><b>根拠:</b> {{ judgementResult10.根拠 }}</p>
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
                >
                  <div class="text-h6">
                    {{ judgementResult12Title }}
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <p><b>理由:</b> {{ judgementResult12.message }}</p>
                  <p><b>根拠:</b> {{ judgementResult12.basis }}</p>
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
