
import type { Ref } from 'vue';

// Article11UserInput
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

// Article12UserInput
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

// Article13UserInput
export interface Article13UserInput {
  buildingUse: Ref<string | null>;
  isCombustiblesAmountOver1000: Ref<boolean>;
  hasParkingArea: Ref<boolean>;
  hasMechanicalParking: Ref<boolean>;
  mechanicalParkingCapacity: Ref<number | null>;
  hasCarRepairArea: Ref<boolean>;
  hasHelicopterLandingZone: Ref<boolean>;
  hasHighFireUsageArea: Ref<boolean>;
  hasElectricalEquipmentArea: Ref<boolean>;
  hasCommunicationEquipmentRoom: Ref<boolean>;
  hasRoadwayPart: Ref<boolean>;
}

// Article19UserInput
export interface Article19UserInput {
  buildingUse: Ref<string | null>;
  groundFloors: Ref<number>;
  floors: Ref<Floor[]>;
  buildingStructure: Ref<'fire-resistant' | 'quasi-fire-resistant' | 'other' | null>;
  hasMultipleBuildingsOnSite: Ref<boolean>;
}

// Article21UserInput
export interface Article21UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  hasLodging: Ref<boolean>;
  floors: Ref<Floor[]>;
  isSpecifiedOneStaircase: Ref<boolean>;
  storesCombustiblesOver500x: Ref<boolean>;
  hasRoadPart: Ref<boolean>;
  roadPartRooftopArea: Ref<number | null>;
  roadPartOtherArea: Ref<number | null>;
  hasParkingPart: Ref<boolean>;
  parkingPartArea: Ref<number | null>;
  canAllVehiclesExitSimultaneously: Ref<boolean>;
  hasTelecomRoomOver500sqm: Ref<boolean>;
}

// Article21_2UserInput
export interface Article21_2UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  floors: Ref<Floor[]>;
  hasHotSpringFacility: Ref<boolean>;
  isHotSpringFacilityConfirmed: Ref<boolean>;
}

// Article22UserInput
export interface Article22UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  hasSpecialCombustibleStructure: Ref<boolean>;
  contractedCurrentCapacity: Ref<number | null>;
}

// Article23UserInput
export interface Article23UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
}

// Article24UserInput
export interface Article24UserInput {
  buildingUse: Ref<string | null>;
  totalCapacity: Ref<number | null>;
  groundFloors: Ref<number>;
  basementFloors: Ref<number>;
  floors: Ref<Floor[]>;
}

// Article25UserInput
export interface Article25UserInput {
  buildingUse: Ref<string | null>;
  floors: Ref<Floor[]>;
}

// Article26UserInput
export interface Article26UserInput {
  buildingUse: Ref<string | null>;
  groundFloors: Ref<number>;
  floors: Ref<Floor[]>;
}

// Article27UserInput
export interface Article27UserInput {
  buildingUse: Ref<string | null>;
  siteArea: Ref<number | null>;
  buildingHeight: Ref<number | null>;
  totalArea: Ref<number | null>;
  groundFloors: Ref<number>;
  floors: Ref<Floor[]>;
  buildingStructure: Ref<'fire-resistant' | 'quasi-fire-resistant' | 'other' | null>;
}

// Article28UserInput
export interface Article28UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  hasStageArea: Ref<boolean>;
  stageArea: Ref<number | null>;
  floors: Ref<Floor[]>;
}

// その他型定義
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
  required: boolean | 'warning' | 'info';
  message: string;
  basis: string;
}

export interface Article26Result {
  exitGuideLight: JudgementResult;
  corridorGuideLight: JudgementResult;
  auditoriumGuideLight: JudgementResult;
  guideSign: JudgementResult;
}
