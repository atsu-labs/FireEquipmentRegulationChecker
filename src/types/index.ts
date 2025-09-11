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
