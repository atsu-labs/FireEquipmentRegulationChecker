import type { Ref } from 'vue';

export interface BuildingData {
  buildingUse: Ref<string | null>;
  totalFloorAreaInput: Ref<number | null>;
  floors: Ref<Floor[]>;
  usesFireEquipment: Ref<boolean>;
  storesMinorHazardousMaterials: Ref<boolean>;
  storesDesignatedCombustibles: Ref<boolean>;
}

export interface Floor {
  level: number;
  type: 'ground' | 'basement';
  floorArea: number | null;
  capacity: number | null;
  isWindowless: boolean;
}

export interface Article11UserInput {
  buildingUse: string | null;
  totalArea: number | null;
  hasBasement: boolean;
  basementArea: number;
  hasNoWindowFloor: boolean;
  noWindowFloorArea: number;
  hasUpperFloors: boolean;
  upperFloorsArea: number;
  storesFlammableItems: boolean;
  isFlammableItemsAmountOver750: boolean;
  structureType: 'A' | 'B' | 'C' | null;
  finishType: 'flammable' | 'other' | null;
}

export interface Article12UserInput {
  buildingUse: Ref<string | null>;
  groundFloors: Ref<number>;
  totalArea: Ref<number | null>;
  floors: Ref<Floor[]>;
  isCareDependentOccupancy: Ref<boolean>;
  hasStageArea: Ref<boolean>;
  stageFloorLevel: Ref<string | null>; // 'basement_windowless_4th_or_higher' | 'other'
  stageArea: Ref<number | null>;
  isRackWarehouse: Ref<boolean>;
  ceilingHeight: Ref<number | null>;
  isCombustiblesAmountOver1000: Ref<boolean>;
  hasFireSuppressingStructure: Ref<boolean>;
  hasBeds: Ref<boolean>;
}
