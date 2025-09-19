import type { Ref } from 'vue';

export interface BuildingData {
  buildingUse: Ref<string | null>;
  totalFloorAreaInput: Ref<number | null>;
  floors: Ref<Floor[]>;
  usesFireEquipment: Ref<boolean>;
  storesMinorHazardousMaterials: Ref<boolean>;
  storesDesignatedCombustibles: Ref<boolean>;
  hasRoadPart: Ref<boolean>;
}

export interface Floor {
  level: number;
  type: 'ground' | 'basement';
  floorArea: number | null;
  capacity: number | null;
  isWindowless: boolean;
}

export interface JudgementResult {
  required: boolean | 'warning';
  message: string;
  basis: string;
}

export interface Article11UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  hasBasement: Ref<boolean>;
  basementArea: Ref<number>;
  hasNoWindowFloor: Ref<boolean>;
  noWindowFloorArea: Ref<number>;
  hasUpperFloors: Ref<boolean>;
  upperFloorsArea: Ref<number>;
  storesFlammableItems: Ref<boolean>;
  isFlammableItemsAmountOver750: Ref<boolean>;
  structureType: Ref<'A' | 'B' | 'C' | null>;
  finishType: Ref<'flammable' | 'other' | null>;
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

export interface Article22UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  hasSpecialCombustibleStructure: Ref<boolean>;
  contractedCurrentCapacity: Ref<number | null>;
}

export interface Article21_2UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  floors: Ref<Floor[]>;
  hasHotSpringFacility: Ref<boolean>;
  isHotSpringFacilityConfirmed: Ref<boolean>;
}

export interface Article23UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
}

export interface Article26Result {
  exitGuideLight: JudgementResult;
  corridorGuideLight: JudgementResult;
  auditoriumGuideLight: JudgementResult;
  guideSign: JudgementResult;
}
